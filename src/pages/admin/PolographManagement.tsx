import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X, Plus, Trash2 } from "lucide-react";

// Per-language keys are resolved by `getLocalizedContent` (src/lib/localizedContent.ts)
// with priority: `<key>_<lang>` → `<key>` → i18n default. Filling the per-language
// rows lets the admin show different copy per language without touching code.
const FIELDS = [
  { key: "polograph_hero_image", label: "Hero Image", type: "image" },
  { key: "polograph_title_ka", label: "Page Title (KA)", type: "text" },
  { key: "polograph_title_en", label: "Page Title (EN)", type: "text" },
  { key: "polograph_title_ru", label: "Page Title (RU)", type: "text" },
  { key: "polograph_description_ka", label: "Description (KA)", type: "textarea" },
  { key: "polograph_description_en", label: "Description (EN)", type: "textarea" },
  { key: "polograph_description_ru", label: "Description (RU)", type: "textarea" },
  { key: "polograph_vision_title_ka", label: "Vision Title (KA)", type: "text" },
  { key: "polograph_vision_title_en", label: "Vision Title (EN)", type: "text" },
  { key: "polograph_vision_title_ru", label: "Vision Title (RU)", type: "text" },
  { key: "polograph_vision_text_ka", label: "Vision Text (KA)", type: "textarea" },
  { key: "polograph_vision_text_en", label: "Vision Text (EN)", type: "textarea" },
  { key: "polograph_vision_text_ru", label: "Vision Text (RU)", type: "textarea" },
  { key: "polograph_video_url", label: "Video URL (YouTube/Vimeo/MP4)", type: "text" },
  { key: "polograph_delivery_title_ka", label: "Delivery Conditions Title (KA)", type: "text" },
  { key: "polograph_delivery_title_en", label: "Delivery Conditions Title (EN)", type: "text" },
  { key: "polograph_delivery_title_ru", label: "Delivery Conditions Title (RU)", type: "text" },
  { key: "polograph_delivery_text_ka", label: "Delivery Conditions Text (KA)", type: "textarea" },
  { key: "polograph_delivery_text_en", label: "Delivery Conditions Text (EN)", type: "textarea" },
  { key: "polograph_delivery_text_ru", label: "Delivery Conditions Text (RU)", type: "textarea" },
] as const;

interface ProjectRender {
  id: string;
  project: string;
  title: string;
  image_url: string;
  sort_order: number;
}

const PolographManagement = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [renders, setRenders] = useState<ProjectRender[]>([]);
  const [uploadingRender, setUploadingRender] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const [settingsRes, rendersRes] = await Promise.all([
        supabase.from("site_settings").select("key, value").in("key", FIELDS.map((f) => f.key)),
        supabase.from("project_renders").select("*").eq("project", "polograph").order("sort_order"),
      ]);
      if (settingsRes.data) {
        const map: Record<string, string> = {};
        settingsRes.data.forEach((r: { key: string; value: string }) => (map[r.key] = r.value));
        setValues(map);
      }
      if (rendersRes.data) setRenders(rendersRes.data as ProjectRender[]);
      setLoading(false);
    })();
  }, []);

  const handleUpload = async (key: string, file: File) => {
    setUploading(key);
    const ext = file.name.split(".").pop();
    const path = `polograph/${key}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("renders").upload(path, file);
    if (error) { toast({ title: "Upload failed", variant: "destructive" }); setUploading(null); return; }
    const { data: urlData } = supabase.storage.from("renders").getPublicUrl(path);
    setValues((v) => ({ ...v, [key]: urlData.publicUrl }));
    setUploading(null);
  };

  const handleRenderUpload = async (file: File) => {
    setUploadingRender(true);
    const ext = file.name.split(".").pop();
    const path = `polograph/render-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("renders").upload(path, file);
    if (error) { toast({ title: "Upload failed", variant: "destructive" }); setUploadingRender(false); return; }
    const { data: urlData } = supabase.storage.from("renders").getPublicUrl(path);
    const { data } = await supabase.from("project_renders").insert({
      project: "polograph", title: "", image_url: urlData.publicUrl, sort_order: renders.length,
    }).select().single();
    if (data) setRenders((r) => [...r, data as ProjectRender]);
    setUploadingRender(false);
  };

  const deleteRender = async (id: string) => {
    await supabase.from("project_renders").delete().eq("id", id);
    setRenders((r) => r.filter((x) => x.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const { key } of FIELDS) {
        const val = values[key] ?? "";
        const { data } = await supabase.from("site_settings").update({ value: val, updated_at: new Date().toISOString() }).eq("key", key).select();
        if (!data?.length) await supabase.from("site_settings").insert({ key, value: val });
      }
      toast({ title: "Polograph page saved" });
    } catch { toast({ title: "Error saving", variant: "destructive" }); }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-serif mb-6">Polograph Page</h1>

      {/* Render Gallery */}
      <Card className="mb-6">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-sans font-medium">Render Gallery</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {renders.map((r) => (
              <div key={r.id} className="relative group">
                <img src={r.image_url} alt={r.title} className="rounded-lg w-full aspect-video object-cover" />
                <button onClick={() => deleteRender(r.id)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-sans text-primary hover:underline">
            {uploadingRender ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Render Image
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRenderUpload(f); }} />
          </label>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {FIELDS.map(({ key, label, type }) => (
          <Card key={key}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-sans font-medium">{label}</CardTitle></CardHeader>
            <CardContent>
              {type === "image" ? (
                <div className="space-y-3">
                  {values[key] && (
                    <div className="relative w-full max-w-xs">
                      <img src={values[key]} alt={label} className="rounded-lg w-full h-auto" />
                      <button onClick={() => setValues((v) => ({ ...v, [key]: "" }))} className="absolute top-1 right-1 bg-foreground/70 text-background rounded-full p-1"><X className="w-3 h-3" /></button>
                    </div>
                  )}
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-sans text-primary hover:underline">
                    {uploading === key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(key, f); }} />
                  </label>
                </div>
              ) : type === "textarea" ? (
                <Textarea value={values[key] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))} rows={4} />
              ) : (
                <Input value={values[key] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={handleSave} disabled={saving} className="mt-6">
        {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Save Polograph Page
      </Button>
    </div>
  );
};

export default PolographManagement;
