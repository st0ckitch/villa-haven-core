import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { AnimatedSection } from "@/components/AnimatedSection";
import { CatalogSection } from "@/components/CatalogSection";
import { ContactSection } from "@/components/home/ContactSection";
import { RenderGalleryWithDescription } from "@/components/RenderGalleryWithDescription";
import { InfrastructureTicker } from "@/components/InfrastructureTicker";
import { VillaGrouping } from "@/components/VillaGrouping";
import { PlotMapPublic } from "@/components/PlotMapPublic";
import { ProjectHero } from "@/components/ProjectHero";
import { GlassVideoFrame } from "@/components/GlassVideoFrame";
import { GlassInfoCard } from "@/components/GlassInfoCard";
import { StatsGlassPanel } from "@/components/StatsGlassPanel";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const KEYS = [
  "polograph_hero_image",
  "polograph_title",
  "polograph_description",
  "polograph_vision_title",
  "polograph_vision_text",
  "polograph_video_url",
  "polograph_delivery_title",
  "polograph_delivery_text",
];

// Client-requested default content (Slides 10–11 of feedback PPTX).
// Admin-entered values in site_settings take precedence — these only render when empty.
const POLOGRAPH_DEFAULT_TITLE = "პოლოგრაფი იგავისგან";
const POLOGRAPH_DEFAULT_DESCRIPTION =
  "სიმწვანეში ჩაფლული ეკო-მეგობრული, უნიკალური საცხოვრებელი გარემო, სადაც მობინადრეები კომფორტულად და ჰარმონიულად გრძნობენ თავს.";

const Polograph = () => {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState("all");
  const [counts, setCounts] = useState({ all: 0, available: 0, reserved: 0, sold: 0 });

  const { data: content, isLoading } = useQuery({
    queryKey: ["polograph-page"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("key, value").in("key", KEYS);
      const map: Record<string, string> = {};
      data?.forEach((r) => (map[r.key] = r.value));
      return map;
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  const c = content || {};

  const investStats = [
    { value: t("polograph.stat1Value"), label: t("polograph.stat1Label") },
    { value: t("polograph.stat2Value"), label: t("polograph.stat2Label") },
    { value: t("polograph.stat3Value"), label: t("polograph.stat3Label") },
    { value: t("polograph.stat4Value"), label: t("polograph.stat4Label") },
  ];

  const filterButtons = [
    { key: "all", label: t("sitePlan.all"), count: counts.all },
    { key: "available", label: t("sitePlan.available"), count: counts.available },
    { key: "reserved", label: t("sitePlan.reserved"), count: counts.reserved },
    { key: "sold", label: t("sitePlan.sold"), count: counts.sold },
  ];

  return (
    <Layout>
      <SEO title={`${c.polograph_title || t("nav.polograph")} — Igavi`} description={c.polograph_description?.slice(0, 160) || ""} />

      {/* 1. Hero with glass card */}
      {c.polograph_hero_image && (
        <ProjectHero
          image={c.polograph_hero_image}
          breadcrumb={c.polograph_title || POLOGRAPH_DEFAULT_TITLE}
          title={c.polograph_title || POLOGRAPH_DEFAULT_TITLE}
          subtitle={(c.polograph_description || POLOGRAPH_DEFAULT_DESCRIPTION).split("\n")[0]?.slice(0, 140) || ""}
          badge={t("nav.projects")}
          backLink={{ label: t("nav.home"), to: "/" }}
        />
      )}

      {/* 2. Gallery + Description */}
      <AnimatedSection>
        <RenderGalleryWithDescription
          project="polograph"
          title={c.polograph_title || POLOGRAPH_DEFAULT_TITLE}
          description={c.polograph_description || POLOGRAPH_DEFAULT_DESCRIPTION}
          visionTitle={c.polograph_vision_title}
          visionText={c.polograph_vision_text}
        />
      </AnimatedSection>

      {/* 3. Investment Stats */}
      <StatsGlassPanel
        stats={investStats}
        title={t("polograph.investTitle")}
        subtitle={t("projects.investment") !== "projects.investment" ? t("projects.investment") : "Investment"}
      />

      {/* 4. Interactive Site Plan */}
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <AnimatedSection>
          <p className="font-sans text-base md:text-lg text-foreground/80 mb-10 max-w-3xl leading-relaxed">
            {t("sitePlan.instruction")}
          </p>

          {/* Glass filter buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {filterButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setStatusFilter(btn.key)}
                className={`px-5 py-2.5 rounded-full font-sans text-sm transition-all duration-300 ${
                  statusFilter === btn.key
                    ? "bg-gradient-to-r from-[#2d8f43] to-[#3aa557] text-white shadow-[0_4px_16px_rgba(45,143,67,0.3)]"
                    : "bg-white/60 backdrop-blur-md border border-[hsl(130_55%_40%/0.12)] text-foreground/70 hover:bg-white hover:border-[hsl(130_55%_40%/0.3)] hover:text-foreground"
                }`}
              >
                {btn.label} ({btn.count})
              </button>
            ))}
          </div>

          <PlotMapPublic statusFilter={statusFilter} onCounts={setCounts} />
        </AnimatedSection>
      </div>

      {/* 5. Villa Grouping by sqm */}
      <div className="container mx-auto px-6 pb-16 max-w-6xl">
        <VillaGrouping />
      </div>

      {/* 6. Video */}
      {c.polograph_video_url && (
        <div className="container mx-auto px-6 pb-16 md:pb-24 max-w-5xl">
          <AnimatedSection>
            <GlassVideoFrame url={c.polograph_video_url} label={t("nav.polograph")} />
          </AnimatedSection>
        </div>
      )}

      {/* 7. Infrastructure Ticker */}
      <div className="py-12">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-8">
              <p className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-primary/50 mb-3">
                {t("amenities.title1")}
              </p>
              <h2 className="font-sans text-2xl md:text-3xl font-light tracking-tight text-foreground">
                World-class <span className="font-medium">infrastructure</span>
              </h2>
            </div>
          </AnimatedSection>
        </div>
        <div className="relative py-8 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[hsl(130_55%_40%/0.05)] via-[hsl(130_55%_50%/0.12)] to-[hsl(130_55%_40%/0.05)]" />
          <InfrastructureTicker />
        </div>
      </div>

      {/* 8. Delivery Conditions */}
      {(c.polograph_delivery_title || c.polograph_delivery_text) && (
        <div className="container mx-auto px-6 py-16 lg:py-20 max-w-5xl">
          <AnimatedSection>
            <GlassInfoCard
              title={c.polograph_delivery_title || ""}
              text={c.polograph_delivery_text || ""}
              variant="delivery"
            />
          </AnimatedSection>
        </div>
      )}

      {/* 9. Catalog */}
      <CatalogSection />

      {/* 10. Contact */}
      <ContactSection />
    </Layout>
  );
};

export default Polograph;
