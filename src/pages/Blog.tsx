import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Calendar } from "lucide-react";
import { useLanguage, getLocalizedField } from "@/contexts/LanguageContext";

type BlogPost = Record<string, any>;
type BlogCategory = { id: string; name: string; slug: string };

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    Promise.all([
      supabase.from("blog_posts").select("*").eq("is_published", true).order("created_at", { ascending: false }),
      supabase.from("blog_categories").select("*").order("name"),
    ]).then(([postsRes, catsRes]) => {
      setPosts(postsRes.data || []);
      setCategories(catsRes.data || []);
      setLoading(false);
    });
  }, []);

  const filtered = activeCategory === "all"
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  return (
    <Layout>
      <SEO title={t("blog.title")} description={t("blog.subtitle")} />
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-24">
        <div className="container mx-auto px-6">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif mb-4">{t("blog.title")}</h1>
          <p className="text-muted-foreground font-sans mb-8 max-w-lg">{t("blog.subtitle")}</p>

          {/* Category filters */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-4 py-2 rounded-full text-sm font-sans font-medium transition-colors ${
                  activeCategory === "all" ? "bg-gradient-to-r from-[#2d8f43] to-[#3aa557] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t("blog.allCategories")}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-sans font-medium transition-colors ${
                    activeCategory === cat.slug ? "bg-gradient-to-r from-[#2d8f43] to-[#3aa557] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground font-sans text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" /> {t("blog.loading")}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground font-sans">{t("blog.noPosts")}</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {post.featured_image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.featured_image_url}
                        alt={getLocalizedField(post, "title", language)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-5 text-card-foreground">
                    <span className="text-xs font-sans font-medium text-primary uppercase tracking-wider">
                      {post.category}
                    </span>
                    <h2 className="font-serif text-lg mt-1.5 mb-2 text-card-foreground group-hover:text-primary transition-colors">
                      {getLocalizedField(post, "title", language)}
                    </h2>
                    <p className="text-sm text-muted-foreground font-sans line-clamp-2 mb-3">
                      {getLocalizedField(post, "excerpt", language)}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-sans">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.read_time_minutes} {t("blog.min")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
