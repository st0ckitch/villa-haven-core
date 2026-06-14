import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatedSection } from "@/components/AnimatedSection";
import { PlotMapPublic } from "@/components/PlotMapPublic";
import { AvailabilityPanel, type AvailabilityStatus } from "@/components/AvailabilityPanel";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Plot map embedded on the home page (between the gallery and the contact
 * banner) so visitors can start the villa-picker flow without first
 * navigating to /site-plan. Same interactive PlotMapPublic, lighter chrome
 * — no glass frame around the map, no decorative orbs — so it doesn't
 * compete with the rest of the homepage's editorial layout.
 */
export const HomePlotMapSection = () => {
  const [statusFilter, setStatusFilter] = useState<AvailabilityStatus>("all");
  const [counts, setCounts] = useState({ all: 0, available: 0, reserved: 0, sold: 0 });
  // Toggle + static-photo fallback read from public.site_settings — admin
  // flips these in /admin/settings. Defaults to "enabled" so a missing
  // row never breaks the homepage. "0" / "false" / "no" all disable.
  const [mapEnabled, setMapEnabled] = useState(true);
  const [staticImage, setStaticImage] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["homepage_plotmap_enabled", "homepage_plotmap_static_image"])
      .then(({ data }) => {
        if (!data) return;
        for (const row of data) {
          if (row.key === "homepage_plotmap_enabled") {
            const v = (row.value || "").trim().toLowerCase();
            setMapEnabled(v !== "0" && v !== "false" && v !== "no" && v !== "");
          } else if (row.key === "homepage_plotmap_static_image") {
            setStaticImage(row.value || null);
          }
        }
      });
  }, []);

  const handleCounts = useCallback((c: typeof counts) => setCounts(c), []);

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-6">
        <AnimatedSection>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-sans text-base md:text-lg font-light tracking-tight text-foreground md:whitespace-nowrap">
                {t("sitePlan.mapHeading")}
              </h2>
            </div>
            <Link to="/site-plan" className="shrink-0">
              <Button variant="outline" className="rounded-full font-sans gap-2 hidden md:inline-flex">
                {t("properties.viewAll")} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </AnimatedSection>

        {/* Availability panel — only shown when the live map is enabled.
            With the map hidden the filter row would be context-less. */}
        {mapEnabled && (
          <AnimatedSection delay={100}>
            <div className="mb-6">
              <AvailabilityPanel counts={counts} active={statusFilter} onChange={setStatusFilter} />
            </div>
          </AnimatedSection>
        )}

        <AnimatedSection delay={200}>
          {mapEnabled ? (
            <div className="rounded-2xl overflow-hidden border border-border bg-white/40 backdrop-blur-md">
              <PlotMapPublic statusFilter={statusFilter} onCounts={handleCounts} />
            </div>
          ) : staticImage ? (
            <Link to="/site-plan" className="block">
              <div className="rounded-2xl overflow-hidden border border-border bg-white/40 backdrop-blur-md">
                <img
                  src={staticImage}
                  alt={t("sitePlan.title")}
                  loading="lazy"
                  className="w-full h-auto block hover:scale-[1.01] transition-transform duration-500"
                />
              </div>
            </Link>
          ) : (
            // Toggle off but no fallback image yet — keep the map so the
            // section doesn't go blank. Admin uploads the photo to flip
            // the visual without redeploy.
            <div className="rounded-2xl overflow-hidden border border-border bg-white/40 backdrop-blur-md">
              <PlotMapPublic statusFilter={statusFilter} onCounts={handleCounts} />
            </div>
          )}
        </AnimatedSection>

        {/* Mobile "view full plan" CTA, hidden on desktop where the header
            link already serves the same purpose. */}
        <div className="mt-6 text-center md:hidden">
          <Link to="/site-plan">
            <Button variant="outline" className="rounded-full font-sans gap-2">
              {t("properties.viewAll")} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
