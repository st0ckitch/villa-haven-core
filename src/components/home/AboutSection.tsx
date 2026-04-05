import { useEffect, useRef, useState } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { useLanguage } from "@/contexts/LanguageContext";

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
    <span ref={ref} className="font-serif text-3xl lg:text-4xl text-card-foreground">
      {count.toLocaleString()}{suffix && <span className="text-2xl ml-1">{suffix}</span>}
    </span>
  );
};

export const AboutSection = () => {
  const { t } = useLanguage();

  const stats = [
    { value: 48, suffix: "", label: t("about.statVillas") },
    { value: 12500, suffix: "", label: t("about.statArea") },
    { value: 2026, suffix: "", label: t("about.statYear") },
    { value: 15, suffix: "min", label: t("about.statCenter") },
  ];

  return (
    <section className="py-12 lg:py-16 bg-background">
      <div className="container mx-auto px-6">
        <AnimatedSection>
          <h2 className="text-2xl md:text-3xl lg:text-4xl mb-12">
            {t("about.title1")}<em className="italic">{t("about.titleEm")}</em>
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 mb-16">
            <p className="font-sans text-muted-foreground leading-relaxed">
              {t("about.desc1")}
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              {t("about.desc2")}
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-white/40 backdrop-blur-md border border-white/25 shadow-[0_4px_24px_rgba(0,0,0,0.06)] flex items-center justify-center mb-3">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Partner Logos Marquee */}
        <AnimatedSection delay={300}>
          <div className="mt-20 pt-16 border-t border-border">
            <p className="text-center text-sm uppercase tracking-widest text-muted-foreground mb-8">
              {t("about.partnersTitle")}
            </p>
            <div className="overflow-hidden">
              <div
                className="flex gap-16 items-center w-max"
                style={{ animation: "marquee 20s linear infinite" }}
              >
                {["WATG", "UNS", "KCAP", "EY", "Colliers", "WATG", "UNS", "KCAP", "EY", "Colliers"].map((name, i) => (
                  <span
                    key={i}
                    className="text-2xl font-serif tracking-wider text-muted-foreground/60 select-none whitespace-nowrap"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
