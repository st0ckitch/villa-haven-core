import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Youtube, BookOpen, Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const CATALOG_KEYS = [
  { key: "catalog_igavi", labelKey: "footer.catalogIgavi" },
  { key: "catalog_polograph", labelKey: "footer.catalogPolograph" },
  { key: "catalog_olimpo", labelKey: "footer.catalogOlimpo" },
  { key: "catalog_equestrian", labelKey: "footer.catalogEquestrian" },
];

export const Footer = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from("site_settings").select("key, value").then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r: { key: string; value: string }) => { map[r.key] = r.value; });
        setSettings(map);
      }
    });
  }, []);

  const address = settings.contact_address || "Tbilisi, Georgia";
  const phone = settings.contact_phone || "+995 (32) 200-00-00";

  const socials = [
    { name: "Facebook", url: settings.social_facebook, icon: Facebook },
    { name: "Instagram", url: settings.social_instagram, icon: Instagram },
    { name: "LinkedIn", url: settings.social_linkedin, icon: Linkedin },
    { name: "YouTube", url: settings.social_youtube, icon: Youtube },
  ].filter((s) => s.url);

  const quickLinks = [
    { label: t("nav.home"), to: "/" },
    { label: t("footer.polograph"), to: "/polograph" },
    { label: t("footer.olimpo"), to: "/olimpo" },
    { label: t("footer.equestrian"), to: "/equestrian" },
    { label: t("footer.news"), to: "/blog" },
  ];

  const catalogs = CATALOG_KEYS
    .map((c) => ({ label: t(c.labelKey), url: settings[c.key] }));

  return (
    <footer className="bg-secondary/60 backdrop-blur-xl border-t border-white/15 text-foreground">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="font-serif text-2xl tracking-tight">
              Igavi<span className="text-primary">–</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              {t("footer.desc")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sans text-xs font-bold uppercase tracking-widest mb-4 text-muted-foreground/60">
              {t("footer.quickLinks")}
            </h4>
            <nav className="flex flex-col gap-2.5">
              {quickLinks.map((item) => (
                <Link
                  key={item.to + item.label}
                  to={item.to}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans text-xs font-bold uppercase tracking-widest mb-4 text-muted-foreground/60">
              {t("footer.contactTitle")}
            </h4>
            <div className="flex flex-col gap-3">
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{t("footer.salesAddress")}: {address}</span>
              </p>
              <a href={`tel:${phone.replace(/[\s()-]/g, "")}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{t("footer.salesPhone")}: {phone}</span>
              </a>
              <a href="mailto:info@igavidevelopment.ge" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="w-4 h-4 shrink-0" /> info@igavidevelopment.ge
              </a>
              <a href="mailto:sales@igavidevelopment.ge" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="w-4 h-4 shrink-0" /> sales@igavidevelopment.ge
              </a>
            </div>
          </div>

          {/* Social Icons */}
          <div>
            <div className="flex gap-3 lg:mt-6">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Catalogs Section */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10 bg-white/30 backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-8">
              <div className="flex items-start gap-3 md:max-w-md">
                <BookOpen className="w-8 h-8 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-sans text-sm font-semibold mb-1">{t("footer.catalogsTitle")}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("footer.catalogsDesc")}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {catalogs.map((catalog) =>
                  catalog.url ? (
                    <a
                      key={catalog.label}
                      href={catalog.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {catalog.label}
                    </a>
                  ) : (
                    <span
                      key={catalog.label}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg border border-border bg-background text-muted-foreground/50 cursor-default"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {catalog.label}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

        <div className="mt-12 pt-8 border-t border-border text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-xs">
            <Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("footer.privacy")}
            </Link>
            <span className="text-muted-foreground/40">|</span>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("footer.terms")}
            </Link>
          </div>
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} Igavi - იგავი. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
};
