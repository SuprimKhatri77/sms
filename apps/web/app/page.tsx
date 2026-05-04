"use client";

import ImageGallery from "@/components/image-gallery";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import InquiryForm from "@/components/landing/InquiryForm";
import OurPartners from "@/components/landing/OurPartners";
import Programs from "@/components/landing/Programs";
import { TestimonialsSection } from "@/components/landing/Testimonials";
import WhyUs from "@/components/landing/Whyus";

export default function Home() {
  return (
    <main>
      <Hero />
      <WhyUs />
      <Programs />
      <HowItWorks />
      <ImageGallery />
      <TestimonialsSection />
      <OurPartners />
      <InquiryForm />
    </main>
  );
}
