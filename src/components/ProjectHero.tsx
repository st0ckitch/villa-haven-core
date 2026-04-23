import { SplitText } from "@/components/SplitText";

interface ProjectHeroProps {
  image: string;
  /**
   * Kept for backward compatibility with existing callers — no longer rendered.
   * Client feedback (PPTX slide 6 / April 22 review) asked to remove the small
   * breadcrumb line above the big title because it was a visual duplicate.
   * The global Navbar (fixed, top) already provides site navigation.
   */
  breadcrumb?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  /** Kept for backward compatibility. No longer rendered (breadcrumb removed). */
  backLink?: { label: string; to: string };
}

export const ProjectHero = ({ image, title, subtitle, badge }: ProjectHeroProps) => {
  return (
    <section className="relative w-full h-[55vh] md:h-[75vh] min-h-[420px] overflow-hidden">
      {/* Background image */}
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-black/20" />

      {/* Top-right floating badge */}
      {badge && (
        <div className="hidden md:flex absolute top-8 right-8 items-center gap-2 px-4 py-2 rounded-full
          bg-white/60 backdrop-blur-xl border border-white/40
          shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
          <div className="w-1.5 h-1.5 rounded-full bg-[hsl(130_55%_40%)] animate-pulse" />
          <span className="font-sans text-xs font-semibold tracking-wide text-foreground/80">
            {badge}
          </span>
        </div>
      )}

      {/* Bottom-left floating glass card — title + subtitle only */}
      <div className="absolute bottom-0 left-0 right-0 md:bottom-10 md:left-10 md:right-auto md:max-w-2xl">
        <div className="m-4 md:m-0 bg-white/65 backdrop-blur-2xl border border-white/50 rounded-3xl p-6 md:p-10
          shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
          {/* Title with character reveal — single heading, no kicker (client feedback) */}
          <h1 className="font-sans text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground leading-[1.05] mb-3 whitespace-nowrap">
            <SplitText text={title} split="char" stagger={0.03} as="span" />
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
