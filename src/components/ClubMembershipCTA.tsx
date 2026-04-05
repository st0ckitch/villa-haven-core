import { AnimatedSection } from "@/components/AnimatedSection";
import { MagneticButton } from "@/components/MagneticButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Crown, ArrowRight } from "lucide-react";

interface ClubMembershipCTAProps {
  project: "olimpo" | "equestrian";
  joinTitle?: string;
  joinDescription?: string;
  services?: string[];
}

export const ClubMembershipCTA = ({ project, joinTitle, joinDescription, services = [] }: ClubMembershipCTAProps) => {
  const { t } = useLanguage();

  const defaultTitle = project === "olimpo"
    ? t("projects.joinOlimpo")
    : t("projects.joinEquestrian");

  const title = joinTitle || defaultTitle;

  return (
    <section className="relative py-16 lg:py-20 overflow-hidden">
      {/* Background decorative orbs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] -translate-y-1/2 bg-[radial-gradient(circle,hsl(130_55%_40%/0.08)_0%,transparent_70%)] animate-orb-float" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[radial-gradient(circle,hsl(130_55%_50%/0.05)_0%,transparent_70%)] animate-orb-float-reverse" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl">
        <AnimatedSection>
          <div className="relative bg-white/55 backdrop-blur-xl border border-[hsl(130_55%_40%/0.2)] rounded-3xl p-8 md:p-12 lg:p-16 overflow-hidden
            shadow-[0_20px_60px_rgba(45,143,67,0.12)]">
            {/* Inner decorative orb */}
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[radial-gradient(circle,hsl(130_55%_40%/0.15)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(130_55%_40%/0.08)] border border-[hsl(130_55%_40%/0.2)] mb-4">
                    <Crown className="w-3.5 h-3.5 text-[hsl(130_55%_35%)]" />
                    <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[hsl(130_55%_30%)]">
                      {t("projects.memberServices")}
                    </span>
                  </div>
                  <h2 className="font-sans text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-3 leading-tight">
                    {title}
                  </h2>
                  {joinDescription && (
                    <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                      {joinDescription}
                    </p>
                  )}
                </div>

                <MagneticButton strength={0.25}>
                  <Link
                    to="/contact"
                    className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full
                      bg-gradient-to-r from-[#2d8f43] to-[#3aa557] text-white
                      hover:from-[#359e4d] hover:to-[#44b862]
                      shadow-[0_8px_24px_rgba(45,143,67,0.35)] hover:shadow-[0_12px_32px_rgba(45,143,67,0.45)]
                      transition-all font-sans text-sm font-semibold whitespace-nowrap"
                  >
                    {t("contact.ctaButton")}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </MagneticButton>
              </div>

              {/* Numbered service grid */}
              {services.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {services.map((service, i) => (
                    <div
                      key={i}
                      className="group flex items-start gap-3 p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/60
                        hover:bg-white hover:border-[hsl(130_55%_40%/0.2)] hover:shadow-[0_4px_20px_rgba(45,143,67,0.1)]
                        transition-all duration-300"
                    >
                      <div className="shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-[hsl(130_55%_40%/0.15)] to-[hsl(130_55%_40%/0.05)]
                        flex items-center justify-center">
                        <span className="font-sans text-[11px] font-bold text-[hsl(130_55%_30%)]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <span className="font-sans text-xs md:text-sm font-medium text-foreground/80 leading-snug">
                        {service}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
