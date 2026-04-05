import { BedDouble, Bath, Maximize } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export const PropertiesSection = () => {
  const { t } = useLanguage();

  const { data: villas } = useQuery({
    queryKey: ["homepage-villas"],
    queryFn: async () => {
      const { data: villasData, error } = await supabase
        .from("villas")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;

      // Fetch hero images for these villas
      if (!villasData?.length) return [];
      const villaIds = villasData.map((v) => v.id);
      const { data: images } = await supabase
        .from("villa_images")
        .select("*")
        .in("villa_id", villaIds)
        .eq("is_hero", true);

      const imageMap = new Map(images?.map((img) => [img.villa_id, img.image_url]) || []);

      return villasData.map((v) => ({
        ...v,
        heroImage: imageMap.get(v.id) || "/placeholder.svg",
      }));
    },
  });

  const displayVillas = villas || [];

  return (
    <section className="py-12 lg:py-16 bg-background">
      <div className="container mx-auto px-6">
        <AnimatedSection>
          <div className="flex items-end justify-between mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl">
              {t("properties.title1")}<em className="italic">{t("properties.titleEm")}</em>
            </h2>
            <Link to="/site-plan">
              <Button variant="outline" className="rounded-full hidden md:inline-flex font-sans">
                {t("properties.viewAll")}
              </Button>
            </Link>
          </div>
        </AnimatedSection>

        {displayVillas.length === 0 ? (
          <p className="text-muted-foreground font-sans text-center py-12">{t("properties.noVillas")}</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayVillas.map((villa, i) => (
              <AnimatedSection key={villa.id} delay={i * 80}>
                <Link to={`/projects/${(villa as any).section || 'a-section'}/${villa.slug || villa.id}`}>
                  <div className="group bg-white/50 backdrop-blur-lg text-card-foreground rounded-2xl overflow-hidden border border-white/20 hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] hover:bg-white/60 hover:ring-1 hover:ring-white/30 transition-all duration-300 cursor-pointer">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={villa.heroImage}
                        alt={villa.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-5">
                      <p className="font-sans text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        {t(`sitePlan.${villa.status}`)}
                      </p>
                      <h3 className="text-lg mb-1">{villa.name}</h3>
                      {villa.price && (
                        <p className="font-sans text-lg font-semibold text-primary mb-3">
                          ${Number(villa.price).toLocaleString()}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-muted-foreground font-sans text-xs">
                        <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> {villa.size_sqm} m²</span>
                        <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {villa.bedrooms}</span>
                        <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {villa.bathrooms}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Link to="/site-plan">
            <Button variant="outline" className="rounded-full font-sans">{t("properties.viewAll")}</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
