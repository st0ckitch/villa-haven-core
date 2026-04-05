import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Lightbox } from "@/components/Lightbox";
import { SEO } from "@/components/SEO";
import { AnimatedSection } from "@/components/AnimatedSection";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, getLocalizedField } from "@/contexts/LanguageContext";

type Render = Record<string, any>;

const categoryKeys = ["all", "exterior", "interior", "amenities", "landscape"] as const;

const Gallery = () => {
  const [renders, setRenders] = useState<Render[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    supabase.from("renders").select("*").order("sort_order").then(({ data }) => {
      setRenders(data || []);
      setLoading(false);
    });
  }, []);

  const filtered = filter === "all" ? renders : renders.filter((r) => r.category === filter);
  const lightboxImages = filtered.map((r) => ({
    url: r.image_url,
    title: getLocalizedField(r, "title", language),
  }));

  return (
    <Layout>
      <SEO title={t("gallery.title")} description={t("gallery.subtitle")} />

      {/* Decorative orbs */}
      <div className="absolute inset-x-0 top-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(130_55%_40%/0.05)_0%,transparent_70%)] animate-orb-float" />
        <div className="absolute top-[40%] left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,hsl(130_55%_50%/0.04)_0%,transparent_70%)] animate-orb-float-reverse" />
      </div>

      <section className="pt-28 lg:pt-32 pb-16 lg:pb-24">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <p className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-primary/50 mb-3">
              {t("gallery.title")}
            </p>
            <h1 className="font-sans text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-4">
              {t("gallery.title")}
            </h1>
            <p className="text-muted-foreground font-sans mb-10 max-w-lg">
              {t("gallery.subtitle")}
            </p>
          </AnimatedSection>

          {/* Glass filter buttons */}
          <AnimatedSection delay={100}>
            <div className="flex flex-wrap gap-2 mb-10">
              {categoryKeys.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-sans font-medium transition-all duration-300 ${
                    filter === cat
                      ? "bg-gradient-to-r from-[#2d8f43] to-[#3aa557] text-white shadow-[0_4px_16px_rgba(45,143,67,0.3)]"
                      : "bg-white/60 backdrop-blur-md border border-[hsl(130_55%_40%/0.12)] text-foreground/70 hover:bg-white hover:border-[hsl(130_55%_40%/0.3)] hover:text-foreground"
                  }`}
                >
                  {t(`gallery.${cat}`)}
                </button>
              ))}
            </div>
          </AnimatedSection>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground font-sans text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" /> {t("gallery.loading")}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground font-sans">{t("gallery.noRenders")}</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {filtered.map((render, i) => (
                <AnimatedSection key={render.id} delay={i * 50}>
                  <button
                    onClick={() => setLightboxIndex(i)}
                    className="group relative aspect-[4/3] w-full rounded-2xl overflow-hidden cursor-pointer text-left
                      border border-white/40 shadow-[0_2px_16px_rgba(0,0,0,0.04)]
                      hover:shadow-[0_12px_40px_rgba(45,143,67,0.18)] hover:border-[hsl(130_55%_40%/0.3)] hover:-translate-y-1
                      transition-all duration-300"
                  >
                    <img
                      src={render.image_url}
                      alt={getLocalizedField(render, "title", language)}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    {/* Glass overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-white mb-2">
                          {t(`gallery.${render.category}`)}
                        </span>
                        <h3 className="text-white font-sans font-medium text-sm leading-tight">{getLocalizedField(render, "title", language)}</h3>
                      </div>
                    </div>
                  </button>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </Layout>
  );
};

export default Gallery;
