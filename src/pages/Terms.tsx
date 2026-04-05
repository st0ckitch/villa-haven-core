import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";

const Terms = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <SEO title={t("terms.seoTitle")} description={t("terms.seoDesc")} />
      <div className="container mx-auto px-6 pt-24 lg:pt-32 pb-16 max-w-3xl prose prose-sm dark:prose-invert">
        <h1>{t("terms.title")}</h1>

        <h2>{t("terms.generalTitle")}</h2>
        <p>{t("terms.generalText")}</p>

        <h2>{t("terms.serviceTitle")}</h2>
        <p>{t("terms.serviceText")}</p>

        <h2>{t("terms.ipTitle")}</h2>
        <p>{t("terms.ipText")}</p>

        <h2>{t("terms.obligationsTitle")}</h2>
        <ul>
          <li>{t("terms.obligation1")}</li>
          <li>{t("terms.obligation2")}</li>
          <li>{t("terms.obligation3")}</li>
        </ul>

        <h2>{t("terms.liabilityTitle")}</h2>
        <p>{t("terms.liabilityText")}</p>

        <h2>{t("terms.thirdPartyTitle")}</h2>
        <p>{t("terms.thirdPartyText")}</p>

        <h2>{t("terms.changesTitle")}</h2>
        <p>{t("terms.changesText")}</p>

        <h2>{t("terms.lawTitle")}</h2>
        <p>{t("terms.lawText")}</p>

        <h2>{t("terms.contactTitle")}</h2>
        <p>{t("terms.contactText")}</p>
        <p>{t("terms.contactEmail")} <a href="mailto:info@igavidevelopment.ge">info@igavidevelopment.ge</a></p>
      </div>
    </Layout>
  );
};

export default Terms;
