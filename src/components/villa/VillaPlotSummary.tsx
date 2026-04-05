import { useLanguage } from "@/contexts/LanguageContext";
import { VillaContactForm } from "@/components/VillaContactForm";

interface VillaPlotSummaryProps {
  villa: { name: string; price: number | null };
  plotZone: { name: string; price: number | null };
}

export const VillaPlotSummary = ({ villa, plotZone }: VillaPlotSummaryProps) => {
  const { t } = useLanguage();

  const hasBothPrices = villa.price != null && plotZone.price != null;
  const totalPrice = hasBothPrices ? Number(villa.price) + Number(plotZone.price) : null;
  const propertyInterest = `${villa.name} + ${plotZone.name}`;

  return (
    <div className="space-y-4">
      <h2 className="text-xl">{t("villa.selectedPlot") || "Selected Plot"}</h2>

      {hasBothPrices ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 font-sans">
          <h3 className="font-semibold text-foreground">{t("villa.priceSummary") || "Price Summary"}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("villa.villaPrice") || "Villa"} ({villa.name})</span>
              <span className="text-foreground">${Number(villa.price).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("villa.plotPrice") || "Land Plot"} ({plotZone.name})</span>
              <span className="text-foreground">${Number(plotZone.price).toLocaleString()}</span>
            </div>
            <div className="border-t border-primary/20 pt-2 flex justify-between font-semibold text-base">
              <span>{t("villa.totalPrice") || "Total"}</span>
              <span className="text-primary">${totalPrice!.toLocaleString()}</span>
            </div>
          </div>
          <div className="border-t border-primary/20 pt-4">
            <p className="text-xs text-muted-foreground mb-3">{t("plotMap.sendRequestDesc") || "Interested? Send us a request."}</p>
            <VillaContactForm villaName={propertyInterest} />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3 font-sans">
          <p className="text-sm font-medium text-foreground">{plotZone.name}</p>
          <p className="text-sm text-muted-foreground">
            {t("plotMap.contactPricingDesc") || "Pricing for this combination is available upon request. Please fill out the form below."}
          </p>
          <VillaContactForm villaName={propertyInterest} />
        </div>
      )}
    </div>
  );
};
