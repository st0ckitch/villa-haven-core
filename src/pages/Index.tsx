import { Layout } from "@/components/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { LeaveRequestSection } from "@/components/home/LeaveRequestSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { AmenitiesSection } from "@/components/home/AmenitiesSection";
import { BlogSection } from "@/components/home/BlogSection";
import { ContactSection } from "@/components/home/ContactSection";
import { SEO } from "@/components/SEO";
import { OrganizationLd } from "@/components/JsonLd";

const Index = () => {
  return (
    <Layout>
      <SEO title="Luxury Villas" />
      <OrganizationLd />
      <HeroSection />
      <LeaveRequestSection />
      <ServicesSection />
      <AmenitiesSection />
      <BlogSection />
      <ContactSection />
    </Layout>
  );
};

export default Index;
