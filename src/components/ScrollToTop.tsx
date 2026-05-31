import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { clearChunkReloadFlag } from "@/lib/lazyWithRetry";

/**
 * Resets scroll to the top of the page on every route change.
 *
 * React Router preserves the current scroll position when you navigate to
 * a new route, which made internal links open new pages "from the middle"
 * if the visitor had scrolled before clicking. This restores the
 * conventional browser behaviour of new-page = top-of-page.
 *
 * Drives both native scroll (mobile, reduced-motion) and Lenis (desktop
 * smooth-scroll) via the global handle SmoothScroll publishes on
 * `window.__lenis`. The Lenis reset uses `immediate: true` so the user
 * doesn't see an animated scroll on every navigation — that would feel
 * sluggish, and Lenis's animation can also visibly fight with React's
 * paint of the new route.
 *
 * Exceptions: leaves the scroll alone when the URL has a `#hash` (the
 * browser owns anchor navigation), and when the new path is the same as
 * the previous one (e.g. closing a query-param popup).
 */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // A successful route render means we navigated without hitting a
    // stale chunk — clear the one-shot reload guard so the next genuine
    // chunk miss is allowed to trigger a reload again.
    clearChunkReloadFlag();

    if (hash) return;

    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      // Fallback for mobile / reduced-motion (Lenis isn't initialized there).
      // `instant` behaviour keeps the navigation snappy.
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [pathname, hash]);

  return null;
};
