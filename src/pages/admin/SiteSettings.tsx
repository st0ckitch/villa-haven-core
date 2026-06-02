import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Trash2, FileText } from "lucide-react";

const SETTING_KEYS = [
  { key: "contact_email", label: "Email" },
  { key: "contact_phone", label: "Phone" },
  { key: "contact_address", label: "Address" },
  { key: "social_facebook", label: "Facebook URL" },
  { key: "social_instagram", label: "Instagram URL" },
  { key: "social_linkedin", label: "LinkedIn URL" },
  { key: "social_x", label: "X (Twitter) URL" },
  { key: "social_youtube", label: "YouTube URL" },
];

const STAT_KEYS = [
  { key: "stat_1_value", label: "Stat 1 Value" },
  { key: "stat_1_label", label: "Stat 1 Label" },
  { key: "stat_2_value", label: "Stat 2 Value" },
  { key: "stat_2_label", label: "Stat 2 Label" },
  { key: "stat_3_value", label: "Stat 3 Value" },
  { key: "stat_3_label", label: "Stat 3 Label" },
  { key: "stat_3_suffix", label: "Stat 3 Suffix (e.g. HA)" },
  { key: "stat_4_value", label: "Stat 4 Value" },
  { key: "stat_4_label", label: "Stat 4 Label" },
  { key: "stat_4_suffix", label: "Stat 4 Suffix (e.g. HA)" },
  { key: "stat_5_value", label: "Stat 5 Value" },
  { key: "stat_5_label", label: "Stat 5 Label" },
  { key: "stat_5_suffix", label: "Stat 5 Suffix (e.g. min)" },
  { key: "amenities_slogan", label: "Infrastructure Slogan" },
];

const LEAVE_REQUEST_KEYS = [
  { key: "leave_request_title_ka", label: "Title (KA)" },
  { key: "leave_request_title_en", label: "Title (EN)" },
  { key: "leave_request_title_ru", label: "Title (RU)" },
  { key: "leave_request_subtitle_ka", label: "Subtitle (KA)" },
  { key: "leave_request_subtitle_en", label: "Subtitle (EN)" },
  { key: "leave_request_subtitle_ru", label: "Subtitle (RU)" },
  { key: "leave_request_button_ka", label: "Button Text (KA)" },
  { key: "leave_request_button_en", label: "Button Text (EN)" },
  { key: "leave_request_button_ru", label: "Button Text (RU)" },
];

const CATALOG_KEYS = [
  { key: "catalog_igavi", label: "Igavi Development Catalog" },
  { key: "catalog_polograph", label: "Polograph Catalog" },
  { key: "catalog_olimpo", label: "Olimpo Catalog" },
  { key: "catalog_equestrian", label: "Equestrian Club Catalog" },
];

// Homepage plot-map toggle — when "0" or empty, HomePlotMapSection
// renders the static photo (homepage_plotmap_static_image) instead of
// the live PlotMapPublic component. Lets the client temporarily hide
// the interactive map without a code change.
const HOMEPAGE_MAP_KEYS = [
  { key: "homepage_plotmap_enabled", label: "Show interactive plot map on homepage? (1 = yes, 0 = no)" },
  { key: "homepage_plotmap_static_image", label: "Static photo URL (shown when toggle is off)" },
];

const ALL_KEYS = [...SETTING_KEYS, ...STAT_KEYS, ...LEAVE_REQUEST_KEYS, ...CATALOG_KEYS, ...HOMEPAGE_MAP_KEYS];

const SiteSettings = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("key, value");
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r: { key: string; value: string }) => {
          map[r.key] = r.value;
        });
        setValues(map);
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const { key } of ALL_KEYS) {
        const val = values[key] ?? "";
        const { data } = await supabase
          .from("site_settings")
          .update({ value: val, updated_at: new Date().toISOString() })
          .eq("key", key)
          .select();
        if (!data?.length) {
          await supabase.from("site_settings").insert({ key, value: val });
        }
      }
      toast({ title: "Settings saved" });
    } catch {
      toast({ title: "Error saving settings", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleCatalogUpload = async (settingKey: string, file: File) => {
    setUploading(settingKey);
    try {
      const ext = file.name.split(".").pop();
      const path = `${settingKey}.${ext}`;

      // Remove old file if exists
      await supabase.storage.from("catalogs").remove([path]);

      const { error } = await supabase.storage
        .from("catalogs")
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("catalogs")
        .getPublicUrl(path);

      const url = urlData.publicUrl;
      setValues((v) => ({ ...v, [settingKey]: url }));

      // Save immediately
      const { data } = await supabase
        .from("site_settings")
        .update({ value: url, updated_at: new Date().toISOString() })
        .eq("key", settingKey)
        .select();
      if (!data?.length) {
        await supabase.from("site_settings").insert({ key: settingKey, value: url });
      }

      toast({ title: "Catalog uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(null);
  };

  const handleCatalogRemove = async (settingKey: string) => {
    const currentUrl = values[settingKey];
    if (currentUrl) {
      const path = currentUrl.split("/catalogs/").pop();
      if (path) {
        await supabase.storage.from("catalogs").remove([path]);
      }
    }
    setValues((v) => ({ ...v, [settingKey]: "" }));
    await supabase
      .from("site_settings")
      .update({ value: "", updated_at: new Date().toISOString() })
      .eq("key", settingKey);
    toast({ title: "Catalog removed" });
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
      <h1 className="text-2xl font-serif mb-6">Site Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-sans">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {SETTING_KEYS.slice(0, 3).map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-sm font-sans">{label}</Label>
              <Input
                value={values[key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base font-sans">Social Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {SETTING_KEYS.slice(3).map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-sm font-sans">{label}</Label>
              <Input
                value={values[key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base font-sans">Leave Request Section (CTA Banner)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {LEAVE_REQUEST_KEYS.map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-sm font-sans">{label}</Label>
              <Input
                value={values[key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                placeholder="Leave empty to use default"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base font-sans">Stats & Slogan (Infrastructure Section)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {STAT_KEYS.map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-sm font-sans">{label}</Label>
              <Input
                value={values[key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Homepage plot map toggle — controls whether the homepage shows
          the live interactive plot map or a static photo banner. Use
          "1" / "0" for the toggle and a publicly-reachable URL for the
          static fallback image. */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base font-sans">Homepage Plot Map</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {HOMEPAGE_MAP_KEYS.map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-sm font-sans">{label}</Label>
              <Input
                value={values[key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                placeholder={key === "homepage_plotmap_enabled" ? "1" : "https://… or /renders/polograph/banner.jpg"}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base font-sans">Project Catalogs (PDF)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {CATALOG_KEYS.map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label className="text-sm font-sans">{label}</Label>
              {values[key] ? (
                <div className="flex items-center gap-3">
                  <a
                    href={values[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    View current file
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCatalogRemove(key)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Remove
                  </Button>
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf"
                  disabled={uploading === key}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCatalogUpload(key, file);
                  }}
                  className="text-sm"
                />
                {uploading === key && <Loader2 className="w-4 h-4 animate-spin" />}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="mt-6">
        {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Save Settings
      </Button>
    </div>
  );
};

export default SiteSettings;
