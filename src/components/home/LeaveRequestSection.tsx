import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const useLeaveRequestSettings = () => {
  return useQuery({
    queryKey: ["leave-request-settings"],
    queryFn: async () => {
      const keys = [
        "leave_request_title_en",
        "leave_request_title_ka",
        "leave_request_title_ru",
        "leave_request_subtitle_en",
        "leave_request_subtitle_ka",
        "leave_request_subtitle_ru",
        "leave_request_button_en",
        "leave_request_button_ka",
        "leave_request_button_ru",
      ];
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", keys);
      const map: Record<string, string> = {};
      data?.forEach((r) => (map[r.key] = r.value));
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const LeaveRequestSection = () => {
  const { t, language } = useLanguage();
  const { data: settings } = useLeaveRequestSettings();

  const title =
    settings?.[`leave_request_title_${language}`] || t("leaveRequest.title");
  const subtitle =
    settings?.[`leave_request_subtitle_${language}`] || t("leaveRequest.subtitle");
  const buttonText =
    settings?.[`leave_request_button_${language}`] || t("nav.leaveRequest");

  return (
    <section className="py-10 lg:py-14">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-4xl rounded-3xl bg-secondary/60 backdrop-blur-xl border border-white/30 shadow-lg px-8 py-10 lg:py-14 text-center">
          <AnimatedSection>
            <h2 className="text-2xl md:text-3xl lg:text-4xl tracking-tight text-foreground mb-6">
              {title}
            </h2>
            <p className="text-muted-foreground font-sans text-base md:text-lg max-w-xl mx-auto mb-8">
              {subtitle}
            </p>
            <a href="#contact">
              <Button size="lg" className="rounded-full font-sans font-medium px-8 h-12 gap-2">
                {buttonText}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};
