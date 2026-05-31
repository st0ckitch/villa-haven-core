import { Play } from "lucide-react";

interface GlassVideoFrameProps {
  url: string;
  label?: string;
}

const getVideoEmbed = (url: string): string => {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const id = url.includes("youtu.be") ? url.split("/").pop() : new URL(url).searchParams.get("v");
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}`;
  }
  if (url.includes("vimeo.com")) {
    const id = url.split("/").pop();
    return `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1`;
  }
  return url;
};

export const GlassVideoFrame = ({ url, label }: GlassVideoFrameProps) => {
  const isEmbed = url.includes("youtube") || url.includes("youtu.be") || url.includes("vimeo");

  return (
    <div className="relative">
      {/* Decorative glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-[hsl(130_55%_40%/0.2)] via-[hsl(130_55%_50%/0.3)] to-[hsl(130_55%_40%/0.2)] rounded-[28px] blur-2xl -z-10 opacity-60" />

      {/* Label chip */}
      {label && (
        <div className="absolute -top-4 left-8 z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full
          bg-white/80 backdrop-blur-xl border border-[hsl(130_55%_40%/0.2)]
          shadow-[0_4px_16px_rgba(45,143,67,0.15)]">
          <Play className="w-3 h-3 text-[hsl(130_55%_35%)] fill-[hsl(130_55%_35%)]" />
          <span className="font-sans text-xs font-semibold text-foreground/85">
            {label}
          </span>
        </div>
      )}

      {/* Glass frame wrapper */}
      <div className="p-1.5 rounded-[24px] bg-gradient-to-br from-[hsl(130_55%_40%/0.3)] via-white/50 to-[hsl(130_55%_40%/0.15)] backdrop-blur-md shadow-[0_16px_48px_rgba(45,143,67,0.15)]">
        <div className="relative w-full aspect-video rounded-[20px] overflow-hidden bg-black">
          {isEmbed ? (
            <iframe
              src={getVideoEmbed(url)}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : (
            <video src={url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
          )}
        </div>
      </div>
    </div>
  );
};
