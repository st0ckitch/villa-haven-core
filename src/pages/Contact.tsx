import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { ContactSection } from "@/components/home/ContactSection";
import { useLanguage } from "@/contexts/LanguageContext";

const Contact = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <SEO title={`${t("nav.contact")} — Igavi`} description={t("contact.subtitle")} />
      <div className="pt-24 lg:pt-32 pb-10 lg:pb-16">
        <ContactSection />
      </div>
    </Layout>
  );
};

export default Contact;
