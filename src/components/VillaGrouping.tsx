import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const RANGES = [
  { label: "500–700", min: 500, max: 700 },
  { label: "700–800", min: 700, max: 800 },
  { label: "800–900", min: 800, max: 900 },
  { label: "900–1100", min: 900, max: 1100 },
];

export const VillaGrouping = () => {
  const { t } = useLanguage();
  const [activeRange, setActiveRange] = useState(0);

  const { data: villas = [] } = useQuery({
    queryKey: ["villas-with-images"],
    queryFn: async () => {
      const { data } = await supabase
        .from("villas")
        .select("id, name, slug, size_sqm, status, villa_images(image_url, is_hero, sort_order)")
        .order("size_sqm");
      return data || [];
    },
  });

  const range = RANGES[activeRange];
  const filtered = villas.filter(
    (v) => v.size_sqm >= range.min && v.size_sqm < range.max
  );

  return (
    <AnimatedSection>
      <h2 className="text-2xl md:text-3xl mb-6">{t("projects.villasBySize")}</h2>

      {/* Range buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        {RANGES.map((r, i) => (
          <button
            key={r.label}
            onClick={() => setActiveRange(i)}
            className={`px-5 py-2.5 rounded-full font-sans text-sm transition-colors ${
              i === activeRange
                ? "bg-gradient-to-r from-[#2d8f43] to-[#3aa557] text-white shadow-md"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            {r.label} m²
          </button>
        ))}
      </div>

      {/* Villa grid */}
      {filtered.length === 0 ? (
        <p className="font-sans text-muted-foreground text-sm">{t("projects.noVillas")}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((villa) => {
            const heroImg = villa.villa_images?.find((img: any) => img.is_hero)?.image_url
              || villa.villa_images?.[0]?.image_url;
            return (
              <Link
                key={villa.id}
                to={`/villa/${villa.slug || villa.id}`}
                className="group rounded-xl overflow-hidden bg-card border border-border hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  {heroImg ? (
                    <img
                      src={heroImg}
                      alt={villa.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">{t("villa.noImage")}</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm">{villa.name}</p>
                  <p className="font-sans text-xs text-muted-foreground">{villa.size_sqm} m²</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AnimatedSection>
  );
};
