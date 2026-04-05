import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Lightbox } from "@/components/Lightbox";
import { SEO } from "@/components/SEO";
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
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-24">
        <div className="container mx-auto px-6">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif mb-4">{t("gallery.title")}</h1>
          <p className="text-muted-foreground font-sans mb-8 max-w-lg">
            {t("gallery.subtitle")}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {categoryKeys.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-sans font-medium transition-colors ${
                  filter === cat
                    ? "bg-gradient-to-r from-[#2d8f43] to-[#3aa557] text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t(`gallery.${cat}`)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground font-sans text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" /> {t("gallery.loading")}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground font-sans">{t("gallery.noRenders")}</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((render, i) => (
                <button
                  key={render.id}
                  onClick={() => setLightboxIndex(i)}
                  className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer text-left"
                >
                  <img
                    src={render.image_url}
                    alt={getLocalizedField(render, "title", language)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-white font-medium text-sm">{getLocalizedField(render, "title", language)}</h3>
                      <p className="text-white/70 text-xs font-sans capitalize">{t(`gallery.${render.category}`)}</p>
                    </div>
                  </div>
                </button>
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
