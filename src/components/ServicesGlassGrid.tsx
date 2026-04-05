import type { LucideIcon } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { useLanguage } from "@/contexts/LanguageContext";

interface ServiceItem {
  icon: LucideIcon;
  key: string;
}

interface ServicesGlassGridProps {
  items: ServiceItem[];
  namespace: string;
  title: string;
  subtitle?: string;
}

export const ServicesGlassGrid = ({ items, namespace, title, subtitle }: ServicesGlassGridProps) => {
  const { t } = useLanguage();

  return (
    <section className="relative py-20 lg:py-24 overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(130_55%_40%/0.05)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,hsl(130_55%_50%/0.04)_0%,transparent_70%)]" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl">
        <AnimatedSection>
          <div className="text-center mb-12">
            {subtitle && (
              <p className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-primary/50 mb-3">
                {subtitle}
              </p>
            )}
            <h2 className="font-sans text-3xl md:text-4xl font-light tracking-tight text-foreground">
              {title}
            </h2>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {items.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <AnimatedSection key={svc.key} delay={i * 50}>
                <div className="group relative bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-5 md:p-6 flex flex-col items-center text-center gap-3 md:gap-4
                  shadow-[0_2px_16px_rgba(0,0,0,0.04)]
                  hover:bg-white hover:shadow-[0_8px_32px_rgba(45,143,67,0.15)] hover:border-[hsl(130_55%_40%/0.25)] hover:scale-[1.03] hover:-translate-y-0.5
                  transition-all duration-300 cursor-default">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-[hsl(130_55%_40%/0.12)] to-[hsl(130_55%_40%/0.04)]
                    group-hover:from-[hsl(130_55%_40%/0.2)] group-hover:to-[hsl(130_55%_40%/0.08)]
                    flex items-center justify-center transition-all duration-300">
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-[hsl(130_55%_35%)] group-hover:text-[hsl(130_55%_30%)] transition-colors duration-300" strokeWidth={1.8} />
                  </div>
                  <span className="font-sans text-xs md:text-sm font-medium text-foreground/75 group-hover:text-foreground transition-colors duration-300 leading-tight">
                    {t(`${namespace}.${svc.key}`)}
                  </span>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
};
