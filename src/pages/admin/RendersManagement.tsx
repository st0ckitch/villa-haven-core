import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Search, Plus, Upload, Pencil } from "lucide-react";

type Render = Tables<"renders">;

// Category options offered in the admin dropdown. Client PDF 2026-05-31
// renamed the public Gallery buckets — old values (exterior/interior/
// amenities/landscape) are kept here so legacy rows still have a valid
// option, but new uploads should land in one of the four project-named
// buckets so the public gallery filter pills match the rest of the site.
const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  // New project buckets — preferred
  { value: "polograph", label: "Polograph" },
  { value: "olimpo",    label: "Olimpo" },
  { value: "ipodromi",  label: "Ipodromi" },
  { value: "villas",    label: "Villas" },
  // Legacy buckets — still selectable so existing rows aren't orphaned
  { value: "exterior",  label: "Exterior (legacy)" },
  { value: "interior",  label: "Interior (legacy)" },
  { value: "amenities", label: "Amenities (legacy)" },
  { value: "landscape", label: "Landscape (legacy)" },
];

const RendersManagement = () => {
  const [renders, setRenders] = useState<Render[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<Render | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTitleKa, setNewTitleKa] = useState("");
  const [newTitleEn, setNewTitleEn] = useState("");
  const [newTitleRu, setNewTitleRu] = useState("");
  // Default new uploads to "polograph" — the project gallery the client
  // uses most. They can switch via the dropdown for each upload.
  const [newCategory, setNewCategory] = useState("polograph");
  const [newSortOrder, setNewSortOrder] = useState(0);
  const [newFile, setNewFile] = useState<File | null>(null);
  // Inline edit-category flow: clicking the small pencil on a render
  // opens this dialog seeded with that row's current category. Saving
  // PATCHes the renders row in place.
  const [editing, setEditing] = useState<Render | null>(null);
  const [editCategory, setEditCategory] = useState("");
  const { toast } = useToast();

  const saveCategory = async () => {
    if (!editing) return;
    const { error } = await supabase
      .from("renders")
      .update({ category: editCategory })
      .eq("id", editing.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Category updated" });
    setEditing(null);
    fetchRenders();
  };

  const fetchRenders = async () => {
    const { data } = await supabase.from("renders").select("*").order("sort_order");
    setRenders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRenders(); }, []);

  const handleDelete = async () => {
    if (!deleting) return;
    const { error } = await supabase.from("renders").delete().eq("id", deleting.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Image deleted" });
    setDeleting(null);
    fetchRenders();
  };

  const handleAdd = async () => {
    if (!newFile || !newTitle.trim()) {
      toast({ title: "Please fill in title and select an image", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = newFile.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("renders").upload(path, newFile);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("renders").getPublicUrl(path);

      const { error: insertError } = await supabase.from("renders").insert({
        title: newTitle.trim(),
        title_ka: newTitleKa.trim() || null,
        title_en: newTitleEn.trim() || null,
        title_ru: newTitleRu.trim() || null,
        image_url: publicUrl,
        category: newCategory,
        sort_order: newSortOrder,
      } as any);
      if (insertError) throw insertError;

      toast({ title: "Image added" });
      setAddOpen(false);
      setNewTitle("");
      setNewTitleKa(""); setNewTitleEn(""); setNewTitleRu("");
      setNewCategory("exterior");
      setNewSortOrder(0);
      setNewFile(null);
      fetchRenders();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const filtered = renders.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif">Gallery Images</h1>
        <Button onClick={() => setAddOpen(true)} className="gap-2 font-sans">
          <Plus className="w-4 h-4" /> Add Image
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search gallery images..." className="pl-9 font-sans" />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground font-sans text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" /> Loading...
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground font-sans">No gallery images found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((render) => (
            <div key={render.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <img
                src={render.image_url}
                alt={render.title}
                loading="lazy"
                onError={(e) => {
                  // Don't show the default broken-image icon — replace
                  // with a muted placeholder block so the admin can still
                  // see the row and delete or recategorize it.
                  const img = e.currentTarget;
                  img.style.display = "none";
                  if (img.parentElement) {
                    img.parentElement.style.background = "hsl(var(--muted))";
                    img.parentElement.style.height = "10rem";
                  }
                }}
                className="w-full h-40 object-cover"
              />
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-sm truncate max-w-[12rem]">{render.title || "(no title)"}</h3>
                  <p className="text-xs text-muted-foreground font-sans">{render.category}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => { setEditing(render); setEditCategory(render.category || "polograph"); }}
                    title="Change category"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleting(render)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Image Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Add Gallery Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="font-sans">Image</Label>
              <div className="mt-1.5">
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-sans">
                    {newFile ? newFile.name : "Click to select image"}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setNewFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
            <div>
              <Label className="font-sans">Title (default / fallback)</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Image title" className="mt-1.5 font-sans" />
            </div>
            <Tabs defaultValue="ka">
              <TabsList>
                <TabsTrigger value="ka" className="font-sans">KA</TabsTrigger>
                <TabsTrigger value="en" className="font-sans">EN</TabsTrigger>
                <TabsTrigger value="ru" className="font-sans">RU</TabsTrigger>
              </TabsList>
              <TabsContent value="ka">
                <Input value={newTitleKa} onChange={(e) => setNewTitleKa(e.target.value)} placeholder="სათაური (KA)" className="mt-1.5 font-sans" />
              </TabsContent>
              <TabsContent value="en">
                <Input value={newTitleEn} onChange={(e) => setNewTitleEn(e.target.value)} placeholder="Title (EN)" className="mt-1.5 font-sans" />
              </TabsContent>
              <TabsContent value="ru">
                <Input value={newTitleRu} onChange={(e) => setNewTitleRu(e.target.value)} placeholder="Заголовок (RU)" className="mt-1.5 font-sans" />
              </TabsContent>
            </Tabs>
            <div>
              <Label className="font-sans">Category</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="mt-1.5 font-sans">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-sans">Sort Order</Label>
              <Input type="number" value={newSortOrder} onChange={(e) => setNewSortOrder(Number(e.target.value))} className="mt-1.5 font-sans" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} className="font-sans">Cancel</Button>
            <Button onClick={handleAdd} disabled={uploading} className="font-sans">
              {uploading ? "Uploading..." : "Add Image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit-category dialog. Lets the client recategorize an existing
          render without re-uploading the file. The category dropdown
          reuses the same option list as the Add dialog so legacy values
          are still selectable. */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">Change category</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground font-sans truncate">
                {editing.title || "(no title)"}
              </div>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger className="font-sans">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} className="font-sans">Cancel</Button>
            <Button onClick={saveCategory} className="font-sans">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleting?.title}"?</AlertDialogTitle>
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

export default RendersManagement;
