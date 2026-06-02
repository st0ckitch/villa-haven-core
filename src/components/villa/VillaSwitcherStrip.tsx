import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface VillaSwitcherStripProps {
  /** Currently viewed villa — excluded from the strip so the user isn't shown a tile for the page they're on. */
  currentVillaId: string;
}

interface VillaThumb {
  id: string;
  name: string;
  slug: string | null;
  section: string | null;
  size_sqm: number | null;
  heroImage: string | null;
}

/**
 * Horizontal villa picker shown above the footer on every villa detail
 * page (per client PDF item 7.3, 2026-05-31).
 *
 * Behaviour: clicking a thumbnail navigates to that villa's detail page,
 * preserving the current `?plot=<id>` query so the user keeps the plot
 * they originally picked from the map. VillaDetail re-reads the URL on
 * mount, so the contact form / combination badge / Bitrix payload all
 * pick up the new villa automatically — no in-page state swap needed,
 * just a real navigation.
 *
 * Horizontal scroll on mobile (snap-x), grid on desktop. Renders nothing
 * if fewer than 2 villas exist (no point switching when there's nowhere
 * else to go).
 */
export const VillaSwitcherStrip = ({ currentVillaId }: VillaSwitcherStripProps) => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const plotId = searchParams.get("plot");

  const { data: villas = [] } = useQuery<VillaThumb[]>({
    queryKey: ["villa-switcher-strip"],
    queryFn: async () => {
      const { data: vRows } = await supabase
        .from("villas")
        .select("id, name, slug, section, size_sqm")
        .order("name");
      if (!vRows || vRows.length === 0) return [];

      const ids = vRows.map((v) => v.id);
      const { data: heroes } = await supabase
        .from("villa_images")
        .select("villa_id, image_url")
        .in("villa_id", ids)
        .eq("is_hero", true);

      const heroMap: Record<string, string> = {};
      for (const h of heroes || []) heroMap[h.villa_id] = h.image_url;

      return vRows.map((v) => ({
        ...v,
        heroImage: heroMap[v.id] || null,
      })) as VillaThumb[];
    },
  });

  // Filter out the current villa so the strip is only "where else could I go?".
  const others = villas.filter((v) => v.id !== currentVillaId);
  if (others.length === 0) return null;

  const buildHref = (v: VillaThumb) => {
    const section = v.section || "a-section";
    const slug = v.slug || v.id;
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    return `${base}/projects/${section}/${slug}${plotId ? `?plot=${plotId}` : ""}`;
  };

  return (
    <section className="container mx-auto px-6 py-12 lg:py-16">
      <h2 className="font-sans text-xl md:text-2xl font-medium text-foreground mb-6">
        {t("villa.otherVillas") || "Other villas"}
      </h2>

      {/* On mobile scroll horizontally with snap so the user can swipe through
          all villas one-handed. ≥md it becomes a normal responsive grid. */}
      <div className="-mx-6 md:mx-0">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-6 md:px-0
                        md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-4 md:overflow-visible
                        [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {others.map((v) => (
            <Link
              key={v.id}
              to={buildHref(v)}
              className="snap-start shrink-0 w-44 md:w-auto group block rounded-2xl overflow-hidden
                         border border-border bg-card hover:border-[hsl(130_55%_40%/0.4)]
                         hover:shadow-[0_8px_24px_rgba(45,143,67,0.12)] hover:-translate-y-0.5
                         transition-all duration-300"
            >
              <div className="aspect-[4/3] bg-muted overflow-hidden">
                {v.heroImage ? (
                  <img
                    src={v.heroImage}
                    alt={v.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-muted-foreground text-xs font-sans">
                    {v.name}
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-sans text-sm font-medium text-foreground truncate">{v.name}</p>
                {v.size_sqm != null && (
                  <p className="font-sans text-xs text-muted-foreground mt-0.5">{v.size_sqm} m²</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
