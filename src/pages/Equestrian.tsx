/**
 * Ipodromi page (renamed from Equestrian per client feedback PPTX).
 * File name kept as Equestrian.tsx for backward-compatible admin & import paths;
 * route `/ipodromi` is the primary public URL, `/equestrian` is a backward alias.
 */
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
  Warehouse,
  Home as HomeIcon,
  TreePine,
  Crown,
  GraduationCap,
  ConciergeBell,
  ShieldCheck,
  Trees,
  Car,
  Wrench,
  SprayCan,
  Stethoscope,
  Home,
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

/**
 * Ipodromi advantages — 5 items per client PPTX slide 15.
 */
const ADVANTAGES = [
  { icon: Warehouse, key: "adv_stable120" },
  { icon: HomeIcon, key: "adv_indoorArena" },
  { icon: TreePine, key: "adv_outdoorArena" },
  { icon: Crown, key: "adv_dressageField" },
  { icon: GraduationCap, key: "adv_sportsSchool" },
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

const Ipodromi = () => {
  const { t } = useLanguage();
  const { data: content, isLoading } = useQuery({
    queryKey: ["ipodromi-page"],
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
  const titleText = c.equestrian_title || t("ipodromi.title");
  const descriptionText = c.equestrian_description || t("ipodromi.descriptionDefault");

  return (
    <Layout>
      <SEO title={`${titleText} — Igavi`} description={descriptionText.slice(0, 160)} />

      {/* 1. Hero with glass card */}
      {c.equestrian_hero_image && (
        <ProjectHero
          image={c.equestrian_hero_image}
          breadcrumb={titleText}
          title={titleText}
          subtitle={descriptionText.split("\n")[0]?.slice(0, 140) || ""}
          badge={t("nav.projects")}
          backLink={{ label: t("nav.home"), to: "/" }}
        />
      )}

      {/* 2. Gallery + Description */}
      <AnimatedSection>
        <RenderGalleryWithDescription
          project="equestrian"
          title={titleText}
          description={descriptionText}
          visionTitle={c.equestrian_vision_title}
          visionText={c.equestrian_vision_text}
        />
      </AnimatedSection>

      {/* 3. Ipodromi Advantages — 5 items (slide 15) */}
      <div className="container mx-auto px-6 pb-12 lg:pb-16 max-w-5xl">
        <AnimatedSection>
          <div className="mb-8">
            <h2 className="font-sans text-3xl md:text-4xl font-light tracking-tight text-foreground">
              <span className="font-medium">{t("ipodromi.advantagesTitle")}</span>
            </h2>
          </div>
        </AnimatedSection>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {ADVANTAGES.map((d, i) => {
            const Icon = d.icon;
            return (
              <AnimatedSection key={d.key} delay={i * 60}>
                <TiltCard maxTilt={7} scale={1.04} glare={false}>
                  <div className="group relative bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-6 flex flex-col items-center text-center gap-4
                    shadow-[0_2px_16px_rgba(0,0,0,0.04)]
                    hover:bg-white hover:shadow-[0_8px_32px_rgba(45,143,67,0.15)] hover:border-[hsl(130_55%_40%/0.25)]
                    transition-all duration-300 cursor-default h-full">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(130_55%_40%/0.12)] to-[hsl(130_55%_40%/0.04)]
                      group-hover:from-[hsl(130_55%_40%/0.2)] group-hover:to-[hsl(130_55%_40%/0.08)]
                      flex items-center justify-center transition-all duration-300"
                      style={{ transform: "translateZ(25px)" }}>
                      <Icon className="w-6 h-6 text-[hsl(130_55%_35%)] group-hover:text-[hsl(130_55%_30%)] transition-colors duration-300" strokeWidth={1.8} />
                    </div>
                    <span className="font-sans text-sm font-medium text-foreground/75 group-hover:text-foreground transition-colors duration-300 leading-tight"
                      style={{ transform: "translateZ(15px)" }}>
                      {t(`ipodromi.${d.key}`)}
                    </span>
                  </div>
                </TiltCard>
              </AnimatedSection>
            );
          })}
        </div>
      </div>

      {/* 4. Video */}
      {c.equestrian_video_url && (
        <div className="container mx-auto px-6 pb-12 md:pb-16 max-w-5xl">
          <AnimatedSection>
            <GlassVideoFrame url={c.equestrian_video_url} label={t("nav.projects")} />
          </AnimatedSection>
        </div>
      )}

      {/* 5. Equestrian Club banner — horizontal banner as sub-section of Ipodromi (slide 16) */}
      <div className="container mx-auto px-6 pb-12 lg:pb-16 max-w-6xl">
        <AnimatedSection>
          <div className="relative rounded-3xl overflow-hidden min-h-[220px] md:min-h-[260px] flex items-center
            bg-gradient-to-r from-[hsl(130_55%_40%/0.15)] via-[hsl(130_55%_50%/0.25)] to-[hsl(130_55%_40%/0.15)]
            backdrop-blur-md border border-[hsl(130_55%_40%/0.2)]
            shadow-[0_12px_40px_rgba(45,143,67,0.15)]">
            {/* Placeholder background image — replace /equestrian-club-banner.jpg when asset arrives */}
            <img
              src="/equestrian-club-banner.jpg"
              alt=""
              aria-hidden
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/30 to-transparent" />

            <div className="relative p-8 md:p-12 w-full text-center md:text-left">
              <h3 className="font-sans text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-3">
                <span className="font-medium">{t("ipodromi.equestrianClubBannerTitle")}</span>
              </h3>
              <p className="font-sans text-sm md:text-base text-foreground/75 leading-relaxed max-w-2xl mx-auto md:mx-0">
                {t("ipodromi.equestrianClubDescription")}
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {/* 6. Infrastructure Ticker */}
      <div className="py-10">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <div className="text-center mb-6">
              <p className="text-xs md:text-sm font-sans font-semibold uppercase tracking-[0.3em] text-[hsl(130_55%_35%)]">
                {t("projects.multipleInfra")}
              </p>
            </div>
          </AnimatedSection>
        </div>
        <div className="relative py-6 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[hsl(130_55%_40%/0.05)] via-[hsl(130_55%_50%/0.12)] to-[hsl(130_55%_40%/0.05)]" />
          <InfrastructureTicker />
        </div>
      </div>

      {/* 7. Club Membership CTA */}
      <ClubMembershipCTA
        project="equestrian"
        joinTitle={c.equestrian_join_title}
        joinDescription={c.equestrian_join_description}
        services={memberServices}
      />

      {/* 8. Services Grid */}
      <ServicesGlassGrid
        items={SERVICES}
        namespace="ipodromi"
        title={t("ipodromi.servicesTitle")}
      />

      {/* 9. Catalog Downloads */}
      <CatalogSection />

      {/* 10. Contact */}
      <ContactSection />
    </Layout>
  );
};

export default Ipodromi;
