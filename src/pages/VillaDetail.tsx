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
      <div className="container mx-auto px-6 pt-24 lg:pt-32 pb-10 lg:pb-16">
        <Link to={section ? `/projects/${section}` : "/site-plan"} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm mb-8">
          <ArrowLeft className="w-4 h-4" /> {t("villa.backToProperties")}
        </Link>

        {heroImage && (
          <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-8 cursor-pointer" onClick={() => openLightbox(galleryImages.findIndex(i => i.id === heroImage.id))}>
            <img src={heroImage.image_url} alt={villa.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-start gap-3 mb-3">
                <h1 className="text-2xl md:text-3xl lg:text-4xl">{villa.name}</h1>
                <Badge variant="outline" className={`mt-2 font-sans text-xs border ${statusColors[villa.status]}`}>{t(`sitePlan.${villa.status}`)}</Badge>
              </div>
              {villa.price && <p className="text-2xl font-sans font-semibold text-primary">${Number(villa.price).toLocaleString()}</p>}
            </div>

            <div className="flex flex-wrap gap-6 py-6 border-y border-border">
              <div className="flex items-center gap-2 font-sans">
                <Maximize className="w-5 h-5 text-muted-foreground" />
                <div><p className="text-sm text-muted-foreground">{t("villa.size")}</p><p className="font-medium text-foreground">{villa.size_sqm} m²</p></div>
              </div>
              <div className="flex items-center gap-2 font-sans">
                <BedDouble className="w-5 h-5 text-muted-foreground" />
                <div><p className="text-sm text-muted-foreground">{t("villa.bedrooms")}</p><p className="font-medium text-foreground">{villa.bedrooms}</p></div>
              </div>
              <div className="flex items-center gap-2 font-sans">
                <Bath className="w-5 h-5 text-muted-foreground" />
                <div><p className="text-sm text-muted-foreground">{t("villa.bathrooms")}</p><p className="font-medium text-foreground">{villa.bathrooms}</p></div>
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
                <div>
                  <h2 className="text-xl mb-4">{t("villa.specifications")}</h2>
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                    {specs.map((spec) => (
                      <div key={spec.label} className="flex justify-between py-2 border-b border-border font-sans text-sm">
                        <span className="text-muted-foreground">{spec.label}</span>
                        <span className="font-medium text-foreground">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {description && (
              <div>
                <h2 className="text-xl mb-4">{t("villa.description")}</h2>
                <p className="font-sans text-muted-foreground leading-relaxed whitespace-pre-line">{description}</p>
              </div>
            )}

            {features && features.length > 0 && (
              <div>
                <h2 className="text-xl mb-4">{t("villa.features")}</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 font-sans text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" /><span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Plot Zone Price Summary (from ?plot= param) */}
            {plotZone && <VillaPlotSummary villa={villa} plotZone={plotZone} />}

            {galleryImages.length > 1 && (
              <div>
                <h2 className="text-xl mb-4">{t("villa.gallery")}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {galleryImages.map((img, i) => (
                    <div key={img.id} className="aspect-[4/3] rounded-xl overflow-hidden cursor-pointer" onClick={() => openLightbox(i)}>
                      <img src={img.image_url} alt={`${villa.name} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-2xl p-6 space-y-6 text-card-foreground">
              <div>
                <h3 className="text-lg mb-2 text-card-foreground">{t("villa.inquire")}</h3>
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
        <Lightbox images={galleryImages.map((img) => ({ url: img.image_url, title: villa.name }))} currentIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />
      )}
    </Layout>
  );
};

export default VillaDetail;
