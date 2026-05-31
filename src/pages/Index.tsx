import { Layout } from "@/components/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { LeaveRequestSection } from "@/components/home/LeaveRequestSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { AmenitiesSection } from "@/components/home/AmenitiesSection";
import { BlogSection } from "@/components/home/BlogSection";
import { GallerySection } from "@/components/home/GallerySection";
import { HomePlotMapSection } from "@/components/home/HomePlotMapSection";
import { ContactSection } from "@/components/home/ContactSection";
import { SEO } from "@/components/SEO";
import { OrganizationLd } from "@/components/JsonLd";

/**
 * Homepage section order (top → bottom):
 *   1. Hero
 *   2. Leave-request strip
 *   3. Services / project cards
 *   4. Amenities marquee
 *   5. Blog teasers
 *   6. Gallery
 *   7. Plot map  ← added 2026-05-31: lets visitors start the villa picker
 *                  without first navigating to /site-plan
 *   8. Contact CTA ("Interested in our project?")  ← stays right above
 *                  the footer so it's the last thing visible before
 *                  the visitor leaves.
 */
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
      <GallerySection />
      <HomePlotMapSection />
      <ContactSection />
    </Layout>
  );
};

export default Index;
