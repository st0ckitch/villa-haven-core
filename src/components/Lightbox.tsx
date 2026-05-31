import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
  images: { url: string; title: string }[];
  currentIndex: number;
  onClose: () => void;
}

/**
 * Returns true for titles like "Render 07", "რენდერი 07", "Рендер 07" — the
 * auto-numbered captions seeded into public.renders. Client feedback
 * (2026-05-31) was that these add noise without informing the viewer. Real
 * human-written captions (e.g. "Polograph aerial", "120 ცხენზე გათვლილი თავლა")
 * still render normally.
 */
const isGenericRenderTitle = (title: string): boolean => {
  const t = title.trim();
  if (!t) return true;
  return /^(?:render|რენდერი|рендер)\s*\d+$/i.test(t);
};

export const Lightbox = ({ images, currentIndex, onClose }: LightboxProps) => {
  const [index, setIndex] = useState(currentIndex);

  const prev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  // Lock body scroll so a tap on a dimmed gallery thumbnail (rendered inside an
  // ancestor with a CSS transform) doesn't leave the page scrolled while the
  // overlay is up.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  const currentTitle = images[index].title;
  const showTitle = !isGenericRenderTitle(currentTitle);

  // Portal to <body> so the fixed overlay isn't trapped inside an ancestor
  // with `transform` applied (e.g. AnimatedSection's translate-y animation),
  // which on mobile pushed the lightbox far up the page and required scrolling
  // to find it.
  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-foreground/95 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="dialog"
    >
      {/* Close button — on mobile it sits in a small dark chip so it's
          legible on top of a bright photo edge. */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 grid place-items-center w-10 h-10 rounded-full bg-foreground/40 sm:bg-transparent text-background/90 hover:text-background"
      >
        <X className="w-6 h-6" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous"
            className="absolute left-2 sm:left-4 z-20 grid place-items-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-foreground/40 sm:bg-transparent text-background/90 hover:text-background"
          >
            <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next"
            className="absolute right-2 sm:right-4 z-20 grid place-items-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-foreground/40 sm:bg-transparent text-background/90 hover:text-background"
          >
            <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>
        </>
      )}

      {/* Image container — fills the viewport on mobile (per client feedback
          2026-05-31: "in the view it shrinks, please maximize it"). On ≥sm
          the lightbox keeps its desktop sizing with margins. */}
      <div
        className="w-full h-full sm:w-auto sm:h-auto sm:max-w-5xl sm:max-h-[90vh] px-0 sm:px-12 flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[index].url}
          alt={currentTitle || "render"}
          className="w-full h-full sm:w-auto sm:h-auto sm:max-w-full sm:max-h-[85vh] object-contain rounded-none sm:rounded-lg"
        />
        {showTitle && (
          <p className="text-center text-background/80 text-sm font-sans mt-3 px-4">
            {currentTitle}
          </p>
        )}
      </div>
    </div>,
    document.body
  );
};
