import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Lightbox } from "@/components/Lightbox";

interface RenderCarouselProps {
  project: string;
}

export const RenderCarousel = ({ project }: RenderCarouselProps) => {
  const [current, setCurrent] = useState(0);
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

  if (renders.length === 0) return null;

  const prev = () => setCurrent((c) => (c === 0 ? renders.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === renders.length - 1 ? 0 : c + 1));

  return (
    <>
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-2xl group">
        <img
          src={renders[current].image_url}
          alt={renders[current].title || project}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-500"
          onClick={() => setLightboxOpen(true)}
        />
        {renders.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {renders.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-background/60"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox
          images={renders.map((r) => ({ url: r.image_url, title: r.title || "" }))}
          currentIndex={current}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
};
