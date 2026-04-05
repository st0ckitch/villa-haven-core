import { AnimatedSection } from "@/components/AnimatedSection";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InfrastructureTicker } from "@/components/InfrastructureTicker";
import { SplitText } from "@/components/SplitText";

const CountUp = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const steps = 40;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="font-sans text-3xl lg:text-4xl font-light text-foreground tracking-tight">
      {count.toLocaleString()}{suffix && <span className="text-xl ml-0.5 text-foreground/60">{suffix}</span>}
    </span>
  );
};

const STAT_KEYS = [
  "stat_1_value", "stat_1_label",
  "stat_2_value", "stat_2_label",
  "stat_3_value", "stat_3_label", "stat_3_suffix",
  "stat_4_value", "stat_4_label", "stat_4_suffix",
  "stat_5_value", "stat_5_label", "stat_5_suffix",
  "amenities_slogan",
];

export const AmenitiesSection = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", STAT_KEYS)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          data.forEach((r) => (map[r.key] = r.value));
          setSettings(map);
        }
      });
  }, []);

  const stats = [
    { value: Number(settings.stat_1_value) || 279, suffix: settings.stat_1_suffix || "", label: settings.stat_1_label || t("about.statVillas") },
    { value: Number(settings.stat_2_value) || 50, suffix: settings.stat_2_suffix || "", label: settings.stat_2_label || "ჰექტარი" },
    { value: Number(settings.stat_3_value) || 100, suffix: settings.stat_3_suffix || "%", label: settings.stat_3_label || "გამწვანება" },
    { value: Number(settings.stat_4_value) || 15, suffix: settings.stat_4_suffix || "წუთი", label: settings.stat_4_label || "თბილისიდან" },
    { value: Number(settings.stat_5_value) || 0, suffix: settings.stat_5_suffix || "", label: settings.stat_5_label || "" },
  ].filter(s => s.value > 0 && s.label);

  const slogan = settings.amenities_slogan || "";

  return (
    <section className="relative py-12 lg:py-16 overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 via-background to-background" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,hsl(130_55%_40%/0.03)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(130_30%_50%/0.02)_0%,transparent_70%)]" />
      </div>

      <div className="container mx-auto px-6">
        {/* Header */}
        <AnimatedSection>
          <div className="mb-14 max-w-2xl">
            <p className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-primary/60 mb-3">
              {t("amenities.title1")}
            </p>
            <h2 className="font-sans text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground leading-[1.1]">
              <SplitText text="World-class" split="char" stagger={0.03} as="span" />
              <br />
              <span className="font-medium text-foreground">
                <SplitText text="infrastructure" split="char" stagger={0.03} delay={0.3} as="span" />
              </span>
            </h2>
          </div>
        </AnimatedSection>

      </div>

      {/* Amenity marquee — full bleed with green gradient backdrop */}
      <AnimatedSection delay={100}>
        <div className="relative py-10 md:py-14 my-8 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[hsl(130_55%_40%/0.05)] via-[hsl(130_55%_50%/0.12)] to-[hsl(130_55%_40%/0.05)]" />
          <InfrastructureTicker />
        </div>
      </AnimatedSection>

      <div className="container mx-auto px-6">

        {/* Slogan */}
        {slogan && (
          <AnimatedSection className="mt-16">
            <div className="max-w-xl mx-auto text-center">
              <div className="inline-block bg-white/30 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-5">
                <p className="text-base md:text-lg italic text-muted-foreground leading-relaxed">
                  "{slogan}"
                </p>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Stats row */}
        <AnimatedSection delay={200} className="mt-16">
          <div className="bg-white/35 backdrop-blur-xl border border-white/20 rounded-3xl p-8 lg:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.04)]">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
              {stats.map((stat, i) => (
                <div key={stat.label} className="flex flex-col items-center text-center relative">
                  {i > 0 && (
                    <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-12 bg-foreground/[0.07]" />
                  )}
                  <CountUp target={stat.value} suffix={stat.suffix} />
                  <p className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/70 mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
