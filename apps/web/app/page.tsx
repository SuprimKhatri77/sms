import ImageGallery from "@/components/image-gallery";
import ClosingCta from "@/components/landing/ClosingCta";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import InquiryForm from "@/components/landing/InquiryForm";
import Mentors from "@/components/landing/Mentors";
// Industry Network section hidden for now — restore with the <OurPartners /> line below.
// import OurPartners from "@/components/landing/OurPartners";
import Programs from "@/components/landing/Programs";
import StoryBand from "@/components/landing/StoryBand";
import { TestimonialsSection } from "@/components/landing/Testimonials";
import WhyUs from "@/components/landing/Whyus";
import { JsonLd } from "@/components/seo/json-ld";
import {
  createOrganizationJsonLd,
  createWebsiteJsonLd,
  homeMetadata,
} from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = homeMetadata;

export default function Home() {
  return (
    <main id="main-content">
      <JsonLd data={[createOrganizationJsonLd(), createWebsiteJsonLd()]} />
      <Hero />
      <Programs />
      <WhyUs />
      <Mentors />
      <HowItWorks />
      <StoryBand />
      <ImageGallery />
      <TestimonialsSection />
      {/* <OurPartners /> */}
      <InquiryForm />
      <ClosingCta />
    </main>
  );
}
