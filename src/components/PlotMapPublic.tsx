import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage, getLocalizedField } from "@/contexts/LanguageContext";
import { Calculator, X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { PlotPriceDialog } from "@/components/PlotPriceDialog";
import { getZoneCategory } from "@/lib/zoneCategory";

interface PlotZone {
  id: string;
  name: string;
  description: string;
  status: string;
  size_sqm: number | null;
  price: number | null;
  code: string | null;
  length_m: number | null;
  width_m: number | null;
  polygon: { x: number; y: number }[];
}

interface AssignedVilla {
  id: string;
  name: string;
  slug: string | null;
  section: string | null;
  size_sqm: number | null;
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
  en: { available: "Free", reserved: "Reserved", sold: "Sold" },
  ka: { available: "თავისუფალი", reserved: "დაჯავშნილი", sold: "გაყიდული" },
  ru: { available: "Свободно", reserved: "Забронировано", sold: "Продано" },
};

interface PlotMapPublicProps {
  statusFilter?: string;
  /**
   * [minSqm, maxSqm] — when provided, plots whose largest assigned villa
   * falls outside this size range are visually dimmed. (Client feedback slide 7.)
   */
  sizeFilter?: [number, number] | null;
  onCounts?: (counts: { all: number; available: number; reserved: number; sold: number }) => void;
}

export const PlotMapPublic = ({ statusFilter, sizeFilter, onCounts }: PlotMapPublicProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [zones, setZones] = useState<PlotZone[]>([]);
  // Per WhatsApp 2026-05-31: every plot can pair with any villa, so we hold a
  // single global list instead of per-zone subsets.
  const [allVillas, setAllVillas] = useState<AssignedVilla[]>([]);
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

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: settings }, { data: zonesData }, { data: villasData }] = await Promise.all([
        supabase.from("plot_settings").select("*").limit(1).single(),
        supabase.from("plot_zones").select("*").order("created_at"),
        // Every plot lists every villa now — pull them all up-front in one query
        // and order so the user always sees them in a stable, predictable order.
        supabase.from("villas").select("id, name, slug, section, size_sqm, price, status").order("name"),
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

      if (villasData && villasData.length > 0) {
        const villaIds = (villasData as any[]).map((v) => v.id);
        const { data: heroImages } = await supabase
          .from("villa_images")
          .select("villa_id, image_url")
          .in("villa_id", villaIds)
          .eq("is_hero", true);

        const heroMap: Record<string, string> = {};
        for (const img of heroImages || []) heroMap[img.villa_id] = img.image_url;
        setAllVillas(
          (villasData as any[]).map((v) => ({ ...v, heroImage: heroMap[v.id] || null })) as AssignedVilla[]
        );
      }
      setLoading(false);
    };
    fetchData();
  }, [onCounts]);

  const filtered = statusFilter && statusFilter !== "all"
    ? zones.filter((z) => z.status === statusFilter)
    : zones;

  /**
   * Zone matches the active size filter (client feedback slide 7).
   * Filters the zones by their own m² only. Villas are no longer scoped per
   * zone (every plot can pair with every villa per WhatsApp 2026-05-31), so
   * there's nothing villa-side to fall back on.
   */
  const zoneMatchesSizeFilter = useCallback(
    (zone: PlotZone): boolean => {
      if (!sizeFilter) return true;
      const [min, max] = sizeFilter;
      if (typeof zone.size_sqm === "number" && zone.size_sqm >= min && zone.size_sqm < max) return true;
      return false;
    },
    [sizeFilter]
  );

  const handleZoneClick = (zone: PlotZone) => {
    if (zone.status !== "available") return;
    setSelectedZone(zone);
    // Push history state so browser Back closes popup instead of leaving the page
    window.history.pushState({ plotPopup: zone.id }, "");
  };

  const closePopup = useCallback(() => {
    setSelectedZone(null);
    // Unwind the history entry we added on open (only if the top entry is our popup marker)
    if (window.history.state?.plotPopup) {
      window.history.back();
    }
  }, []);

  // Listen for browser Back while popup is open
  useEffect(() => {
    if (!selectedZone) return;
    const onPop = () => setSelectedZone(null);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [selectedZone]);

  // Lock body scroll while the sheet is open so its `fixed` position visibly
  // pins to the viewport on mobile (the page used to scroll behind it).
  useEffect(() => {
    if (!selectedZone) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, [selectedZone]);

  const pointsToSvg = (points: { x: number; y: number }[]) =>
    points.map((p) => `${p.x},${p.y}`).join(" ");

  const labels = statusLabels[language] || statusLabels.en;

  const handleCalculate = (villa: AssignedVilla, zone: PlotZone) => {
    setPriceDialog({ open: true, villa, zone });
  };

  const buildVillaHref = (villa: AssignedVilla, zoneId: string) => {
    const section = villa.section || "a-section";
    const slug = villa.slug || villa.id;
    // Prepend Vite's BASE_URL so GitHub Pages deploy (served under
    // /villa-haven-core/) resolves correctly. Plain `<a href="/...">` bypasses
    // React Router's basename, which caused a 404 at stOckitch.github.io/projects/...
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    return `${base}/projects/${section}/${slug}?plot=${zoneId}`;
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
  // Same list of villas regardless of which plot is clicked — the visitor picks
  // their preferred villa, and the selected plot rides along via ?plot=<id>.
  const zoneVillas = selectedZone ? allVillas : [];

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full rounded-xl overflow-hidden border border-border bg-muted select-none touch-none"
      >
        <TransformWrapper
          // On mobile the map frame is ~320px wide; starting at 1.4x makes
          // small zones tappable without forcing the user to pinch first.
          initialScale={typeof window !== "undefined" && window.innerWidth < 640 ? 1.4 : 1}
          minScale={1}
          maxScale={5}
          doubleClick={{ mode: "toggle", step: 1.2 }}
          wheel={{ step: 0.15 }}
          pinch={{ step: 5 }}
          panning={{ velocityDisabled: true }}
          centerOnInit
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <TransformComponent
                wrapperStyle={{ width: "100%", height: "auto" }}
                contentStyle={{ width: "100%", height: "auto" }}
              >
                <div className="relative w-full">
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
                      const matchesSize = zoneMatchesSizeFilter(zone);
                      const dimmed = sizeFilter && !matchesSize;
                      const showFill = isActive || isUnavailable || dimmed;
                      const fillColor = dimmed && !isActive && !isUnavailable ? "rgb(100,100,100)" : statusColors[zone.status];
                      const fillOp = dimmed && !isActive && !isUnavailable ? 0.35 : isActive ? 0.5 : isUnavailable ? 0.3 : 0;
                      return (
                        <polygon
                          key={zone.id}
                          points={pointsToSvg(zone.polygon)}
                          fill={showFill ? fillColor : "transparent"}
                          fillOpacity={fillOp}
                          stroke="transparent"
                          strokeWidth="0"
                          className={`transition-all duration-200 ${isAvailable && !dimmed ? "cursor-pointer" : "cursor-default"}`}
                          onClick={() => !dimmed && handleZoneClick(zone)}
                          onMouseEnter={() => isAvailable && !dimmed && setHoveredZoneId(zone.id)}
                          onMouseLeave={() => { setHoveredZoneId(null); setTooltipPos(null); }}
                          onMouseMove={(e: any) => { if (isAvailable && !dimmed) handleMouseMove(e); }}
                          style={{ filter: isActive ? `drop-shadow(0 0 3px ${statusColors[zone.status]})` : undefined }}
                        />
                      );
                    })}
                  </svg>

                  {/* Floating hover tooltip (desktop only — touch shows the sheet on tap) */}
                  {hoveredZoneId && tooltipPos && !selectedZone && (
                    <div
                      className="absolute z-30 bg-card border border-border rounded-lg px-3 py-1.5 shadow-lg pointer-events-none whitespace-nowrap hidden sm:block"
                      style={{ left: tooltipPos.x, top: tooltipPos.y - 40, transform: "translateX(-50%)" }}
                    >
                      <span className="text-xs font-sans text-foreground">{t("villa.moreDetails")}</span>
                    </div>
                  )}
                </div>
              </TransformComponent>

              {/* Zoom controls — always visible, touch-friendly (44x44). */}
              <div className="absolute bottom-3 right-3 z-30 flex flex-col gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-11 w-11 rounded-full bg-card/95 backdrop-blur-sm shadow-lg border border-border"
                  onClick={() => zoomIn()}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-11 w-11 rounded-full bg-card/95 backdrop-blur-sm shadow-lg border border-border"
                  onClick={() => zoomOut()}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-11 w-11 rounded-full bg-card/95 backdrop-blur-sm shadow-lg border border-border"
                  onClick={() => resetTransform()}
                  aria-label="Reset zoom"
                >
                  <Maximize2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Pinch-to-zoom hint on mobile, first time only */}
              <div className="absolute bottom-3 left-3 z-30 bg-card/90 backdrop-blur-sm border border-border rounded-full px-3 py-1.5 sm:hidden pointer-events-none">
                <span className="text-[10px] font-sans text-muted-foreground">{t("sitePlan.pinchHint") !== "sitePlan.pinchHint" ? t("sitePlan.pinchHint") : "Pinch to zoom"}</span>
              </div>
            </>
          )}
        </TransformWrapper>

        {/* Legend — stays outside the pan/zoom layer so it doesn't move */}
        <div className="absolute top-3 right-3 z-20 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-2.5 flex gap-3">
          {(["available", "reserved", "sold"] as const).map((status) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColors[status] }} />
              <span className="text-[10px] font-sans text-muted-foreground">{labels[status]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zone Detail Popup — top sheet on desktop, bottom sheet on mobile.
          Portaled to <body> so the `fixed` overlay anchors to the viewport
          rather than the AnimatedSection ancestor (whose translate-y entrance
          animation otherwise traps the sheet inside the section and forced
          mobile users to scroll the page to find it). */}
      {selectedZone && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closePopup}
          />
          {/* Sheet — sized to the viewport so it never gets taller than the
              screen. On mobile it docks to the bottom (sheet style) and on
              ≥sm it floats from the top. Inner card uses flex column so the
              header / description stay pinned while the villa list scrolls.
              Belt-and-suspenders: max-height is enforced on BOTH the outer
              positioning wrapper and the inner card. Some browsers (notably
              older Safari) don't propagate a flex child's max-height back up
              to its `position: fixed` parent, which caused the inner card
              to render at content height. Capping the wrapper too forces
              the constraint regardless. */}
          <div
            className="
              fixed z-[100] left-1/2 -translate-x-1/2 w-full max-w-lg px-4
              bottom-0 pb-4 sm:bottom-auto sm:pb-0
              sm:top-24
              max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-7rem)]
              animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-top-4 duration-200
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* `100dvh` (dynamic viewport height) handles mobile browsers
                that include the URL bar in `100vh` — without this, the
                popup overshoots the visible area on iOS Safari and Chrome
                Android when the address bar is showing. Falls back to
                100vh on browsers without dvh support. */}
            <div className="flex flex-col bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-7rem)]">
              {/* Header — leads with the plot code (A3/D14/…) when present so the
                  visitor immediately sees the identifier the sales team uses. */}
              <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    {selectedZone.code
                      ? selectedZone.code
                      : getZoneCategory(getLocalizedField(selectedZone as any, "name", language))}
                  </h3>
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground font-sans">
                    {selectedZone.length_m && selectedZone.width_m && (
                      <span>{selectedZone.length_m} × {selectedZone.width_m} m</span>
                    )}
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

              {/* Description (pinned) */}
              {(() => {
                const desc = getLocalizedField(selectedZone as any, "description", language);
                return desc ? (
                  <div className="px-5 pt-4 shrink-0">
                    <p className="text-sm text-muted-foreground font-sans leading-relaxed">{desc}</p>
                  </div>
                ) : null;
              })()}

              {/* Villas — scroll region. `min-h-0` is required for the flex
                  child to actually shrink below its content height and
                  trigger the overflow-y-auto scrollbar. `overscroll-contain`
                  stops scroll from chaining to the page underneath. */}
              <div className="p-5 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain">
                {zoneVillas.length > 0 ? (
                  <>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-sans font-medium">
                      {t("plotMap.availableVillas")}
                    </p>
                    <div className="grid gap-3">
                      {zoneVillas.map((villa) => (
                        <div
                          key={villa.id}
                          className="flex gap-3 items-center p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors"
                        >
                          {/* Photo + name/price (clickable, opens villa in new tab) */}
                          <a
                            href={buildVillaHref(villa, selectedZone.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex gap-3 items-center flex-1 min-w-0 group"
                          >
                            {villa.heroImage ? (
                              <img
                                src={villa.heroImage}
                                alt={villa.name}
                                className="w-20 h-14 rounded-lg object-cover shrink-0 transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-20 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                <span className="text-[10px] text-muted-foreground font-sans">No image</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-sans font-medium text-foreground truncate group-hover:text-[hsl(130_55%_30%)] transition-colors">
                                {villa.name}
                              </p>
                              {/* Combination preview — visitor sees the same string the sales team will receive in Bitrix. */}
                              {(selectedZone.size_sqm || villa.size_sqm) && (
                                <p className="text-[11px] text-muted-foreground font-sans">
                                  {selectedZone.size_sqm ? `${selectedZone.size_sqm} m² plot` : "Plot"}
                                  {villa.size_sqm ? ` + ${villa.size_sqm} m² villa` : ""}
                                </p>
                              )}
                              {villa.price != null && (
                                <p className="text-xs text-muted-foreground font-sans">${Number(villa.price).toLocaleString()}</p>
                              )}
                            </div>
                          </a>
                          {/* Calculator-only button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => handleCalculate(villa, selectedZone)}
                            title={t("plotMap.calculate") || "Calculate"}
                          >
                            <Calculator className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground font-sans text-center py-4">
                    No villas available yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>,
        document.body
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
