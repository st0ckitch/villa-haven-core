import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const BrandHeader = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-background py-14 md:py-20 lg:py-24 text-center">
      <div className="container mx-auto px-6">
        <h1
          className="font-serif font-bold tracking-tight leading-none"
          style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
        >
          {t("brandHeader.title")}
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mt-6 mb-10 font-sans">
          {t("brandHeader.subtitle")}
        </p>
        <a href="#contact">
          <Button size="lg" className="rounded-full font-sans font-medium px-8 h-12 gap-2">
            {t("nav.leaveRequest")}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </a>
      </div>
    </section>
  );
};
