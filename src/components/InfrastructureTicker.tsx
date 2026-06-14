import {
  TreePine, Waves, Cherry, Theater, Pill, ShoppingBag, Coffee, UtensilsCrossed,
  Building2, Hotel, Sparkles, Heart, Baby, Palmtree, Dribbble, Trophy,
  Target, Dumbbell, Sun, Cpu, TreeDeciduous, Footprints, LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AmenityItem {
  icon: LucideIcon;
  key: string;
}

const allAmenities: AmenityItem[] = [
  { icon: Footprints, key: "boulevard" },
  { icon: TreePine, key: "forestPark" },
  { icon: Waves, key: "lake" },
  { icon: Cherry, key: "sakuraAlley" },
  { icon: TreeDeciduous, key: "park" },
  { icon: Palmtree, key: "recreationAreas" },
  { icon: Dribbble, key: "footballFields" },
  { icon: LayoutGrid, key: "basketballCourts" },
  { icon: Target, key: "tennisCourts" },
  { icon: Trophy, key: "padelCourts" },
  { icon: Dumbbell, key: "equestrianClub" },
  { icon: Dumbbell, key: "sportsComplex" },
  { icon: LayoutGrid, key: "billiards" },
  { icon: Theater, key: "amphitheater" },
  { icon: Pill, key: "pharmacies" },
  { icon: ShoppingBag, key: "shops" },
  { icon: Coffee, key: "cafeBars" },
  { icon: UtensilsCrossed, key: "restaurants" },
  { icon: Building2, key: "businessCenter" },
  { icon: Hotel, key: "hotel" },
  { icon: Sparkles, key: "wellnessCenter" },
  { icon: Heart, key: "rehabCenter" },
  { icon: Baby, key: "playgrounds" },
  { icon: Sun, key: "solarPower" },
  { icon: Cpu, key: "hiTechDrones" },
];

const Chip = ({ item, t }: { item: AmenityItem; t: (k: string) => string }) => {
  const Icon = item.icon;
  return (
    <div
      className="group/chip inline-flex items-center gap-2.5 px-5 py-3 rounded-full
        bg-[hsl(130_50%_33%)] border border-[hsl(130_55%_27%)]
        shadow-[0_2px_12px_rgba(45,143,67,0.18)]
        hover:shadow-[0_8px_24px_rgba(45,143,67,0.32)] hover:bg-[hsl(130_55%_28%)]
        hover:scale-[1.05] hover:-translate-y-0.5
        transition-all duration-300 cursor-default select-none shrink-0"
    >
      <div className="w-8 h-8 rounded-full bg-white/15 group-hover/chip:bg-white/25 flex items-center justify-center transition-all duration-300">
        <Icon className="w-4 h-4 text-white" strokeWidth={1.8} />
      </div>
      <span className="text-sm font-sans font-medium text-white whitespace-nowrap">
        {t(`amenities.${item.key}`)}
      </span>
    </div>
  );
};

export const InfrastructureTicker = () => {
  const { t } = useLanguage();

  // Split into two rows
  const row1 = allAmenities.slice(0, Math.ceil(allAmenities.length / 2));
  const row2 = allAmenities.slice(Math.ceil(allAmenities.length / 2));

  return (
    <div className="relative">
      {/* Edge fade masks — fade to the section's white background. */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-10" />

      <div className="flex flex-col gap-4 overflow-hidden py-2 group/track">
        {/* Row 1 — scrolls left */}
        <div className="flex gap-3 animate-[marquee-left_45s_linear_infinite] group-hover/track:[animation-play-state:paused]">
          {[...row1, ...row1, ...row1].map((item, i) => (
            <Chip key={`r1-${i}`} item={item} t={t} />
          ))}
        </div>

        {/* Row 2 — scrolls right, slightly faster */}
        <div className="flex gap-3 animate-[marquee-right_38s_linear_infinite] group-hover/track:[animation-play-state:paused]">
          {[...row2, ...row2, ...row2].map((item, i) => (
            <Chip key={`r2-${i}`} item={item} t={t} />
          ))}
        </div>
      </div>
    </div>
  );
};
