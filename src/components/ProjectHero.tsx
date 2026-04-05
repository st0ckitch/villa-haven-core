import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SplitText } from "@/components/SplitText";

interface ProjectHeroProps {
  image: string;
  breadcrumb: string;
  title: string;
  subtitle?: string;
  badge?: string;
  backLink?: { label: string; to: string };
}

export const ProjectHero = ({ image, breadcrumb, title, subtitle, badge, backLink }: ProjectHeroProps) => {
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

      {/* Bottom-left floating glass card */}
      <div className="absolute bottom-0 left-0 right-0 md:bottom-10 md:left-10 md:right-auto md:max-w-2xl">
        <div className="m-4 md:m-0 bg-white/65 backdrop-blur-2xl border border-white/50 rounded-3xl p-6 md:p-10
          shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-[hsl(130_55%_35%)] mb-4">
            {backLink && (
              <>
                <Link to={backLink.to} className="hover:text-[hsl(130_55%_30%)] transition-colors">
                  {backLink.label}
                </Link>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <span className="text-foreground/50">{breadcrumb}</span>
          </div>

          {/* Title with character reveal */}
          <h1 className="font-sans text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground leading-[1.05] mb-3">
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
