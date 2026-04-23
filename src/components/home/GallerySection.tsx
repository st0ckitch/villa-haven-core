import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Lightbox } from "@/components/Lightbox";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, getLocalizedField } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type Render = Record<string, any>;

export const GallerySection = () => {
  const { language, t } = useLanguage();
  const [renders, setRenders] = useState<Render[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Primary source: the `renders` table (admin-curated homepage gallery).
  // Fallback: aggregate the per-project galleries (`project_renders`) so the
  // section still renders after Latest News even when `renders` is empty.
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("renders")
        .select("*")
        .order("sort_order")
        .limit(6);
      if (data && data.length > 0) {
        setRenders(data);
        return;
      }
      const { data: pr } = await supabase
        .from("project_renders")
        .select("*")
        .order("sort_order")
        .limit(6);
      setRenders((pr as Render[]) || []);
    })();
  }, []);

  if (renders.length === 0) return null;

  const lightboxImages = renders.map((r) => ({
    url: r.image_url,
    title: getLocalizedField(r, "title", language),
  }));

  return (
    <section className="py-8 lg:py-12 bg-background">
      <div className="container mx-auto px-6">
        <AnimatedSection>
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-foreground">
              {t("gallery.title")}
            </h2>
            <Link to="/gallery">
              <Button variant="outline" className="rounded-full hidden md:inline-flex font-sans gap-2">
                {t("properties.viewAll")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {renders.slice(0, 6).map((render, i) => (
              <button
                key={render.id}
                onClick={() => setLightboxIndex(i)}
                className="group relative aspect-[4/3] w-full rounded-2xl overflow-hidden cursor-pointer text-left
                  border border-white/40 shadow-[0_2px_12px_rgba(0,0,0,0.04)]
                  hover:shadow-[0_12px_32px_rgba(45,143,67,0.18)] hover:border-[hsl(130_55%_40%/0.3)] hover:-translate-y-1
                  transition-all duration-300"
              >
                <img
                  src={render.image_url}
                  alt={getLocalizedField(render, "title", language)}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-sans font-medium text-sm leading-tight">
                      {getLocalizedField(render, "title", language)}
                    </h3>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </AnimatedSection>

        <div className="mt-6 text-center md:hidden">
          <Link to="/gallery">
            <Button variant="outline" className="rounded-full font-sans gap-2">
              {t("properties.viewAll")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  );
};
