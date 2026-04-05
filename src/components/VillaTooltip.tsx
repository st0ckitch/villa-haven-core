import { Tables } from "@/integrations/supabase/types";
import { useLanguage } from "@/contexts/LanguageContext";

type Villa = Tables<"villas">;

interface VillaTooltipProps {
  villa: Villa;
  position: { x: number; y: number };
}

const statusColors: Record<string, string> = {
  available: "text-villa-available",
  reserved: "text-villa-reserved",
  sold: "text-villa-sold",
};

export const VillaTooltip = ({ villa, position }: VillaTooltipProps) => {
  const { t } = useLanguage();
  return (
    <div
      className="absolute z-20 bg-card border border-border rounded-xl p-4 shadow-lg min-w-[200px] pointer-events-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -120%)",
      }}
    >
      <h4 className="font-serif text-sm font-medium mb-1">{villa.name}</h4>
      <div className="space-y-0.5 font-sans text-xs text-muted-foreground">
        <p>{villa.size_sqm} sqm · {villa.bedrooms}bd / {villa.bathrooms}ba</p>
        <p className={`font-medium ${statusColors[villa.status]}`}>
          {t(`sitePlan.${villa.status}`)}
        </p>
        {villa.price && <p className="text-foreground font-medium">${Number(villa.price).toLocaleString()}</p>}
      </div>
      <p className="font-sans text-[10px] text-muted-foreground mt-2">{t("villa.clickToView")}</p>
    </div>
  );
};
