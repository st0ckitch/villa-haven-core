import { useLanguage } from "@/contexts/LanguageContext";

export type AvailabilityStatus = "all" | "available" | "reserved" | "sold";

interface AvailabilityPanelProps {
  counts: Record<AvailabilityStatus, number>;
  active: AvailabilityStatus;
  onChange: (next: AvailabilityStatus) => void;
  /** When true, the panel centres its pills (used on /polograph). Default: left-aligned. */
  centered?: boolean;
}

const DOT_COLOR: Record<AvailabilityStatus, string> = {
  all: "bg-foreground/35",
  available: "bg-[hsl(145,50%,42%)]",
  reserved: "bg-[hsl(40,80%,50%)]",
  sold: "bg-[hsl(0,60%,50%)]",
};

const STATUS_KEYS: AvailabilityStatus[] = ["all", "available", "reserved", "sold"];

/**
 * Standalone availability filter panel that lives ABOVE the plot map
 * (not on top of it). Each entry shows a status-coloured dot, the
 * localized label, and the live count. Tapping an entry filters the map.
 *
 * Used by:
 *   - HomePlotMapSection (homepage embedded map)
 *   - /site-plan dedicated picker
 *   - /polograph project page
 */
export const AvailabilityPanel = ({
  counts, active, onChange, centered = false,
}: AvailabilityPanelProps) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-[hsl(130_55%_40%/0.15)] bg-white/55 backdrop-blur-md p-3 sm:p-4 shadow-[0_4px_24px_rgba(45,143,67,0.06)]">
      <div className={`flex flex-wrap items-center gap-2 sm:gap-3 ${centered ? "justify-center" : ""}`}>
        {STATUS_KEYS.map((status) => {
          const isActive = active === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => onChange(status)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-sans font-medium transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-[#2d8f43] to-[#3aa557] text-white shadow-[0_4px_16px_rgba(45,143,67,0.3)]"
                  : "bg-white/80 border border-[hsl(130_55%_40%/0.12)] text-foreground/75 hover:bg-white hover:border-[hsl(130_55%_40%/0.3)] hover:text-foreground"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isActive ? "bg-white/85" : DOT_COLOR[status]}`} />
              {t(`sitePlan.${status}`)}
              <span className={`tabular-nums ${isActive ? "text-white/85" : "text-muted-foreground"}`}>
                {counts[status]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
