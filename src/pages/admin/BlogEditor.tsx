import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";

type BlogCategory = { id: string; name: string; slug: string };

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [form, setForm] = useState({
    title: "", title_ka: "", title_ru: "",
    slug: "", excerpt: "", excerpt_ka: "", excerpt_ru: "",
    content: "", content_ka: "", content_ru: "",
    category: "general", author: "Admin",
    featured_image_url: "", is_published: false, read_time_minutes: 5,
    meta_title: "", meta_title_ka: "", meta_title_ru: "",
    meta_description: "", meta_description_ka: "", meta_description_ru: "",
    meta_keywords: "", meta_keywords_ka: "", meta_keywords_ru: "",
  });

  useEffect(() => {
    supabase.from("blog_categories").select("*").order("name").then(({ data }) => {
      setCategories((data as BlogCategory[]) || []);
    });
  }, []);

  useEffect(() => {
    if (!isNew && id) {
      supabase.from("blog_posts").select("*").eq("id", id).single().then(({ data }) => {
        if (data) {
          setForm({
            title: data.title, title_ka: data.title_ka || "", title_ru: data.title_ru || "",
            slug: data.slug, excerpt: data.excerpt, excerpt_ka: data.excerpt_ka || "", excerpt_ru: data.excerpt_ru || "",
            content: data.content, content_ka: data.content_ka || "", content_ru: data.content_ru || "",
            category: data.category, author: data.author,
            featured_image_url: data.featured_image_url || "",
            is_published: data.is_published, read_time_minutes: data.read_time_minutes,
            meta_title: data.meta_title || "", meta_title_ka: data.meta_title_ka || "", meta_title_ru: data.meta_title_ru || "",
            meta_description: data.meta_description || "", meta_description_ka: data.meta_description_ka || "", meta_description_ru: data.meta_description_ru || "",
            meta_keywords: (data as any).meta_keywords || "", meta_keywords_ka: (data as any).meta_keywords_ka || "", meta_keywords_ru: (data as any).meta_keywords_ru || "",
          });
        }
        setLoading(false);
      });
    }
  }, [id, isNew]);

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleFeaturedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop();
    const path = `featured-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("blog-images").upload(path, file);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return; }
    const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(path);
    setForm((f) => ({ ...f, featured_image_url: urlData.publicUrl }));
  };

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.excerpt) {
      toast({ title: "Missing fields", description: "Title, slug, and excerpt are required.", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload: Record<string, any> = {
      title: form.title, title_ka: form.title_ka || null, title_ru: form.title_ru || null,
      slug: form.slug, excerpt: form.excerpt, excerpt_ka: form.excerpt_ka || null, excerpt_ru: form.excerpt_ru || null,
      content: form.content, content_ka: form.content_ka || null, content_ru: form.content_ru || null,
      category: form.category, author: form.author,
      featured_image_url: form.featured_image_url || null,
      is_published: form.is_published, read_time_minutes: form.read_time_minutes,
      meta_title: form.meta_title || null, meta_title_ka: form.meta_title_ka || null, meta_title_ru: form.meta_title_ru || null,
      meta_description: form.meta_description || null, meta_description_ka: form.meta_description_ka || null, meta_description_ru: form.meta_description_ru || null,
      meta_keywords: form.meta_keywords || null, meta_keywords_ka: form.meta_keywords_ka || null, meta_keywords_ru: form.meta_keywords_ru || null,
    };

    const { error } = isNew
      ? await supabase.from("blog_posts").insert(payload as any)
      : await supabase.from("blog_posts").update(payload as any).eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isNew ? "Post created" : "Post updated" });
      navigate("/admin/blog");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-muted-foreground font-sans text-sm">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" /> Loading...
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/blog")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-serif">{isNew ? "New Post" : "Edit Post"}</h1>
      </div>

      <Tabs defaultValue="content" className="space-y-5">
        <TabsList className="font-sans">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="translations">Translations</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-5">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block font-sans">Title</label>
            <Input
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm((f) => ({ ...f, title, slug: isNew ? generateSlug(title) : f.slug }));
              }}
              className="font-sans"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block font-sans">Slug</label>
            <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="font-sans" />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block font-sans">Excerpt</label>
            <Input value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} className="font-sans" />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block font-sans">Content</label>
            <RichTextEditor content={form.content} onChange={(html) => setForm((f) => ({ ...f, content: html }))} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block font-sans">Category</label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger className="font-sans"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                  ))}
                  {categories.length === 0 && <SelectItem value="general">General</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block font-sans">Read Time (min)</label>
              <Input type="number" value={form.read_time_minutes} onChange={(e) => setForm((f) => ({ ...f, read_time_minutes: parseInt(e.target.value) || 5 }))} className="font-sans" />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block font-sans">Featured Image</label>
            <div className="flex gap-2">
              <Input value={form.featured_image_url} onChange={(e) => setForm((f) => ({ ...f, featured_image_url: e.target.value }))} placeholder="URL or upload →" className="font-sans flex-1" />
              <Button variant="outline" className="font-sans relative overflow-hidden">
                Upload
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFeaturedUpload} />
              </Button>
            </div>
            {form.featured_image_url && <img src={form.featured_image_url} alt="Featured" className="mt-2 rounded-md max-h-32 object-cover" />}
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={form.is_published} onCheckedChange={(val) => setForm((f) => ({ ...f, is_published: val }))} />
            <span className="text-sm font-sans">Published</span>
          </div>
        </TabsContent>

        <TabsContent value="translations" className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-serif text-lg">Georgian (KA)</h3>
            <div><label className="text-sm text-muted-foreground mb-1.5 block font-sans">Title (KA)</label><Input value={form.title_ka} onChange={(e) => setForm((f) => ({ ...f, title_ka: e.target.value }))} className="font-sans" /></div>
            <div><label className="text-sm text-muted-foreground mb-1.5 block font-sans">Excerpt (KA)</label><Input value={form.excerpt_ka} onChange={(e) => setForm((f) => ({ ...f, excerpt_ka: e.target.value }))} className="font-sans" /></div>
            <div><label className="text-sm text-muted-foreground mb-1.5 block font-sans">Content (KA)</label><RichTextEditor content={form.content_ka} onChange={(html) => setForm((f) => ({ ...f, content_ka: html }))} /></div>
          </div>
          <div className="border-t border-border pt-6 space-y-4">
            <h3 className="font-serif text-lg">Russian (RU)</h3>
            <div><label className="text-sm text-muted-foreground mb-1.5 block font-sans">Title (RU)</label><Input value={form.title_ru} onChange={(e) => setForm((f) => ({ ...f, title_ru: e.target.value }))} className="font-sans" /></div>
            <div><label className="text-sm text-muted-foreground mb-1.5 block font-sans">Excerpt (RU)</label><Input value={form.excerpt_ru} onChange={(e) => setForm((f) => ({ ...f, excerpt_ru: e.target.value }))} className="font-sans" /></div>
            <div><label className="text-sm text-muted-foreground mb-1.5 block font-sans">Content (RU)</label><RichTextEditor content={form.content_ru} onChange={(html) => setForm((f) => ({ ...f, content_ru: html }))} /></div>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-5">
          <div><label className="text-sm text-muted-foreground mb-1.5 block font-sans">Meta Title (EN)</label><Input value={form.meta_title} onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))} className="font-sans" /></div>
          <div><label className="text-sm text-muted-foreground mb-1.5 block font-sans">Meta Description (EN)</label><Input value={form.meta_description} onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))} className="font-sans" /></div>
          <div><label className="text-sm text-muted-foreground mb-1.5 block font-sans">Meta Keywords (EN)</label><Input value={form.meta_keywords} onChange={(e) => setForm((f) => ({ ...f, meta_keywords: e.target.value }))} placeholder="villa, tbilisi, real estate" className="font-sans" /></div>
          <div className="border-t border-border pt-4 space-y-4">
            <h3 className="font-serif text-lg">Georgian (KA)</h3>
            <Input value={form.meta_title_ka} onChange={(e) => setForm((f) => ({ ...f, meta_title_ka: e.target.value }))} placeholder="Meta Title (KA)" className="font-sans" />
            <Input value={form.meta_description_ka} onChange={(e) => setForm((f) => ({ ...f, meta_description_ka: e.target.value }))} placeholder="Meta Description (KA)" className="font-sans" />
            <Input value={form.meta_keywords_ka} onChange={(e) => setForm((f) => ({ ...f, meta_keywords_ka: e.target.value }))} placeholder="Meta Keywords (KA)" className="font-sans" />
          </div>
          <div className="border-t border-border pt-4 space-y-4">
            <h3 className="font-serif text-lg">Russian (RU)</h3>
            <Input value={form.meta_title_ru} onChange={(e) => setForm((f) => ({ ...f, meta_title_ru: e.target.value }))} placeholder="Meta Title (RU)" className="font-sans" />
            <Input value={form.meta_description_ru} onChange={(e) => setForm((f) => ({ ...f, meta_description_ru: e.target.value }))} placeholder="Meta Description (RU)" className="font-sans" />
            <Input value={form.meta_keywords_ru} onChange={(e) => setForm((f) => ({ ...f, meta_keywords_ru: e.target.value }))} placeholder="Meta Keywords (RU)" className="font-sans" />
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button onClick={handleSave} disabled={saving} className="gap-2 font-sans">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default BlogEditor;
