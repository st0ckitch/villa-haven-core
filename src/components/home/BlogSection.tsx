import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatedSection } from "@/components/AnimatedSection";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, getLocalizedField } from "@/contexts/LanguageContext";
import { Calendar, Clock } from "lucide-react";

type BlogPost = Record<string, any>;

export const BlogSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        setPosts(data || []);
        setLoading(false);
      });
  }, []);

  if (loading || posts.length === 0) return null;

  return (
    <section className="py-8 lg:py-12 bg-card text-card-foreground">
      <div className="container mx-auto px-6">
        <AnimatedSection>
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl">
              {t("blog.title")}
            </h2>
            <Link
              to="/blog"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-sans font-medium text-primary hover:underline"
            >
              {t("properties.viewAll")} →
            </Link>
          </div>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <AnimatedSection key={post.id} delay={i * 100}>
              <Link
                to={`/blog/${post.slug}`}
                className="group bg-secondary border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow block h-full"
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
                <div className="p-5">
                  <span className="text-sm font-sans font-medium text-primary">
                    {post.category}
                  </span>
                  <h3 className="font-serif text-lg mt-1.5 mb-2 text-card-foreground group-hover:text-primary transition-colors">
                    {getLocalizedField(post, "title", language)}
                  </h3>
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
            </AnimatedSection>
          ))}
        </div>

        <Link
          to="/blog"
          className="sm:hidden inline-flex items-center gap-1 text-sm font-sans font-medium text-primary hover:underline mt-6"
        >
          {t("properties.viewAll")} →
        </Link>
      </div>
    </section>
  );
};
