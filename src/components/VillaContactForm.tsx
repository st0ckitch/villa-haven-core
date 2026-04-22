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
}

export const VillaContactForm = ({ villaName }: VillaContactFormProps) => {
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

      // Fire-and-forget Bitrix24 Lead creation — villa name appears in lead description.
      submitLeadToBitrix({
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        message: values.message,
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
