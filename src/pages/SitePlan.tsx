import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { PlotMapPublic } from "@/components/PlotMapPublic";
import { AvailabilityPanel, type AvailabilityStatus } from "@/components/AvailabilityPanel";
import { SEO } from "@/components/SEO";
import { AnimatedSection } from "@/components/AnimatedSection";
import { useLanguage } from "@/contexts/LanguageContext";

const SitePlan = () => {
  const [statusFilter, setStatusFilter] = useState<AvailabilityStatus>("all");
  const [counts, setCounts] = useState({ all: 0, available: 0, reserved: 0, sold: 0 });
  const { t } = useLanguage();

  const handleCounts = useCallback((c: typeof counts) => setCounts(c), []);

  return (
    <Layout>
      <SEO title={t("sitePlan.title")} description={t("sitePlan.subtitle")} />

      {/* Decorative orbs */}
      <div className="absolute inset-x-0 top-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(130_55%_40%/0.05)_0%,transparent_70%)] animate-orb-float" />
      </div>

      <section className="pt-28 lg:pt-32 pb-16 lg:pb-24">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <p className="font-sans text-base md:text-lg font-medium text-foreground/90 mb-10 max-w-3xl mx-auto text-center leading-relaxed">
              {t("sitePlan.instruction")}
            </p>
          </AnimatedSection>

          {/* Availability panel — sits outside the map's glass frame. */}
          <AnimatedSection delay={100}>
            <div className="mb-8">
              <AvailabilityPanel counts={counts} active={statusFilter} onChange={setStatusFilter} />
            </div>
          </AnimatedSection>

          {/* Glass frame for map */}
          <AnimatedSection delay={200}>
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-r from-[hsl(130_55%_40%/0.12)] via-[hsl(130_55%_50%/0.18)] to-[hsl(130_55%_40%/0.12)] rounded-[28px] blur-2xl -z-10 opacity-50" />
              <div className="p-1.5 rounded-[20px] bg-gradient-to-br from-[hsl(130_55%_40%/0.2)] via-white/40 to-[hsl(130_55%_40%/0.1)] backdrop-blur-md shadow-[0_16px_48px_rgba(45,143,67,0.1)]">
                <div className="rounded-[16px] overflow-hidden bg-white/60 backdrop-blur-md">
                  <PlotMapPublic statusFilter={statusFilter} onCounts={handleCounts} />
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default SitePlan;
