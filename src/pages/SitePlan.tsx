import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { PlotMapPublic } from "@/components/PlotMapPublic";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";

const SitePlan = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [counts, setCounts] = useState({ all: 0, available: 0, reserved: 0, sold: 0 });
  const { t } = useLanguage();

  const handleCounts = useCallback((c: typeof counts) => setCounts(c), []);

  const statusKeys = ["all", "available", "reserved", "sold"] as const;

  return (
    <Layout>
      <SEO title={t("sitePlan.title")} description={t("sitePlan.subtitle")} />
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-24">
        <div className="container mx-auto px-6">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif mb-4">{t("sitePlan.title")}</h1>
          <p className="text-muted-foreground font-sans mb-8 max-w-lg">
            {t("sitePlan.subtitle")}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {statusKeys.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-sans font-medium transition-colors ${
                  statusFilter === status
                    ? "bg-gradient-to-r from-[#2d8f43] to-[#3aa557] text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t(`sitePlan.${status}`)} ({counts[status]})
              </button>
            ))}
          </div>

          <PlotMapPublic statusFilter={statusFilter} onCounts={handleCounts} />
        </div>
      </section>
    </Layout>
  );
};

export default SitePlan;
