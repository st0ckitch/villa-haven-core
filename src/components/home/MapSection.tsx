import { AnimatedSection } from "@/components/AnimatedSection";
import { useLanguage } from "@/contexts/LanguageContext";

const neighborhoods = [
  { name: "Marina District", distance: "5 min" },
  { name: "Business Bay", distance: "12 min" },
  { name: "Downtown", distance: "15 min" },
  { name: "Airport", distance: "25 min" },
];

const mapPins = [
  { label: "$980K", x: 30, y: 40 },
  { label: "$1.2M", x: 55, y: 30 },
  { label: "$1.8M", x: 45, y: 60 },
  { label: "$1.1M", x: 70, y: 50 },
];

export const MapSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-12 lg:py-16 bg-secondary">
      <div className="container mx-auto px-6">
        <AnimatedSection>
          <h2 className="text-2xl md:text-3xl lg:text-4xl mb-12">
            {t("map.title1")}<em className="italic">{t("map.titleEm")}</em>
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] lg:aspect-[21/9] mb-8">
            <img
              src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1400&q=80"
              alt="Aerial city view showing project location"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/20" />
            {mapPins.map((pin, i) => (
              <div
                key={i}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              >
                <div className="bg-card text-card-foreground text-xs font-sans font-semibold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                  {pin.label}
                </div>
                <div className="w-2 h-2 bg-card rounded-full mx-auto mt-0.5" />
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {neighborhoods.map((n) => (
              <div
                key={n.name}
                className="bg-card rounded-xl px-5 py-4 text-center border border-border hover:border-primary/30 transition-colors cursor-pointer"
              >
                <p className="font-sans text-sm font-medium text-card-foreground">{n.name}</p>
                <p className="font-sans text-xs text-muted-foreground mt-0.5">{n.distance} {t("map.drive")}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
