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
import { PlotMapPublic } from "@/components/PlotMapPublic";
import { ProjectHero } from "@/components/ProjectHero";
import { GlassVideoFrame } from "@/components/GlassVideoFrame";
import { GlassInfoCard } from "@/components/GlassInfoCard";
import { HelicopterBanner } from "@/components/HelicopterBanner";
import { GreenFrameSection } from "@/components/GreenFrameSection";
import { ServicesGlassGrid } from "@/components/ServicesGlassGrid";
import {
  Loader2,
  ConciergeBell,
  ShieldCheck,
  Car,
  Wrench,
  Trees,
  SprayCan,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { AvailabilityPanel, type AvailabilityStatus } from "@/components/AvailabilityPanel";

/**
 * All `site_settings` keys we read for this page, including per-language variants.
 * Admin can populate any of these; `getLocalizedContent` resolves the best match:
 *   polograph_title_<lang> → polograph_title → i18n default
 */
const KEYS = [
  "polograph_hero_image",
  "polograph_title",
  "polograph_title_ka", "polograph_title_en", "polograph_title_ru",
  "polograph_description",
  "polograph_description_ka", "polograph_description_en", "polograph_description_ru",
  "polograph_vision_title",
  "polograph_vision_title_ka", "polograph_vision_title_en", "polograph_vision_title_ru",
  "polograph_vision_text",
  "polograph_vision_text_ka", "polograph_vision_text_en", "polograph_vision_text_ru",
  "polograph_video_url",
  "polograph_delivery_title",
  "polograph_delivery_title_ka", "polograph_delivery_title_en", "polograph_delivery_title_ru",
  "polograph_delivery_text",
  "polograph_delivery_text_ka", "polograph_delivery_text_en", "polograph_delivery_text_ru",
];

// Polograph subset of services (PPTX slide 9)
const POLOGRAPH_SERVICES = [
  { icon: ConciergeBell, key: "serviceConcierge" },
  { icon: ShieldCheck, key: "serviceSecurity" },
  { icon: Car, key: "serviceParking" },
  { icon: Wrench, key: "serviceMaintenance" },
  { icon: Trees, key: "serviceLandscape" },
  { icon: SprayCan, key: "serviceCleaning" },
];

const Polograph = () => {
  const { t, language } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<AvailabilityStatus>("all");
  const [sizeFilter, setSizeFilter] = useState<[number, number] | null>(null);
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
  // Resolver priority: per-language key (admin override) → i18n default.
  // The old language-neutral `polograph_*` rows were populated with English-only
  // copy before per-language fields existed, so we bypass that tier to avoid
  // showing the legacy English on KA/RU. Admin edits always win via `_<lang>`.
  const pick = (key: string, fallback: string) => {
    const v = c[`${key}_${language}`];
    return v && v.trim().length > 0 ? v : fallback;
  };
  const titleText = pick("polograph_title", t("polograph.titleDefault"));
  const descriptionText = pick("polograph_description", t("polograph.descriptionDefault"));
  const visionTitle = pick("polograph_vision_title", t("polograph.visionTitleDefault"));
  const visionText = pick("polograph_vision_text", t("polograph.visionTextDefault"));
  const deliveryTitle = pick("polograph_delivery_title", "");
  const deliveryText = pick("polograph_delivery_text", "");

  return (
    <Layout>
      <SEO title={`${titleText} — Igavi`} description={descriptionText.slice(0, 160)} />

      {/* 1. Hero with glass card — breadcrumb uses generic project label to avoid duplicate title (slide 6) */}
      {c.polograph_hero_image && (
        <ProjectHero
          image={c.polograph_hero_image}
          breadcrumb={t("footer.polograph")}
          title={titleText}
          subtitle={descriptionText.split("\n")[0]?.slice(0, 140) || ""}
          badge={t("nav.projects")}
          backLink={{ label: t("nav.home"), to: "/" }}
        />
      )}

      {/* 2. Gallery + Description */}
      <AnimatedSection>
        <RenderGalleryWithDescription
          project="polograph"
          title={titleText}
          description={descriptionText}
          visionTitle={visionTitle}
          visionText={visionText}
        />
      </AnimatedSection>

      {/* 3. Helicopter Aerodrome banner (replaces Investment Stats per slide 6) */}
      <HelicopterBanner />

      {/* 4. Interactive Site Plan */}
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <AnimatedSection>
          <p className="font-sans text-base md:text-lg font-medium text-foreground/90 mb-10 max-w-3xl mx-auto text-center leading-relaxed">
            {t("sitePlan.instruction")}
          </p>

          {/* Availability panel — pulled out of the map area into its own
              card above. */}
          <div className="mb-8">
            <AvailabilityPanel counts={counts} active={statusFilter} onChange={setStatusFilter} centered />
          </div>

          <PlotMapPublic statusFilter={statusFilter} sizeFilter={sizeFilter} onCounts={setCounts} />
        </AnimatedSection>
      </div>

      {/* 6. Video */}
      {c.polograph_video_url && (
        <div className="container mx-auto px-6 pb-12 md:pb-16 max-w-5xl">
          <AnimatedSection>
            <GlassVideoFrame url={c.polograph_video_url} label={t("nav.polograph")} />
          </AnimatedSection>
        </div>
      )}

      {/* 7. Infrastructure Ticker */}
      <div className="py-10">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <h2 className="mb-6 font-mtavruli font-sans text-sm md:text-base font-medium tracking-tight text-center text-[hsl(130_55%_32%)]">
              {t("projects.multipleInfra")}
            </h2>
          </AnimatedSection>
        </div>
        <div className="relative py-6 overflow-hidden bg-white border-y-2 border-[hsl(130_55%_40%/0.45)]">
          <InfrastructureTicker />
        </div>
      </div>

      {/* 8. Green Frame Condition (new — slide 8) */}
      <GreenFrameSection />

      {/* 9. Polograph services (subset, slide 9) */}
      <ServicesGlassGrid
        items={POLOGRAPH_SERVICES}
        namespace="polograph"
        title={t("polograph.servicesTitle")}
      />

      {/* 10. Delivery Conditions (admin-editable) */}
      {(deliveryTitle || deliveryText) && (
        <div className="container mx-auto px-6 py-12 lg:py-16 max-w-5xl">
          <AnimatedSection>
            <GlassInfoCard
              title={deliveryTitle}
              text={deliveryText}
              variant="delivery"
            />
          </AnimatedSection>
        </div>
      )}

      {/* 11. Catalog */}
      <CatalogSection />

      {/* 12. Contact */}
      <ContactSection />
    </Layout>
  );
};

export default Polograph;
