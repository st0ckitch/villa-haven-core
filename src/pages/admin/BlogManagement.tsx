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
    if (!newCatName.trim()) return;
    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { error } = await supabase.from("blog_categories").insert({ name: newCatName.trim(), slug } as any);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Category added" });
    setNewCatName("");
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
          <div className="flex gap-2 mt-2">
            <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="New category name" className="font-sans" onKeyDown={(e) => e.key === "Enter" && addCategory()} />
            <Button onClick={addCategory} size="sm" className="font-sans">Add</Button>
          </div>
          <div className="space-y-2 mt-4">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <span className="text-sm font-sans">{cat.name} <span className="text-xs text-muted-foreground">({cat.slug})</span></span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeletingCat(cat)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
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
