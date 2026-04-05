import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Lightbox } from "@/components/Lightbox";
import { Loader2 } from "lucide-react";

const ProjectSection = () => {
  const { section } = useParams<{ section: string }>();
  const { t } = useLanguage();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const sectionTitle = section === "a-section" ? t("projects.sectionA") : (section || "");

  const { data: images, isLoading } = useQuery({
    queryKey: ["project-gallery", section],
    queryFn: async () => {
      // Get villa IDs for this section
      const { data: villas, error: vErr } = await supabase
        .from("villas")
        .select("id, name")
        .eq("section", section!);
      if (vErr) throw vErr;
      if (!villas?.length) return [];

      const villaIds = villas.map((v) => v.id);
      const villaMap = new Map(villas.map((v) => [v.id, v.name]));

      const { data: imgs, error: iErr } = await supabase
        .from("villa_images")
        .select("*")
        .in("villa_id", villaIds)
        .order("sort_order", { ascending: true });
      if (iErr) throw iErr;

      return (imgs || []).map((img) => ({
        url: img.image_url,
        title: villaMap.get(img.villa_id) || "",
        id: img.id,
      }));
    },
    enabled: !!section,
  });

  const galleryImages = images || [];

  return (
    <Layout>
      <SEO title={`${sectionTitle} — Igavi`} description={t("gallery.subtitle")} />
      <div className="container mx-auto px-6 pt-24 lg:pt-32 pb-10 lg:pb-16">
        <AnimatedSection>
          <h1 className="text-2xl md:text-3xl lg:text-4xl mb-2">{sectionTitle}</h1>
          <p className="font-sans text-muted-foreground mb-8">{t("gallery.subtitle")}</p>
        </AnimatedSection>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : galleryImages.length === 0 ? (
          <p className="text-muted-foreground font-sans text-center py-12">{t("gallery.noRenders")}</p>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {galleryImages.map((img, i) => (
              <AnimatedSection key={img.id} delay={i * 60}>
                <div
                  className="break-inside-avoid cursor-pointer group overflow-hidden rounded-xl"
                  onClick={() => setLightboxIndex(i)}
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={galleryImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </Layout>
  );
};

export default ProjectSection;
