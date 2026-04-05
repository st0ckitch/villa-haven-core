import { Quote, Sparkles, Package } from "lucide-react";

interface GlassInfoCardProps {
  title?: string;
  text: string;
  variant?: "vision" | "delivery" | "quote";
}

export const GlassInfoCard = ({ title, text, variant = "vision" }: GlassInfoCardProps) => {
  const Icon = variant === "delivery" ? Package : variant === "quote" ? Quote : Sparkles;

  return (
    <div className="relative bg-white/65 backdrop-blur-xl border border-[hsl(130_55%_40%/0.15)] rounded-3xl p-8 md:p-10 overflow-hidden
      shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
      {/* Decorative orb */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[radial-gradient(circle,hsl(130_55%_40%/0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Icon in top-right */}
      <Icon className="absolute top-6 right-6 w-16 h-16 text-[hsl(130_55%_40%)] opacity-[0.08]" strokeWidth={1.2} />

      {/* Left accent bar + content */}
      <div className="relative flex gap-5 md:gap-6">
        <div className="w-1 bg-gradient-to-b from-[hsl(130_55%_40%)] via-[hsl(130_55%_50%)] to-[hsl(130_55%_40%/0.2)] rounded-full shrink-0" />
        <div className="flex-1">
          {title && (
            <h2 className="font-sans text-xl md:text-2xl font-medium tracking-tight text-foreground mb-3">
              {title}
            </h2>
          )}
          <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};
