import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { MapPin, Check } from "lucide-react";

interface PlotSelectorProps {
  villaId: string;
  villaPrice: number | null;
}

interface LandPlot {
  id: string;
  name: string;
  size_sqm: number;
  price: number;
  status: string;
}

export const PlotSelector = ({ villaId, villaPrice }: PlotSelectorProps) => {
  const { t } = useLanguage();
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);

  const { data: plots } = useQuery({
    queryKey: ["villa-plots", villaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plot_zone_villa_assignments")
        .select("plot_zone_id, plot_zones(*)")
        .eq("villa_id", villaId);
      if (error) throw error;
      return (data || [])
        .map((d: any) => d.plot_zones as LandPlot)
        .filter((p: LandPlot | null): p is LandPlot => p !== null && p.status === "available");
    },
    enabled: !!villaId,
  });

  if (!plots?.length) return null;

  const selectedPlot = plots.find((p) => p.id === selectedPlotId);
  const totalPrice = villaPrice && selectedPlot ? villaPrice + selectedPlot.price : null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl">{t("villa.choosePlot") || "Choose Your Plot"}</h2>
      <p className="font-sans text-sm text-muted-foreground">
        {t("villa.choosePlotDesc") || "Select a land plot where this villa will be built."}
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        {plots.map((plot) => {
          const isSelected = selectedPlotId === plot.id;
          return (
            <button
              key={plot.id}
              onClick={() => setSelectedPlotId(isSelected ? null : plot.id)}
              className={`relative text-left p-4 rounded-xl border-2 transition-all font-sans ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 bg-card"
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{plot.name}</span>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{plot.size_sqm} m²</span>
                <span className="font-semibold text-foreground">${Number(plot.price).toLocaleString()}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Price Summary */}
      {selectedPlot && villaPrice != null && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 font-sans">
          <h3 className="font-semibold text-foreground">{t("villa.priceSummary") || "Price Summary"}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("villa.villaPrice") || "Villa"}</span>
              <span className="text-foreground">${Number(villaPrice).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("villa.plotPrice") || "Land Plot"} ({selectedPlot.name})</span>
              <span className="text-foreground">${Number(selectedPlot.price).toLocaleString()}</span>
            </div>
            <div className="border-t border-primary/20 pt-2 flex justify-between font-semibold text-base">
              <span>{t("villa.totalPrice") || "Total"}</span>
              <span className="text-primary">${Number(totalPrice).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
