import ImageGallery from "@/components/image-gallery";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import InquiryForm from "@/components/landing/InquiryForm";
import OurPartners from "@/components/landing/OurPartners";
import Programs from "@/components/landing/Programs";
import ProgramLoadingSkeleton from "@/components/landing/programs/ProgramLoadingSkeleton";
import { TestimonialsSection } from "@/components/landing/Testimonials";
import WhyUs from "@/components/landing/Whyus";
import { JsonLd } from "@/components/seo/json-ld";
import {
  createOrganizationJsonLd,
  createWebsiteJsonLd,
  homeMetadata,
} from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = homeMetadata;

export default function Home() {
  return (
    <main id="main-content">
      <JsonLd
        data={[createOrganizationJsonLd(), createWebsiteJsonLd()]}
      />
      <Hero />
      <Suspense fallback={<ProgramLoadingSkeleton />}>
        <Programs />
      </Suspense>
      <WhyUs />
      <HowItWorks />
      <ImageGallery />
      <TestimonialsSection />
      <OurPartners />
      <InquiryForm />
    </main>
  );
}
