import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

export const CookieBanner = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie_consent")) {
      setVisible(true);
    }
  }, []);

  const handle = (value: string) => {
    localStorage.setItem("cookie_consent", value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-4 md:p-6">
      <div className="container mx-auto max-w-3xl bg-card border border-border rounded-xl shadow-lg p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Cookie className="w-6 h-6 text-primary shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-sm text-muted-foreground flex-1">{t("cookie.message")}</p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => handle("declined")}>
            {t("cookie.decline")}
          </Button>
          <Button size="sm" onClick={() => handle("accepted")}>
            {t("cookie.accept")}
          </Button>
        </div>
      </div>
    </div>
  );
};
