import { useEffect, useState } from "react";
import { BookOpen, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { AnimatedSection } from "@/components/AnimatedSection";

const CATALOG_KEYS = [
  { key: "catalog_igavi", labelKey: "footer.catalogIgavi" },
  { key: "catalog_polograph", labelKey: "footer.catalogPolograph" },
  { key: "catalog_olimpo", labelKey: "footer.catalogOlimpo" },
  { key: "catalog_equestrian", labelKey: "footer.catalogEquestrian" },
];

export const CatalogSection = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", CATALOG_KEYS.map((c) => c.key))
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          data.forEach((r: { key: string; value: string }) => { map[r.key] = r.value; });
          setSettings(map);
        }
      });
  }, []);

  const catalogs = CATALOG_KEYS.map((c) => ({ label: t(c.labelKey), url: settings[c.key] }));

  return (
    <section className="relative py-16 lg:py-20 overflow-hidden">
      {/* Background orb */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse,hsl(130_55%_40%/0.05)_0%,transparent_70%)]" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl">
        <AnimatedSection>
          <div className="relative bg-white/60 backdrop-blur-xl border border-[hsl(130_55%_40%/0.15)] rounded-3xl p-6 md:p-10 overflow-hidden
            shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            {/* Decorative corner orb */}
            <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-[radial-gradient(circle,hsl(130_55%_40%/0.1)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
              <div className="flex items-start gap-4 md:max-w-md">
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(130_55%_40%/0.15)] to-[hsl(130_55%_40%/0.05)] flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-[hsl(130_55%_35%)]" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="font-sans text-lg md:text-xl font-medium text-foreground mb-1.5">
                    {t("footer.catalogsTitle")}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("footer.catalogsDesc")}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5 md:ml-auto">
                {catalogs.map((catalog) =>
                  catalog.url ? (
                    <a
                      key={catalog.label}
                      href={catalog.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-full
                        bg-white/80 backdrop-blur-sm border border-[hsl(130_55%_40%/0.15)]
                        hover:bg-white hover:border-[hsl(130_55%_40%/0.35)] hover:shadow-[0_4px_16px_rgba(45,143,67,0.15)] hover:-translate-y-0.5
                        transition-all duration-300"
                    >
                      <Download className="w-3.5 h-3.5 text-[hsl(130_55%_35%)] group-hover:text-[hsl(130_55%_30%)]" strokeWidth={2} />
                      <span className="text-foreground/80 group-hover:text-foreground">{catalog.label}</span>
                    </a>
                  ) : (
                    <span
                      key={catalog.label}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-full
                        bg-white/40 border border-white/40 text-muted-foreground/50 cursor-default"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {catalog.label}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
