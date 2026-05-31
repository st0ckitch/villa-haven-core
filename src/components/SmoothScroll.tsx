import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SmoothScrollProps {
  children: React.ReactNode;
}

// Make the active Lenis instance reachable from anywhere — primarily so
// ScrollToTop can drive Lenis directly on route change. Calling
// window.scrollTo(0,0) alone doesn't reliably reset Lenis's internal
// virtual scroll position.
declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export const SmoothScroll = ({ children }: SmoothScrollProps) => {
  const reduced = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;
    // Don't initialize smooth scroll on touch devices (mobile)
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;
    window.__lenis = lenis;

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, [reduced]);

  return <>{children}</>;
};
