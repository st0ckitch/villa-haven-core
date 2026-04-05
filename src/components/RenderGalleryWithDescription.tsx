import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Lightbox } from "@/components/Lightbox";

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

  const { data: renders = [] } = useQuery({
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

  if (renders.length === 0) {
    // Fallback: no images, just show description
    return (
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-2xl md:text-3xl lg:text-4xl mb-6">{title}</h1>
        <p className="font-sans text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
          {description}
        </p>
      </div>
    );
  }

  const main = renders[activeIndex];
  const thumbnails = renders.filter((_, i) => i !== activeIndex).slice(0, 6);

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
          currentIndex={activeIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
};
