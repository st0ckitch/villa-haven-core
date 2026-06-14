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
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { TiltCard } from "@/components/TiltCard";
import {
  Loader2,
  Warehouse,
  Home as HomeIcon,
  TreePine,
  Crown,
  GraduationCap,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const KEYS = [
  "equestrian_hero_image",
  "equestrian_video_url",
  "equestrian_member_services",
  "equestrian_details",
  "equestrian_title_ka", "equestrian_title_en", "equestrian_title_ru",
  "equestrian_description_ka", "equestrian_description_en", "equestrian_description_ru",
  "equestrian_vision_title_ka", "equestrian_vision_title_en", "equestrian_vision_title_ru",
  "equestrian_vision_text_ka", "equestrian_vision_text_en", "equestrian_vision_text_ru",
  "equestrian_join_title_ka", "equestrian_join_title_en", "equestrian_join_title_ru",
  "equestrian_join_description_ka", "equestrian_join_description_en", "equestrian_join_description_ru",
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

const Ipodromi = () => {
  const { t, language } = useLanguage();
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
  // Per-language admin override → i18n default.
  const pick = (key: string, fallback: string) => {
    const v = c[`${key}_${language}`];
    return v && v.trim().length > 0 ? v : fallback;
  };
  const titleText = pick("equestrian_title", t("ipodromi.title"));
  const descriptionText = pick("equestrian_description", t("ipodromi.descriptionDefault"));
  const visionTitle = pick("equestrian_vision_title", t("ipodromi.visionTitleDefault"));
  const visionText = pick("equestrian_vision_text", t("ipodromi.visionTextDefault"));
  const joinTitle = pick("equestrian_join_title", t("ipodromi.joinTitleDefault"));
  const joinDescription = pick("equestrian_join_description", t("ipodromi.joinDescriptionDefault"));

  return (
    <Layout>
      <SEO title={`${titleText} — Igavi`} description={descriptionText.slice(0, 160)} />

      {/* 1. Hero — match Polograph / Olimpo. Falls back to a bundled render
          when Supabase has no `equestrian_hero_image` row yet. */}
      <ProjectHero
        image={c.equestrian_hero_image || "/renders/ipodromi-1.jpg"}
        breadcrumb={t("footer.equestrian")}
        title={titleText}
        subtitle={descriptionText.split("\n")[0]?.slice(0, 140) || ""}
        badge={t("nav.projects")}
        backLink={{ label: t("nav.home"), to: "/" }}
      />

      {/* 2. Gallery + Description */}
      <AnimatedSection>
        <RenderGalleryWithDescription
          project="equestrian"
          title={titleText}
          description={descriptionText}
          visionTitle={visionTitle}
          visionText={visionText}
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

      {/* 4. Video — REMOVED per client (PPTX slide 19): "we don't have a video
          at this stage, so let's remove it entirely". Kept admin key in DB so
          re-enabling later is one toggle. */}

      {/* 5. Equestrian SCHOOL section — appears ABOVE the Club per PPTX slide 20
          ("ზემოთ იყოს საცხენოსნო სკოლა და ქვემოთ საცხენოსნო კლუბი"). The existing
          ClubMembershipCTA already carries the school's title/copy via
          `joinTitle` → `t("ipodromi.joinTitleDefault")` = "საცხენოსნო სკოლა". */}
      <ClubMembershipCTA
        project="equestrian"
        joinTitle={joinTitle}
        joinDescription={joinDescription}
        services={memberServices}
      />

      {/* 5b. Equestrian CLUB banner — added per PPTX slides 18 & 20.
          Photo from slide 18 (01-club-banner.jpg) sits behind the heading copy
          pulled from `ipodromi.equestrianClubBannerTitle` / `…Description`. */}
      <section className="relative py-16 lg:py-20 overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <AnimatedSection>
            <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(45,143,67,0.12)] border border-white/20">
              <img
                src="/renders/ipodromi/01-club-banner.jpg"
                alt={t("ipodromi.equestrianClubBannerTitle")}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/30" />
              <div className="relative p-8 md:p-12 lg:p-16">
                <div className="max-w-2xl">
                  <h2 className="font-sans text-2xl md:text-3xl lg:text-4xl font-light tracking-tight mb-3 leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                    {t("ipodromi.equestrianClubBannerTitle")}
                  </h2>
                  <p className="font-sans text-sm md:text-base leading-relaxed text-white/85">
                    {t("ipodromi.equestrianClubDescription")}
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 6. Infrastructure Ticker */}
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

      {/* 9. Catalog Downloads */}
      <CatalogSection />

      {/* 10. Contact */}
      <ContactSection />
    </Layout>
  );
};

export default Ipodromi;
