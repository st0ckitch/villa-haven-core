import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { AnimatedSection } from "@/components/AnimatedSection";
import { TiltCard } from "@/components/TiltCard";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Calendar } from "lucide-react";
import { useLanguage, getLocalizedField } from "@/contexts/LanguageContext";

type BlogPost = Record<string, any>;
type BlogCategory = { id: string; name: string; slug: string; name_ka?: string | null; name_en?: string | null; name_ru?: string | null };

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

  // Match posts whose `categories[]` contains the active slug; fall back to the
  // legacy single `category` for rows not yet migrated.
  const filtered = activeCategory === "all"
    ? posts
    : posts.filter((p) => {
        const cats: string[] = (p as any).categories || [];
        return cats.includes(activeCategory) || p.category === activeCategory;
      });

  return (
    <Layout>
      <SEO title={t("blog.title")} description={t("blog.subtitle")} />

      {/* Decorative gradient orbs */}
      <div className="absolute inset-x-0 top-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(130_55%_40%/0.05)_0%,transparent_70%)] animate-orb-float" />
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,hsl(130_55%_50%/0.04)_0%,transparent_70%)] animate-orb-float-reverse" />
      </div>

      <section className="pt-28 lg:pt-32 pb-16 lg:pb-24">
        <div className="container mx-auto px-6">
          <AnimatedSection>
            <h1 className="font-sans text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-4 leading-[1.3] md:leading-[1.3] lg:leading-[1.3]">
              {t("blog.title")}
            </h1>
            <p className="text-muted-foreground font-sans mb-8 max-w-lg">{t("blog.intro")}</p>
          </AnimatedSection>

          {/* Glass category filters */}
          {categories.length > 0 && (
            <AnimatedSection delay={100}>
              <div className="flex flex-wrap gap-2 mb-12">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`px-5 py-2.5 rounded-full text-sm font-sans font-medium transition-all duration-300 ${
                    activeCategory === "all"
                      ? "bg-gradient-to-r from-[#2d8f43] to-[#3aa557] text-white shadow-[0_4px_16px_rgba(45,143,67,0.3)]"
                      : "bg-white/60 backdrop-blur-md border border-[hsl(130_55%_40%/0.12)] text-foreground/70 hover:bg-white hover:border-[hsl(130_55%_40%/0.3)] hover:text-foreground"
                  }`}
                >
                  {t("blog.allCategories")}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.slug)}
                    className={`px-5 py-2.5 rounded-full text-sm font-sans font-medium transition-all duration-300 ${
                      activeCategory === cat.slug
                        ? "bg-gradient-to-r from-[#2d8f43] to-[#3aa557] text-white shadow-[0_4px_16px_rgba(45,143,67,0.3)]"
                        : "bg-white/60 backdrop-blur-md border border-[hsl(130_55%_40%/0.12)] text-foreground/70 hover:bg-white hover:border-[hsl(130_55%_40%/0.3)] hover:text-foreground"
                    }`}
                  >
                    {getLocalizedField(cat as any, "name", language)}
                  </button>
                ))}
              </div>
            </AnimatedSection>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground font-sans text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" /> {t("blog.loading")}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground font-sans">{t("blog.noPosts")}</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post, i) => (
                <AnimatedSection key={post.id} delay={i * 80}>
                  <TiltCard maxTilt={5} scale={1.02} glare={false}>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="group block bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl overflow-hidden
                        shadow-[0_2px_16px_rgba(0,0,0,0.04)]
                        hover:bg-white hover:shadow-[0_8px_32px_rgba(45,143,67,0.12)] hover:border-[hsl(130_55%_40%/0.2)]
                        transition-all duration-300"
                    >
                      {post.featured_image_url && (
                        <div className="aspect-video overflow-hidden relative">
                          <img
                            src={post.featured_image_url}
                            alt={getLocalizedField(post, "title", language)}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          {/* Category chips removed from the image per client
                              2026-06-01 ("remove filter indicator from these
                              blogposts — on the image itself"). The active
                              filter is still visible in the pill row above
                              the grid, so the chip overlay was redundant
                              and visually cluttered the card image. */}
                        </div>
                      )}
                      <div className="p-5 text-card-foreground">
                        <h2 className="font-sans text-lg font-medium mt-1 mb-2 text-foreground group-hover:text-[hsl(130_55%_30%)] transition-colors leading-tight">
                          {getLocalizedField(post, "title", language)}
                        </h2>
                        <p className="text-sm text-muted-foreground font-sans line-clamp-2 mb-3 leading-relaxed">
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
                  </TiltCard>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
