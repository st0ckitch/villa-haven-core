import { useParams, Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useLanguage, getLocalizedField } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbox } from "@/components/Lightbox";
import { ArrowLeft, BedDouble, Bath, Maximize, MapPin, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { VillaContactForm } from "@/components/VillaContactForm";
import { VillaPlotSummary } from "@/components/villa/VillaPlotSummary";
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
  const features = villa.features as string[] | null;

  const openLightbox = (index: number) => { setLightboxIndex(index); setLightboxOpen(true); };

  return (
    <Layout>
      <SEO title={`${villa.name} — Igavi`} description={description || `${villa.name} — ${villa.size_sqm} m², ${villa.bedrooms} bedrooms`} />

      {/* Decorative orbs */}
      <div className="absolute inset-x-0 top-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(130_55%_40%/0.05)_0%,transparent_70%)] animate-orb-float" />
      </div>

      <div className="container mx-auto px-6 pt-28 lg:pt-32 pb-10 lg:pb-16">
        <Link to="/polograph" className="inline-flex items-center gap-2 text-muted-foreground hover:text-[hsl(130_55%_30%)] transition-colors font-sans text-sm mb-8">
          <ArrowLeft className="w-4 h-4" /> {t("villa.backToProperties")}
        </Link>

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
                <h1 className="font-sans text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground">{villa.name}</h1>
                <Badge variant="outline" className={`mt-2 font-sans text-xs border ${statusColors[villa.status]} ${villa.status === "available" ? "animate-pulse" : ""}`}>{t(`sitePlan.${villa.status}`)}</Badge>
                {plotZone && (
                  <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-[hsl(130_55%_40%/0.1)] border border-[hsl(130_55%_40%/0.25)] text-[11px] font-sans font-semibold tracking-wide text-[hsl(130_55%_30%)]">
                    {getZoneCategory(plotZone.name)}
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

            {/* Extended Specifications */}
            {(() => {
              const specs = [
                { label: t("villa.condominium"), value: (villa as any).condominium },
                { label: t("villa.viewType"), value: (villa as any).view_type },
                { label: t("villa.sector"), value: (villa as any).sector },
                { label: t("villa.cadastralCodes"), value: (villa as any).cadastral_codes },
                { label: t("villa.totalArea"), value: (villa as any).total_area ? `${(villa as any).total_area} m²` : null },
                { label: t("villa.livingArea"), value: (villa as any).living_area ? `${(villa as any).living_area} m²` : null },
                { label: t("villa.balconyArea"), value: (villa as any).balcony_area ? `${(villa as any).balcony_area} m²` : null },
                { label: t("villa.bedroomCount"), value: (villa as any).bedroom_count },
                { label: t("villa.livingRoom"), value: (villa as any).living_room },
                { label: t("villa.kitchen"), value: (villa as any).kitchen },
                { label: t("villa.wetPoint"), value: (villa as any).wet_point_1 },
                { label: `${t("villa.wetPoint")} 2`, value: (villa as any).wet_point_2 },
                { label: t("villa.technicalRoom"), value: (villa as any).technical_room },
                { label: t("villa.ceilingHeight"), value: (villa as any).ceiling_height },
                { label: t("villa.parking"), value: (villa as any).parking },
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

            {features && features.length > 0 && (
              <div className="relative bg-white/60 backdrop-blur-md border border-[hsl(130_55%_40%/0.12)] rounded-2xl p-6 md:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                <h2 className="font-sans text-xl font-medium mb-5 text-foreground">{t("villa.features")}</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2.5 font-sans text-sm">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[hsl(130_55%_40%/0.15)] to-[hsl(130_55%_40%/0.05)] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-[hsl(130_55%_35%)]" strokeWidth={2.5} />
                      </div>
                      <span className="text-foreground/80">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Plot Zone Price Summary (from ?plot= param) */}
            {plotZone && <VillaPlotSummary villa={villa} plotZone={plotZone} />}

            {galleryImages.length > 1 && (
              <div>
                <h2 className="font-sans text-xl font-medium mb-4 text-foreground">{t("villa.gallery")}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {galleryImages.map((img, i) => (
                    <div key={img.id} className="aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border border-white/40 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(45,143,67,0.12)] hover:border-[hsl(130_55%_40%/0.3)] hover:-translate-y-0.5 transition-all duration-300 group" onClick={() => openLightbox(i)}>
                      <img src={img.image_url} alt={`${villa.name} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Glass sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white/60 backdrop-blur-xl border border-[hsl(130_55%_40%/0.15)] rounded-3xl p-6 space-y-6 text-card-foreground shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
              <div>
                <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[hsl(130_55%_35%)] mb-2">{t("villa.inquire")}</p>
                <h3 className="font-sans text-lg font-medium mb-2 text-foreground">{t("villa.inquireTitle")}</h3>
                <p className="font-sans text-sm text-muted-foreground mb-4">{t("villa.inquireDesc")}</p>
              </div>
              <VillaContactForm villaName={plotZone ? `${villa.name} + ${plotZone.name}` : villa.name} />
              <Link to="/site-plan">
                <Button variant="outline" className="w-full font-sans mt-3">
                  <MapPin className="w-4 h-4 mr-2" /> {t("villa.viewOnPlan")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

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
