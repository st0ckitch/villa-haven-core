import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { BlogPostingLd, BreadcrumbLd } from "@/components/JsonLd";
import { supabase } from "@/integrations/supabase/client";
import DOMPurify from "dompurify";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { useLanguage, getLocalizedField } from "@/contexts/LanguageContext";

type BlogPost = Record<string, any>;

const SITE_URL = "https://villa-haven-core.lovable.app";

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
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
          supabase
            .from("blog_posts")
            .select("*")
            .eq("is_published", true)
            .eq("category", data.category)
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
      <article className="pt-24 lg:pt-32 pb-16 lg:pb-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <Link to="/blog" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-sans mb-6">
            <ArrowLeft className="w-4 h-4" /> {t("blog.backToBlog")}
          </Link>

          <span className="text-xs font-sans font-medium text-primary uppercase tracking-wider">
            {post.category}
          </span>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif mt-2 mb-4">{localTitle}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-sans mb-8">
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{post.author}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(post.created_at).toLocaleDateString()}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.read_time_minutes} {t("blog.minRead")}</span>
          </div>

          {post.featured_image_url && (
            <div className="aspect-video rounded-xl overflow-hidden mb-8">
              <img src={post.featured_image_url} alt={localTitle} className="w-full h-full object-cover" />
            </div>
          )}

          <div
            className="prose prose-lg max-w-none font-sans prose-headings:font-serif prose-a:text-primary prose-headings:text-foreground prose-p:text-foreground/80 prose-li:text-foreground/80 prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(localContent) }}
          />

          <div className="border-t border-border mt-12 pt-6">
            <p className="text-sm text-muted-foreground font-sans mb-3">{t("blog.share")}</p>
            <div className="flex gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(localTitle)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-muted rounded-full text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
              >
                Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-muted rounded-full text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-serif mb-6">{t("blog.relatedPosts")}</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {related.map((r) => (
                  <Link key={r.id} to={`/blog/${r.slug}`} className="group bg-card border border-border rounded-xl overflow-hidden">
                    {r.featured_image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img src={r.featured_image_url} alt={getLocalizedField(r, "title", language)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      </div>
                    )}
                    <div className="p-3 text-card-foreground">
                      <h3 className="font-serif text-sm text-card-foreground group-hover:text-primary transition-colors">{getLocalizedField(r, "title", language)}</h3>
                      <p className="text-xs text-muted-foreground font-sans mt-1">{r.read_time_minutes} {t("blog.minRead")}</p>
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
