import { useEffect, useState, useRef, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage, getLocalizedField } from "@/contexts/LanguageContext";
import { Calculator, X, Plus, Minus, RotateCcw } from "lucide-react";
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

const ZOOM_MIN = 1;
const ZOOM_MAX = 5;

const pointsToSvgStr = (points: { x: number; y: number }[]) =>
  points.map((p) => `${p.x},${p.y}`).join(" ");

/**
 * One polygon, memoized. With ~300 zones, the previous inline render
 * re-built every polygon JSX node on every hover-state change, then asked
 * React to diff all 300 SVG nodes. Wrapping each polygon in React.memo
 * means only the polygon whose `isActive` / `isHovered` actually flipped
 * gets re-rendered — at most 2 per hover transition instead of 300.
 *
 * Event handlers are intentionally small arrow wrappers; the callbacks
 * they delegate to (onEnter/onLeave/etc) are stable via useCallback in the
 * parent, so they don't bust the memo equality check.
 */
type PolygonZoneProps = {
  zoneId: string;
  points: string;
  showFill: boolean;
  fillColor: string;
  fillOp: number;
  isAvailable: boolean;
  isDimmed: boolean;
  isActive: boolean;
  onPick: (id: string) => void;
  onEnter: (id: string) => void;
  onLeave: () => void;
  onMove: (e: React.MouseEvent) => void;
};
/**
 * Affordance for an available plot.
 *
 * Originally available plots had `fillOpacity: 0` + `stroke: transparent`,
 * so they were completely invisible until the cursor hovered them. Visitors
 * (esp. on mobile, where there's no hover) had no signal that the map was
 * interactive at all — the client report 2026-05-31 was "users don't realize
 * the plot map is clickable."
 *
 * Now every available plot paints a low-opacity green fill + a slightly
 * darker stroke. Plots look like clickable boxes at rest; hover/selection
 * still ramp brightness via existing isActive logic.
 */
const AVAILABLE_REST_FILL_OPACITY = 0.08;
const AVAILABLE_REST_STROKE_OPACITY = 0.45;

const PolygonZone = memo(({
  zoneId, points, showFill, fillColor, fillOp,
  isAvailable, isDimmed, isActive,
  onPick, onEnter, onLeave, onMove,
}: PolygonZoneProps) => {
  // Available plots at rest get a persistent affordance. Non-available
  // (reserved/sold/dimmed) follow the existing showFill logic.
  const restAffordance = isAvailable && !isDimmed && !isActive;
  const actualFill = restAffordance ? fillColor : (showFill ? fillColor : "transparent");
  const actualFillOp = restAffordance ? AVAILABLE_REST_FILL_OPACITY : fillOp;
  const actualStroke = restAffordance ? fillColor : "transparent";
  const actualStrokeOp = restAffordance ? AVAILABLE_REST_STROKE_OPACITY : 0;

  return (
    <polygon
      points={points}
      fill={actualFill}
      fillOpacity={actualFillOp}
      stroke={actualStroke}
      strokeOpacity={actualStrokeOp}
      strokeWidth={restAffordance ? "0.18" : "0"}
      vectorEffect="non-scaling-stroke"
      className={`${isAvailable && !isDimmed ? "cursor-pointer" : "cursor-default"} ${isActive ? "transition-opacity duration-150" : ""}`}
      onClick={() => !isDimmed && onPick(zoneId)}
      onMouseEnter={() => isAvailable && !isDimmed && onEnter(zoneId)}
      onMouseLeave={onLeave}
      onMouseMove={(e) => { if (isAvailable && !isDimmed) onMove(e); }}
      // drop-shadow CSS filter is GPU-expensive — only paint it for the
      // single active polygon, not all 300 on every hover.
      style={isActive ? { filter: `drop-shadow(0 0 3px ${fillColor})` } : undefined}
    />
  );
});
PolygonZone.displayName = "PolygonZone";

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
  const [loading, setLoading] = useState(true);
  const [priceDialog, setPriceDialog] = useState<{ open: boolean; villa: AssignedVilla | null; zone: PlotZone | null }>({ open: false, villa: null, zone: null });
  const containerRef = useRef<HTMLDivElement>(null);
  const { language, t } = useLanguage();

  // No-op kept as the onMove prop on PolygonZone — the hover tooltip was
  // removed (user feedback 2026-05-31), so there's nothing to track on
  // mousemove anymore. Stable identity via useCallback so the memoized
  // PolygonZone children don't re-render every time the parent does.
  const handleMouseMove = useCallback(() => {}, []);

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

  // Stable callbacks for the memoized PolygonZone children. MUST live
  // above the `if (loading) return` early-return below — declaring them
  // after the early return violates the rules of hooks (the hook count
  // would change between renders once `loading` flips to false).
  const handleZoneEnter = useCallback((id: string) => setHoveredZoneId(id), []);
  const handleZoneLeave = useCallback(() => setHoveredZoneId(null), []);
  const pickById = useCallback(
    (id: string) => {
      const z = zones.find((zz) => zz.id === id);
      if (!z || z.status !== "available") return;
      setSelectedZone(z);
      window.history.pushState({ plotPopup: z.id }, "");
    },
    [zones]
  );

  // Listen for browser Back while popup is open
  useEffect(() => {
    if (!selectedZone) return;
    const onPop = () => setSelectedZone(null);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [selectedZone]);

  // Lock background scroll while the sheet is open.
  //
  // The real culprit behind earlier scroll-through bugs was Lenis (the
  // global smooth-scroll library in SmoothScroll.tsx) which installs a
  // window-level `wheel` listener with `passive: false` and unconditionally
  // calls `preventDefault()` so it can drive its own scroll. That was
  // killing wheel events inside the popup before they reached the inner
  // overflow:auto scroller. The fix lives on the scroller itself via
  // `data-lenis-prevent` (see the JSX below) — Lenis sees that attribute
  // and bails on the event so native browser scroll takes over.
  //
  // For background lock, plain `body.overflow = hidden` is sufficient
  // (Lenis owns the page scroll, and once we mark the popup scroller as
  // `data-lenis-prevent`, the rest of the page can't scroll because
  // Lenis still intercepts everything else).
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

  // Dark "spotlight" overlay only kicks in once a zone is selected (clicked).
  // Previously this included hover, which meant every cursor move into a
  // polygon recomputed a complex clipPath polygon string AND re-painted the
  // full-screen overlay — the dominant cost in the hover-lag. Hover-only
  // highlighting now lives on the individual polygon (cheap, memoized).
  const activeHighlight = selectedZone;

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
          minScale={ZOOM_MIN}
          maxScale={ZOOM_MAX}
          doubleClick={{ mode: "toggle", step: 1.2 }}
          // Client request 2026-05-31: zoom only via the +/-/reset buttons,
          // not wheel/trackpad/pinch — which kept accidentally zooming when
          // users tried to scroll the page.
          wheel={{ disabled: true }}
          pinch={{ disabled: true }}
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

                  {/* SVG zone overlays — each polygon is a memoized child so
                      hover state only re-renders the affected polygon(s). */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {filtered.map((zone) => {
                      const isAvailable = zone.status === "available";
                      const isActive = (activeHighlight?.id === zone.id) || (hoveredZoneId === zone.id);
                      const isUnavailable = zone.status === "reserved" || zone.status === "sold";
                      const matchesSize = zoneMatchesSizeFilter(zone);
                      const dimmed = !!(sizeFilter && !matchesSize);
                      const showFill = isActive || isUnavailable || dimmed;
                      const fillColor = dimmed && !isActive && !isUnavailable ? "rgb(100,100,100)" : statusColors[zone.status];
                      const fillOp = dimmed && !isActive && !isUnavailable ? 0.35 : isActive ? 0.5 : isUnavailable ? 0.3 : 0;
                      return (
                        <PolygonZone
                          key={zone.id}
                          zoneId={zone.id}
                          points={pointsToSvgStr(zone.polygon)}
                          showFill={showFill}
                          fillColor={fillColor}
                          fillOp={fillOp}
                          isAvailable={isAvailable}
                          isDimmed={dimmed}
                          isActive={isActive}
                          onPick={pickById}
                          onEnter={handleZoneEnter}
                          onLeave={handleZoneLeave}
                          onMove={handleMouseMove}
                        />
                      );
                    })}
                  </svg>

                </div>
              </TransformComponent>

              {/* Both the "click to select" hint chip and the hover "more
                  details" tooltip were removed per user feedback 2026-05-31
                  ("remove დააწკაპუნე tooltip from everywhere"). The visual
                  affordance on every available polygon (visible green fill
                  + stroke) is now the only signal the map is clickable.
                  Available plots paint at fill-opacity 0.08 / stroke-opacity
                  0.45 at rest, so they read as outlined boxes without any
                  textual prompt. */}

              {/* Zoom controls — vertical glass pill on the right edge of
                  the map. + and − are touch-friendly (40×40 hit area). The
                  middle "track" is purely visual (a thin pill that suggests
                  a slider), since react-zoom-pan-pinch's setTransform from
                  a Radix Slider misfires in our React tree — the proven
                  render-prop zoomIn/zoomOut step zoom works reliably. */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1 bg-card/95 backdrop-blur-sm rounded-full p-1.5 border border-border shadow-lg">
                <button
                  type="button"
                  onClick={() => zoomIn()}
                  aria-label="Zoom in"
                  className="grid place-items-center h-10 w-10 rounded-full hover:bg-muted transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <div className="my-0.5 w-1.5 h-16 rounded-full bg-muted" aria-hidden />
                <button
                  type="button"
                  onClick={() => zoomOut()}
                  aria-label="Zoom out"
                  className="grid place-items-center h-10 w-10 rounded-full hover:bg-muted transition-colors"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <div className="my-0.5 h-px w-6 bg-border" aria-hidden />
                <button
                  type="button"
                  onClick={() => resetTransform()}
                  aria-label="Reset zoom"
                  className="grid place-items-center h-10 w-10 rounded-full hover:bg-muted transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </TransformWrapper>

        {/* The corner status legend was removed 2026-05-31 — the same
            information already lives in the AvailabilityPanel above the
            map (with live counts), and the client flagged the duplicate
            as visual noise. */}
      </div>

      {/* Zone Detail Popup — top sheet on desktop, bottom sheet on mobile.
          Portaled to <body> so the `fixed` overlay anchors to the viewport
          rather than the AnimatedSection ancestor (whose translate-y entrance
          animation otherwise traps the sheet inside the section and forced
          mobile users to scroll the page to find it). */}
      {selectedZone && createPortal(
        <>
          {/* Backdrop — touch-none stops touch gestures from reaching the
              map underneath. Wheel events on the page (outside the popup)
              are already handled by Lenis, and body.overflow=hidden plus
              the data-lenis-prevent on the popup scroller combine to give
              the right behavior: popup scrolls, background doesn't. */}
          <div
            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 touch-none"
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
                  stops scroll from chaining to the page underneath.
                  `data-lenis-prevent` is critical: the site uses Lenis
                  smooth-scroll (SmoothScroll.tsx) which intercepts wheel
                  events at the window level and `preventDefault`s them, so
                  without opt-out, native scroll inside this list dies. */}
              <div
                className="p-5 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain"
                data-lenis-prevent
              >
                {/* Single "Choose Villa" CTA per client PDF 2026-05-31
                    (Q6 — collapsing the in-popup villa list to a single
                    button that routes through /villas?plot=<id>. The new
                    intermediate page surfaces plot context at top and
                    forwards the ?plot= param into the chosen villa's
                    detail URL). The popup is now a brief confirmation
                    surface, not a picker. */}
                <a
                  href={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/villas?plot=${selectedZone.id}`}
                  className="block"
                  onClick={closePopup}
                >
                  <Button className="w-full font-sans" size="lg">
                    {t("plotMap.availableVillas")}
                  </Button>
                </a>
                {/* Lightweight reassurance below the CTA so the visitor
                    knows what they're about to see. Keeps the popup from
                    feeling empty. */}
                <p className="text-xs text-muted-foreground font-sans text-center mt-2">
                  {allVillas.length} {allVillas.length === 1 ? "villa" : "villas"} {t("plotMap.availableLabel")}
                </p>
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
