import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, GripVertical, Upload, Video, Image } from "lucide-react";

interface SlideForm {
  image_url: string;
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

const emptyForm: SlideForm = {
  image_url: "",
  title: "",
  description: "",
  sort_order: 0,
  is_active: true,
};

const SliderManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SlideForm>(emptyForm);
  const [uploading, setUploading] = useState(false);

  // Hero mode state
  const [heroMode, setHeroMode] = useState<string>("slider");
  const [videoUrl, setVideoUrl] = useState("");

  const { data: heroSettings } = useQuery({
    queryKey: ["admin-hero-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["hero_mode", "hero_video_url"]);
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach((r) => (map[r.key] = r.value));
      return map;
    },
  });

  useEffect(() => {
    if (heroSettings) {
      setHeroMode(heroSettings.hero_mode || "slider");
      setVideoUrl(heroSettings.hero_video_url || "");
    }
  }, [heroSettings]);

  const saveSettingsMutation = useMutation({
    mutationFn: async ({ mode, url }: { mode: string; url: string }) => {
      for (const [key, value] of [["hero_mode", mode], ["hero_video_url", url]]) {
        const { data: existing } = await supabase
          .from("site_settings")
          .select("id")
          .eq("key", key)
          .maybeSingle();
        if (existing) {
          await supabase.from("site_settings").update({ value }).eq("key", key);
        } else {
          await supabase.from("site_settings").insert({ key, value });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-settings"] });
      queryClient.invalidateQueries({ queryKey: ["hero-settings"] });
      toast({ title: "Hero settings saved" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const { data: slides, isLoading } = useQuery({
    queryKey: ["admin-hero-slides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (slide: SlideForm & { id?: string }) => {
      if (slide.id) {
        const { error } = await supabase
          .from("hero_slides")
          .update({
            image_url: slide.image_url,
            title: slide.title || null,
            description: slide.description || null,
            sort_order: slide.sort_order,
            is_active: slide.is_active,
          })
          .eq("id", slide.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("hero_slides")
          .insert({
            image_url: slide.image_url,
            title: slide.title || null,
            description: slide.description || null,
            sort_order: slide.sort_order,
            is_active: slide.is_active,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-slides"] });
      queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
      setEditingId(null);
      setForm(emptyForm);
      toast({ title: "Slide saved successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hero_slides").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-slides"] });
      queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
      toast({ title: "Slide deleted" });
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("slider-images").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("slider-images").getPublicUrl(path);
    setForm((prev) => ({ ...prev, image_url: urlData.publicUrl }));
    setUploading(false);
  };

  const startEdit = (slide: NonNullable<typeof slides>[0]) => {
    setEditingId(slide.id);
    setForm({
      image_url: slide.image_url,
      title: slide.title || "",
      description: slide.description || "",
      sort_order: slide.sort_order,
      is_active: slide.is_active,
    });
  };

  const startNew = () => {
    setEditingId("new");
    setForm({ ...emptyForm, sort_order: (slides?.length || 0) });
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <h1 className="text-2xl font-serif mb-6">Hero Section</h1>

      {/* Mode toggle */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8 space-y-4">
        <Label className="font-sans font-semibold text-sm">Display Mode</Label>
        <RadioGroup
          value={heroMode}
          onValueChange={setHeroMode}
          className="flex gap-6"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="slider" id="mode-slider" />
            <Label htmlFor="mode-slider" className="font-sans text-sm flex items-center gap-1.5 cursor-pointer">
              <Image className="w-4 h-4" /> Slider
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="video" id="mode-video" />
            <Label htmlFor="mode-video" className="font-sans text-sm flex items-center gap-1.5 cursor-pointer">
              <Video className="w-4 h-4" /> Video
            </Label>
          </div>
        </RadioGroup>

        {heroMode === "video" && (
          <div className="space-y-2 pt-2">
            <Label className="font-sans text-sm">Video URL (YouTube, Vimeo, or direct MP4 link)</Label>
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://example.com/video.mp4"
              className="font-sans"
            />
          </div>
        )}

        <Button
          onClick={() => saveSettingsMutation.mutate({ mode: heroMode, url: videoUrl })}
          disabled={saveSettingsMutation.isPending}
          className="font-sans"
        >
          {saveSettingsMutation.isPending ? "Saving..." : "Save Mode"}
        </Button>
      </div>

      {/* Slider management (only shown when slider mode) */}
      {heroMode === "slider" && (
        <>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-serif">Slides</h2>
              <p className="text-sm text-muted-foreground font-sans mt-1">Manage homepage slider images, titles, and descriptions.</p>
            </div>
            <Button onClick={startNew} className="gap-2 font-sans">
              <Plus className="w-4 h-4" /> Add Slide
            </Button>
          </div>

          {editingId && (
            <div className="bg-card border border-border rounded-xl p-6 mb-8 space-y-4">
              <h3 className="font-sans font-semibold text-sm">{editingId === "new" ? "New Slide" : "Edit Slide"}</h3>

              <div className="space-y-2">
                <Label className="font-sans text-sm">Image</Label>
                {form.image_url ? (
                  <img src={form.image_url} alt="Preview" className="w-full max-w-md h-40 object-cover rounded-lg" />
                ) : null}
                <label className="cursor-pointer block">
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  <div className="flex items-center justify-center gap-2 w-full max-w-md h-32 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-sans text-muted-foreground">
                      {uploading ? "Uploading..." : form.image_url ? "Replace image" : "Click to upload image"}
                    </span>
                  </div>
                </label>
              </div>

              <div className="space-y-2">
                <Label className="font-sans text-sm">Title (optional)</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Slide title"
                  className="font-sans"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-sans text-sm">Description (optional)</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Slide description"
                  className="font-sans"
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="space-y-1">
                  <Label className="font-sans text-sm">Sort Order</Label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                    className="font-sans w-24"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                  />
                  <Label className="font-sans text-sm">Active</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => saveMutation.mutate(editingId === "new" ? form : { ...form, id: editingId })}
                  disabled={!form.image_url || saveMutation.isPending}
                  className="font-sans"
                >
                  {saveMutation.isPending ? "Saving..." : "Save"}
                </Button>
                <Button variant="ghost" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="font-sans">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <p className="text-muted-foreground font-sans">Loading...</p>
          ) : !slides?.length ? (
            <p className="text-muted-foreground font-sans">No slides yet. Fallback images will be used on the homepage.</p>
          ) : (
            <div className="space-y-3">
              {slides.map((slide) => (
                <div key={slide.id} className="flex items-center gap-4 bg-card border border-border rounded-xl p-4">
                  <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <img src={slide.image_url} alt={slide.title || "Slide"} className="w-24 h-16 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-medium text-sm truncate">{slide.title || "(No title)"}</p>
                    <p className="font-sans text-xs text-muted-foreground truncate">{slide.description || "(No description)"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-sans text-muted-foreground">Order: {slide.sort_order}</span>
                      <span className={`text-xs font-sans ${slide.is_active ? "text-villa-available" : "text-muted-foreground"}`}>
                        {slide.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={() => startEdit(slide)} className="font-sans">
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(slide.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SliderManagement;
