import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { VillaContactForm } from "@/components/VillaContactForm";

interface PlotPriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  villa: { id: string; name: string; price: number | null; size_sqm?: number | null } | null;
  zone: {
    id: string;
    name: string;
    price: number | null;
    code?: string | null;
    size_sqm?: number | null;
  } | null;
}

export const PlotPriceDialog = ({ open, onOpenChange, villa, zone }: PlotPriceDialogProps) => {
  const { t } = useLanguage();

  if (!villa || !zone) return null;

  const hasBothPrices = villa.price != null && zone.price != null;
  const totalPrice = hasBothPrices ? Number(villa.price) + Number(zone.price) : null;
  const zoneIdent = zone.code || zone.name;
  const propertyInterest = `${villa.name} — ${zoneIdent}${zone.size_sqm ? ` (${zone.size_sqm} m² plot)` : ""}${villa.size_sqm ? ` + ${villa.size_sqm} m² villa` : ""}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans">
            {hasBothPrices ? (t("plotMap.priceSummary") || "Price Summary") : (t("plotMap.contactForPricing") || "Contact Us for Pricing")}
          </DialogTitle>
        </DialogHeader>

        {hasBothPrices && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 font-sans">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("villa.villaPrice") || "Villa"} ({villa.name})</span>
                <span className="text-foreground">${Number(villa.price).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("villa.plotPrice") || "Land Plot"} ({zone.name})</span>
                <span className="text-foreground">${Number(zone.price).toLocaleString()}</span>
              </div>
              <div className="border-t border-primary/20 pt-2 flex justify-between font-semibold text-base">
                <span>{t("villa.totalPrice") || "Total"}</span>
                <span className="text-primary">${totalPrice!.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {!hasBothPrices && (
          <p className="text-sm text-muted-foreground font-sans">
            {t("plotMap.contactPricingDesc") || "Pricing for this combination is available upon request. Please fill out the form below and our team will get back to you."}
          </p>
        )}

        <div className="pt-2">
          <p className="text-xs text-muted-foreground font-sans mb-3">
            {hasBothPrices
              ? (t("plotMap.sendRequestDesc") || "Interested? Send us a request about this combination.")
              : ""}
          </p>
          <VillaContactForm
            villaName={propertyInterest}
            plotCode={zone.code || null}
            plotSqm={zone.size_sqm ?? null}
            villaSqm={villa.size_sqm ?? null}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
