import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SmoothScrollProps {
  children: React.ReactNode;
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
    };
  }, [reduced]);

  return <>{children}</>;
};
