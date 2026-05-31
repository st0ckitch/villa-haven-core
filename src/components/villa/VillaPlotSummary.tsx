import { useLanguage } from "@/contexts/LanguageContext";
import { VillaContactForm } from "@/components/VillaContactForm";

interface VillaPlotSummaryProps {
  villa: { name: string; price: number | null; size_sqm?: number | null };
  plotZone: {
    name: string;
    price: number | null;
    code?: string | null;
    size_sqm?: number | null;
    length_m?: number | null;
    width_m?: number | null;
  };
}

export const VillaPlotSummary = ({ villa, plotZone }: VillaPlotSummaryProps) => {
  const { t } = useLanguage();

  const hasBothPrices = villa.price != null && plotZone.price != null;
  const totalPrice = hasBothPrices ? Number(villa.price) + Number(plotZone.price) : null;
  const plotIdent = plotZone.code || plotZone.name;
  // Combination string is also written to Bitrix (`property_interest`), so keep
  // it human-readable for the sales team reading leads.
  const plotSize = plotZone.size_sqm ? `${plotZone.size_sqm} m² plot` : "plot";
  const villaSize = villa.size_sqm ? `${villa.size_sqm} m² villa` : "villa";
  const propertyInterest = `${villa.name} — ${plotIdent} (${plotSize}) + ${villaSize}`;

  return (
    <div className="space-y-4">
      <h2 className="text-xl">{t("villa.selectedPlot") || "Selected Plot"}</h2>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4 font-sans">
        {/* Plot summary — code, dimensions, area in one row so the visitor sees
            what the sales team will see in Bitrix. */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">{plotIdent}</span>
            {plotZone.size_sqm && <span className="text-sm text-foreground">{plotZone.size_sqm} m²</span>}
          </div>
          {plotZone.length_m && plotZone.width_m && (
            <p className="text-xs text-muted-foreground">{plotZone.length_m} × {plotZone.width_m} m</p>
          )}
          <p className="text-xs text-muted-foreground">{plotSize} + {villaSize}</p>
        </div>

        {hasBothPrices && (
          <div className="space-y-2 text-sm border-t border-primary/20 pt-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("villa.villaPrice") || "Villa"} ({villa.name})</span>
              <span className="text-foreground">${Number(villa.price).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("villa.plotPrice") || "Land Plot"} ({plotIdent})</span>
              <span className="text-foreground">${Number(plotZone.price).toLocaleString()}</span>
            </div>
            <div className="border-t border-primary/20 pt-2 flex justify-between font-semibold text-base">
              <span>{t("villa.totalPrice") || "Total"}</span>
              <span className="text-primary">${totalPrice!.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="border-t border-primary/20 pt-4">
          <p className="text-xs text-muted-foreground mb-3">
            {hasBothPrices
              ? (t("plotMap.sendRequestDesc") || "Interested? Send us a request.")
              : (t("plotMap.contactPricingDesc") || "Pricing for this combination is available upon request.")}
          </p>
          <VillaContactForm
            villaName={propertyInterest}
            plotCode={plotZone.code || null}
            plotSqm={plotZone.size_sqm ?? null}
            villaSqm={villa.size_sqm ?? null}
          />
        </div>
      </div>
    </div>
  );
};
