import { AnimatedSection } from "@/components/AnimatedSection";
import { useLanguage } from "@/contexts/LanguageContext";

export const SloganSection = () => {
  const { t } = useLanguage();
  const line2 = t("slogan.line2");

  return (
    <section className="py-8 lg:py-12 bg-secondary">
      <div className="container mx-auto px-6">
        <AnimatedSection>
          <h2 className="text-xl md:text-2xl lg:text-3xl text-center leading-snug tracking-tight text-foreground font-light">
            <span className="italic text-primary">{t("slogan.line1")}</span>
            {line2 && (
              <>
                <br />
                <em className="italic text-primary">{line2}</em>
              </>
            )}
          </h2>
        </AnimatedSection>
      </div>
    </section>
  );
};
