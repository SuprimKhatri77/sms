"use client";

import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import InquiryForm from "@/components/landing/InquiryForm";
import Programs from "@/components/landing/Programs";
import WhyUs from "@/components/landing/Whyus";

export default function Home() {
  return (
    <main>
      <Hero />
      <WhyUs />
      <Programs />
      <HowItWorks />
      <InquiryForm />
    </main>
  );
}
