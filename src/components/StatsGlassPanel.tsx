import { AnimatedSection } from "@/components/AnimatedSection";

interface Stat {
  value: string;
  label: string;
}

interface StatsGlassPanelProps {
  stats: Stat[];
  title?: string;
  subtitle?: string;
}

export const StatsGlassPanel = ({ stats, title, subtitle }: StatsGlassPanelProps) => {
  return (
    <section className="relative py-16 lg:py-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <AnimatedSection>
          {(title || subtitle) && (
            <div className="text-center mb-10">
              {subtitle && (
                <p className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-primary/50 mb-3">
                  {subtitle}
                </p>
              )}
              {title && (
                <h2 className="font-sans text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-foreground">
                  {title}
                </h2>
              )}
            </div>
          )}
          <div className="relative bg-white/55 backdrop-blur-xl border border-[hsl(130_55%_40%/0.15)] rounded-3xl p-8 md:p-12 overflow-hidden
            shadow-[0_8px_40px_rgba(0,0,0,0.04)]">
            {/* Decorative orb */}
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[radial-gradient(circle,hsl(130_55%_40%/0.06)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="relative flex flex-col items-center text-center">
                  {i > 0 && (
                    <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-16 bg-gradient-to-b from-transparent via-[hsl(130_55%_40%/0.15)] to-transparent" />
                  )}
                  <div className="font-sans text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-2">
                    {stat.value}
                  </div>
                  <p className="font-sans text-[10px] md:text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/70">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
