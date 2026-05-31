import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { AnimatedSection } from "@/components/AnimatedSection";
import { PlotMapPublic } from "@/components/PlotMapPublic";
import { AvailabilityPanel, type AvailabilityStatus } from "@/components/AvailabilityPanel";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
  const { t } = useLanguage();

  const handleCounts = useCallback((c: typeof counts) => setCounts(c), []);

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-6">
        <AnimatedSection>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-sans text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-foreground">
                {t("sitePlan.title")}
              </h2>
              <p className="font-sans text-base text-muted-foreground mt-2 max-w-2xl">
                {t("sitePlan.subtitle")}
              </p>
            </div>
            <Link to="/site-plan" className="shrink-0">
              <Button variant="outline" className="rounded-full font-sans gap-2 hidden md:inline-flex">
                {t("properties.viewAll")} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </AnimatedSection>

        {/* Availability panel — clearly outside the map (in its own card
            above it) so the filter row isn't perceived as part of the map. */}
        <AnimatedSection delay={100}>
          <div className="mb-6">
            <AvailabilityPanel counts={counts} active={statusFilter} onChange={setStatusFilter} />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <div className="rounded-2xl overflow-hidden border border-border bg-white/40 backdrop-blur-md">
            <PlotMapPublic statusFilter={statusFilter} onCounts={handleCounts} />
          </div>
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
