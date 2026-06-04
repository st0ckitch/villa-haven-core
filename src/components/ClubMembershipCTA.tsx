import { AnimatedSection } from "@/components/AnimatedSection";
import { MagneticButton } from "@/components/MagneticButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

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

  const isEquestrian = project === "equestrian";
  const heroImage = "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1600&q=80";

  return (
    <section className="relative py-16 lg:py-20 overflow-hidden">
      {/* Background decorative orbs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] -translate-y-1/2 bg-[radial-gradient(circle,hsl(130_55%_40%/0.08)_0%,transparent_70%)] animate-orb-float" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[radial-gradient(circle,hsl(130_55%_50%/0.05)_0%,transparent_70%)] animate-orb-float-reverse" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl">
        <AnimatedSection>
          <div className={`relative rounded-3xl p-8 md:p-12 lg:p-16 overflow-hidden shadow-[0_20px_60px_rgba(45,143,67,0.12)] ${
            isEquestrian
              ? "border border-white/20"
              : "bg-white/55 backdrop-blur-xl border border-[hsl(130_55%_40%/0.2)]"
          }`}>
            {/* Equestrian: horse photo background with dark gradient overlay */}
            {isEquestrian && (
              <>
                <img
                  src={heroImage}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </>
            )}

            {/* Inner decorative orb (light variant only) */}
            {!isEquestrian && (
              <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[radial-gradient(circle,hsl(130_55%_40%/0.15)_0%,transparent_70%)] pointer-events-none" />
            )}

            <div className="relative">
              {/* Header — centered (client 2026-06-04): title + button stacked
                  and centered instead of the old left-title / right-button split,
                  which looked unbalanced with no services row. */}
              <div className="flex flex-col items-center text-center gap-6 mb-10">
                <div className="max-w-2xl">
                  {/* "Services for club members" badge removed per client request */}
                  <h2 className={`font-sans text-2xl md:text-3xl lg:text-4xl font-light tracking-tight mb-3 leading-tight ${
                    isEquestrian ? "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]" : "text-foreground"
                  }`}>
                    {title}
                  </h2>
                  {joinDescription && (
                    <p className={`font-sans text-sm md:text-base leading-relaxed whitespace-pre-line ${
                      isEquestrian ? "text-white/85" : "text-muted-foreground"
                    }`}>
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
                      className={`group flex items-start gap-3 p-4 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
                        isEquestrian
                          ? "bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40"
                          : "bg-white/70 border border-white/60 hover:bg-white hover:border-[hsl(130_55%_40%/0.2)] hover:shadow-[0_4px_20px_rgba(45,143,67,0.1)]"
                      }`}
                    >
                      <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                        isEquestrian
                          ? "bg-white/20 border border-white/30"
                          : "bg-gradient-to-br from-[hsl(130_55%_40%/0.15)] to-[hsl(130_55%_40%/0.05)]"
                      }`}>
                        <span className={`font-sans text-[11px] font-bold ${
                          isEquestrian ? "text-white" : "text-[hsl(130_55%_30%)]"
                        }`}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <span className={`font-sans text-xs md:text-sm font-medium leading-snug ${
                        isEquestrian ? "text-white/90" : "text-foreground/80"
                      }`}>
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
