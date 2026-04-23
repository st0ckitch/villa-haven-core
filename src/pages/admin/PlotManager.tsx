import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, Trash2, Edit2, X, Check, MousePointer2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface PlotZone {
  id: string;
  name: string;
  name_ka?: string | null;
  name_en?: string | null;
  name_ru?: string | null;
  description: string;
  description_ka?: string | null;
  description_en?: string | null;
  description_ru?: string | null;
  status: string;
  size_sqm: number | null;
  price: number | null;
  polygon: { x: number; y: number }[];
}

interface Villa {
  id: string;
  name: string;
  price: number | null;
  status: string;
}

const statusColors: Record<string, string> = {
  available: "hsl(145, 50%, 42%)",
  reserved: "hsl(40, 80%, 50%)",
  sold: "hsl(0, 60%, 50%)",
};

const PlotManager = () => {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [zones, setZones] = useState<PlotZone[]>([]);
  const [uploading, setUploading] = useState(false);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);

  // Form state for new/edit zone
  const [editingZone, setEditingZone] = useState<Partial<PlotZone> | null>(null);
  const [isNewZone, setIsNewZone] = useState(false);

  // Inline villa selection
  const [allVillas, setAllVillas] = useState<Villa[]>([]);
  const [selectedVillaIds, setSelectedVillaIds] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    const [{ data: settings }, { data: zonesData }] = await Promise.all([
      supabase.from("plot_settings").select("*").limit(1).single(),
      supabase.from("plot_zones").select("*").order("created_at"),
    ]);
    if (settings) {
      setImageUrl(settings.image_url);
      setSettingsId(settings.id);
    }
    if (zonesData) {
      setZones(zonesData.map((z: any) => ({ ...z, polygon: z.polygon as any })));
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Fetch villas list once
  useEffect(() => {
    supabase.from("villas").select("id, name, price, status").order("name")
      .then(({ data }) => { if (data) setAllVillas(data as Villa[]); });
  }, []);

  // When editing an existing zone, load its villa assignments
  const loadAssignments = useCallback(async (zoneId: string) => {
    const { data } = await supabase
      .from("plot_zone_villa_assignments")
      .select("villa_id")
      .eq("plot_zone_id", zoneId);
    setSelectedVillaIds(new Set((data || []).map((a: any) => a.villa_id)));
  }, []);

  const openEditZone = (zone: PlotZone) => {
    setEditingZone(zone);
    setIsNewZone(false);
    loadAssignments(zone.id);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `plot-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("plot-images").upload(path, file);
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("plot-images").getPublicUrl(path);
    if (settingsId) {
      await supabase.from("plot_settings").update({ image_url: publicUrl }).eq("id", settingsId);
    } else {
      await supabase.from("plot_settings").insert({ image_url: publicUrl });
    }
    setImageUrl(publicUrl);
    setUploading(false);
    toast({ title: "Image uploaded" });
    fetchData();
  };

  const getRelativeCoords = (e: React.MouseEvent): { x: number; y: number } | null => {
    const container = containerRef.current;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    return {
      x: parseFloat(((e.clientX - rect.left) / rect.width * 100).toFixed(2)),
      y: parseFloat(((e.clientY - rect.top) / rect.height * 100).toFixed(2)),
    };
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const coords = getRelativeCoords(e);
    if (!coords) return;
    if (currentPoints.length >= 3) {
      const first = currentPoints[0];
      const dist = Math.sqrt((coords.x - first.x) ** 2 + (coords.y - first.y) ** 2);
      if (dist < 2) { finishDrawing(); return; }
    }
    setCurrentPoints((p) => [...p, coords]);
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDrawing && currentPoints.length >= 3) finishDrawing();
  };

  const finishDrawing = () => {
    setIsDrawing(false);
    setIsNewZone(true);
    setSelectedVillaIds(new Set());
    setEditingZone({ name: "", description: "", status: "available", size_sqm: null, price: null, polygon: currentPoints });
  };

  const startDrawing = () => {
    setIsDrawing(true);
    setCurrentPoints([]);
    setEditingZone(null);
    setIsNewZone(false);
    setSelectedVillaIds(new Set());
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setCurrentPoints([]);
    setEditingZone(null);
    setIsNewZone(false);
    setSelectedVillaIds(new Set());
  };

  const toggleVilla = (villaId: string) => {
    setSelectedVillaIds((prev) => {
      const next = new Set(prev);
      if (next.has(villaId)) next.delete(villaId); else next.add(villaId);
      return next;
    });
  };

  const saveZone = async () => {
    if (!editingZone?.name || !editingZone.polygon?.length) return;
    const payload = {
      name: editingZone.name,
      name_ka: editingZone.name_ka || null,
      name_en: editingZone.name_en || null,
      name_ru: editingZone.name_ru || null,
      description: editingZone.description || "",
      description_ka: editingZone.description_ka || null,
      description_en: editingZone.description_en || null,
      description_ru: editingZone.description_ru || null,
      status: editingZone.status || "available",
      size_sqm: editingZone.size_sqm || null,
      price: editingZone.price || null,
      polygon: editingZone.polygon,
    };

    let zoneId = editingZone.id;

    if (isNewZone) {
      const { data, error } = await supabase.from("plot_zones").insert(payload).select("id").single();
      if (error) { toast({ title: "Error saving zone", description: error.message, variant: "destructive" }); return; }
      zoneId = data.id;
    } else if (zoneId) {
      const { error } = await supabase.from("plot_zones").update(payload).eq("id", zoneId);
      if (error) { toast({ title: "Error updating zone", description: error.message, variant: "destructive" }); return; }
    }

    // Sync villa assignments
    if (zoneId) {
      await supabase.from("plot_zone_villa_assignments").delete().eq("plot_zone_id", zoneId);
      if (selectedVillaIds.size > 0) {
        await supabase.from("plot_zone_villa_assignments").insert(
          Array.from(selectedVillaIds).map((villa_id) => ({ plot_zone_id: zoneId!, villa_id }))
        );
      }
    }

    toast({ title: isNewZone ? "Zone created" : "Zone updated" });
    setEditingZone(null);
    setIsNewZone(false);
    setCurrentPoints([]);
    setSelectedVillaIds(new Set());
    fetchData();
  };

  const deleteZone = async (id: string) => {
    await supabase.from("plot_zone_villa_assignments").delete().eq("plot_zone_id", id);
    await supabase.from("plot_zones").delete().eq("id", id);
    toast({ title: "Zone deleted" });
    fetchData();
  };

  const pointsToSvg = (points: { x: number; y: number }[]) =>
    points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif">Plot Map Manager</h1>
          <p className="text-sm text-muted-foreground font-sans">Upload a plot image and draw villa zones</p>
        </div>
        <div className="flex gap-2">
          {imageUrl && !isDrawing && !editingZone && (
            <Button onClick={startDrawing} size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Add Zone
            </Button>
          )}
          <label>
            <Button variant="outline" size="sm" className="gap-2 cursor-pointer" asChild disabled={uploading}>
              <span><Upload className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload Image"}</span>
            </Button>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>
      </div>

      {isDrawing && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <MousePointer2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-sans">
            Click on the image to place vertices. {currentPoints.length >= 3 ? "Double-click or click near the first point to close the polygon." : `Place at least ${3 - currentPoints.length} more points.`}
          </span>
          <Button variant="ghost" size="sm" onClick={cancelDrawing}><X className="w-4 h-4" /></Button>
        </div>
      )}

      {imageUrl ? (
        <div className="flex gap-6">
          <div
            ref={containerRef}
            className={`relative flex-1 rounded-xl overflow-hidden border border-border bg-muted ${isDrawing ? "cursor-crosshair" : ""}`}
            onClick={handleCanvasClick}
            onDoubleClick={handleCanvasDoubleClick}
          >
            <img src={imageUrl} alt="Plot" className="w-full h-auto block select-none pointer-events-none" draggable={false} />
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {zones.map((zone) => (
                <polygon
                  key={zone.id}
                  points={pointsToSvg(zone.polygon)}
                  fill={statusColors[zone.status] || statusColors.available}
                  fillOpacity={0.25}
                  stroke={statusColors[zone.status] || statusColors.available}
                  strokeWidth="0.3"
                  className="cursor-pointer hover:fill-opacity-40 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isDrawing) openEditZone(zone);
                  }}
                />
              ))}
              {currentPoints.length > 0 && (
                <>
                  <polyline points={pointsToSvg(currentPoints)} fill="none" stroke="hsl(var(--primary))" strokeWidth="0.3" strokeDasharray="1,0.5" />
                  {currentPoints.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r={i === 0 && currentPoints.length >= 3 ? "1" : "0.6"} fill={i === 0 ? "hsl(var(--primary))" : "hsl(var(--foreground))"} stroke="hsl(var(--background))" strokeWidth="0.2" />
                  ))}
                </>
              )}
              {zones.map((zone) => {
                const cx = zone.polygon.reduce((s, p) => s + p.x, 0) / zone.polygon.length;
                const cy = zone.polygon.reduce((s, p) => s + p.y, 0) / zone.polygon.length;
                return (
                  <text key={`label-${zone.id}`} x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="1.8" fill="hsl(var(--foreground))" fontFamily="sans-serif" fontWeight="600" className="pointer-events-none select-none">
                    {zone.name}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Side panel */}
          <div className="w-72 shrink-0 space-y-4">
            {editingZone ? (
              <div className="border border-border rounded-lg p-4 space-y-3 bg-card">
                <h3 className="font-sans font-semibold text-sm">{isNewZone ? "New Zone" : "Edit Zone"}</h3>
                {/* Legacy bare fields kept as the default / canonical value. */}
                <Input placeholder="Name (default)" value={editingZone.name || ""} onChange={(e) => setEditingZone((z) => ({ ...z, name: e.target.value }))} />
                <Input placeholder="Description (default, max 90 chars)" maxLength={90} value={editingZone.description || ""} onChange={(e) => setEditingZone((z) => ({ ...z, description: e.target.value }))} />

                {/* Per-language overrides — the public plot map reads
                    <field>_<lang> via getLocalizedField. */}
                {(["ka", "en", "ru"] as const).map((lang) => (
                  <div key={lang} className="space-y-2 border-t border-border pt-2">
                    <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground">{lang.toUpperCase()}</p>
                    <Input
                      placeholder={`Name (${lang.toUpperCase()})`}
                      value={(editingZone as any)[`name_${lang}`] || ""}
                      onChange={(e) => setEditingZone((z) => ({ ...(z || {}), [`name_${lang}`]: e.target.value }))}
                    />
                    <Input
                      placeholder={`Description (${lang.toUpperCase()})`}
                      maxLength={90}
                      value={(editingZone as any)[`description_${lang}`] || ""}
                      onChange={(e) => setEditingZone((z) => ({ ...(z || {}), [`description_${lang}`]: e.target.value }))}
                    />
                  </div>
                ))}
                <Input placeholder="Size (m²)" type="number" value={editingZone.size_sqm ?? ""} onChange={(e) => setEditingZone((z) => ({ ...z, size_sqm: e.target.value ? Number(e.target.value) : null }))} />
                <Input placeholder="Price ($)" type="number" value={editingZone.price ?? ""} onChange={(e) => setEditingZone((z) => ({ ...z, price: e.target.value ? Number(e.target.value) : null }))} />
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={editingZone.status || "available"}
                  onChange={(e) => setEditingZone((z) => ({ ...z, status: e.target.value }))}
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>

                {/* Inline villa selection */}
                <div>
                  <p className="text-xs font-sans font-semibold text-muted-foreground mb-2">Assign Villas</p>
                  <div className="max-h-40 overflow-y-auto space-y-1 border border-border rounded-md p-2">
                    {allVillas.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No villas found</p>}
                    {allVillas.map((villa) => (
                      <label key={villa.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 cursor-pointer transition-colors">
                        <Checkbox checked={selectedVillaIds.has(villa.id)} onCheckedChange={() => toggleVilla(villa.id)} />
                        <span className="text-xs font-sans truncate">{villa.name}</span>
                        {villa.price != null && <span className="text-xs text-muted-foreground ml-auto">${Number(villa.price).toLocaleString()}</span>}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={saveZone} className="gap-1 flex-1">
                    <Check className="w-3 h-3" /> Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelDrawing}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="font-sans font-semibold text-sm text-muted-foreground">Zones ({zones.length})</h3>
                {zones.map((zone) => (
                  <div key={zone.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: statusColors[zone.status] }} />
                      <div className="min-w-0">
                        <span className="text-sm font-sans font-medium truncate block">{zone.name}</span>
                        {zone.price != null && <span className="text-xs text-muted-foreground font-sans">${Number(zone.price).toLocaleString()}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditZone(zone)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteZone(zone.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-xl">
          <Upload className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground font-sans text-sm mb-3">Upload a plot/land image to get started</p>
          <label>
            <Button variant="outline" size="sm" className="cursor-pointer" asChild>
              <span>Choose Image</span>
            </Button>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>
      )}
    </div>
  );
};

export default PlotManager;
