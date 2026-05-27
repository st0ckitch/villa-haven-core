import { AnimatedSection } from "@/components/AnimatedSection";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const ServicesSection = () => {
  const { t } = useLanguage();

  const services = [
    {
      title: t("services.card1Title"),
      description: t("services.card1Desc"),
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      link: "/polograph",
      cta: t("services.card1Cta"),
    },
    {
      title: t("services.card2Title"),
      description: t("services.card2Desc"),
      // Replaced per PPTX slide 1: aerial of Olimpo sports complex.
      image: "/renders/home/card-olimpo.jpg",
      link: "/olimpo",
      cta: t("services.card2Cta"),
    },
    {
      title: t("services.card3Title"),
      description: t("services.card3Desc"),
      // Replaced per PPTX slide 1: aerial of Ipodromi horse arenas.
      image: "/renders/home/card-ipodromi.jpg",
      link: "/equestrian",
      cta: t("services.card3Cta"),
    },
  ];

  return (
    <section className="py-8 lg:py-10 bg-card">
      <div className="container mx-auto px-6">
        <AnimatedSection delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 auto-rows-[320px] md:auto-rows-[380px]">
            {/* Card 1 — Polograph */}
            <Link
              to={services[0].link}
              className="relative group rounded-3xl overflow-hidden flex flex-col"
            >
              <img
                src={services[0].image}
                alt={services[0].title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="relative z-10 mt-auto p-6 lg:p-8 flex flex-col">
                <h3 className="text-white text-2xl md:text-3xl lg:text-4xl mb-3">
                  {services[0].title}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed mb-6 max-w-md line-clamp-3">
                  {services[0].description}
                </p>
                <span className="inline-flex items-center gap-2 text-white text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full px-5 py-2.5 w-fit group-hover:bg-white/30 transition-colors">
                  {services[0].cta}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            {/* Card 2 — Olimpo */}
            <Link
              to={services[1].link}
              className="relative group rounded-3xl overflow-hidden flex flex-col"
            >
              <img
                src={services[1].image}
                alt={services[1].title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="relative z-10 mt-auto p-6 lg:p-8">
                <h3 className="text-white text-xl md:text-2xl mb-2">
                  {services[1].title}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed mb-4 line-clamp-2">
                  {services[1].description}
                </p>
                <span className="inline-flex items-center gap-2 text-white text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full px-5 py-2.5 w-fit group-hover:bg-white/30 transition-colors">
                  {services[1].cta}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>

            {/* Card 3 — Equestrian */}
            <Link
              to={services[2].link}
              className="relative group rounded-3xl overflow-hidden flex flex-col"
            >
              <img
                src={services[2].image}
                alt={services[2].title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="relative z-10 mt-auto p-6 lg:p-8">
                <h3 className="text-white text-xl md:text-2xl mb-2">
                  {services[2].title}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed mb-4 line-clamp-2">
                  {services[2].description}
                </p>
                <span className="inline-flex items-center gap-2 text-white text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full px-5 py-2.5 w-fit group-hover:bg-white/30 transition-colors">
                  {services[2].cta}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
