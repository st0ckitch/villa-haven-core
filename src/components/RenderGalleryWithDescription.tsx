import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Lightbox } from "@/components/Lightbox";
import { normalizeRenderUrl } from "@/lib/renderUrl";

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
  // URLs whose <img> fired onError (dead/404 render). We drop these from the
  // gallery entirely so the page never shows a broken-image icon or an empty
  // tile — the bad render just disappears. Client 2026-06-04.
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());
  const markFailed = (url: string) =>
    setFailedUrls((prev) => (prev.has(url) ? prev : new Set(prev).add(url)));

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
  // Correct any wrong-extension render URL (.jpeg/.png → .jpg) so seeded rows
  // with a bad extension still resolve to the real bundled file.
  const allRenders: { id: string; image_url: string; title: string | null }[] = (
    dbRenders.length > 0 ? dbRenders : (PLACEHOLDER_RENDERS[project] || [])
  ).map((r) => ({ ...r, image_url: normalizeRenderUrl(r.image_url) }));
  // Exclude any render whose image still failed to load (see markFailed/onError).
  const renders = allRenders.filter((r) => !failedUrls.has(r.image_url));

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

  // Split the description into paragraphs so we can render the first as a
  // wider "lead" and flow the rest into two columns. A single uninterrupted
  // column reads as a wall of text on long copy (Polograph has 11 paragraphs).
  const paragraphs = description
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const [leadParagraph, ...bodyParagraphs] = paragraphs;

  return (
    <>
      <div className="container mx-auto px-6 py-12">
        {/* Gallery: main image + thumbnails side by side on lg+ */}
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
              onError={() => markFailed(main.image_url)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Right: Thumbnails */}
          {renders.length > 1 && (
            <div className="grid grid-cols-3 gap-2.5">
              {thumbnails.map((img, idx) => {
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
                      onError={() => markFailed(img.image_url)}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Text content: magazine-style layout — title + lead paragraph
            constrained for readability, remaining body flows into two
            columns on md+ so long descriptions scan instead of feeling
            like a wall of text. Mobile collapses to single column. */}
        <div className="mt-10 lg:mt-12 max-w-5xl flex flex-col gap-8">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-5 leading-[1.3] md:leading-[1.3] lg:leading-[1.3] max-w-3xl">
              {title}
            </h1>
            {leadParagraph && (
              <p className="font-sans text-foreground/85 leading-relaxed text-base md:text-lg lg:text-xl max-w-3xl whitespace-pre-line">
                {leadParagraph}
              </p>
            )}
          </div>

          {bodyParagraphs.length > 0 && (
            <div className="md:columns-2 md:gap-10 lg:gap-12">
              {bodyParagraphs.map((p, i) => (
                <p
                  key={i}
                  className="font-sans text-muted-foreground leading-relaxed text-sm md:text-base mb-4 md:mb-5 break-inside-avoid whitespace-pre-line"
                >
                  {p}
                </p>
              ))}
            </div>
          )}

          {(visionTitle || visionText) && (
            <div className="bg-white/60 backdrop-blur-md border border-[hsl(130_55%_40%/0.15)] rounded-2xl p-6 md:p-8 max-w-3xl">
              {visionTitle && <h2 className="text-lg md:text-xl font-medium mb-3">{visionTitle}</h2>}
              {visionText && (
                <p className="font-sans text-muted-foreground leading-relaxed text-sm md:text-base whitespace-pre-line">
                  {visionText}
                </p>
              )}
            </div>
          )}

          {extraContent}
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
