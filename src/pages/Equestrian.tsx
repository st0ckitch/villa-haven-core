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
import { TiltCard } from "@/components/TiltCard";
import {
  Loader2,
  Heart,
  GraduationCap,
  Crown,
  Warehouse,
  TreePine,
  ConciergeBell,
  ShieldCheck,
  Trees,
  Car,
  Wrench,
  SprayCan,
  Home,
  Stethoscope,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const KEYS = [
  "equestrian_hero_image",
  "equestrian_title",
  "equestrian_description",
  "equestrian_vision_title",
  "equestrian_vision_text",
  "equestrian_video_url",
  "equestrian_join_title",
  "equestrian_join_description",
  "equestrian_member_services",
  "equestrian_details",
];

const DIRECTIONS = [
  { icon: Heart, key: "direction_horseCare" },
  { icon: GraduationCap, key: "direction_sportSchool" },
  { icon: Crown, key: "direction_dressage" },
  { icon: Warehouse, key: "direction_indoorArena" },
  { icon: TreePine, key: "direction_outdoorArena" },
];

const SERVICES = [
  { icon: ConciergeBell, key: "serviceConcierge" },
  { icon: ShieldCheck, key: "serviceSecurity" },
  { icon: Trees, key: "serviceLandscape" },
  { icon: Car, key: "serviceParking" },
  { icon: Home, key: "serviceStables" },
  { icon: Stethoscope, key: "serviceVeterinary" },
  { icon: SprayCan, key: "serviceCleaning" },
  { icon: Wrench, key: "serviceRidingGear" },
];

const Equestrian = () => {
  const { t } = useLanguage();
  const { data: content, isLoading } = useQuery({
    queryKey: ["equestrian-page"],
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
  const memberServices = c.equestrian_member_services ? c.equestrian_member_services.split("\n").filter(Boolean) : [];

  return (
    <Layout>
      <SEO title={`${c.equestrian_title || t("services.card3Title")} — Igavi`} description={c.equestrian_description?.slice(0, 160) || ""} />

      {/* 1. Hero with glass card */}
      {c.equestrian_hero_image && (
        <ProjectHero
          image={c.equestrian_hero_image}
          breadcrumb={c.equestrian_title || t("services.card3Title")}
          title={c.equestrian_title || t("services.card3Title")}
          subtitle={c.equestrian_description?.split("\n")[0]?.slice(0, 140) || ""}
          badge={t("nav.projects")}
          backLink={{ label: t("nav.home"), to: "/" }}
        />
      )}

      {/* 2. Gallery + Description */}
      <AnimatedSection>
        <RenderGalleryWithDescription
          project="equestrian"
          title={c.equestrian_title || t("services.card3Title")}
          description={c.equestrian_description || ""}
          visionTitle={c.equestrian_vision_title}
          visionText={c.equestrian_vision_text}
        />
      </AnimatedSection>

      {/* 3. Video */}
      {c.equestrian_video_url && (
        <div className="container mx-auto px-6 pb-16 md:pb-24 max-w-5xl">
          <AnimatedSection>
            <GlassVideoFrame url={c.equestrian_video_url} label={t("nav.projects")} />
          </AnimatedSection>
        </div>
      )}

      {/* 4. Main Directions — Glass Grid */}
      <div className="container mx-auto px-6 pb-16 lg:pb-24 max-w-5xl">
        <AnimatedSection>
          <p className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-primary/50 mb-3">
            {t("equestrian.directionsTitle")}
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
                <TiltCard maxTilt={7} scale={1.04} glare={false}>
                  <div className="group relative bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-6 flex flex-col items-center text-center gap-4
                    shadow-[0_2px_16px_rgba(0,0,0,0.04)]
                    hover:bg-white hover:shadow-[0_8px_32px_rgba(45,143,67,0.15)] hover:border-[hsl(130_55%_40%/0.25)]
                    transition-all duration-300 cursor-default">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(130_55%_40%/0.12)] to-[hsl(130_55%_40%/0.04)]
                      group-hover:from-[hsl(130_55%_40%/0.2)] group-hover:to-[hsl(130_55%_40%/0.08)]
                      flex items-center justify-center transition-all duration-300"
                      style={{ transform: "translateZ(25px)" }}>
                      <Icon className="w-6 h-6 text-[hsl(130_55%_35%)] group-hover:text-[hsl(130_55%_30%)] transition-colors duration-300" strokeWidth={1.8} />
                    </div>
                    <span className="font-sans text-sm font-medium text-foreground/75 group-hover:text-foreground transition-colors duration-300 leading-tight"
                      style={{ transform: "translateZ(15px)" }}>
                      {t(`equestrian.${d.key}`)}
                    </span>
                  </div>
                </TiltCard>
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
                {t("equestrian.infrastructureTitle")}
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
        project="equestrian"
        joinTitle={c.equestrian_join_title}
        joinDescription={c.equestrian_join_description}
        services={memberServices}
      />

      {/* 7. Services Grid */}
      <ServicesGlassGrid
        items={SERVICES}
        namespace="equestrian"
        title={t("equestrian.servicesTitle")}
      />

      {/* 8. Catalog Downloads */}
      <CatalogSection />

      {/* 9. Contact */}
      <ContactSection />
    </Layout>
  );
};

export default Equestrian;
