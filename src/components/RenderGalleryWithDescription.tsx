import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Lightbox } from "@/components/Lightbox";

/**
 * Local placeholder renders (in `public/renders/`) used when the
 * `project_renders` table has no rows for a project. DB rows always win —
 * uploading any render in admin auto-replaces these.
 */
const PLACEHOLDER_RENDERS: Record<string, { id: string; image_url: string; title: string | null }[]> = {
  polograph: [
    { id: "ph-pol-1", image_url: "/renders/polograph-aerial-1.jpg", title: "Polograph aerial" },
    { id: "ph-pol-2", image_url: "/renders/polograph-aerial-2.jpg", title: "Polograph neighborhood" },
    { id: "ph-pol-3", image_url: "/renders/polograph-villa.jpg", title: "Polograph villa exterior" },
  ],
  equestrian: [
    { id: "ph-eq-1", image_url: "/renders/ipodromi-1.jpg", title: "Hippodrome arena" },
    { id: "ph-eq-2", image_url: "/renders/ipodromi-2.jpg", title: "Hippodrome facility" },
    { id: "ph-eq-3", image_url: "/renders/ipodromi-3.jpg", title: "Hippodrome aerial" },
  ],
};

interface RenderGalleryWithDescriptionProps {
  project: string;
  title: string;
  description: string;
  visionTitle?: string;
  visionText?: string;
  extraContent?: React.ReactNode;
}

export const RenderGalleryWithDescription = ({
  project,
  title,
  description,
  visionTitle,
  visionText,
  extraContent,
}: RenderGalleryWithDescriptionProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { data: dbRenders = [] } = useQuery({
    queryKey: ["project-renders", project],
    queryFn: async () => {
      const { data } = await supabase
        .from("project_renders")
        .select("*")
        .eq("project", project)
        .order("sort_order");
      return data || [];
    },
  });

  // DB rows take precedence; otherwise fall back to bundled placeholder images.
  const renders: { id: string; image_url: string; title: string | null }[] =
    dbRenders.length > 0 ? dbRenders : (PLACEHOLDER_RENDERS[project] || []);

  if (renders.length === 0) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-2xl md:text-3xl lg:text-4xl mb-6">{title}</h1>
        <p className="font-sans text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
          {description}
        </p>
      </div>
    );
  }

  // Clamp index when renders array length changes (e.g. DB rows arrive after fallback mounts).
  const safeIndex = Math.min(activeIndex, renders.length - 1);
  const main = renders[safeIndex];
  const thumbnails = renders.filter((_, i) => i !== safeIndex).slice(0, 6);

  return (
    <>
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-8 items-start">
          {/* Left: Main image */}
          <div
            className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl cursor-pointer group"
            onClick={() => setLightboxOpen(true)}
          >
            <img
              src={main.image_url}
              alt={main.title || project}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Right: Thumbnails + description */}
          <div className="flex flex-col gap-6">
            {/* Thumbnail grid */}
            {renders.length > 1 && (
              <div className="grid grid-cols-3 gap-2.5">
                {thumbnails.map((img, idx) => {
                  // Find actual index in renders array
                  const actualIdx = renders.findIndex((r) => r.id === img.id);
                  return (
                    <button
                      key={img.id}
                      onClick={() => setActiveIndex(actualIdx)}
                      className="relative aspect-square overflow-hidden rounded-xl group ring-1 ring-border hover:ring-[hsl(130_55%_40%/0.4)] transition-all"
                    >
                      <img
                        src={img.image_url}
                        alt={img.title || `render-${idx}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Title + description */}
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-4">
                {title}
              </h1>
              <p className="font-sans text-muted-foreground leading-relaxed text-sm md:text-base whitespace-pre-line">
                {description}
              </p>
            </div>

            {/* Vision block */}
            {(visionTitle || visionText) && (
              <div className="bg-white/60 backdrop-blur-md border border-[hsl(130_55%_40%/0.15)] rounded-2xl p-6">
                {visionTitle && <h2 className="text-lg font-medium mb-2">{visionTitle}</h2>}
                {visionText && (
                  <p className="font-sans text-muted-foreground leading-relaxed text-sm whitespace-pre-line">
                    {visionText}
                  </p>
                )}
              </div>
            )}

            {/* Extra content slot */}
            {extraContent}
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox
          images={renders.map((r) => ({ url: r.image_url, title: r.title || "" }))}
          currentIndex={safeIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
};
