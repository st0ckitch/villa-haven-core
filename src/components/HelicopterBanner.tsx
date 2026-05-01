import { useLanguage } from "@/contexts/LanguageContext";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Plane } from "lucide-react";

/**
 * Thin horizontal banner for Polograph's "Helicopter Aerodrome" feature.
 * Replaces the Investment Stats section per client feedback (PPTX slide 6).
 * Background uses a stylized SVG helicopter illustration in /public.
 * Swap `/helicopter-banner.svg` for a real photo (.jpg) when one is provided.
 */
export const HelicopterBanner = () => {
  const { t } = useLanguage();

  return (
    <section className="relative py-10 lg:py-14 overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl">
        <AnimatedSection>
          <div className="relative rounded-3xl overflow-hidden min-h-[180px] md:min-h-[220px] flex items-center
            bg-gradient-to-r from-[hsl(130_55%_40%/0.15)] via-[hsl(130_55%_50%/0.25)] to-[hsl(130_55%_40%/0.15)]
            backdrop-blur-md border border-[hsl(130_55%_40%/0.2)]
            shadow-[0_12px_40px_rgba(45,143,67,0.15)]">
            {/* Background helicopter illustration (SVG, brand-green palette).
                Swap for a real /helicopter-banner.jpg photo when one is delivered. */}
            <img
              src="/helicopter-banner.svg"
              alt=""
              aria-hidden
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            {/* Left-side fade so the text stays readable over the illustration */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/55 to-white/10" />

            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 p-6 md:p-10 w-full">
              <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[hsl(130_55%_40%/0.25)] to-[hsl(130_55%_40%/0.1)] flex items-center justify-center">
                <Plane className="w-8 h-8 md:w-10 md:h-10 text-[hsl(130_55%_30%)]" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h3 className="font-sans text-xl md:text-2xl lg:text-3xl font-light tracking-tight text-foreground mb-2">
                  <span className="font-medium">{t("polograph.helicopterBannerTitle")}</span>
                </h3>
                <p className="font-sans text-sm md:text-base text-foreground/70 leading-relaxed max-w-2xl">
                  {t("polograph.helicopterBannerDesc")}
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
