import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { AnimatedSection } from "@/components/AnimatedSection";
import { ProjectHero } from "@/components/ProjectHero";
import { TiltCard } from "@/components/TiltCard";
import { Loader2, Compass, Telescope, Target, Building2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ABOUT_KEYS = [
  "about_hero_image",
  "about_title_ka", "about_title_en", "about_title_ru",
  "about_description_ka", "about_description_en", "about_description_ru",
  "about_mission_title_ka", "about_mission_title_en", "about_mission_title_ru",
  "about_mission_text_ka", "about_mission_text_en", "about_mission_text_ru",
  "about_vision_title_ka", "about_vision_title_en", "about_vision_title_ru",
  "about_vision_text_ka", "about_vision_text_en", "about_vision_text_ru",
  // Added per client PDF 2026-05-31: third "Goal" paragraph (next to
  // Vision + Mission) and a "Reference" VR Holding section describing
  // the parent developer.
  "about_goal_title_ka", "about_goal_title_en", "about_goal_title_ru",
  "about_goal_text_ka",  "about_goal_text_en",  "about_goal_text_ru",
  "about_vr_title_ka",   "about_vr_title_en",   "about_vr_title_ru",
  "about_vr_text_ka",    "about_vr_text_en",    "about_vr_text_ru",
  "about_team_image",
];

const About = () => {
  const { t, language } = useLanguage();
  const { data: content, isLoading } = useQuery({
    queryKey: ["about-page"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ABOUT_KEYS);
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
  // Per-language resolver — admin override via `<key>_<lang>` → i18n default.
  const pick = (key: string, fallback: string) => {
    const v = c[`${key}_${language}`];
    return v && v.trim().length > 0 ? v : fallback;
  };
  const pageTitle = pick("about_title", t("about.title1") + t("about.titleEm"));
  const description = pick("about_description", "");
  const missionTitle = pick("about_mission_title", t("projects.mainDirections"));
  const missionText = pick("about_mission_text", "");
  const visionTitle = pick("about_vision_title", t("about.title1") + t("about.titleEm"));
  const visionText = pick("about_vision_text", "");
  // Third paragraph + VR Holding reference — see migration
  // 20260531180000_about_page_pdf_content for canonical copy.
  const goalTitle = pick("about_goal_title", "");
  const goalText = pick("about_goal_text", "");
  const vrTitle = pick("about_vr_title", "VR Holding");
  const vrText = pick("about_vr_text", "");

  return (
    <Layout>
      <SEO title={`${pageTitle} — Igavi`} description={description.slice(0, 160)} />

      {/* 1. Hero with glass card */}
      {c.about_hero_image ? (
        <ProjectHero
          image={c.about_hero_image}
          breadcrumb={pageTitle}
          title={pageTitle}
          subtitle={description.split("\n")[0]?.slice(0, 140) || ""}
          badge={t("nav.aboutUs")}
          backLink={{ label: t("nav.home"), to: "/" }}
        />
      ) : (
        <div className="pt-28 lg:pt-32" />
      )}

      {/* 2 + 3. Editorial showcase — big bold typography on the left,
          two floating tilted glass panels (mission / vision) offset on the right.
          Replaces the previous two stacked sections (description + grid cards)
          with a single 3D composition inspired by editorial product layouts. */}
      <section className="relative overflow-hidden">
        {/* Soft brand-green background orbs (re-uses existing animation tokens) */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full
            bg-[radial-gradient(circle,hsl(130_55%_40%/0.10)_0%,transparent_70%)]
            animate-orb-float -z-10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/3 -right-32 w-[520px] h-[520px] rounded-full
            bg-[radial-gradient(circle,hsl(130_55%_50%/0.08)_0%,transparent_70%)]
            animate-orb-float-reverse -z-10"
        />

        <div className="container mx-auto px-6 py-16 lg:py-24 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left: editorial headline + description */}
            <div className="lg:col-span-7 relative">
              {/* Corner bracket accents (top-left) */}
              <div aria-hidden className="absolute -top-2 -left-2 w-6 h-6 border-t border-l border-[hsl(130_55%_40%/0.4)]" />
              <div aria-hidden className="absolute -top-2 right-4 w-6 h-6 border-t border-r border-[hsl(130_55%_40%/0.4)] hidden lg:block" />

              <AnimatedSection>
                {/* Floating label chip */}
                <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full
                  bg-white/70 backdrop-blur-xl border border-[hsl(130_55%_40%/0.2)]
                  shadow-[0_2px_12px_rgba(45,143,67,0.08)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(130_55%_40%)]" />
                  <span className="font-sans text-sm font-semibold text-[hsl(130_55%_30%)]">
                    {t("nav.aboutUs")}
                  </span>
                </div>

                {!c.about_hero_image && (
                  <h1 className="font-sans text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight text-foreground mb-8 leading-[1.15] md:leading-[1.15] lg:leading-[1.15]">
                    {pageTitle}
                  </h1>
                )}

                {description && (
                  <p className="font-sans text-foreground/70 leading-relaxed text-base md:text-lg max-w-2xl whitespace-pre-line">
                    {description}
                  </p>
                )}
              </AnimatedSection>

              {/* "Igavi · Est." metadata block removed per client
                  2026-06-01 — the section was decorative noise below
                  the description and didn't add information that the
                  hero / about copy doesn't already convey. */}
            </div>

            {/* Right: stacked, offset, tilted mission + vision cards */}
            {(missionText || visionText) && (
              <div className="lg:col-span-5 relative min-h-[420px] lg:min-h-[520px]">
                {missionText && (
                  <AnimatedSection delay={150}>
                    <div className="relative lg:absolute lg:top-0 lg:left-0 lg:right-8 z-10">
                      {/* Floating chip label above card */}
                      <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full
                        bg-white/80 backdrop-blur-xl border border-[hsl(130_55%_40%/0.25)]
                        shadow-[0_2px_10px_rgba(45,143,67,0.1)]">
                        <Compass className="w-3 h-3 text-[hsl(130_55%_35%)]" strokeWidth={2} />
                        <span className="font-sans text-sm font-semibold text-[hsl(130_55%_30%)]">
                          {t("about.missionLabel")}
                        </span>
                      </div>
                      <TiltCard maxTilt={8} scale={1.02} glare>
                        <div className="relative bg-white/65 backdrop-blur-xl border border-white/50 rounded-3xl p-7 md:p-8
                          shadow-[0_16px_48px_rgba(45,143,67,0.12)]
                          before:absolute before:inset-0 before:rounded-3xl before:pointer-events-none
                          before:bg-gradient-to-br before:from-white/40 before:via-transparent before:to-[hsl(130_55%_40%/0.08)]">
                          <div style={{ transform: "translateZ(30px)" }}>
                            <h2 className="font-sans text-xl md:text-2xl font-medium tracking-tight text-foreground mb-3">
                              {missionTitle}
                            </h2>
                            <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                              {missionText}
                            </p>
                          </div>
                        </div>
                      </TiltCard>
                    </div>
                  </AnimatedSection>
                )}

                {visionText && (
                  <AnimatedSection delay={300}>
                    <div className="relative mt-8 lg:mt-0 lg:absolute lg:top-56 lg:left-12 lg:right-0 z-20">
                      <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full
                        bg-white/80 backdrop-blur-xl border border-[hsl(130_55%_40%/0.25)]
                        shadow-[0_2px_10px_rgba(45,143,67,0.1)]">
                        <Telescope className="w-3 h-3 text-[hsl(130_55%_35%)]" strokeWidth={2} />
                        <span className="font-sans text-sm font-semibold text-[hsl(130_55%_30%)]">
                          {t("about.visionLabel")}
                        </span>
                      </div>
                      <TiltCard maxTilt={8} scale={1.02} glare>
                        <div className="relative bg-white/75 backdrop-blur-xl border border-[hsl(130_55%_40%/0.2)] rounded-3xl p-7 md:p-8
                          shadow-[0_20px_56px_rgba(45,143,67,0.18)]
                          before:absolute before:inset-0 before:rounded-3xl before:pointer-events-none
                          before:bg-gradient-to-tl before:from-[hsl(130_55%_40%/0.12)] before:via-transparent before:to-white/40">
                          <div style={{ transform: "translateZ(30px)" }}>
                            <h2 className="font-sans text-xl md:text-2xl font-medium tracking-tight text-foreground mb-3">
                              {visionTitle}
                            </h2>
                            <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                              {visionText}
                            </p>
                          </div>
                        </div>
                      </TiltCard>
                    </div>

                    {/* Corner bracket accents around the right column (decorative) */}
                    <div aria-hidden className="hidden lg:block absolute -bottom-2 -right-2 w-6 h-6 border-b border-r border-[hsl(130_55%_40%/0.4)]" />
                    <div aria-hidden className="hidden lg:block absolute -bottom-2 left-4 w-6 h-6 border-b border-l border-[hsl(130_55%_40%/0.4)]" />
                  </AnimatedSection>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3b. Goal paragraph (third of the Vision/Mission/Goal trio per
          client PDF 2026-05-31). Rendered as a full-width editorial
          block under the two side-by-side tilted cards so the trio
          reads as one composition rather than a single missing card. */}
      {goalText && (
        <section className="container mx-auto px-6 pb-12 lg:pb-16 max-w-7xl">
          <AnimatedSection>
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              <div className="lg:col-span-7 relative">
                <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full
                  bg-white/80 backdrop-blur-xl border border-[hsl(130_55%_40%/0.25)]
                  shadow-[0_2px_10px_rgba(45,143,67,0.1)]">
                  <Target className="w-3 h-3 text-[hsl(130_55%_35%)]" strokeWidth={2} />
                  <span className="font-sans text-sm font-semibold text-[hsl(130_55%_30%)]">
                    {goalTitle}
                  </span>
                </div>
                <p className="font-sans text-base md:text-lg text-foreground/80 leading-relaxed whitespace-pre-line max-w-2xl">
                  {goalText}
                </p>
              </div>
            </div>
          </AnimatedSection>
        </section>
      )}

      {/* 3c. VR Holding "Reference" section — describes the parent
          developer. Plain editorial layout (no tilted card) per PDF
          (it's reference material, not headline content). */}
      {vrText && (
        <section className="container mx-auto px-6 pb-12 lg:pb-16 max-w-5xl">
          <AnimatedSection>
            <div className="relative bg-white/55 backdrop-blur-xl border border-[hsl(130_55%_40%/0.15)] rounded-3xl p-8 md:p-10
              shadow-[0_8px_32px_rgba(45,143,67,0.08)]">
              <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full
                bg-white/85 border border-[hsl(130_55%_40%/0.25)]">
                <Building2 className="w-3 h-3 text-[hsl(130_55%_35%)]" strokeWidth={2} />
                <span className="font-sans text-xs font-semibold text-[hsl(130_55%_30%)] uppercase tracking-wide">
                  Reference
                </span>
              </div>
              <h2 className="font-sans text-2xl md:text-3xl font-medium tracking-tight text-foreground mb-5">
                {vrTitle}
              </h2>
              <div className="font-sans text-sm md:text-base text-foreground/80 leading-relaxed whitespace-pre-line max-w-3xl">
                {vrText}
              </div>
            </div>
          </AnimatedSection>
        </section>
      )}

      {/* 4. Team image with glass frame */}
      {c.about_team_image && (
        <div className="container mx-auto px-6 pb-16 lg:pb-24 max-w-5xl">
          <AnimatedSection delay={300}>
            <div className="relative">
              {/* Decorative glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[hsl(130_55%_40%/0.15)] via-[hsl(130_55%_50%/0.2)] to-[hsl(130_55%_40%/0.15)] rounded-[28px] blur-2xl -z-10 opacity-60" />
              <div className="p-1.5 rounded-[24px] bg-gradient-to-br from-[hsl(130_55%_40%/0.25)] via-white/50 to-[hsl(130_55%_40%/0.1)] backdrop-blur-md shadow-[0_16px_48px_rgba(45,143,67,0.12)]">
                <div className="relative rounded-[20px] overflow-hidden">
                  <img
                    src={c.about_team_image}
                    alt="Our Team"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      )}
    </Layout>
  );
};

export default About;
