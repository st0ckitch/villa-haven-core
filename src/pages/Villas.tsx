import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Maximize, BedDouble } from "lucide-react";

type Villa = {
  id: string;
  name: string;
  slug: string | null;
  section: string | null;
  size_sqm: number | null;
  bedrooms: number | null;
  price: number | null;
  status: "available" | "reserved" | "sold";
  heroImage?: string | null;
};

type PlotZone = {
  id: string;
  code: string | null;
  name: string;
  size_sqm: number | null;
  length_m: number | null;
  width_m: number | null;
};

const statusBadge: Record<string, string> = {
  available: "bg-villa-available/15 text-villa-available border-villa-available/30",
  reserved: "bg-villa-reserved/15 text-villa-reserved border-villa-reserved/30",
  sold: "bg-villa-sold/15 text-villa-sold border-villa-sold/30",
};

/**
 * Public villa index page.
 *
 * Two modes share this page:
 *  - Plain "/villas" — shows every villa in a hero-photo grid (Q1 from
 *    client PDF 2026-05-31; the navbar's "Choose Villa" link lands here).
 *  - "/villas?plot=<id>" — when a visitor clicks a plot on the map, the
 *    plot popup's single "Choose Villa" CTA navigates here. The page
 *    surfaces the selected plot's metadata at the top and forwards the
 *    `?plot=` param when the visitor opens any villa, so the villa
 *    detail page gets the combination (Q6).
 */
const Villas = () => {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [plotZone, setPlotZone] = useState<PlotZone | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const plotId = searchParams.get("plot");
  const { t } = useLanguage();

  useEffect(() => {
    (async () => {
      const [{ data: villasData }, plotRes] = await Promise.all([
        supabase
          .from("villas")
          .select("id, name, slug, section, size_sqm, bedrooms, price, status")
          .order("name"),
        plotId
          ? supabase.from("plot_zones").select("id, code, name, size_sqm, length_m, width_m").eq("id", plotId).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      if (villasData && villasData.length > 0) {
        const villaIds = (villasData as any[]).map((v) => v.id);
        const { data: heroImages } = await supabase
          .from("villa_images")
          .select("villa_id, image_url")
          .in("villa_id", villaIds)
          .eq("is_hero", true);
        const heroMap: Record<string, string> = {};
        for (const img of heroImages || []) heroMap[img.villa_id] = img.image_url;
        setVillas(
          (villasData as any[]).map((v) => ({ ...v, heroImage: heroMap[v.id] || null })) as Villa[]
        );
      } else {
        setVillas([]);
      }

      if ((plotRes as any).data) setPlotZone((plotRes as any).data as PlotZone);
      setLoading(false);
    })();
  }, [plotId]);

  // When entered with ?plot=<id> we want every internal villa link to
  // carry the same plot through so the villa detail page can compose the
  // plot+villa combination. Plain index entries link without it.
  const villaHref = (v: Villa) => {
    const section = v.section || "a-section";
    const slug = v.slug || v.id;
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    return plotId
      ? `${base}/projects/${section}/${slug}?plot=${plotId}`
      : `${base}/projects/${section}/${slug}`;
  };

  const plotIdent = plotZone?.code || plotZone?.name;
  const plotIntro = plotZone && (plotZone.size_sqm || plotZone.length_m);

  return (
    <Layout>
      <SEO
        title={plotIdent ? `${t("sitePlan.title")} — ${plotIdent}` : t("sitePlan.title")}
        description={t("sitePlan.subtitle")}
      />

      <section className="pt-28 lg:pt-32 pb-16 lg:pb-24">
        <div className="container mx-auto px-6">
          {/* Plot context strip — only rendered when ?plot= is set. Lets
              the visitor confirm they're picking a villa for the right
              plot before clicking through. */}
          {plotZone && (
            <AnimatedSection>
              <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-[hsl(130_55%_40%/0.08)] border border-[hsl(130_55%_40%/0.25)] px-5 py-3">
                <MapPin className="w-4 h-4 text-[hsl(130_55%_30%)]" />
                <div className="font-sans text-sm">
                  <span className="font-semibold text-[hsl(130_55%_30%)]">{plotIdent}</span>
                  {plotIntro && (
                    <span className="text-muted-foreground ml-2">
                      {plotZone.length_m && plotZone.width_m && (
                        <>{plotZone.length_m} × {plotZone.width_m} m · </>
                      )}
                      {plotZone.size_sqm && <>{plotZone.size_sqm} m²</>}
                    </span>
                  )}
                </div>
              </div>
            </AnimatedSection>
          )}

          <AnimatedSection>
            <h1 className="font-sans text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-10 leading-[1.3] md:leading-[1.3] lg:leading-[1.3]">
              {t("sitePlan.mapHeading")}
            </h1>
          </AnimatedSection>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground font-sans text-sm py-12">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              {t("gallery.loading")}
            </div>
          ) : villas.length === 0 ? (
            <p className="text-muted-foreground font-sans">No villas yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {villas.map((villa, i) => (
                <AnimatedSection key={villa.id} delay={i * 40}>
                  <Link
                    to={villaHref(villa).replace(import.meta.env.BASE_URL.replace(/\/$/, ""), "")}
                    className="group block rounded-2xl overflow-hidden border border-white/40
                      bg-white/55 backdrop-blur-md
                      shadow-[0_2px_16px_rgba(0,0,0,0.04)]
                      hover:shadow-[0_12px_40px_rgba(45,143,67,0.16)] hover:border-[hsl(130_55%_40%/0.3)] hover:-translate-y-1
                      transition-all duration-300"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {villa.heroImage ? (
                        <img
                          src={villa.heroImage}
                          alt={villa.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center text-muted-foreground font-sans text-xs">
                          {t("villa.noImage")}
                        </div>
                      )}
                      <Badge
                        variant="outline"
                        className={`absolute top-3 right-3 font-sans text-[10px] border ${statusBadge[villa.status]}`}
                      >
                        {t(`sitePlan.${villa.status}`)}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-sans text-base font-medium text-foreground mb-2 truncate">
                        {villa.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-sans">
                        {villa.size_sqm != null && (
                          <span className="inline-flex items-center gap-1">
                            <Maximize className="w-3 h-3" /> {villa.size_sqm} m²
                          </span>
                        )}
                        {villa.bedrooms != null && (
                          <span className="inline-flex items-center gap-1">
                            <BedDouble className="w-3 h-3" /> {villa.bedrooms}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Villas;
