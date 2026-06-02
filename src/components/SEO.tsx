import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";

interface HrefLang {
  lang: string;
  href: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
  hrefLangs?: HrefLang[];
}

// Site brand renamed Igavi → Polograph (footer + meta) per client 2026-05-31
// PDF. "Igavi Development" still appears in About-page body copy as the
// developer / parent-company name, but the site itself is branded Polograph
// (matches the polograph.ge domain).
const SITE_NAME = "Polograph";

export const SEO = ({
  title,
  description,
  image,
  url,
  type = "website",
  keywords,
  hrefLangs,
}: SEOProps) => {
  const { t } = useLanguage();
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const finalDescription = description || t("seo.defaultDescription");

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      {image && <meta name="twitter:image" content={image} />}
      {url && <link rel="canonical" href={url} />}
      {hrefLangs?.map((hl) => (
        <link key={hl.lang} rel="alternate" hrefLang={hl.lang} href={hl.href} />
      ))}
    </Helmet>
  );
};
