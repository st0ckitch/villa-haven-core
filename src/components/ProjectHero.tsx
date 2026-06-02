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

/**
 * Project hero — full-bleed photo with the title placed directly on the image.
 *
 * The previous design wrapped the title in a translucent white glass card
 * which read as a flat "white box" no matter how its opacity was tuned
 * (client feedback 2026-05-31, applied to Polograph / Olimpo / Equestrian).
 * Replaced with: a dark vertical gradient mask on the lower half of the
 * photo + white title sitting on top. No panel, no border, no white wash —
 * just photo, gradient, type. Closer to the Apple / Airbnb editorial hero
 * pattern.
 */
export const ProjectHero = ({ image, title, subtitle, badge }: ProjectHeroProps) => {
  return (
    <section className="relative w-full h-[55vh] md:h-[75vh] min-h-[420px] overflow-hidden">
      {/* Background image.
          decoding="async" lets the browser decode off the main thread so
          painting the rest of the page isn't blocked while a large JPEG is
          being decompressed (we hit this with a 45 MB hero that froze the
          tab for 3-4 seconds). fetchPriority="high" keeps it eager — it
          is the LCP element. */}
      <img
        src={image}
        alt={title}
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
      />

      {/* Dark scrim — covers the bottom 65% of the hero so the white title
          sits on enough contrast to remain readable on bright photos, while
          the top half of the image stays clean. Two layers: a top→bottom
          tint to lift the lower half, plus a darker pool at the very bottom
          where the text actually sits. No backdrop-blur — the look is now
          editorial, not glassmorphism. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />

      {/* Top-right "Projects" pill removed per client 2026-06-01 —
          duplicated the nav breadcrumb and crowded the corner. The
          `badge` prop is still accepted on the component for backward
          compatibility with existing callers but no longer renders. */}

      {/* Title + subtitle — direct on photo, no card.
          A green accent bar on the left signals brand without painting a
          background. Drop-shadow on the text gives it just enough lift to
          stay legible on lighter photo regions. */}
      <div className="absolute bottom-6 left-4 right-4 md:bottom-12 md:left-12 md:right-12 md:max-w-3xl">
        <div className="flex gap-4 md:gap-5">
          <div className="w-[3px] md:w-1 self-stretch bg-gradient-to-b from-[hsl(130_55%_55%)] via-[hsl(130_55%_45%)] to-transparent rounded-full" />
          <div>
            {/* leading-[1.4]: SplitText pads each char wrapper to keep
                Georgian descenders (გ, ფ, ც, ჯ) from being clipped, but the
                parent line-box still needs breathing room so descenders
                don't touch the next line. */}
            <h1
              className="font-sans text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-white leading-[1.35] md:leading-[1.35] lg:leading-[1.35] pb-1 mb-3 [text-shadow:0_2px_24px_rgba(0,0,0,0.45)]"
            >
              <SplitText text={title} split="char" stagger={0.03} as="span" />
            </h1>

            {subtitle && (
              <p className="font-sans text-sm md:text-base lg:text-lg text-white/85 leading-relaxed max-w-2xl [text-shadow:0_1px_12px_rgba(0,0,0,0.55)]">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
