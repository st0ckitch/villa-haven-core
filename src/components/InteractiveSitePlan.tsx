import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { VillaTooltip } from "@/components/VillaTooltip";

type Villa = Tables<"villas">;

interface InteractiveSitePlanProps {
  villas: Villa[];
  statusFilter?: string;
}

const statusFills: Record<string, string> = {
  available: "hsl(145, 50%, 42%)",
  reserved: "hsl(40, 80%, 50%)",
  sold: "hsl(0, 60%, 50%)",
};

export const InteractiveSitePlan = ({ villas, statusFilter }: InteractiveSitePlanProps) => {
  const [hoveredVilla, setHoveredVilla] = useState<Villa | null>(null);
  const navigate = useNavigate();

  const filtered = statusFilter && statusFilter !== "all"
    ? villas.filter((v) => v.status === statusFilter)
    : villas;

  return (
    <div className="relative w-full aspect-[16/10] bg-muted rounded-xl overflow-hidden">
      {/* Background grid */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 62.5" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="hsl(var(--border))" strokeWidth="0.1" />
          </pattern>
        </defs>
        <rect width="100" height="62.5" fill="url(#grid)" />
      </svg>

      {/* Villa markers */}
      {filtered.map((villa) => (
        <div
          key={villa.id}
          className="absolute cursor-pointer transition-transform hover:scale-125"
          style={{
            left: `${villa.position_x}%`,
            top: `${villa.position_y}%`,
            transform: "translate(-50%, -50%)",
          }}
          onMouseEnter={() => setHoveredVilla(villa)}
          onMouseLeave={() => setHoveredVilla(null)}
          onClick={() => navigate(`/projects/${(villa as any).section || 'a-section'}/${(villa as any).slug || villa.id}`)}
        >
          <div
            className="w-4 h-4 rounded-full border-2 border-card shadow-md"
            style={{ backgroundColor: statusFills[villa.status] }}
          />
        </div>
      ))}

      {/* Tooltip */}
      {hoveredVilla && (
        <VillaTooltip
          villa={hoveredVilla}
          position={{ x: Number(hoveredVilla.position_x), y: Number(hoveredVilla.position_y) }}
        />
      )}

      {/* Legend */}
      <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-2.5 flex gap-3">
        {[
          { label: "Available", color: statusFills.available },
          { label: "Reserved", color: statusFills.reserved },
          { label: "Sold", color: statusFills.sold },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] font-sans text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
