import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { BlogPostingLd, BreadcrumbLd } from "@/components/JsonLd";
import { supabase } from "@/integrations/supabase/client";
import DOMPurify from "dompurify";
import { ArrowLeft, Calendar, Clock, Facebook } from "lucide-react";
import { useLanguage, getLocalizedField } from "@/contexts/LanguageContext";

type BlogPost = Record<string, any>;

const SITE_URL = "https://villa-haven-core.lovable.app";

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Record<string, any>[]>([]);
  useEffect(() => {
    supabase.from("blog_categories").select("*").then(({ data }) => setCategories(data || []));
  }, []);
  const { language, t } = useLanguage();

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single()
      .then(({ data }) => {
        setPost(data);
        setLoading(false);
        if (data) {
          // Related posts: any that share at least one category with this post.
          // Fall back to the legacy single `category` column if `categories[]` is empty.
          const slugs: string[] = (data as any).categories?.length
            ? (data as any).categories
            : data.category ? [data.category] : [];
          if (slugs.length === 0) { setRelated([]); return; }
          supabase
            .from("blog_posts")
            .select("*")
            .eq("is_published", true)
            .or(`categories.ov.{${slugs.join(",")}},category.in.(${slugs.map((s) => `"${s}"`).join(",")})`)
            .neq("id", data.id)
            .limit(3)
            .then(({ data: relatedData }) => setRelated(relatedData || []));
        }
      });
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="pt-28 pb-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="pt-28 pb-24 container mx-auto px-6 text-center">
          <h1 className="text-2xl font-serif mb-4">{t("blog.notFound")}</h1>
          <Link to="/blog" className="text-primary font-sans text-sm hover:underline">← {t("blog.backToBlog")}</Link>
        </div>
      </Layout>
    );
  }

  const localTitle = getLocalizedField(post, "title", language);
  const localExcerpt = getLocalizedField(post, "excerpt", language);
  const localContent = getLocalizedField(post, "content", language);
  const localMetaDesc = getLocalizedField(post, "meta_description", language) || localExcerpt;
  const localKeywords = getLocalizedField(post, "meta_keywords", language);

  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const hrefLangs = [
    { lang: "en", href: postUrl },
    { lang: "ka", href: postUrl },
    { lang: "ru", href: postUrl },
    { lang: "x-default", href: postUrl },
  ];

  return (
    <Layout>
      <SEO
        title={localTitle}
        description={localMetaDesc}
        image={post.featured_image_url || undefined}
        type="article"
        url={postUrl}
        keywords={localKeywords || undefined}
        hrefLangs={hrefLangs}
      />
      <BlogPostingLd
        title={localTitle}
        description={localExcerpt}
        author={post.author}
        datePublished={post.created_at}
        dateModified={post.updated_at}
        image={post.featured_image_url || undefined}
      />
      <BreadcrumbLd items={[
        { name: t("nav.home"), url: "/" },
        { name: t("blog.title"), url: "/blog" },
        { name: localTitle, url: `/blog/${post.slug}` },
      ]} />
      {/* Decorative orbs */}
      <div className="absolute inset-x-0 top-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(130_55%_40%/0.05)_0%,transparent_70%)] animate-orb-float" />
      </div>

      <article className="pt-28 lg:pt-32 pb-16 lg:pb-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[hsl(130_55%_30%)] font-sans mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t("blog.backToBlog")}
          </Link>

          {/* Category pills — multi-category support, per-language labels */}
          <div className="flex flex-wrap gap-2 mb-4">
            {((post.categories && post.categories.length) ? post.categories : (post.category ? [post.category] : [])).map((slug: string) => {
              const cat = categories.find((c) => c.slug === slug);
              return (
                <span key={slug} className="inline-flex items-center px-3 py-1.5 rounded-full bg-[hsl(130_55%_40%/0.08)] border border-[hsl(130_55%_40%/0.2)] text-xs font-sans font-medium text-[hsl(130_55%_30%)]">
                  {cat ? getLocalizedField(cat, "name", language) : slug}
                </span>
              );
            })}
          </div>
          <h1 className="font-sans text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground mt-2 mb-6 leading-[1.3] md:leading-[1.3] lg:leading-[1.3]">{localTitle}</h1>

          {/* Metadata glass chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-sans mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-[hsl(130_55%_40%/0.12)]">
              <Calendar className="w-3 h-3 text-[hsl(130_55%_35%)]" />{new Date(post.created_at).toLocaleDateString()}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-[hsl(130_55%_40%/0.12)]">
              <Clock className="w-3 h-3 text-[hsl(130_55%_35%)]" />{post.read_time_minutes} {t("blog.minRead")}
            </span>
          </div>

          {/* Hero image in glass frame */}
          {post.featured_image_url && (
            <div className="relative mb-10">
              <div className="absolute -inset-2 bg-gradient-to-r from-[hsl(130_55%_40%/0.15)] via-[hsl(130_55%_50%/0.2)] to-[hsl(130_55%_40%/0.15)] rounded-[24px] blur-xl -z-10 opacity-50" />
              <div className="p-1.5 rounded-[20px] bg-gradient-to-br from-[hsl(130_55%_40%/0.25)] via-white/50 to-[hsl(130_55%_40%/0.1)] backdrop-blur-md shadow-[0_12px_40px_rgba(45,143,67,0.12)]">
                <div className="aspect-video rounded-2xl overflow-hidden">
                  <img src={post.featured_image_url} alt={localTitle} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          )}

          {/* Glass content card with accent bar */}
          <div className="relative bg-white/60 backdrop-blur-md border border-[hsl(130_55%_40%/0.12)] rounded-3xl p-8 md:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <div className="flex gap-6">
              <div className="hidden md:block w-1 bg-gradient-to-b from-[hsl(130_55%_40%)] via-[hsl(130_55%_50%)] to-[hsl(130_55%_40%/0.2)] rounded-full shrink-0" />
              <div
                className="prose prose-lg max-w-none font-sans prose-headings:font-sans prose-headings:font-medium prose-a:text-[hsl(130_55%_30%)] prose-headings:text-foreground prose-p:text-foreground/80 prose-li:text-foreground/80 prose-strong:text-foreground"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(localContent) }}
              />
            </div>
          </div>

          {/* Share as glass chips */}
          <div className="mt-12">
            <p className="font-sans text-sm font-medium text-primary/70 mb-3">{t("blog.share")}</p>
            <div className="flex gap-2">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-[hsl(130_55%_40%/0.12)] text-sm font-sans text-foreground/70 hover:bg-white hover:border-[hsl(130_55%_40%/0.3)] hover:text-[hsl(130_55%_30%)] transition-all duration-300 hover:-translate-y-0.5"
              >
                <Facebook className="w-3.5 h-3.5" />
                Facebook
              </a>
            </div>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="font-sans text-2xl md:text-3xl font-light tracking-tight text-foreground mb-6">
                {t("blog.relatedPosts")}
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {related.map((r) => (
                  <Link key={r.id} to={`/blog/${r.slug}`} className="group block bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:bg-white hover:border-[hsl(130_55%_40%/0.2)] hover:shadow-[0_8px_24px_rgba(45,143,67,0.1)] hover:-translate-y-0.5 transition-all duration-300">
                    {r.featured_image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img src={r.featured_image_url} alt={getLocalizedField(r, "title", language)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-sans text-sm font-medium text-foreground group-hover:text-[hsl(130_55%_30%)] transition-colors leading-snug">{getLocalizedField(r, "title", language)}</h3>
                      <p className="text-xs text-muted-foreground font-sans mt-2">{r.read_time_minutes} {t("blog.minRead")}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </Layout>
  );
};

export default BlogPostPage;
