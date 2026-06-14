import { useParams, Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useLanguage, getLocalizedField } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbox } from "@/components/Lightbox";
import { BedDouble, Bath, Maximize, MapPin, X, FileDown, ZoomIn } from "lucide-react";
import { useState } from "react";
import { VillaContactForm } from "@/components/VillaContactForm";
import { VillaPlotSummary } from "@/components/villa/VillaPlotSummary";
import { VillaSwitcherStrip } from "@/components/villa/VillaSwitcherStrip";
import { getZoneCategory } from "@/lib/zoneCategory";

const statusColors: Record<string, string> = {
  available: "bg-villa-available/15 text-villa-available border-villa-available/30",
  reserved: "bg-villa-reserved/15 text-villa-reserved border-villa-reserved/30",
  sold: "bg-villa-sold/15 text-villa-sold border-villa-sold/30",
};

const VillaDetail = () => {
  const { slug, section } = useParams<{ slug: string; section?: string }>();
  const [searchParams] = useSearchParams();
  const plotZoneId = searchParams.get("plot");
  const { t, language } = useLanguage();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { data: villa, isLoading } = useQuery({
    queryKey: ["villa", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("villas").select("*").eq("slug", slug!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: images } = useQuery({
    queryKey: ["villa-images", villa?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("villa_images").select("*").eq("villa_id", villa!.id).order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!villa?.id,
  });

  // All project renders — used to build combined lightbox (villa images first, renders after)
  const { data: allRenders = [] } = useQuery({
    queryKey: ["all-renders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("renders").select("*").order("sort_order");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch plot zone if ?plot= param is present
  const { data: plotZone } = useQuery({
    queryKey: ["plot-zone", plotZoneId],
    queryFn: async () => {
      const { data, error } = await supabase.from("plot_zones").select("*").eq("id", plotZoneId!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!plotZoneId,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center pt-20 lg:pt-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (!villa) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 pt-20 lg:pt-24">
          <h1 className="text-2xl">{t("villa.notFound")}</h1>
          <Link to="/"><Button variant="outline" className="font-sans">{t("villa.backToProperties")}</Button></Link>
        </div>
      </Layout>
    );
  }

  const heroImage = images?.find((img) => img.is_hero) || images?.[0];
  const galleryImages = images || [];
  const description = getLocalizedField(villa, "description", language);

  const openLightbox = (index: number) => { setLightboxIndex(index); setLightboxOpen(true); };

  // Build the combination label the visitor sees and that we send to Bitrix.
  // Keep this in one place so the badge, the contact form, and the sidebar
  // stay in lock-step.
  const plotLabel = (() => {
    if (!plotZone) return null;
    const p: any = plotZone;
    const plotIdent = p.code || getZoneCategory(p.name);
    const plotSize = p.size_sqm ? `${p.size_sqm} m² plot` : "plot";
    const villaSize = villa?.size_sqm ? `${villa.size_sqm} m² villa` : "villa";
    return {
      ident: plotIdent,
      short: `${plotSize} + ${villaSize}`,
      full: `${plotIdent} (${plotSize}) + ${villa?.name || villaSize}`,
    };
  })();

  return (
    <Layout>
      <SEO title={`${villa.name} — Igavi`} description={description || `${villa.name} — ${villa.size_sqm} m², ${villa.bedrooms} bedrooms`} />

      {/* Decorative orbs */}
      <div className="absolute inset-x-0 top-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(130_55%_40%/0.05)_0%,transparent_70%)] animate-orb-float" />
      </div>

      <div className="container mx-auto px-6 pt-28 lg:pt-32 pb-10 lg:pb-16">
        {/* Hero image with glass frame */}
        {heroImage && (
          <div className="relative mb-10">
            <div className="absolute -inset-3 bg-gradient-to-r from-[hsl(130_55%_40%/0.12)] via-[hsl(130_55%_50%/0.18)] to-[hsl(130_55%_40%/0.12)] rounded-[28px] blur-2xl -z-10 opacity-50" />
            <div className="p-1.5 rounded-[20px] bg-gradient-to-br from-[hsl(130_55%_40%/0.2)] via-white/40 to-[hsl(130_55%_40%/0.1)] backdrop-blur-md shadow-[0_16px_48px_rgba(45,143,67,0.1)]">
              <div className="aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer group" onClick={() => openLightbox(galleryImages.findIndex(i => i.id === heroImage.id))}>
                <img src={heroImage.image_url} alt={villa.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-start gap-3 mb-3 flex-wrap">
                <h1 className="font-sans text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground leading-[1.3] md:leading-[1.3] lg:leading-[1.3]">{villa.name}</h1>
                <Badge variant="outline" className={`mt-2 font-sans text-xs border ${statusColors[villa.status]} ${villa.status === "available" ? "animate-pulse" : ""}`}>{t(`sitePlan.${villa.status}`)}</Badge>
                {plotLabel && (
                  <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(130_55%_40%/0.1)] border border-[hsl(130_55%_40%/0.25)] text-[11px] font-sans font-semibold tracking-wide text-[hsl(130_55%_30%)]">
                    <MapPin className="w-3 h-3" />
                    {plotLabel.ident} · {plotLabel.short}
                  </span>
                )}
              </div>
              {villa.price && <p className="text-2xl font-sans font-semibold text-[hsl(130_55%_30%)]">${Number(villa.price).toLocaleString()}</p>}
            </div>

            {/* Spec chips in glass style */}
            <div className="flex flex-wrap gap-2.5">
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-[hsl(130_55%_40%/0.12)] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(130_55%_40%/0.15)] to-[hsl(130_55%_40%/0.05)] flex items-center justify-center">
                  <Maximize className="w-3.5 h-3.5 text-[hsl(130_55%_35%)]" strokeWidth={2} />
                </div>
                <span className="font-sans text-sm"><span className="text-muted-foreground">{t("villa.size")}</span> <span className="font-medium text-foreground">{villa.size_sqm} m²</span></span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-[hsl(130_55%_40%/0.12)] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(130_55%_40%/0.15)] to-[hsl(130_55%_40%/0.05)] flex items-center justify-center">
                  <BedDouble className="w-3.5 h-3.5 text-[hsl(130_55%_35%)]" strokeWidth={2} />
                </div>
                <span className="font-sans text-sm"><span className="text-muted-foreground">{t("villa.bedrooms")}</span> <span className="font-medium text-foreground">{villa.bedrooms}</span></span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-[hsl(130_55%_40%/0.12)] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(130_55%_40%/0.15)] to-[hsl(130_55%_40%/0.05)] flex items-center justify-center">
                  <Bath className="w-3.5 h-3.5 text-[hsl(130_55%_35%)]" strokeWidth={2} />
                </div>
                <span className="font-sans text-sm"><span className="text-muted-foreground">{t("villa.bathrooms")}</span> <span className="font-medium text-foreground">{villa.bathrooms}</span></span>
              </div>
            </div>

            {/* Extended Specifications — fixed list per client screenshot (May 12, 2026) */}
            {(() => {
              const v = villa as any;
              const yesNo = (b: boolean | null | undefined) =>
                b === true ? t("villa.yes") : b === false ? t("villa.no") : null;
              const specs = [
                // Identity / context
                { label: t("villa.sector"), value: v.sector },
                { label: t("villa.cadastralCodes"), value: v.cadastral_codes },
                { label: t("villa.viewType"), value: v.view_type },
                { label: t("villa.ceilingHeight"), value: v.ceiling_height },
                // Areas — overall
                { label: t("villa.plotArea"), value: v.plot_area ? `${v.plot_area} m²` : null },
                { label: t("villa.totalArea"), value: v.total_area ? `${v.total_area} m²` : null },
                { label: t("villa.livingArea"), value: v.living_area ? `${v.living_area} m²` : null },
                { label: t("villa.balconyArea"), value: v.balcony_area ? `${v.balcony_area} m²` : null },
                { label: t("villa.yardArea"), value: v.yard_area ? `${v.yard_area} m²` : null },
                // Areas — per floor
                { label: t("villa.floor1TotalArea"),  value: v.floor_1_total_area  ? `${v.floor_1_total_area} m²`  : null },
                { label: t("villa.floor1LivingArea"), value: v.floor_1_living_area ? `${v.floor_1_living_area} m²` : null },
                { label: t("villa.floor1SummerArea"), value: v.floor_1_summer_area ? `${v.floor_1_summer_area} m²` : null },
                { label: t("villa.floor2TotalArea"),  value: v.floor_2_total_area  ? `${v.floor_2_total_area} m²`  : null },
                { label: t("villa.floor2LivingArea"), value: v.floor_2_living_area ? `${v.floor_2_living_area} m²` : null },
                { label: t("villa.floor2SummerArea"), value: v.floor_2_summer_area ? `${v.floor_2_summer_area} m²` : null },
                // Room counts
                { label: t("villa.roomsCount"), value: v.rooms_count },
                { label: t("villa.bedroomsCount"), value: v.bedroom_count },
                { label: t("villa.masterBedroom"), value: v.master_bedroom },
                { label: t("villa.livingRoom"), value: v.living_room },
                { label: t("villa.diningRoom"), value: v.dining_room },
                { label: t("villa.studyRoom"), value: v.study_room },
                { label: t("villa.kitchen"), value: v.kitchen },
                { label: t("villa.wardrobe"), value: v.wardrobe },
                { label: t("villa.terrace"), value: v.terrace },
                { label: t("villa.balconyCount"), value: v.balcony_count },
                { label: t("villa.wetPoint1"), value: v.wet_point_1 },
                { label: t("villa.wetPoint2"), value: v.wet_point_2 },
                { label: t("villa.auxiliaryRooms1"), value: v.auxiliary_rooms_1 },
                { label: t("villa.auxiliaryRooms2"), value: v.auxiliary_rooms_2 },
                { label: t("villa.technicalRoom"), value: v.technical_room },
                // Amenities
                { label: t("villa.pool"), value: yesNo(v.pool) },
                { label: t("villa.parking"), value: v.parking },
              ].filter((s) => s.value != null && s.value !== "" && s.value !== 0);
              if (specs.length === 0) return null;
              return (
                <div className="relative bg-white/60 backdrop-blur-md border border-[hsl(130_55%_40%/0.12)] rounded-2xl p-6 md:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                  <h2 className="font-sans text-xl font-medium mb-5 text-foreground">{t("villa.specifications")}</h2>
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                    {specs.map((spec) => (
                      <div key={spec.label} className="flex justify-between py-2 border-b border-[hsl(130_55%_40%/0.08)] font-sans text-sm">
                        <span className="text-muted-foreground">{spec.label}</span>
                        <span className="font-medium text-foreground">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {description && (
              <div className="relative bg-white/60 backdrop-blur-md border border-[hsl(130_55%_40%/0.12)] rounded-2xl p-6 md:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                <div className="flex gap-5">
                  <div className="w-1 bg-gradient-to-b from-[hsl(130_55%_40%)] via-[hsl(130_55%_50%)] to-[hsl(130_55%_40%/0.2)] rounded-full shrink-0" />
                  <div className="flex-1">
                    <h2 className="font-sans text-xl font-medium mb-3 text-foreground">{t("villa.description")}</h2>
                    <p className="font-sans text-muted-foreground leading-relaxed whitespace-pre-line">{description}</p>
                  </div>
                </div>
              </div>
            )}

            {galleryImages.length > 1 && (
              <div>
                <h2 className="font-sans text-xl font-medium mb-4 text-foreground">{t("villa.gallery")}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {galleryImages.map((img, i) => (
                    <div key={img.id} className="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-zoom-in border border-white/40 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(45,143,67,0.22)] hover:border-[hsl(130_55%_40%/0.4)] hover:scale-[1.06] hover:z-10 transition-transform duration-300 group" onClick={() => openLightbox(i)}>
                      <img src={img.image_url} alt={`${villa.name} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                      {/* Zoom affordance — fades in on hover so it's clear the
                          photo enlarges / opens full-screen (client PDF #6). */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/15 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/85 text-foreground shadow-md">
                          <ZoomIn className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inquiry form — the single contact form on the page, always
                shown below the villa content (client 2026-06-04: the
                duplicate sidebar form was removed). With a plot selected it
                shows the Selected villa + Selected plot summary and price;
                otherwise a plain "Request more information" form. */}
            {plotZone ? (
              <VillaPlotSummary
                villa={villa}
                plotZone={plotZone}
                villaImage={heroImage?.image_url ?? null}
                villaBedrooms={villa.bedrooms ?? null}
              />
            ) : (
              <div className="relative bg-white/60 backdrop-blur-md border border-[hsl(130_55%_40%/0.12)] rounded-2xl p-6 md:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                <p className="text-xs font-sans font-semibold text-[hsl(130_55%_30%)] mb-1">{t("villa.inquire")}</p>
                <h2 className="font-sans text-xl font-medium text-foreground mb-1">{t("villa.inquireTitle")}</h2>
                <p className="text-sm text-muted-foreground font-sans mb-4">{t("villa.inquireDesc")}</p>
                <VillaContactForm villaName={villa.name} villaSqm={villa.size_sqm ?? null} />
              </div>
            )}
          </div>

          {/* Glass sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white/60 backdrop-blur-xl border border-[hsl(130_55%_40%/0.15)] rounded-3xl p-6 space-y-6 text-card-foreground shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
              {/* Sidebar holds only the villa media + plot CTA now — the
                  contact form was removed per client 2026-06-04 (it
                  duplicated the inquiry form below the villa content; one
                  form per page). Elements:
                  - 4-up villa-photo mini grid (enlarges on hover)
                  - "Download villa project (PDF)" button when the villa
                    has a project_pdf_url (hidden when empty)
                  - Choose / Change plot button. */}
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {galleryImages.slice(0, 4).map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => openLightbox(i)}
                      className={`relative overflow-hidden rounded-xl aspect-[4/3] group cursor-zoom-in
                        border border-white/40 shadow-[0_2px_8px_rgba(0,0,0,0.04)]
                        ${i === 0 ? "col-span-2 aspect-[16/9]" : ""}`}
                    >
                      <img
                        src={img.image_url}
                        alt={villa.name}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/15 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/85 text-foreground shadow">
                          <ZoomIn className="w-4 h-4" />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {(villa as any).project_pdf_url && (
                <a
                  href={(villa as any).project_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="block"
                >
                  <Button variant="outline" className="w-full font-sans">
                    <FileDown className="w-4 h-4 mr-2" /> {t("villa.downloadProject")}
                  </Button>
                </a>
              )}
              {/* Choose / Change plot — sends the visitor to the dedicated
                  plot-map page (not the Polograph project page), so they
                  land directly on the picker instead of having to scroll.
                  Matches the home "Choose villa or condominium" CTA. */}
              {plotLabel ? (
                <Link to="/site-plan" className="block">
                  <Button variant="outline" className="w-full font-sans mt-3">
                    <MapPin className="w-4 h-4 mr-2" /> {t("villa.changePlot")}
                  </Button>
                </Link>
              ) : (
                <Link to="/site-plan" className="block">
                  <Button variant="default" className="w-full font-sans mt-3">
                    <MapPin className="w-4 h-4 mr-2" /> {t("villa.choosePlot")}
                  </Button>
                </Link>
              )}
              {plotLabel && (
                <Link to={`/projects/${villa.section || "a-section"}/${villa.slug || villa.id}`} className="block">
                  <Button variant="ghost" size="sm" className="w-full font-sans text-xs">
                    <X className="w-3 h-3 mr-1" /> {t("villa.clearPlot")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Other villas — horizontal switcher strip per PDF item 7.3.
          Preserves the current ?plot=<id> on navigation so the visitor
          keeps the plot they picked from the map while comparing villas. */}
      <VillaSwitcherStrip currentVillaId={villa.id} />

      {lightboxOpen && galleryImages.length > 0 && (
        <Lightbox
          images={[
            // Villa's own photos first
            ...galleryImages.map((img) => ({ url: img.image_url, title: villa.name })),
            // Then all other project renders (dedupe by URL so we don't repeat villa hero if it's also a render)
            ...allRenders
              .filter((r: any) => !galleryImages.some((img) => img.image_url === r.image_url))
              .map((r: any) => ({ url: r.image_url, title: r.title || "" })),
          ]}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </Layout>
  );
};

export default VillaDetail;
