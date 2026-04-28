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
import { TiltCard } from "@/components/TiltCard";
import {
  Loader2,
  Trophy,
  Target,
  LayoutGrid,
  CircleDashed,
  Sparkles,
  HeartPulse,
  Hotel,
  Dumbbell,
  Circle,
  TreePine,
  PartyPopper,
  Waves,
  Car,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { pickGridCols } from "@/lib/pickGridCols";

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
  "olimpo_club_benefits_title_ka", "olimpo_club_benefits_title_en", "olimpo_club_benefits_title_ru",
  "olimpo_club_benefits_text_ka", "olimpo_club_benefits_text_en", "olimpo_club_benefits_text_ru",
];

/**
 * Olimpo advantages — 13 items per client PPTX slide 12.
 * Renamed section heading from "Main Directions" to "ოლიმპოს უპირატესობები".
 */
const ADVANTAGES = [
  { icon: Trophy, key: "adv_footballStadiums" },
  { icon: Target, key: "adv_tennisCourts" },
  { icon: LayoutGrid, key: "adv_padelCourts" },
  { icon: CircleDashed, key: "adv_volleyballCourt" },
  { icon: Sparkles, key: "adv_wellnessCenter" },
  { icon: HeartPulse, key: "adv_sportsHealthCenter" },
  { icon: Hotel, key: "adv_hotel" },
  { icon: Dumbbell, key: "adv_sportsHall" },
  { icon: Circle, key: "adv_billiards" },
  { icon: TreePine, key: "adv_recreationZones" },
  { icon: PartyPopper, key: "adv_entertainmentSpaces" },
  { icon: Waves, key: "adv_pools" },
  { icon: Car, key: "adv_parking" },
];

const Olimpo = () => {
  const { t, language } = useLanguage();
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
  // Per-language admin override → i18n default. We skip the language-neutral
  // `olimpo_*` row on purpose: it still holds English-only copy from before
  // per-language fields existed, so using it would leak English onto KA/RU.
  const pick = (key: string, fallback: string) => {
    const v = c[`${key}_${language}`];
    return v && v.trim().length > 0 ? v : fallback;
  };
  const titleText = pick("olimpo_title", t("olimpo.titleDefault"));
  const descriptionText = pick("olimpo_description", t("olimpo.descriptionDefault"));
  const visionTitle = pick("olimpo_vision_title", "");
  const visionText = pick("olimpo_vision_text", "");
  const joinTitle = pick("olimpo_join_title", "");
  const joinDescription = pick("olimpo_join_description", "");
  const clubBenefitsTitle = pick("olimpo_club_benefits_title", t("olimpo.clubBenefitsTitle"));
  const clubBenefitsText = pick("olimpo_club_benefits_text", t("olimpo.clubBenefitsText"));

  return (
    <Layout>
      <SEO title={`${titleText} — Igavi`} description={descriptionText.slice(0, 160)} />

      {/* 1. Hero — breadcrumb uses short generic label to avoid duplicate with title (slide 11) */}
      {c.olimpo_hero_image && (
        <ProjectHero
          image={c.olimpo_hero_image}
          breadcrumb={t("footer.olimpo")}
          title={titleText}
          subtitle={descriptionText.split("\n")[0]?.slice(0, 140) || ""}
          badge={t("nav.projects")}
          backLink={{ label: t("nav.home"), to: "/" }}
        />
      )}

      {/* 2. Gallery + Description (2-col layout).
          Apartment Types grid removed per client feedback (Apr 23, 2026):
          Olimpo is a sports/wellness complex, not a residential project. */}
      <AnimatedSection>
        <RenderGalleryWithDescription
          project="olimpo"
          title={titleText}
          description={descriptionText}
          visionTitle={visionTitle}
          visionText={visionText}
        />
      </AnimatedSection>

      {/* 3. Olimpo Advantages — BEFORE video (slide 12) */}
      <div className="container mx-auto px-6 pb-12 lg:pb-16 max-w-6xl">
        <AnimatedSection>
          <div className="mb-8">
            <h2 className="font-sans text-3xl md:text-4xl font-light tracking-tight text-foreground mb-3">
              <span className="font-medium">{t("olimpo.advantagesTitle")}</span>
            </h2>
            <p className="font-sans text-sm md:text-base text-muted-foreground max-w-3xl leading-relaxed">
              {t("olimpo.advantagesIntro")}
            </p>
          </div>
        </AnimatedSection>
        <div
          className="flex flex-wrap justify-center gap-3"
          style={{
            ["--mob-cols" as string]: ADVANTAGES.length === 1 ? 1 : 2,
            ["--desk-cols" as string]: pickGridCols(ADVANTAGES.length, 5),
          }}
        >
          {ADVANTAGES.map((d, i) => {
            const Icon = d.icon;
            return (
              <AnimatedSection
                key={d.key}
                delay={i * 40}
                className="w-[calc((100%-(var(--mob-cols)-1)*0.75rem)/var(--mob-cols))] lg:w-[calc((100%-(var(--desk-cols)-1)*0.75rem)/var(--desk-cols))]"
              >
                <TiltCard maxTilt={6} scale={1.03} glare={false}>
                  <div className="group relative bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-4 md:p-5 flex flex-col items-center text-center gap-3
                    shadow-[0_2px_16px_rgba(0,0,0,0.04)]
                    hover:bg-white hover:shadow-[0_8px_32px_rgba(45,143,67,0.15)] hover:border-[hsl(130_55%_40%/0.25)]
                    transition-all duration-300 cursor-default h-full">
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[hsl(130_55%_40%/0.12)] to-[hsl(130_55%_40%/0.04)]
                      group-hover:from-[hsl(130_55%_40%/0.2)] group-hover:to-[hsl(130_55%_40%/0.08)]
                      flex items-center justify-center transition-all duration-300"
                      style={{ transform: "translateZ(20px)" }}>
                      <Icon className="w-5 h-5 text-[hsl(130_55%_35%)] group-hover:text-[hsl(130_55%_30%)] transition-colors duration-300" strokeWidth={1.8} />
                    </div>
                    <span className="font-sans text-xs md:text-sm font-medium text-foreground/75 group-hover:text-foreground transition-colors duration-300 leading-tight"
                      style={{ transform: "translateZ(10px)" }}>
                      {t(`olimpo.${d.key}`)}
                    </span>
                  </div>
                </TiltCard>
              </AnimatedSection>
            );
          })}
        </div>
      </div>

      {/* 4. Video — moved AFTER advantages */}
      {c.olimpo_video_url && (
        <div className="container mx-auto px-6 pb-12 md:pb-16 max-w-5xl">
          <AnimatedSection>
            <GlassVideoFrame url={c.olimpo_video_url} label={t("nav.projects")} />
          </AnimatedSection>
        </div>
      )}

      {/* 5. Infrastructure Ticker */}
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

      {/* 6. Club Membership CTA */}
      <ClubMembershipCTA
        project="olimpo"
        joinTitle={joinTitle}
        joinDescription={joinDescription}
        services={memberServices}
      />

      {/* 7. Club Member Benefits — sits below the membership CTA, mirroring
          Polograph's info card placement (marketer feedback, Apr 28, 2026).
          Admin overrides via `olimpo_club_benefits_title_<lang>` / `..._text_<lang>`. */}
      <div className="container mx-auto px-6 pt-6 pb-12 lg:pt-8 lg:pb-16 max-w-5xl">
        <AnimatedSection>
          <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-3xl p-8 md:p-10 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
            <h2 className="font-sans text-2xl md:text-3xl font-light tracking-tight text-foreground mb-4">
              {clubBenefitsTitle}
            </h2>
            <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
              {clubBenefitsText}
            </p>
          </div>
        </AnimatedSection>
      </div>

      {/* 8. Catalog Downloads */}
      <CatalogSection />

      {/* 9. Contact */}
      <ContactSection />
    </Layout>
  );
};

export default Olimpo;
