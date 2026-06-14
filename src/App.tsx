import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Analytics } from "@/components/Analytics";
import { CookieBanner } from "@/components/CookieBanner";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ChunkErrorBoundary } from "@/components/ChunkErrorBoundary";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

// Routes are code-split via React.lazy → dynamic import(). Wrapped in
// lazyWithRetry so the user doesn't get a blank screen after a deploy
// when their cached index.html points at chunk URLs that no longer
// exist — the wrapper retries once on transient failures and forces a
// single reload on real stale-deploy misses.
const Index = lazyWithRetry(() => import("./pages/Index"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const AdminLogin = lazyWithRetry(() => import("./pages/AdminLogin"));
const Dashboard = lazyWithRetry(() => import("./pages/admin/Dashboard"));
const VillaManagement = lazyWithRetry(() => import("./pages/admin/VillaManagement"));
const BlogManagement = lazyWithRetry(() => import("./pages/admin/BlogManagement"));
const BlogEditor = lazyWithRetry(() => import("./pages/admin/BlogEditor"));
const RendersManagement = lazyWithRetry(() => import("./pages/admin/RendersManagement"));
const PlotManager = lazyWithRetry(() => import("./pages/admin/PlotManager"));
const SliderManagement = lazyWithRetry(() => import("./pages/admin/SliderManagement"));
const SiteSettings = lazyWithRetry(() => import("./pages/admin/SiteSettings"));
const AboutManagement = lazyWithRetry(() => import("./pages/admin/AboutManagement"));
const PolographManagement = lazyWithRetry(() => import("./pages/admin/PolographManagement"));
const OlimpoManagement = lazyWithRetry(() => import("./pages/admin/OlimpoManagement"));
const EquestrianManagement = lazyWithRetry(() => import("./pages/admin/EquestrianManagement"));
const Gallery = lazyWithRetry(() => import("./pages/Gallery"));
const SitePlan = lazyWithRetry(() => import("./pages/SitePlan"));
const Villas = lazyWithRetry(() => import("./pages/Villas"));
const Blog = lazyWithRetry(() => import("./pages/Blog"));
const BlogPostPage = lazyWithRetry(() => import("./pages/BlogPost"));
const VillaDetail = lazyWithRetry(() => import("./pages/VillaDetail"));
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword"));
const Contact = lazyWithRetry(() => import("./pages/Contact"));
const About = lazyWithRetry(() => import("./pages/About"));
const Polograph = lazyWithRetry(() => import("./pages/Polograph"));
const Olimpo = lazyWithRetry(() => import("./pages/Olimpo"));
const Equestrian = lazyWithRetry(() => import("./pages/Equestrian"));
const PrivacyPolicy = lazyWithRetry(() => import("./pages/PrivacyPolicy"));
const Terms = lazyWithRetry(() => import("./pages/Terms"));

// Defaults tuned for a content site: data rarely changes within a session,
// so cache it aggressively to avoid re-fetching on every page navigation
// (was causing the home hero to flash and pages to re-trigger spinners).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 min — admin edits show up within the next page load
      staleTime: 5 * 60_000,
      // Keep cached data in memory for 30 min after last use; cheap to keep,
      // huge UX win when navigating back to a previously visited page.
      gcTime: 30 * 60_000,
      // Don't auto-refetch when the user returns to the tab — the staleTime
      // window already covers that, and refocus refetches were causing
      // visible loading spinners on the homepage.
      refetchOnWindowFocus: false,
      // Same reason for reconnect events.
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <AuthProvider>
              <SmoothScroll>
                <ScrollToTop />
                <ScrollProgress />
                <Analytics />
                <CookieBanner />
                <ChunkErrorBoundary fallback={<PageLoader />}>
                  <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/site-plan" element={<SitePlan />} />
                    <Route path="/villas" element={<Villas />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPostPage />} />
                    <Route path="/villas/:slug" element={<VillaDetail />} />
                    <Route path="/projects/:section/:slug" element={<VillaDetail />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/polograph" element={<Polograph />} />
                    <Route path="/olimpo" element={<Olimpo />} />
                    <Route path="/equestrian" element={<Equestrian />} />
                    {/* New route per client rename Equestrian → Ipodromi */}
                    <Route path="/ipodromi" element={<Equestrian />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute>
                          <AdminLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Dashboard />} />
                      <Route path="villas" element={<VillaManagement />} />
                      <Route path="blog" element={<BlogManagement />} />
                      <Route path="blog/:id" element={<BlogEditor />} />
                      <Route path="renders" element={<RendersManagement />} />
                      <Route path="sliders" element={<SliderManagement />} />
                      <Route path="plot-map" element={<PlotManager />} />
                      <Route path="settings" element={<SiteSettings />} />
                      <Route path="about" element={<AboutManagement />} />
                      <Route path="polograph" element={<PolographManagement />} />
                      <Route path="olimpo" element={<OlimpoManagement />} />
                      <Route path="equestrian" element={<EquestrianManagement />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </Suspense>
                </ChunkErrorBoundary>
              </SmoothScroll>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
