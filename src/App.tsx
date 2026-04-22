import { Suspense, lazy } from "react";
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
import { NoiseOverlay } from "@/components/NoiseOverlay";
import { Cursor } from "@/components/Cursor";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const VillaManagement = lazy(() => import("./pages/admin/VillaManagement"));
const BlogManagement = lazy(() => import("./pages/admin/BlogManagement"));
const BlogEditor = lazy(() => import("./pages/admin/BlogEditor"));
const RendersManagement = lazy(() => import("./pages/admin/RendersManagement"));
const PlotManager = lazy(() => import("./pages/admin/PlotManager"));
const SliderManagement = lazy(() => import("./pages/admin/SliderManagement"));
const SiteSettings = lazy(() => import("./pages/admin/SiteSettings"));
const AboutManagement = lazy(() => import("./pages/admin/AboutManagement"));
const PolographManagement = lazy(() => import("./pages/admin/PolographManagement"));
const OlimpoManagement = lazy(() => import("./pages/admin/OlimpoManagement"));
const EquestrianManagement = lazy(() => import("./pages/admin/EquestrianManagement"));
const Gallery = lazy(() => import("./pages/Gallery"));
const SitePlan = lazy(() => import("./pages/SitePlan"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPostPage = lazy(() => import("./pages/BlogPost"));
const VillaDetail = lazy(() => import("./pages/VillaDetail"));
const ProjectSection = lazy(() => import("./pages/ProjectSection"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const Polograph = lazy(() => import("./pages/Polograph"));
const Olimpo = lazy(() => import("./pages/Olimpo"));
const Equestrian = lazy(() => import("./pages/Equestrian"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));

const queryClient = new QueryClient();

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
          <BrowserRouter>
            <AuthProvider>
              <SmoothScroll>
                <ScrollProgress />
                <NoiseOverlay />
                <Cursor />
                <Analytics />
                <CookieBanner />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/site-plan" element={<SitePlan />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPostPage />} />
                    <Route path="/villas/:slug" element={<VillaDetail />} />
                    <Route path="/projects/:section" element={<ProjectSection />} />
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
              </SmoothScroll>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
