import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";

const PrivacyPolicy = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <SEO title={t("privacy.seoTitle")} description={t("privacy.seoDesc")} />
      <div className="container mx-auto px-6 pt-24 lg:pt-32 pb-16 max-w-3xl prose prose-sm dark:prose-invert">
        <h1>{t("privacy.title")}</h1>

        <p>{t("privacy.intro")}</p>
        <p>{t("privacy.consent")}</p>

        <h2>{t("privacy.termsTitle")}</h2>
        <p><strong>{t("privacy.termCompany")}</strong></p>
        <p><strong>{t("privacy.termService")}</strong></p>
        <p><strong>{t("privacy.termPersonalData")}</strong></p>
        <p><strong>{t("privacy.termUsageData")}</strong></p>
        <p><strong>{t("privacy.termDevice")}</strong></p>
        <p><strong>{t("privacy.termServiceProvider")}</strong></p>
        <p><strong>{t("privacy.termYou")}</strong></p>

        <h2>{t("privacy.dataCollectionTitle")}</h2>
        <ul>
          <li><strong>{t("privacy.dataId")}</strong></li>
          <li><strong>{t("privacy.dataContact")}</strong></li>
          <li><strong>{t("privacy.dataLocation")}</strong></li>
          <li><strong>{t("privacy.dataPreferences")}</strong></li>
          <li><strong>{t("privacy.dataUsage")}</strong></li>
        </ul>

        <h2>{t("privacy.legalBasisTitle")}</h2>
        <p>{t("privacy.legalBasisIntro")}</p>
        <ul>
          <li><strong>{t("privacy.legalConsent")}</strong></li>
          <li><strong>{t("privacy.legalContract")}</strong></li>
          <li><strong>{t("privacy.legalObligation")}</strong></li>
          <li><strong>{t("privacy.legalInterest")}</strong></li>
        </ul>

        <h2>{t("privacy.dataUseTitle")}</h2>
        <p>{t("privacy.dataUseIntro")}</p>
        <ul>
          <li>{t("privacy.dataUse1")}</li>
          <li>{t("privacy.dataUse2")}</li>
          <li>{t("privacy.dataUse3")}</li>
          <li>{t("privacy.dataUse4")}</li>
          <li>{t("privacy.dataUse5")}</li>
          <li>{t("privacy.dataUse6")}</li>
        </ul>

        <h2>{t("privacy.dataSharingTitle")}</h2>
        <p>{t("privacy.dataSharingIntro")}</p>
        <ul>
          <li>{t("privacy.dataShare1")}</li>
          <li>{t("privacy.dataShare2")}</li>
          <li>{t("privacy.dataShare3")}</li>
          <li>{t("privacy.dataShare4")}</li>
          <li>{t("privacy.dataShare5")}</li>
          <li>{t("privacy.dataShare6")}</li>
        </ul>

        <h2>{t("privacy.retentionTitle")}</h2>
        <ul>
          <li><strong>{t("privacy.retention1")}</strong></li>
          <li><strong>{t("privacy.retention2")}</strong></li>
          <li><strong>{t("privacy.retention3")}</strong></li>
          <li><strong>{t("privacy.retention4")}</strong></li>
        </ul>

        <h2>{t("privacy.transferTitle")}</h2>
        <p>{t("privacy.transferIntro")}</p>
        <ul>
          <li>{t("privacy.transfer1")}</li>
          <li>{t("privacy.transfer2")}</li>
        </ul>

        <h2>{t("privacy.rightsTitle")}</h2>
        <p>{t("privacy.rightsIntro")}</p>
        <ul>
          <li>{t("privacy.right1")}</li>
          <li>{t("privacy.right2")}</li>
          <li>{t("privacy.right3")}</li>
          <li>{t("privacy.right4")}</li>
          <li>{t("privacy.right5")}</li>
          <li>{t("privacy.right6")}</li>
        </ul>

        <h2>{t("privacy.securityTitle")}</h2>
        <p>{t("privacy.securityText")}</p>

        <h2>{t("privacy.minorsTitle")}</h2>
        <p>{t("privacy.minorsText")}</p>

        <h2>{t("privacy.thirdPartyTitle")}</h2>
        <p>{t("privacy.thirdPartyText")}</p>

        <h2>{t("privacy.changesTitle")}</h2>
        <p>{t("privacy.changesText")}</p>

        <h2>{t("privacy.contactTitle")}</h2>
        <p>{t("privacy.contactText")}</p>
        <p>{t("privacy.contactEmail")} <a href="mailto:info@igavidevelopment.ge">info@igavidevelopment.ge</a></p>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
