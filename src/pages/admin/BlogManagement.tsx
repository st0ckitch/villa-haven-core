import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Tag, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type BlogPost = Tables<"blog_posts">;
type BlogCategory = { id: string; name: string; slug: string; created_at: string };

const BlogManagement = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<BlogPost | null>(null);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatNameKa, setNewCatNameKa] = useState("");
  const [newCatNameEn, setNewCatNameEn] = useState("");
  const [newCatNameRu, setNewCatNameRu] = useState("");
  const [deletingCat, setDeletingCat] = useState<BlogCategory | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchPosts = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("blog_categories").select("*").order("name");
    setCategories((data as BlogCategory[]) || []);
  };

  useEffect(() => { fetchPosts(); fetchCategories(); }, []);

  const togglePublish = async (post: BlogPost) => {
    const { error } = await supabase.from("blog_posts").update({ is_published: !post.is_published }).eq("id", post.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: post.is_published ? "Unpublished" : "Published" });
    fetchPosts();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", deleting.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Post deleted" });
    setDeleting(null);
    fetchPosts();
  };

  const addCategory = async () => {
    const displayName = (newCatName || newCatNameKa || newCatNameEn || newCatNameRu).trim();
    if (!displayName) return;
    // Slug stays ASCII-only so URLs behave. Use EN name if provided, otherwise
    // fall back to whatever the admin typed and ascii-slugify it.
    const slugSource = (newCatNameEn || newCatName || displayName).trim();
    const slug = slugSource.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `cat-${Date.now()}`;
    const { error } = await supabase.from("blog_categories").insert({
      name: displayName,
      name_ka: newCatNameKa.trim() || null,
      name_en: newCatNameEn.trim() || null,
      name_ru: newCatNameRu.trim() || null,
      slug,
    } as any);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Category added" });
    setNewCatName(""); setNewCatNameKa(""); setNewCatNameEn(""); setNewCatNameRu("");
    fetchCategories();
  };

  const updateCategoryLang = async (id: string, field: "name_ka" | "name_en" | "name_ru", value: string) => {
    await supabase.from("blog_categories").update({ [field]: value || null } as any).eq("id", id);
    fetchCategories();
  };

  const deleteCategory = async () => {
    if (!deletingCat) return;
    const { error } = await supabase.from("blog_categories").delete().eq("id", deletingCat.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Category deleted" });
    setDeletingCat(null);
    fetchCategories();
  };

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif">Blog Posts</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCatDialogOpen(true)} className="gap-2 font-sans">
            <Tag className="w-4 h-4" /> Categories
          </Button>
          <Button onClick={() => navigate("/admin/blog/new")} className="gap-2 font-sans">
            <Plus className="w-4 h-4" /> New Post
          </Button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts..." className="pl-9 font-sans" />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground font-sans text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" /> Loading...
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground font-sans">No posts found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <div key={post.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
              {post.featured_image_url && (
                <img src={post.featured_image_url} alt="" className="w-16 h-16 rounded-lg object-cover hidden sm:block" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{post.title}</h3>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  {post.category} · {new Date(post.created_at).toLocaleDateString()} · {post.read_time_minutes} min read
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePublish(post)} title={post.is_published ? "Unpublish" : "Publish"}>
                  {post.is_published ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/blog/${post.id}`)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleting(post)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Management Dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Manage Categories</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            <p className="text-xs text-muted-foreground font-sans">New category — fill any language; slug is derived from the EN field (or default).</p>
            <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Default name" className="font-sans" />
            <div className="grid grid-cols-3 gap-2">
              <Input value={newCatNameKa} onChange={(e) => setNewCatNameKa(e.target.value)} placeholder="KA" className="font-sans" />
              <Input value={newCatNameEn} onChange={(e) => setNewCatNameEn(e.target.value)} placeholder="EN" className="font-sans" />
              <Input value={newCatNameRu} onChange={(e) => setNewCatNameRu(e.target.value)} placeholder="RU" className="font-sans" />
            </div>
            <Button onClick={addCategory} size="sm" className="font-sans w-full">Add Category</Button>
          </div>
          <div className="space-y-3 mt-4 max-h-[50vh] overflow-y-auto" data-lenis-prevent>
            {categories.map((cat) => (
              <div key={cat.id} className="p-3 bg-muted rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-sans font-medium">{(cat as any).name_ka || cat.name} <span className="text-xs text-muted-foreground">({cat.slug})</span></span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeletingCat(cat)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(["ka", "en", "ru"] as const).map((lang) => (
                    <Input
                      key={lang}
                      defaultValue={(cat as any)[`name_${lang}`] || ""}
                      placeholder={lang.toUpperCase()}
                      className="font-sans text-xs h-8"
                      onBlur={(e) => {
                        const v = e.currentTarget.value;
                        if (v !== ((cat as any)[`name_${lang}`] || "")) updateCategoryLang(cat.id, `name_${lang}` as any, v);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete post confirmation */}
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

      {/* Delete category confirmation */}
      <AlertDialog open={!!deletingCat} onOpenChange={() => setDeletingCat(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category "{deletingCat?.name}"?</AlertDialogTitle>
            <AlertDialogDescription className="font-sans">Posts with this category won't be deleted, but the filter will be removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-sans">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteCategory} className="bg-destructive text-destructive-foreground font-sans">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlogManagement;
