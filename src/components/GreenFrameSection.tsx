import { useLanguage } from "@/contexts/LanguageContext";
import { AnimatedSection } from "@/components/AnimatedSection";
import { TiltCard } from "@/components/TiltCard";
import { DoorOpen, Columns, Layers, Zap, Layout } from "lucide-react";

/**
 * Green Frame ("მწვანე კარკასის კონდიცია") delivery-condition grid
 * for Polograph. Added per client feedback (PPTX slide 8).
 */
const FRAME_ITEMS = [
  { icon: DoorOpen, titleKey: "polograph.frameDoorWindow", descKey: "polograph.frameDoorWindowDesc" },
  { icon: Columns, titleKey: "polograph.framePartitions", descKey: "polograph.framePartitionsDesc" },
  { icon: Layers, titleKey: "polograph.frameFloor", descKey: "polograph.frameFloorDesc" },
  { icon: Zap, titleKey: "polograph.frameUtilities", descKey: "polograph.frameUtilitiesDesc" },
  { icon: Layout, titleKey: "polograph.frameFacade", descKey: "polograph.frameFacadeDesc" },
];

export const GreenFrameSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative py-12 lg:py-16 overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(130_55%_40%/0.05)_0%,transparent_70%)] animate-orb-float" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl">
        <AnimatedSection>
          <div className="text-center mb-10">
            <h2 className="font-sans text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-foreground">
              <span className="font-medium">{t("polograph.frameConditionTitle")}</span>
            </h2>
          </div>
        </AnimatedSection>

        <div className="flex flex-wrap justify-center gap-4">
          {FRAME_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <AnimatedSection
                key={item.titleKey}
                delay={i * 60}
                className="w-full md:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
              >
                <TiltCard maxTilt={5} scale={1.02} glare={false}>
                  <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-5 md:p-6
                    shadow-[0_2px_16px_rgba(0,0,0,0.04)]
                    hover:bg-white hover:shadow-[0_8px_32px_rgba(45,143,67,0.15)] hover:border-[hsl(130_55%_40%/0.25)]
                    transition-all duration-300 h-full">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(130_55%_40%/0.15)] to-[hsl(130_55%_40%/0.05)]
                      flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-[hsl(130_55%_35%)]" strokeWidth={1.8} />
                    </div>
                    <h3 className="font-sans text-base md:text-lg font-medium text-foreground mb-2 leading-tight">
                      {t(item.titleKey)}
                    </h3>
                    <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                      {t(item.descKey)}
                    </p>
                  </div>
                </TiltCard>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
};
