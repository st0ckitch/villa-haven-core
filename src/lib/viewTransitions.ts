/**
 * View Transitions API wrapper for smooth page navigation.
 * Falls back to normal navigation in unsupported browsers (Safari).
 */

type ViewTransitionAPI = {
  startViewTransition: (callback: () => void | Promise<void>) => {
    finished: Promise<void>;
    ready: Promise<void>;
    updateCallbackDone: Promise<void>;
  };
};

export const startViewTransition = (callback: () => void | Promise<void>) => {
  const doc = document as Document & Partial<ViewTransitionAPI>;
  if (typeof doc.startViewTransition === "function") {
    return doc.startViewTransition(callback);
  }
  // Fallback: just run the callback
  callback();
  return null;
};

export const supportsViewTransitions = (): boolean => {
  return typeof document !== "undefined" && "startViewTransition" in document;
};
