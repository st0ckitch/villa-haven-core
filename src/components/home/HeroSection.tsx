import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fallbackSlides = [
  {
    image_url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80",
    title: null as string | null,
    description: null as string | null,
  },
  {
    image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
    title: null,
    description: null,
  },
  {
    image_url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80",
    title: null,
    description: null,
  },
  {
    image_url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&q=80",
    title: null,
    description: null,
  },
];

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
  });

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
  });

  const heroMode = heroSettings?.hero_mode || "slider";
  const heroVideoUrl = heroSettings?.hero_video_url || "";

  const slides = dbSlides && dbSlides.length > 0 ? dbSlides : fallbackSlides;

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
    <section ref={heroRef} className="relative h-[60vh] md:h-[85vh] min-h-[400px] md:min-h-[600px] flex items-center overflow-hidden">
      {/* Layer 1: Parallax image */}
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
          />
        </AnimatePresence>
      </motion.div>

      {/* Layer 2: Animated overlay that darkens on scroll */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none"
        style={{ opacity: overlayOpacity }}
      />

      {/* Layer 3: Title with reverse parallax + blur exit */}
      {(current.title || current.description) && (
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
