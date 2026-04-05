import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calculator, ArrowRight, X } from "lucide-react";
import { PlotPriceDialog } from "@/components/PlotPriceDialog";

interface PlotZone {
  id: string;
  name: string;
  description: string;
  status: string;
  size_sqm: number | null;
  price: number | null;
  polygon: { x: number; y: number }[];
}

interface AssignedVilla {
  id: string;
  name: string;
  slug: string | null;
  section: string | null;
  price: number | null;
  status: string;
  heroImage?: string | null;
}

const statusColors: Record<string, string> = {
  available: "hsl(145, 50%, 42%)",
  reserved: "hsl(40, 80%, 50%)",
  sold: "hsl(0, 60%, 50%)",
};

const statusLabels: Record<string, Record<string, string>> = {
  en: { available: "Available", reserved: "Reserved", sold: "Sold" },
  ka: { available: "თავისუფალი", reserved: "დაჯავშნილი", sold: "გაყიდული" },
  ru: { available: "Доступно", reserved: "Забронировано", sold: "Продано" },
};

interface PlotMapPublicProps {
  statusFilter?: string;
  onCounts?: (counts: { all: number; available: number; reserved: number; sold: number }) => void;
}

export const PlotMapPublic = ({ statusFilter, onCounts }: PlotMapPublicProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [zones, setZones] = useState<PlotZone[]>([]);
  const [villasByZone, setVillasByZone] = useState<Record<string, AssignedVilla[]>>({});
  const [selectedZone, setSelectedZone] = useState<PlotZone | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [priceDialog, setPriceDialog] = useState<{ open: boolean; villa: AssignedVilla | null; zone: PlotZone | null }>({ open: false, villa: null, zone: null });
  const containerRef = useRef<HTMLDivElement>(null);
  const { language, t } = useLanguage();

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: settings }, { data: zonesData }, { data: assignments }] = await Promise.all([
        supabase.from("plot_settings").select("*").limit(1).single(),
        supabase.from("plot_zones").select("*").order("created_at"),
        supabase.from("plot_zone_villa_assignments").select("plot_zone_id, villa_id, villas(id, name, slug, section, price, status)"),
      ]);
      if (settings) setImageUrl(settings.image_url);
      if (zonesData) {
        const parsed = zonesData.map((z: any) => ({ ...z, polygon: z.polygon as any }));
        setZones(parsed);
        onCounts?.({
          all: parsed.length,
          available: parsed.filter((z: PlotZone) => z.status === "available").length,
          reserved: parsed.filter((z: PlotZone) => z.status === "reserved").length,
          sold: parsed.filter((z: PlotZone) => z.status === "sold").length,
        });
      }

      // Build villa map and fetch hero images
      if (assignments) {
        const map: Record<string, AssignedVilla[]> = {};
        const villaIds = new Set<string>();
        for (const a of assignments as any[]) {
          if (!a.villas) continue;
          if (!map[a.plot_zone_id]) map[a.plot_zone_id] = [];
          map[a.plot_zone_id].push({ ...a.villas } as AssignedVilla);
          villaIds.add(a.villas.id);
        }

        // Fetch hero images for all assigned villas
        if (villaIds.size > 0) {
          const { data: heroImages } = await supabase
            .from("villa_images")
            .select("villa_id, image_url")
            .in("villa_id", Array.from(villaIds))
            .eq("is_hero", true);

          if (heroImages) {
            const heroMap: Record<string, string> = {};
            for (const img of heroImages) heroMap[img.villa_id] = img.image_url;
            // Attach hero images to villas
            for (const zoneId in map) {
              for (const villa of map[zoneId]) {
                villa.heroImage = heroMap[villa.id] || null;
              }
            }
          }
        }

        setVillasByZone(map);
      }
      setLoading(false);
    };
    fetchData();
  }, [onCounts]);

  const filtered = statusFilter && statusFilter !== "all"
    ? zones.filter((z) => z.status === statusFilter)
    : zones;

  const handleZoneClick = (zone: PlotZone) => {
    if (zone.status !== "available") return;
    setSelectedZone(zone);
  };

  const closePopup = () => setSelectedZone(null);

  const pointsToSvg = (points: { x: number; y: number }[]) =>
    points.map((p) => `${p.x},${p.y}`).join(" ");

  const labels = statusLabels[language] || statusLabels.en;

  const handleCalculate = (villa: AssignedVilla, zone: PlotZone) => {
    setPriceDialog({ open: true, villa, zone });
  };

  const navigateToVilla = (villa: AssignedVilla, zoneId: string) => {
    const section = villa.section || "a-section";
    const slug = villa.slug || villa.id;
    navigate(`/projects/${section}/${slug}?plot=${zoneId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground font-sans text-sm py-12">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
        Loading...
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="text-center py-16 text-muted-foreground font-sans">
        No plot map has been configured yet.
      </div>
    );
  }

  const activeHighlight = selectedZone || (hoveredZoneId ? zones.find(z => z.id === hoveredZoneId) : null);
  const zoneVillas = selectedZone ? villasByZone[selectedZone.id] || [] : [];

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full rounded-xl overflow-hidden border border-border bg-muted select-none"
      >
        <img src={imageUrl} alt="Site plan" className="w-full h-auto block pointer-events-none" draggable={false} />

        {/* Dark overlay with cutout for active zone */}
        <div
          className="absolute inset-0 transition-opacity duration-200 pointer-events-none"
          style={{
            backgroundColor: activeHighlight ? "rgba(0,0,0,0.55)" : "transparent",
            clipPath: activeHighlight
              ? `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${activeHighlight.polygon.map((p) => `${p.x}% ${p.y}%`).join(", ")})`
              : undefined,
            clipRule: "evenodd",
          }}
        />

        {/* SVG zone overlays */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {filtered.map((zone) => {
            const isAvailable = zone.status === "available";
            const isActive = activeHighlight?.id === zone.id;
            const isUnavailable = zone.status === "reserved" || zone.status === "sold";
            const showFill = isActive || isUnavailable;
            return (
              <polygon
                key={zone.id}
                points={pointsToSvg(zone.polygon)}
                fill={showFill ? statusColors[zone.status] : "transparent"}
                fillOpacity={isActive ? 0.5 : isUnavailable ? 0.3 : 0}
                stroke="transparent"
                strokeWidth="0"
                className={`transition-all duration-200 ${isAvailable ? "cursor-pointer" : "cursor-default"}`}
                onClick={() => handleZoneClick(zone)}
                onMouseEnter={() => isAvailable && setHoveredZoneId(zone.id)}
                onMouseLeave={() => { setHoveredZoneId(null); setTooltipPos(null); }}
                onMouseMove={(e: any) => { if (isAvailable) handleMouseMove(e); }}
                style={{ filter: isActive ? `drop-shadow(0 0 3px ${statusColors[zone.status]})` : undefined }}
              />
            );
          })}
        </svg>

        {/* Floating tooltip */}
        {hoveredZoneId && tooltipPos && !selectedZone && (
          <div
            className="absolute z-30 bg-card border border-border rounded-lg px-3 py-1.5 shadow-lg pointer-events-none whitespace-nowrap"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y - 40,
              transform: "translateX(-50%)",
            }}
          >
            <span className="text-xs font-sans text-foreground">{t("villa.moreDetails")}</span>
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-2.5 flex gap-3">
          {(["available", "reserved", "sold"] as const).map((status) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColors[status] }} />
              <span className="text-[10px] font-sans text-muted-foreground">{labels[status]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zone Detail Popup (overlay) */}
      {selectedZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={closePopup}>
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground">{selectedZone.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground font-sans">
                  {selectedZone.size_sqm && <span>{selectedZone.size_sqm} m²</span>}
                  {selectedZone.price != null && (
                    <span className="font-semibold text-foreground">${Number(selectedZone.price).toLocaleString()}</span>
                  )}
                  <Badge
                    className="text-[10px] px-1.5 py-0 border-0"
                    style={{ backgroundColor: statusColors[selectedZone.status], color: "white" }}
                  >
                    {labels[selectedZone.status]}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={closePopup}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Description */}
            {selectedZone.description && (
              <div className="px-5 pt-4">
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">{selectedZone.description}</p>
              </div>
            )}

            {/* Villas */}
            <div className="p-5 space-y-4">
              {zoneVillas.length > 0 ? (
                <>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-sans font-medium">
                    {t("plotMap.availableVillas") || "Available Villas"}
                  </p>
                  <div className="grid gap-3">
                    {zoneVillas.map((villa) => (
                      <div key={villa.id} className="flex gap-3 items-center p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors">
                        {/* Hero image */}
                        {villa.heroImage ? (
                          <img
                            src={villa.heroImage}
                            alt={villa.name}
                            className="w-20 h-14 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <span className="text-[10px] text-muted-foreground font-sans">No image</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-sans font-medium text-foreground truncate">{villa.name}</p>
                          {villa.price != null && (
                            <p className="text-xs text-muted-foreground font-sans">${Number(villa.price).toLocaleString()}</p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCalculate(villa, selectedZone)}
                            title={t("plotMap.calculate") || "Calculate"}
                          >
                            <Calculator className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => navigateToVilla(villa, selectedZone.id)}
                            title={t("plotMap.viewVilla") || "View Villa"}
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground font-sans text-center py-4">
                  No villas assigned to this zone yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Price / Contact Dialog */}
      <PlotPriceDialog
        open={priceDialog.open}
        onOpenChange={(open) => setPriceDialog((p) => ({ ...p, open }))}
        villa={priceDialog.villa}
        zone={priceDialog.zone}
      />
    </>
  );
};
