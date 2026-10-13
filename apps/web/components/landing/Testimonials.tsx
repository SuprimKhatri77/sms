"use client";

import { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Reveal } from "@/components/motion/reveal";
import { siteButton } from "@/components/site/button";
import { SectionHeading } from "@/components/site/section-heading";

type Testimonial = {
  name: string;
  role: string;
  image: string;
  company?: string;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "I joined with zero café experience. Within weeks I was dialing in espresso, steaming milk properly, and pouring basic latte art. The trainers work in real cafés, so everything they teach actually applies on the bar.",
    image:
      "https://ui-avatars.com/api/?name=Srijana+Thapa&background=2F4E40&color=FBFAF7&size=128",
    name: "Srijana Thapa",
    role: "Barista",
    company: "Café Kalika, Butwal",
  },
  {
    quote:
      "The bakery course is fully hands-on — mixing, proofing, shaping, and baking every day. I left confident enough to handle production shifts at a local bakery, not just follow recipes from a book.",
    image:
      "https://ui-avatars.com/api/?name=Anjali+Gurung&background=C28A4F&color=FBFAF7&size=128",
    name: "Anjali Gurung",
    role: "Bakery Trainee",
    company: "Sweet Crust Bakery",
  },
  {
    quote:
      "Small batch sizes made a huge difference. I got repeated practice on commercial machines and direct feedback every session. That is hard to find at bigger institutes.",
    image:
      "https://ui-avatars.com/api/?name=Nabin+Adhikari&background=2F4E40&color=FBFAF7&size=128",
    name: "Nabin Adhikari",
    role: "Head Barista",
    company: "Bhairahawa",
  },
  {
    quote:
      "Bartending training covered build, stir, and shake techniques along with bar hygiene and service flow. The mock bar setup feels close to a real shift behind the counter.",
    image:
      "https://ui-avatars.com/api/?name=Rajan+KC&background=C28A4F&color=FBFAF7&size=128",
    name: "Rajan KC",
    role: "Bartender",
    company: "Hotel Siddhartha",
  },
  {
    quote:
      "Pastry and bread modules were well structured — from laminated dough to cake finishing. Instructors corrected my technique on the spot, which helped me improve much faster.",
    image:
      "https://ui-avatars.com/api/?name=Sunita+Poudel&background=2F4E40&color=FBFAF7&size=128",
    name: "Sunita Poudel",
    role: "Pastry Assistant",
    company: "Butwal",
  },
  {
    quote:
      "After completing barista training, the academy helped me connect with a café opening in Kalikanagar. I was working within a few weeks of graduation.",
    image:
      "https://ui-avatars.com/api/?name=Bikash+Sharma&background=C28A4F&color=FBFAF7&size=128",
    name: "Bikash Sharma",
    role: "Barista",
    company: "Bean & Leaf Café",
  },
  {
    quote:
      "I came from Bardaghat for the combined barista and bakery program. The schedule was manageable, the environment was friendly, and the skills I gained were immediately useful at work.",
    image:
      "https://ui-avatars.com/api/?name=Menuka+Rana&background=2F4E40&color=FBFAF7&size=128",
    name: "Menuka Rana",
    role: "Café Team Member",
    company: "Bardaghat",
  },
  {
    quote:
      "What stood out was the focus on professional habits — cleanliness, speed, and customer service — not just making coffee look good. That mindset helped me in my hotel interview.",
    image:
      "https://ui-avatars.com/api/?name=Ashish+Bhandari&background=C28A4F&color=FBFAF7&size=128",
    name: "Ashish Bhandari",
    role: "Hospitality Graduate",
    company: "Pokhara",
  },
  {
    quote:
      "The training labs mirror real kitchen and bar conditions. I never felt like I was only watching demos — we were practicing, correcting mistakes, and building muscle memory every class.",
    image:
      "https://ui-avatars.com/api/?name=Pramila+Chaudhary&background=2F4E40&color=FBFAF7&size=128",
    name: "Pramila Chaudhary",
    role: "Barista Graduate",
    company: "Tansen",
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * One large pull quote at a time. Every quote sits in the same grid cell,
 * so the block keeps the height of the longest one and nothing below it
 * jumps when the quote changes.
 */
export function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const count = testimonials.length;
  const go = (next: number) => setIndex((next + count) % count);

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="container-page grid gap-12 py-20 font-site sm:py-28 lg:grid-cols-12 lg:gap-16"
    >
      <Reveal className="flex flex-col lg:col-span-4">
        <SectionHeading
          id="testimonials-heading"
          eyebrow="Student voices"
          title={
            <>
              In their <em>own words.</em>
            </>
          }
          description="Hear from graduates who trained with us in barista, bakery, and hospitality programs."
          className="sm:mb-10"
        />

        <ul
          aria-label="Choose a student"
          className="hidden grid-cols-9 gap-2 sm:grid lg:grid-cols-5"
        >
          {testimonials.map((t, i) => (
            <li key={t.name}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Read ${t.name}'s story`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "rounded-full outline-none transition-[opacity,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                  i === index
                    ? "ring-1 ring-ink ring-offset-2 ring-offset-paper"
                    : "opacity-50 hover:opacity-100",
                )}
              >
                <TestimonialAvatar testimonial={t} />
              </button>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={0.1} className="flex flex-col lg:col-span-8 lg:pt-8">
        <span
          aria-hidden
          className="font-display text-[7rem] leading-[0.6] text-clay"
        >
          &ldquo;
        </span>

        <div className="mt-6 grid">
          {testimonials.map((t, i) => {
            const active = i === index;
            return (
              <figure
                key={t.name}
                aria-hidden={!active}
                className={cn(
                  "col-start-1 row-start-1 transition-[opacity,transform,visibility] duration-700 ease-out-expo motion-reduce:transition-none",
                  active
                    ? "visible translate-y-0 opacity-100"
                    : "invisible translate-y-3 opacity-0",
                )}
              >
                <blockquote className="font-display text-[clamp(1.75rem,3.2vw,3rem)] leading-[1.15] tracking-[-0.01em] text-ink">
                  <p>{t.quote}</p>
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3">
                  <TestimonialAvatar testimonial={t} />
                  <cite className="text-[0.875rem] font-medium text-ink not-italic">
                    {t.name}
                  </cite>
                </figcaption>
              </figure>
            );
          })}
        </div>

        <div className="mt-10 flex items-center gap-5 border-t border-hairline pt-6">
          <p className="font-label text-[0.75rem] tracking-[0.08em] text-ink tabular-nums">
            {pad(index + 1)}
            <span className="mx-1.5 text-ink-muted">/</span>
            <span className="text-ink-muted">{pad(count)}</span>
          </p>
          <p className="sr-only" aria-live="polite">
            Testimonial {index + 1} of {count}, from {testimonials[index].name}
          </p>
          <div className="ml-auto flex gap-1">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous testimonial"
              className={siteButton({ variant: "outline", size: "icon" })}
            >
              <ArrowLeftIcon weight="light" className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next testimonial"
              className={siteButton({ variant: "outline", size: "icon" })}
            >
              <ArrowRightIcon weight="light" className="size-4" />
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function TestimonialAvatar({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Avatar className="size-10 after:hidden">
      <AvatarImage alt="" src={testimonial.image} />
      <AvatarFallback className="bg-surface font-label text-xs text-ink">
        {testimonial.name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
}
