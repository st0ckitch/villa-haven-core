// Olimpo project page
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { AnimatedSection } from "@/components/AnimatedSection";
import { CatalogSection } from "@/components/CatalogSection";
import { ContactSection } from "@/components/home/ContactSection";
import { RenderGalleryWithDescription } from "@/components/RenderGalleryWithDescription";
import { InfrastructureTicker } from "@/components/InfrastructureTicker";
import { ClubMembershipCTA } from "@/components/ClubMembershipCTA";
import { ProjectHero } from "@/components/ProjectHero";
import { GlassVideoFrame } from "@/components/GlassVideoFrame";
import { ServicesGlassGrid } from "@/components/ServicesGlassGrid";
import {
  Loader2,
  Dumbbell,
  Hotel,
  Sparkles,
  Trophy,
  TreePine,
  ConciergeBell,
  ShieldCheck,
  Trees,
  Car,
  Wrench,
  SprayCan,
  Waves,
  Heart,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const KEYS = [
  "olimpo_hero_image",
  "olimpo_title",
  "olimpo_description",
  "olimpo_vision_title",
  "olimpo_vision_text",
  "olimpo_video_url",
  "olimpo_join_title",
  "olimpo_join_description",
  "olimpo_member_services",
];

const APARTMENT_TYPES = [
  { key: "aptStudio", icon: "🏠" },
  { key: "aptSemiStandard", icon: "🏡" },
  { key: "aptNonStandard", icon: "🏗️" },
  { key: "aptPenthouse", icon: "🌆" },
];

const DIRECTIONS = [
  { icon: Trophy, key: "direction_sports" },
  { icon: Dumbbell, key: "direction_equestrian" },
  { icon: Hotel, key: "direction_hotel" },
  { icon: Sparkles, key: "direction_wellness" },
  { icon: TreePine, key: "direction_recreation" },
];

const SERVICES = [
  { icon: ConciergeBell, key: "serviceConcierge" },
  { icon: ShieldCheck, key: "serviceSecurity" },
  { icon: Trees, key: "serviceLandscape" },
  { icon: Car, key: "serviceParking" },
  { icon: Wrench, key: "serviceMaintenance" },
  { icon: SprayCan, key: "serviceCleaning" },
  { icon: Waves, key: "servicePool" },
  { icon: Heart, key: "serviceSpa" },
];

const Olimpo = () => {
  const { t } = useLanguage();
  const { data: content, isLoading } = useQuery({
    queryKey: ["olimpo-page"],
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
  const memberServices = c.olimpo_member_services ? c.olimpo_member_services.split("\n").filter(Boolean) : [];

  return (
    <Layout>
      <SEO title={`${c.olimpo_title || "Olimpo"} — Igavi`} description={c.olimpo_description?.slice(0, 160) || ""} />

      {/* 1. Hero — glass overlay card */}
      {c.olimpo_hero_image && (
        <ProjectHero
          image={c.olimpo_hero_image}
          breadcrumb={c.olimpo_title || "Olimpo"}
          title={c.olimpo_title || "Olimpo"}
          subtitle={c.olimpo_description?.split("\n")[0]?.slice(0, 140) || ""}
          badge={t("nav.projects")}
          backLink={{ label: t("nav.home"), to: "/" }}
        />
      )}

      {/* 2. Gallery + Description (2-col layout) */}
      <AnimatedSection>
        <RenderGalleryWithDescription
          project="olimpo"
          title={c.olimpo_title || "Olimpo"}
          description={c.olimpo_description || ""}
          visionTitle={c.olimpo_vision_title}
          visionText={c.olimpo_vision_text}
          extraContent={
            <div>
              <p className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-primary/50 mb-3">
                {t("olimpo.apartmentTypesTitle")}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {APARTMENT_TYPES.map((apt) => (
                  <div
                    key={apt.key}
                    className="group relative rounded-xl bg-white/60 backdrop-blur-md border border-[hsl(130_55%_40%/0.12)] p-3 flex items-center gap-2.5 hover:bg-white hover:border-[hsl(130_55%_40%/0.3)] hover:shadow-[0_4px_16px_rgba(45,143,67,0.1)] transition-all duration-300"
                  >
                    <span className="text-xl shrink-0">{apt.icon}</span>
                    <h3 className="font-sans text-xs font-semibold leading-tight">
                      {t(`olimpo.${apt.key}`)}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          }
        />
      </AnimatedSection>

      {/* 3. Video with glass frame */}
      {c.olimpo_video_url && (
        <div className="container mx-auto px-6 pb-16 md:pb-24 max-w-5xl">
          <AnimatedSection>
            <GlassVideoFrame url={c.olimpo_video_url} label={t("nav.projects")} />
          </AnimatedSection>
        </div>
      )}

      {/* 4. Main Directions — Glass Grid */}
      <div className="container mx-auto px-6 pb-16 lg:pb-24 max-w-5xl">
        <AnimatedSection>
          <p className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-primary/50 mb-3">
            {t("projects.mainDirections")}
          </p>
          <h2 className="font-sans text-3xl md:text-4xl font-light tracking-tight text-foreground mb-10">
            Main <span className="font-medium">Directions</span>
          </h2>
        </AnimatedSection>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {DIRECTIONS.map((d, i) => {
            const Icon = d.icon;
            return (
              <AnimatedSection key={d.key} delay={i * 60}>
                <div className="group relative bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-6 flex flex-col items-center text-center gap-4
                  shadow-[0_2px_16px_rgba(0,0,0,0.04)]
                  hover:bg-white hover:shadow-[0_8px_32px_rgba(45,143,67,0.15)] hover:border-[hsl(130_55%_40%/0.25)] hover:scale-[1.03] hover:-translate-y-0.5
                  transition-all duration-300 cursor-default">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(130_55%_40%/0.12)] to-[hsl(130_55%_40%/0.04)]
                    group-hover:from-[hsl(130_55%_40%/0.2)] group-hover:to-[hsl(130_55%_40%/0.08)]
                    flex items-center justify-center transition-all duration-300">
                    <Icon className="w-6 h-6 text-[hsl(130_55%_35%)] group-hover:text-[hsl(130_55%_30%)] transition-colors duration-300" strokeWidth={1.8} />
                  </div>
                  <span className="font-sans text-sm font-medium text-foreground/75 group-hover:text-foreground transition-colors duration-300 leading-tight">
                    {t(`olimpo.${d.key}`)}
                  </span>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>

      {/* 5. Infrastructure Ticker */}
      <div className="py-12">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-8">
              <p className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-primary/50 mb-3">
                {t("olimpo.infrastructureTitle")}
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

      {/* 6. Club Membership CTA */}
      <ClubMembershipCTA
        project="olimpo"
        joinTitle={c.olimpo_join_title}
        joinDescription={c.olimpo_join_description}
        services={memberServices}
      />

      {/* 7. Services Grid */}
      <ServicesGlassGrid
        items={SERVICES}
        namespace="olimpo"
        title={t("olimpo.servicesTitle")}
      />

      {/* 8. Catalog Downloads */}
      <CatalogSection />

      {/* 9. Contact */}
      <ContactSection />
    </Layout>
  );
};

export default Olimpo;
