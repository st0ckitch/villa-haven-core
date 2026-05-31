import React from "react";

interface State {
  hasError: boolean;
}

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

/**
 * Catches any chunk-load failure that escaped lazyWithRetry (e.g. a CSS
 * chunk failing to load mid-render, or a different error path) and
 * forces a single reload to pick up the current asset manifest.
 *
 * Non-chunk errors are rethrown so they reach whatever upstream boundary
 * is interested (currently none — they'll surface in the console as
 * uncaught, which is the right behaviour for genuine app bugs).
 */
export class ChunkErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    if (isChunkError(error)) return { hasError: true };
    // Not our concern — propagate.
    throw error;
  }

  componentDidCatch(error: Error) {
    if (!isChunkError(error)) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(RELOAD_KEY)) return; // already attempted
    sessionStorage.setItem(RELOAD_KEY, "1");
    // Defer slightly so React unwinds the current render before navigation.
    setTimeout(() => window.location.reload(), 50);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )
      );
    }
    return this.props.children;
  }
}
