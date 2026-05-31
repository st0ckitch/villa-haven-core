import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { submitLeadToBitrix } from "@/lib/bitrix";

const formSchema = z.object({
  full_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface VillaContactFormProps {
  villaName: string;
  /** Plot identifier (A3 / D14 / …) when a plot has been selected. */
  plotCode?: string | null;
  /** Plot square meterage when a plot has been selected. */
  plotSqm?: number | null;
  /** Villa square meterage — paired with plotSqm to build the combination string. */
  villaSqm?: number | null;
}

export const VillaContactForm = ({ villaName, plotCode, plotSqm, villaSqm }: VillaContactFormProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  // Combination string for Bitrix per client WhatsApp 2026-05-31:
  // "800 m² plot + 250 m² villa" (prefixed with the plot code when set).
  // Only meaningful when an actual plot has been selected — without one,
  // showing just "250 m² villa" on its own would be noise. Falls back to
  // bare villaName via the Bitrix payload below.
  const hasPlot = plotCode != null || plotSqm != null;
  const combinationLine = (() => {
    if (!hasPlot) return null;
    const parts: string[] = [];
    if (plotSqm) parts.push(`${plotSqm} m² plot`);
    if (villaSqm) parts.push(`${villaSqm} m² villa`);
    const sized = parts.join(" + ");
    return plotCode ? `${plotCode}: ${sized || "plot + villa"}` : sized;
  })();

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        full_name: values.full_name,
        email: values.email,
        phone: values.phone || null,
        message: values.message || "",
        property_interest: villaName,
      });
      if (error) throw error;

      // Fire-and-forget Bitrix24 Lead creation — villaName carries the rich
      // "Villa — A3 (800 m² plot) + villa" string, and we also surface the
      // shorter combination line inside the comment body so it's easy to scan.
      const messageWithCombo = combinationLine
        ? `${values.message ? values.message + "\n\n" : ""}Combination: ${combinationLine}`
        : values.message;

      submitLeadToBitrix({
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        message: messageWithCombo,
        property_interest: villaName,
      });

      toast({ title: t("contact.successTitle"), description: t("contact.successDesc") });
      reset();
    } catch {
      toast({ title: t("contact.errorTitle"), description: t("contact.errorDesc"), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {combinationLine && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-sans">
          <span className="text-muted-foreground">Inquiring about:</span>{" "}
          <span className="font-semibold text-foreground">{combinationLine}</span>
        </div>
      )}
      <div>
        <Input
          placeholder={t("contact.fullName")}
          {...register("full_name")}
          className="font-sans text-sm"
        />
        {errors.full_name && <p className="text-destructive text-xs mt-1 font-sans">{t("validation.required")}</p>}
      </div>
      <div>
        <Input
          type="email"
          placeholder={t("contact.email")}
          {...register("email")}
          className="font-sans text-sm"
        />
        {errors.email && <p className="text-destructive text-xs mt-1 font-sans">{t("validation.invalidEmail")}</p>}
      </div>
      <div>
        <Input
          type="tel"
          placeholder={t("contact.phone")}
          {...register("phone")}
          className="font-sans text-sm"
        />
      </div>
      <div>
        <Textarea
          placeholder={t("contact.messagePlaceholder")}
          rows={3}
          {...register("message")}
          className="font-sans text-sm resize-none"
        />
      </div>
      <Button type="submit" className="w-full font-sans" disabled={submitting}>
        {submitting ? t("contact.sending") : t("contact.send")}
      </Button>
    </form>
  );
};
