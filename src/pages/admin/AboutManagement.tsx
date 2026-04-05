import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";

const FIELDS = [
  { key: "about_hero_image", label: "Hero Image", type: "image" },
  { key: "about_title", label: "Page Title", type: "text" },
  { key: "about_description", label: "Description", type: "textarea" },
  { key: "about_mission_title", label: "Mission Title", type: "text" },
  { key: "about_mission_text", label: "Mission Text", type: "textarea" },
  { key: "about_vision_title", label: "Vision Title", type: "text" },
  { key: "about_vision_text", label: "Vision Text", type: "textarea" },
  { key: "about_team_image", label: "Team / Company Image", type: "image" },
] as const;

const AboutManagement = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", FIELDS.map((f) => f.key));
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r: { key: string; value: string }) => (map[r.key] = r.value));
        setValues(map);
      }
      setLoading(false);
    })();
  }, []);

  const handleUpload = async (key: string, file: File) => {
    setUploading(key);
    const ext = file.name.split(".").pop();
    const path = `about/${key}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("renders").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", variant: "destructive" });
      setUploading(null);
      return;
    }
    const { data: urlData } = supabase.storage.from("renders").getPublicUrl(path);
    setValues((v) => ({ ...v, [key]: urlData.publicUrl }));
    setUploading(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const { key } of FIELDS) {
        const val = values[key] ?? "";
        // Upsert: try update first, insert if no rows matched
        const { data } = await supabase
          .from("site_settings")
          .update({ value: val, updated_at: new Date().toISOString() })
          .eq("key", key)
          .select();
        if (!data?.length) {
          await supabase.from("site_settings").insert({ key, value: val });
        }
      }
      toast({ title: "About page saved" });
    } catch {
      toast({ title: "Error saving", variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-serif mb-6">About Page</h1>

      <div className="space-y-4">
        {FIELDS.map(({ key, label, type }) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-sans font-medium">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              {type === "image" ? (
                <div className="space-y-3">
                  {values[key] && (
                    <div className="relative w-full max-w-xs">
                      <img src={values[key]} alt={label} className="rounded-lg w-full h-auto" />
                      <button
                        onClick={() => setValues((v) => ({ ...v, [key]: "" }))}
                        className="absolute top-1 right-1 bg-foreground/70 text-background rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-sans text-primary hover:underline">
                    {uploading === key ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(key, f);
                      }}
                    />
                  </label>
                </div>
              ) : type === "textarea" ? (
                <Textarea
                  value={values[key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                  rows={4}
                />
              ) : (
                <Input
                  value={values[key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={handleSave} disabled={saving} className="mt-6">
        {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Save About Page
      </Button>
    </div>
  );
};

export default AboutManagement;
