"use client";

import { m } from "motion/react";
import { EASE_OUT } from "@/lib/motion";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/site/section-heading";

const steps = [
  {
    title: "Send an inquiry",
    description:
      "Fill out our inquiry form with your details and questions. Our team will respond within 24 hours.",
  },
  {
    title: "Submit your application",
    description:
      "Complete the online admission form with your details and preferred training program.",
  },
  {
    title: "Admissions review",
    description:
      "Our admissions team reviews your application and confirms the next steps.",
  },
  {
    title: "Welcome aboard",
    description:
      "Once approved, receive your confirmation and begin your training journey with us.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="bg-pine py-20 font-site text-paper sm:py-28"
    >
      <div className="container-page">
        <Reveal>
          <SectionHeading
            id="how-it-works-heading"
            tone="light"
            eyebrow="The process"
            title={
              <>
                How enrollment <em>works.</em>
              </>
            }
            description="We've kept admissions straightforward and transparent — so you can focus on choosing the right program."
          />
        </Reveal>

        <div className="relative">
          {/* A line that draws across the steps as they come into view. */}
          <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/15">
            <m.div
              className="h-full origin-left bg-clay"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "0px 0px -12% 0px" }}
              transition={{ duration: 1.6, ease: EASE_OUT, delay: 0.2 }}
            />
          </div>

          <Stagger
            gap={0.12}
            delay={0.2}
            className="grid sm:grid-cols-2 lg:grid-cols-4"
          >
            {steps.map((step, i) => (
              <StaggerItem
                key={step.title}
                className="border-white/15 pt-8 pb-10 not-first:border-t sm:not-first:border-t-0 sm:nth-[n+3]:border-t sm:odd:border-r sm:odd:pr-8 sm:even:pl-8 lg:nth-[n+3]:border-t-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0"
              >
                <p
                  aria-hidden
                  className="font-label text-5xl font-light tracking-[-0.04em] text-clay"
                >
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-10 font-display text-3xl leading-tight text-paper">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xs text-[0.875rem] leading-relaxed text-paper/70">
                  {step.description}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
