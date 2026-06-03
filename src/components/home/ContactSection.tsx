import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { PhoneInput } from "@/components/PhoneInput";
import { submitLeadToBitrix } from "@/lib/bitrix";
// TEMPORARY: aerial render shown in place of the Google Map embed.
import contactLocationAerial from "@/assets/contact-location-aerial.jpg";

const contactSchema = z.object({
  first_name: z.string().trim().min(1).max(50),
  last_name: z.string().trim().max(50).optional().or(z.literal("")),
  email: z.string().trim().max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
}).refine(
  (data) => (data.email && data.email.length > 0) || (data.phone && data.phone.length > 0),
  { message: "phoneOrEmailRequired", path: ["_contactMethod"] }
).refine(
  (data) => !data.email || data.email.length === 0 || z.string().email().safeParse(data.email).success,
  { message: "invalidEmail", path: ["email"] }
);

const CHANNELS = ["telegram", "whatsapp", "viber", "messenger", "emailChannel", "mobilePhone"] as const;

export const ContactSection = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  const toggleChannel = (channel: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const raw = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      message: formData.get("message") as string,
    };

    const result = contactSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as string;
        if (key === "_contactMethod") {
          fieldErrors._contactMethod = err.message;
        } else if (key) {
          fieldErrors[key] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        full_name: `${result.data.first_name} ${result.data.last_name || ""}`.trim(),
        email: result.data.email || "",
        phone: result.data.phone || null,
        property_interest: null,
        message: result.data.message || "",
        preferred_channels: selectedChannels,
      };

      const { error } = await supabase.from("contact_submissions").insert(payload as any);
      if (error) throw error;

      // Fire-and-forget Bitrix24 Lead creation. Never blocks UX.
      submitLeadToBitrix({
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone,
        message: payload.message,
        preferred_channels: payload.preferred_channels,
        property_interest: null,
      });

      toast({ title: t("contact.successTitle"), description: t("contact.successDesc") });
      form.reset();
      setSelectedChannels([]);
      setErrors({});
    } catch {
      toast({ title: t("contact.errorTitle"), description: t("contact.errorDesc"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border-0 border-b border-border rounded-none px-0 py-3 text-foreground text-sm font-sans placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 transition-colors";

  return (
    <section id="contact" className="py-12 lg:py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="bg-secondary rounded-2xl lg:rounded-3xl overflow-hidden">
          <AnimatedSection className="p-8 md:p-12 lg:p-16">
            <h3 className="text-xl md:text-2xl text-foreground mb-8 text-center lg:text-left">{t("contact.ctaButton")}</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left Column — Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <input name="first_name" placeholder={`${t("contact.firstName")} *`} autoComplete="given-name" className={inputClass} />
                    {errors.first_name && <p className="text-xs text-red-400 mt-1 font-sans">{t("validation.required")}</p>}
                  </div>
                  <div>
                    <input name="last_name" placeholder={t("contact.lastName")} autoComplete="family-name" className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <PhoneInput name="phone" placeholder={t("contact.phone")} className={inputClass} />
                    {errors._contactMethod && !errors.email && (
                      <p className="text-xs text-red-400 mt-1 font-sans">{t("contact.phoneOrEmailRequired")}</p>
                    )}
                  </div>
                  <div>
                    <input name="email" type="email" placeholder={t("contact.email")} autoComplete="email" className={inputClass} />
                    {errors.email && <p className="text-xs text-red-400 mt-1 font-sans">{t("validation.invalidEmail")}</p>}
                    {errors._contactMethod && (
                      <p className="text-xs text-red-400 mt-1 font-sans">{t("contact.phoneOrEmailRequired")}</p>
                    )}
                  </div>
                </div>

                <div>
                  <textarea name="message" rows={3} placeholder={t("contact.messagePlaceholderLong")} className={`${inputClass} resize-none`} />
                </div>

                {/* Channel Checkboxes */}
                <div>
                  <p className="text-sm font-sans text-muted-foreground mb-3">{t("contact.preferredChannels")}</p>
                  <div className="flex flex-wrap gap-4">
                    {CHANNELS.map((channel) => (
                      <label key={channel} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={selectedChannels.includes(channel)}
                          onCheckedChange={() => toggleChannel(channel)}
                        />
                        <span className="text-sm font-sans text-foreground">{t(`contact.${channel}`)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full h-12 font-sans font-medium mt-2"
                >
                  {loading ? t("contact.sending") : t("contact.submit")}
                </Button>
              </form>

              {/* Right Column — TEMPORARY: aerial render shown in place of the Google Map embed. */}
              <div className="relative rounded-2xl overflow-hidden bg-white/15 backdrop-blur-xl border border-white/20 shadow-2xl min-h-[320px] lg:min-h-0">
                <img
                  src={contactLocationAerial}
                  alt="Aerial view of the Igavi development"
                  className="w-full h-full absolute inset-0 object-cover"
                  loading="lazy"
                />
                {/* Frosted edge overlay */}
                <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-inset ring-white/25" />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};
