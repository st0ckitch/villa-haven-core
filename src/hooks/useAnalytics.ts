export const useAnalytics = () => {
  const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
    if (window.gtag) {
      window.gtag("event", eventName, params);
    }
    if (window.fbq) {
      window.fbq("trackCustom", eventName, params);
    }
  };

  return {
    trackContactSubmit: () => trackEvent("contact_submit"),
    trackVillaClick: (villaName: string) => trackEvent("villa_click", { villa_name: villaName }),
    trackSearch: (query: string) => trackEvent("search", { search_term: query }),
    trackEvent,
  };
};
