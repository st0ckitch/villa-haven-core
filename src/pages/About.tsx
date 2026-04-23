import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { AnimatedSection } from "@/components/AnimatedSection";
import { ProjectHero } from "@/components/ProjectHero";
import { GlassInfoCard } from "@/components/GlassInfoCard";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ABOUT_KEYS = [
  "about_hero_image",
  "about_title_ka", "about_title_en", "about_title_ru",
  "about_description_ka", "about_description_en", "about_description_ru",
  "about_mission_title_ka", "about_mission_title_en", "about_mission_title_ru",
  "about_mission_text_ka", "about_mission_text_en", "about_mission_text_ru",
  "about_vision_title_ka", "about_vision_title_en", "about_vision_title_ru",
  "about_vision_text_ka", "about_vision_text_en", "about_vision_text_ru",
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

      {/* 2. Full description */}
      <div className="container mx-auto px-6 py-12 lg:py-16 max-w-4xl">
        <AnimatedSection>
          {!c.about_hero_image && (
            <h1 className="font-sans text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-6">
              {pageTitle}
            </h1>
          )}
          <p className="font-sans text-muted-foreground leading-relaxed text-base md:text-lg whitespace-pre-line">
            {description}
          </p>
        </AnimatedSection>
      </div>

      {/* 3. Mission & Vision glass cards */}
      {(missionText || visionText) && (
        <div className="container mx-auto px-6 pb-16 lg:pb-20 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {missionText && (
              <AnimatedSection delay={100}>
                <GlassInfoCard title={missionTitle} text={missionText} variant="vision" />
              </AnimatedSection>
            )}
            {visionText && (
              <AnimatedSection delay={200}>
                <GlassInfoCard title={visionTitle} text={visionText} variant="quote" />
              </AnimatedSection>
            )}
          </div>
        </div>
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
