import { lazy, type ComponentType } from "react";

/**
 * Wraps React.lazy with chunk-load retry + stale-deploy recovery.
 *
 * Why this exists:
 *   The app uses code-splitting via dynamic import(). When Vercel ships a
 *   new build, each chunk gets a fresh content hash in its filename
 *   (Polograph-abc123.js → Polograph-def456.js). A visitor whose tab is
 *   still on the previous index.html will, on navigation, request the OLD
 *   chunk URL — which 404s — and React Suspense surfaces the rejection
 *   as a blank white screen.
 *
 * Strategy:
 *   1. Try the import.
 *   2. On a chunk-shaped error, retry once after a short delay. Handles
 *      transient network blips that don't actually need a reload.
 *   3. If the retry also fails with a chunk error, force a single full
 *      reload. The fresh index.html will reference the current chunk
 *      hashes and the navigation can succeed. sessionStorage guards
 *      against an infinite reload loop.
 *   4. Non-chunk errors propagate normally so they hit the ErrorBoundary.
 */

const RELOAD_KEY = "__chunk_reload_attempted";

const isChunkError = (err: unknown): boolean => {
  if (!(err instanceof Error)) return false;
  const m = err.message || "";
  return (
    /Failed to fetch dynamically imported module/i.test(m) ||
    /error loading dynamically imported module/i.test(m) ||
    /Loading chunk \d+ failed/i.test(m) ||
    /Loading CSS chunk/i.test(m) ||
    /Importing a module script failed/i.test(m) ||
    err.name === "ChunkLoadError"
  );
};

export const lazyWithRetry = <T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) => {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      if (!isChunkError(err)) throw err;

      // Brief delay then retry once — covers transient fetch failures
      // that don't require a reload.
      try {
        await new Promise((r) => setTimeout(r, 400));
        return await factory();
      } catch (err2) {
        if (isChunkError(err2)) {
          // Stale deploy: the chunk URL is gone. Reload to pick up the
          // current asset manifest. Guard against repeating the reload
          // if the new build is also broken (avoids infinite refresh).
          if (typeof window !== "undefined" && !sessionStorage.getItem(RELOAD_KEY)) {
            sessionStorage.setItem(RELOAD_KEY, "1");
            window.location.reload();
            // Return an unresolved promise so Suspense keeps showing the
            // PageLoader during the brief moment before the reload kicks in
            // — prevents a flash of nothing.
            return new Promise<{ default: T }>(() => {});
          }
        }
        throw err2;
      }
    }
  });
};

/**
 * Clears the one-shot reload guard. Called after a successful route
 * change so subsequent stale-chunk events can trigger a fresh reload.
 */
export const clearChunkReloadFlag = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(RELOAD_KEY);
};
