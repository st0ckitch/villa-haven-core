import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Cache key used to hydrate the first paint with the most recently fetched
// hero slides. Eliminates the "old image flash" by serving the previous
// session's slides from localStorage while the network query revalidates.
const HERO_CACHE_KEY = "hero-slides-cache-v1";

type CachedSlide = { image_url: string; title: string | null; description: string | null };

const readCachedSlides = (): CachedSlide[] | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(HERO_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
};

const writeCachedSlides = (slides: CachedSlide[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HERO_CACHE_KEY, JSON.stringify(slides));
  } catch {
    // ignore quota / private-mode errors
  }
};

const getEmbedUrl = (url: string): { type: "iframe" | "video"; src: string } => {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
  if (ytMatch) {
    return { type: "iframe", src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytMatch[1]}&controls=0&showinfo=0&rel=0&modestbranding=1` };
  }
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return { type: "iframe", src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&loop=1&background=1` };
  }
  return { type: "video", src: url };
};

export const HeroSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  // Read the previous session's slides synchronously on first render so we
  // can paint immediately. Stable across renders, not reactive.
  const cachedSlidesRef = useRef<CachedSlide[] | null>(null);
  if (cachedSlidesRef.current === null) {
    cachedSlidesRef.current = readCachedSlides();
  }

  const { data: dbSlides } = useQuery({
    queryKey: ["hero-slides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    // Only seed initialData when we actually have cached slides. Passing
    // `null`/`undefined` would make react-query think the data is loaded
    // and skip the queryFn entirely — that broke the hero earlier.
    initialData: cachedSlidesRef.current ?? undefined,
    // Treat the cache as immediately stale so we still hit the network in
    // the background and pick up any admin edits within a few hundred ms.
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60_000,
  });

  // Persist whenever new data arrives so the next session benefits.
  useEffect(() => {
    if (dbSlides && Array.isArray(dbSlides) && dbSlides.length > 0) {
      writeCachedSlides(
        dbSlides.map((s: any) => ({
          image_url: s.image_url,
          title: s.title ?? null,
          description: s.description ?? null,
        }))
      );
    }
  }, [dbSlides]);

  const { data: heroSettings } = useQuery({
    queryKey: ["hero-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["hero_mode", "hero_video_url"]);
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach((r) => (map[r.key] = r.value));
      return map;
    },
    staleTime: 5 * 60_000,
  });

  const heroMode = heroSettings?.hero_mode || "slider";
  const heroVideoUrl = heroSettings?.hero_video_url || "";

  // Last-resort fallbacks for the rare case where (a) localStorage has no
  // cache and (b) the Supabase query fails. Uses brand-owned renders so the
  // hero never renders as a blank gradient. On a successful first load the
  // dbSlides immediately replace these.
  const fallbackSlides: CachedSlide[] = [
    { image_url: "/renders/polograph-aerial-1.jpg", title: null, description: null },
    { image_url: "/renders/polograph-aerial-2.jpg", title: null, description: null },
    { image_url: "/renders/polograph-villa.jpg",   title: null, description: null },
    { image_url: "/renders/ipodromi-1.jpg",        title: null, description: null },
  ];

  const slides =
    dbSlides && dbSlides.length > 0
      ? dbSlides
      : cachedSlidesRef.current && cachedSlidesRef.current.length > 0
      ? cachedSlidesRef.current
      : fallbackSlides;

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (heroMode !== "slider") return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, heroMode]);

  useEffect(() => {
    setActiveSlide(0);
  }, [dbSlides]);

  const current = slides[activeSlide];
  // Build the immediate next slide URL so the browser starts decoding it
  // in the background; eliminates the brief blank flash when AnimatePresence
  // unmounts the current image and mounts the next.
  const nextImageUrl = slides.length > 1 ? slides[(activeSlide + 1) % slides.length].image_url : null;

  // Scroll-driven parallax hooks (must be called before any early returns)
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  // Layer 1 (back): image scales + moves slower
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  // Layer 2 (mid): overlay darkens as you scroll
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.4, 0.85]);
  // Layer 3 (front): title floats UP faster + fades + blurs
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const titleBlurAmount = useTransform(scrollYProgress, [0, 0.6], [0, 8]);
  const titleBlur = useMotionTemplate`blur(${titleBlurAmount}px)`;

  // Video mode
  if (heroMode === "video" && heroVideoUrl) {
    const embed = getEmbedUrl(heroVideoUrl);
    return (
      <section className="relative h-[60vh] md:h-[85vh] min-h-[400px] md:min-h-[600px] flex items-center overflow-hidden">
        {embed.type === "iframe" ? (
          <iframe
            src={embed.src}
            className="absolute inset-0 pointer-events-none"
            style={{ border: 0, width: "100vw", height: "56.25vw", minHeight: "100%", minWidth: "177.78vh", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
            allow="autoplay; fullscreen"
            allowFullScreen
            title="Hero video"
          />
        ) : (
          <video
            src={embed.src}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </section>
    );
  }

  // Slider mode (default) with 3D parallax layers
  return (
    <section ref={heroRef} className="relative h-[60vh] md:h-[85vh] min-h-[400px] md:min-h-[600px] flex items-center overflow-hidden bg-gradient-to-br from-[hsl(130_30%_15%)] via-[hsl(130_25%_20%)] to-[hsl(130_20%_12%)]">
      {/* Hidden preloader for the next slide so it's decoded before transition.
          Eliminates the flash to the fallback color between slides. */}
      {nextImageUrl && (
        <link rel="preload" as="image" href={nextImageUrl} />
      )}

      {/* Layer 1: Parallax image — only mounted once `current` exists,
          which avoids flashing a stale fallback during the initial query. */}
      {current && (
        <motion.div
          className="absolute inset-0"
          style={{ y: imageY, scale: imageScale }}
        >
          <AnimatePresence mode="popLayout">
            <motion.img
              key={activeSlide}
              src={current.image_url}
              alt={current.title || "Hero slide"}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover"
              // First slide is above the fold; load eagerly with high priority
              // so the LCP image is requested as soon as possible.
              loading={activeSlide === 0 ? "eager" : "lazy"}
              fetchPriority={activeSlide === 0 ? "high" : "auto"}
              decoding="async"
            />
          </AnimatePresence>
        </motion.div>
      )}

      {/* Layer 2: Animated overlay that darkens on scroll */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none"
        style={{ opacity: overlayOpacity }}
      />

      {/* Layer 3: Title with reverse parallax + blur exit */}
      {current && (current.title || current.description) && (
        <motion.div
          className="relative z-10 container mx-auto px-6"
          style={{ y: titleY, opacity: titleOpacity, filter: titleBlur }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="max-w-2xl"
            >
              {current.title && (
                <h1 className="text-3xl md:text-4xl lg:text-5xl text-white font-serif mb-4 drop-shadow-lg">
                  {current.title}
                </h1>
              )}
              {current.description && (
                <p className="text-lg md:text-xl text-white/80 font-sans drop-shadow-md">
                  {current.description}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/15">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === activeSlide ? "bg-white w-8" : "bg-white/40 w-2.5"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
