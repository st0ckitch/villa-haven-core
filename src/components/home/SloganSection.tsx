import { AnimatedSection } from "@/components/AnimatedSection";
import { useLanguage } from "@/contexts/LanguageContext";

export const SloganSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-14 lg:py-20 bg-secondary">
      <div className="container mx-auto px-6">
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-center leading-tight tracking-tight text-foreground">
            {t("slogan.line1")}
            <br />
            <em className="italic text-primary">{t("slogan.line2")}</em>
          </h2>
        </AnimatedSection>
      </div>
    </section>
  );
};
