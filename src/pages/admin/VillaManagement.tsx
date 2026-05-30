import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Search, Trash2, Home, Plus, Pencil, Upload, Star, X, GripVertical } from "lucide-react";

type Villa = Tables<"villas">;
type VillaImage = Tables<"villa_images">;

interface VillaForm {
  name: string; slug: string; section: string; size_sqm: string; bedrooms: string; bathrooms: string;
  price: string; status: string; description: string; description_ka: string; description_ru: string;
  view_type: string; sector: string; cadastral_codes: string; ceiling_height: string;
  plot_area: string; total_area: string; living_area: string; balcony_area: string; yard_area: string;
  floor_1_total_area: string; floor_1_living_area: string; floor_1_summer_area: string;
  floor_2_total_area: string; floor_2_living_area: string; floor_2_summer_area: string;
  rooms_count: string; bedroom_count: string; living_room: string; dining_room: string;
  study_room: string; kitchen: string; wardrobe: string; terrace: string; balcony_count: string;
  wet_point_1: string; wet_point_2: string;
  auxiliary_rooms_1: string; auxiliary_rooms_2: string; technical_room: string;
  pool: string; parking: string;
}

const emptyForm: VillaForm = {
  name: "", slug: "", section: "a-section", size_sqm: "", bedrooms: "", bathrooms: "",
  price: "", status: "available", description: "", description_ka: "", description_ru: "",
  view_type: "", sector: "", cadastral_codes: "", ceiling_height: "",
  plot_area: "", total_area: "", living_area: "", balcony_area: "", yard_area: "",
  floor_1_total_area: "", floor_1_living_area: "", floor_1_summer_area: "",
  floor_2_total_area: "", floor_2_living_area: "", floor_2_summer_area: "",
  rooms_count: "", bedroom_count: "", living_room: "", dining_room: "",
  study_room: "", kitchen: "", wardrobe: "", terrace: "", balcony_count: "",
  wet_point_1: "", wet_point_2: "",
  auxiliary_rooms_1: "", auxiliary_rooms_2: "", technical_room: "",
  pool: "", parking: "",
};

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const VillaManagement = () => {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<Villa | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Villa | null>(null);
  const [form, setForm] = useState<VillaForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<VillaImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchVillas = async () => {
    const { data } = await supabase.from("villas").select("*").order("name");
    setVillas(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchVillas(); }, []);

  const fetchImages = useCallback(async (villaId: string) => {
    const { data } = await supabase.from("villa_images").select("*").eq("villa_id", villaId).order("sort_order");
    setImages(data || []);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setImages([]);
    setDialogOpen(true);
  };

  const openEdit = async (villa: Villa) => {
    setEditing(villa);
    const v = villa as any;
    setForm({
      name: villa.name, slug: villa.slug || "", section: villa.section || "a-section",
      size_sqm: String(villa.size_sqm), bedrooms: String(villa.bedrooms), bathrooms: String(villa.bathrooms),
      price: villa.price ? String(villa.price) : "", status: villa.status,
      description: villa.description || "", description_ka: villa.description_ka || "", description_ru: villa.description_ru || "",
      view_type: v.view_type || "", sector: v.sector || "",
      cadastral_codes: v.cadastral_codes || "",
      ceiling_height: v.ceiling_height || "",
      plot_area: v.plot_area != null ? String(v.plot_area) : "",
      total_area: v.total_area != null ? String(v.total_area) : "",
      living_area: v.living_area != null ? String(v.living_area) : "",
      balcony_area: v.balcony_area != null ? String(v.balcony_area) : "",
      yard_area: v.yard_area != null ? String(v.yard_area) : "",
      floor_1_total_area:  v.floor_1_total_area  != null ? String(v.floor_1_total_area)  : "",
      floor_1_living_area: v.floor_1_living_area != null ? String(v.floor_1_living_area) : "",
      floor_1_summer_area: v.floor_1_summer_area != null ? String(v.floor_1_summer_area) : "",
      floor_2_total_area:  v.floor_2_total_area  != null ? String(v.floor_2_total_area)  : "",
      floor_2_living_area: v.floor_2_living_area != null ? String(v.floor_2_living_area) : "",
      floor_2_summer_area: v.floor_2_summer_area != null ? String(v.floor_2_summer_area) : "",
      rooms_count:   v.rooms_count   != null ? String(v.rooms_count)   : "",
      bedroom_count: v.bedroom_count != null ? String(v.bedroom_count) : "",
      living_room:   v.living_room   != null ? String(v.living_room)   : "",
      dining_room:   v.dining_room   != null ? String(v.dining_room)   : "",
      study_room:    v.study_room    != null ? String(v.study_room)    : "",
      kitchen:       v.kitchen       != null ? String(v.kitchen)       : "",
      wardrobe:      v.wardrobe      != null ? String(v.wardrobe)      : "",
      terrace:       v.terrace       != null ? String(v.terrace)       : "",
      balcony_count: v.balcony_count != null ? String(v.balcony_count) : "",
      wet_point_1:   v.wet_point_1   != null ? String(v.wet_point_1)   : "",
      wet_point_2:   v.wet_point_2   != null ? String(v.wet_point_2)   : "",
      auxiliary_rooms_1: v.auxiliary_rooms_1 != null ? String(v.auxiliary_rooms_1) : "",
      auxiliary_rooms_2: v.auxiliary_rooms_2 != null ? String(v.auxiliary_rooms_2) : "",
      technical_room:    v.technical_room    != null ? String(v.technical_room)    : "",
      pool: v.pool === true ? "yes" : v.pool === false ? "no" : "",
      parking: v.parking || "",
    });
    await fetchImages(villa.id);
    setDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: !editing ? slugify(name) : f.slug,
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.size_sqm || !form.bedrooms || !form.bathrooms) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload: any = {
      name: form.name, slug: form.slug || slugify(form.name), section: form.section,
      size_sqm: Number(form.size_sqm), bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms),
      price: form.price ? Number(form.price) : null,
      status: form.status as Villa["status"],
      description: form.description || null, description_ka: form.description_ka || null, description_ru: form.description_ru || null,
      view_type: form.view_type || null, sector: form.sector || null,
      cadastral_codes: form.cadastral_codes || null,
      ceiling_height: form.ceiling_height || null,
      plot_area: form.plot_area ? Number(form.plot_area) : null,
      total_area: form.total_area ? Number(form.total_area) : null,
      living_area: form.living_area ? Number(form.living_area) : null,
      balcony_area: form.balcony_area ? Number(form.balcony_area) : null,
      yard_area: form.yard_area ? Number(form.yard_area) : null,
      floor_1_total_area:  form.floor_1_total_area  ? Number(form.floor_1_total_area)  : null,
      floor_1_living_area: form.floor_1_living_area ? Number(form.floor_1_living_area) : null,
      floor_1_summer_area: form.floor_1_summer_area ? Number(form.floor_1_summer_area) : null,
      floor_2_total_area:  form.floor_2_total_area  ? Number(form.floor_2_total_area)  : null,
      floor_2_living_area: form.floor_2_living_area ? Number(form.floor_2_living_area) : null,
      floor_2_summer_area: form.floor_2_summer_area ? Number(form.floor_2_summer_area) : null,
      rooms_count:   form.rooms_count   ? Number(form.rooms_count)   : null,
      bedroom_count: form.bedroom_count ? Number(form.bedroom_count) : null,
      living_room:   form.living_room   ? Number(form.living_room)   : null,
      dining_room:   form.dining_room   ? Number(form.dining_room)   : null,
      study_room:    form.study_room    ? Number(form.study_room)    : null,
      kitchen:       form.kitchen       ? Number(form.kitchen)       : null,
      wardrobe:      form.wardrobe      ? Number(form.wardrobe)      : null,
      terrace:       form.terrace       ? Number(form.terrace)       : null,
      balcony_count: form.balcony_count ? Number(form.balcony_count) : null,
      wet_point_1:   form.wet_point_1   ? Number(form.wet_point_1)   : null,
      wet_point_2:   form.wet_point_2   ? Number(form.wet_point_2)   : null,
      auxiliary_rooms_1: form.auxiliary_rooms_1 ? Number(form.auxiliary_rooms_1) : null,
      auxiliary_rooms_2: form.auxiliary_rooms_2 ? Number(form.auxiliary_rooms_2) : null,
      technical_room:    form.technical_room    ? Number(form.technical_room)    : null,
      pool: form.pool === "yes" ? true : form.pool === "no" ? false : null,
      parking: form.parking || null,
    };

    if (editing) {
      const { error } = await supabase.from("villas").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
      toast({ title: "Villa updated" });
    } else {
      const { error } = await supabase.from("villas").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
      toast({ title: "Villa created" });
    }

    setSaving(false);
    setDialogOpen(false);
    fetchVillas();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const { error } = await supabase.from("villas").delete().eq("id", deleting.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Villa deleted" });
    setDeleting(null);
    fetchVillas();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing || !e.target.files?.length) return;
    setUploading(true);
    const files = Array.from(e.target.files);
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `${editing.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("villa-images").upload(path, file);
      if (uploadErr) { toast({ title: "Upload error", description: uploadErr.message, variant: "destructive" }); continue; }
      const { data: urlData } = supabase.storage.from("villa-images").getPublicUrl(path);
      await supabase.from("villa_images").insert({
        villa_id: editing.id,
        image_url: urlData.publicUrl,
        sort_order: images.length,
        is_hero: images.length === 0,
      });
    }
    await fetchImages(editing.id);
    setUploading(false);
  };

  const toggleHero = async (img: VillaImage) => {
    if (!editing) return;
    await supabase.from("villa_images").update({ is_hero: false }).eq("villa_id", editing.id);
    await supabase.from("villa_images").update({ is_hero: true }).eq("id", img.id);
    await fetchImages(editing.id);
  };

  const deleteImage = async (img: VillaImage) => {
    await supabase.from("villa_images").delete().eq("id", img.id);
    if (editing) await fetchImages(editing.id);
  };

  const filtered = villas.filter((v) => v.name.toLowerCase().includes(search.toLowerCase()));

  const statusColors: Record<string, string> = {
    available: "text-green-600 bg-green-50",
    reserved: "text-amber-600 bg-amber-50",
    sold: "text-red-600 bg-red-50",
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif">Villas</h1>
        <Button onClick={openCreate} size="sm">
          <Plus className="w-4 h-4 mr-1" /> Add Villa
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search villas..." className="pl-9 font-sans" />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground font-sans text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" /> Loading...
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground font-sans">No villas found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((villa) => (
            <div key={villa.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
              <Home className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{villa.name}</h3>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  {villa.bedrooms} bed · {villa.bathrooms} bath · {villa.size_sqm}m²
                  {villa.price ? ` · $${Number(villa.price).toLocaleString()}` : ""}
                </p>
              </div>
              <Select value={villa.status} onValueChange={(val) => {
                supabase.from("villas").update({ status: val as Villa["status"] }).eq("id", villa.id).then(() => fetchVillas());
              }}>
                <SelectTrigger className={`w-28 h-8 text-xs font-sans font-medium rounded-full ${statusColors[villa.status] || ""}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(villa)}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleting(villa)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">{editing ? "Edit Villa" : "Add Villa"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="col-span-2">
              <label className="text-sm font-medium font-sans">Name *</label>
              <Input value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Villa Panorama" className="font-sans mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium font-sans">Slug</label>
              <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="villa-panorama" className="font-sans mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium font-sans">Section</label>
              <Select value={form.section} onValueChange={(v) => setForm((f) => ({ ...f, section: v }))}>
                <SelectTrigger className="mt-1 font-sans"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="a-section">A Section</SelectItem>
                  <SelectItem value="b-section">B Section</SelectItem>
                  <SelectItem value="c-section">C Section</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium font-sans">Size (m²) *</label>
              <Input type="number" value={form.size_sqm} onChange={(e) => setForm((f) => ({ ...f, size_sqm: e.target.value }))} className="font-sans mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium font-sans">Bedrooms *</label>
              <Input type="number" value={form.bedrooms} onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))} className="font-sans mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium font-sans">Bathrooms *</label>
              <Input type="number" value={form.bathrooms} onChange={(e) => setForm((f) => ({ ...f, bathrooms: e.target.value }))} className="font-sans mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium font-sans">Price</label>
              <Input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="Optional" className="font-sans mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium font-sans">Status</label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger className="mt-1 font-sans"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descriptions */}
          <div className="mt-4">
            <label className="text-sm font-medium font-sans">Description</label>
            <Tabs defaultValue="en" className="mt-1">
              <TabsList className="h-8">
                <TabsTrigger value="en" className="text-xs">EN</TabsTrigger>
                <TabsTrigger value="ka" className="text-xs">KA</TabsTrigger>
                <TabsTrigger value="ru" className="text-xs">RU</TabsTrigger>
              </TabsList>
              <TabsContent value="en">
                <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="font-sans" placeholder="English description..." />
              </TabsContent>
              <TabsContent value="ka">
                <Textarea value={form.description_ka} onChange={(e) => setForm((f) => ({ ...f, description_ka: e.target.value }))} rows={3} className="font-sans" placeholder="Georgian description..." />
              </TabsContent>
              <TabsContent value="ru">
                <Textarea value={form.description_ru} onChange={(e) => setForm((f) => ({ ...f, description_ru: e.target.value }))} rows={3} className="font-sans" placeholder="Russian description..." />
              </TabsContent>
            </Tabs>
          </div>

          {/* Extended Parameters — every field is optional. Leave blank to hide on the public page. */}
          <div className="mt-4 border-t border-border pt-4 space-y-4">
            <div>
              <label className="text-sm font-medium font-sans mb-2 block">Context</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ["sector", "Sector", "text"],
                  ["cadastral_codes", "Cadastral Code", "text"],
                  ["view_type", "View", "text"],
                  ["ceiling_height", "Ceiling Height", "text"],
                ] as const).map(([key, label, type]) => (
                  <div key={key}>
                    <label className="text-xs font-sans text-muted-foreground">{label}</label>
                    <Input
                      value={(form as any)[key] || ""}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="font-sans mt-0.5 h-8 text-sm"
                      type={type}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium font-sans mb-2 block">Areas (m²)</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ["plot_area", "Plot Area"],
                  ["total_area", "Total Area"],
                  ["living_area", "Living Area"],
                  ["balcony_area", "Balcony Area"],
                  ["yard_area", "Yard"],
                  ["floor_1_total_area", "Floor 1 — Total"],
                  ["floor_1_living_area", "Floor 1 — Living"],
                  ["floor_1_summer_area", "Floor 1 — Summer"],
                  ["floor_2_total_area", "Floor 2 — Total"],
                  ["floor_2_living_area", "Floor 2 — Living"],
                  ["floor_2_summer_area", "Floor 2 — Summer"],
                ] as const).map(([key, label]) => (
                  <div key={key}>
                    <label className="text-xs font-sans text-muted-foreground">{label}</label>
                    <Input
                      type="number"
                      value={(form as any)[key] || ""}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="font-sans mt-0.5 h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium font-sans mb-2 block">Room counts</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ["rooms_count", "Rooms (total)"],
                  ["bedroom_count", "Bedrooms"],
                  ["living_room", "Living Room"],
                  ["dining_room", "Dining"],
                  ["study_room", "Study"],
                  ["kitchen", "Kitchen"],
                  ["wardrobe", "Wardrobe"],
                  ["terrace", "Terrace"],
                  ["balcony_count", "Balconies"],
                  ["wet_point_1", "Wet Point (Floor 1)"],
                  ["wet_point_2", "Wet Point (Floor 2)"],
                  ["auxiliary_rooms_1", "Auxiliary (Floor 1)"],
                  ["auxiliary_rooms_2", "Auxiliary (Floor 2)"],
                  ["technical_room", "Technical Room"],
                ] as const).map(([key, label]) => (
                  <div key={key}>
                    <label className="text-xs font-sans text-muted-foreground">{label}</label>
                    <Input
                      type="number"
                      value={(form as any)[key] || ""}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="font-sans mt-0.5 h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium font-sans mb-2 block">Amenities</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-sans text-muted-foreground">Pool</label>
                  <Select value={form.pool || "_unset"} onValueChange={(val) => setForm((f) => ({ ...f, pool: val === "_unset" ? "" : val }))}>
                    <SelectTrigger className="font-sans mt-0.5 h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_unset">—</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-sans text-muted-foreground">Parking / Garage</label>
                  <Input
                    value={form.parking || ""}
                    onChange={(e) => setForm((f) => ({ ...f, parking: e.target.value }))}
                    className="font-sans mt-0.5 h-8 text-sm"
                    placeholder='e.g. "Yes", "No", "2 spaces"'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Images — only for editing (need villa ID) */}
          {editing && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium font-sans">Images</label>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  <span className="inline-flex items-center gap-1 text-xs font-sans text-primary hover:underline">
                    <Upload className="w-3 h-3" /> {uploading ? "Uploading..." : "Upload"}
                  </span>
                </label>
              </div>
              {images.length === 0 ? (
                <p className="text-xs text-muted-foreground font-sans">No images yet. Upload some above.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img) => (
                    <div key={img.id} className="relative group rounded-lg overflow-hidden border border-border">
                      <img src={img.image_url} alt="" className="w-full h-20 object-cover" />
                      {img.is_hero && (
                        <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1 rounded font-sans">Hero</div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <button onClick={() => toggleHero(img)} className="p-1 bg-background rounded-full" title="Set as hero">
                          <Star className="w-3 h-3" />
                        </button>
                        <button onClick={() => deleteImage(img)} className="p-1 bg-background rounded-full text-destructive" title="Delete">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!editing && (
            <p className="text-xs text-muted-foreground font-sans mt-2">💡 Save the villa first, then edit it to add images.</p>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="font-sans">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="font-sans">
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleting?.name}"?</AlertDialogTitle>
            <AlertDialogDescription className="font-sans">This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-sans">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground font-sans">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VillaManagement;
