import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
  images: { url: string; title: string }[];
  currentIndex: number;
  onClose: () => void;
}

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

  // Portal to <body> so the fixed overlay isn't trapped inside an ancestor
  // with `transform` applied (e.g. AnimatedSection's translate-y animation),
  // which on mobile pushed the lightbox far up the page and required scrolling
  // to find it.
  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-foreground/90 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="dialog"
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-background/80 hover:text-background z-10">
        <X className="w-6 h-6" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 text-background/80 hover:text-background z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 text-background/80 hover:text-background z-10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      <div className="max-w-5xl max-h-[90vh] px-12" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[index].url}
          alt={images[index].title}
          className="max-w-full max-h-[85vh] object-contain rounded-lg"
        />
        <p className="text-center text-background/80 text-sm font-sans mt-3">{images[index].title}</p>
      </div>
    </div>,
    document.body
  );
};
