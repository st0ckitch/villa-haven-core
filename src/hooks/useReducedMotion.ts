import { useEffect, useState } from "react";

/**
 * Detects if the user has enabled the "Reduce Motion" accessibility setting.
 * Used to disable or simplify animations for accessibility.
 */
export const useReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
};
