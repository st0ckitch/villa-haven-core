import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const BrandHeader = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-background py-8 md:py-10 lg:py-12 text-center">
      <div className="container mx-auto px-6">
        {/* Logo placeholder — replace /brand-logo.svg with client's logo file */}
        <div className="flex justify-center mb-4">
          <img
            src="/brand-logo.svg"
            alt="Igavi"
            className="h-10 md:h-12 lg:h-14 w-auto"
            onError={(e) => {
              // Fallback to text when logo file is missing
              (e.currentTarget as HTMLImageElement).style.display = "none";
              const fallback = document.getElementById("brand-text-fallback");
              if (fallback) fallback.style.display = "block";
            }}
          />
          <h1
            id="brand-text-fallback"
            className="font-serif font-bold tracking-tight leading-none hidden"
            style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.75rem)" }}
          >
            {t("brandHeader.title")}
          </h1>
        </div>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto mt-2 mb-6 font-sans">
          {t("brandHeader.subtitle")}
        </p>
        <a href="#contact">
          <Button size="default" className="rounded-full font-sans font-medium px-6 h-11 gap-2">
            {t("nav.leaveRequest")}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </a>
      </div>
    </section>
  );
};
