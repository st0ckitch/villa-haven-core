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
 *   2. Services / project cards
 *   3. Amenities marquee
 *   4. Blog teasers
 *   5. Gallery
 *   6. Plot map
 *   7. Leave-request strip ("Interested in our project? Order a call.")
 *      ← moved 2026-05-31: visitor sees the strip AFTER they've explored
 *        the plots, when intent is higher — more likely to convert. Used
 *        to be right under the hero where it interrupted discovery.
 *   8. Contact CTA ("Get in touch") — stays right above the footer so
 *      it's the last conversion surface before the visitor leaves.
 */
const Index = () => {
  return (
    <Layout>
      <SEO title="Luxury Villas" />
      <OrganizationLd />
      <HeroSection />
      <ServicesSection />
      <AmenitiesSection />
      <BlogSection />
      <GallerySection />
      <HomePlotMapSection />
      <LeaveRequestSection />
      <ContactSection />
    </Layout>
  );
};

export default Index;
