import { cn } from "@/lib/utils";
import { GridPattern } from "@/components/ui/grid-pattern";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FullWidthDivider } from "@/components/full-width-divider";
import { GridFiller } from "@/components/grid-filler";
import {
  landingContainerClass,
  landingSectionBodyClass,
  landingSectionTitleClass,
} from "./landing-styles";

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

export function TestimonialsSection() {
  return (
    <section
      className="bg-(--brand-cream) py-24"
      aria-labelledby="testimonials-heading"
    >
      <div
        className={cn(
          landingContainerClass,
          "mx-auto space-y-8 border-x border-[rgba(47,78,64,0.1)] py-6",
        )}
      >
        <div className="flex flex-col gap-2 px-4 md:px-6">
          <h2 id="testimonials-heading" className={landingSectionTitleClass}>
            What our students say
          </h2>
          <p className={cn(landingSectionBodyClass, "max-w-2xl")}>
            Hear from graduates who trained with us in barista, bakery, and
            hospitality programs.
          </p>
        </div>

        <div
          className="relative grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Student testimonials"
        >
          <FullWidthDivider position="top" />
          {testimonials.map((testimonial) => (
            <TestimonialsCard key={testimonial.name} testimonial={testimonial} />
          ))}
          <GridFiller
            className="bg-background"
            lgColumns={3}
            smColumns={2}
            totalItems={testimonials.length}
          />
          <FullWidthDivider position="bottom" />
        </div>
      </div>
    </section>
  );
}

function TestimonialsCard({
  testimonial,
  className,
  ...props
}: React.ComponentProps<"figure"> & {
  testimonial: Testimonial;
}) {
  const { quote, image, name } = testimonial;
  const testimonialId = `testimonial-${name.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <figure
      id={testimonialId}
      className={cn(
        "relative grid grid-cols-[auto_1fr] gap-x-3 overflow-hidden bg-background p-4",
        className,
      )}
      {...props}
    >
      <div className="mask-[radial-gradient(farthest-side_at_top,white,transparent)] pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 size-full">
        <GridPattern
          className="absolute inset-0 size-full stroke-border"
          height={25}
          width={25}
          x={-12}
          y={4}
        />
      </div>

      <Avatar className="size-8 rounded-full">
        <AvatarImage alt={`${name}'s profile picture`} src={image} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <figcaption className="-mt-0.5 -space-y-0.5">
          <cite className="text-sm not-italic md:text-base">{name}</cite>
          {/* <span className="block font-light text-[11px] text-muted-foreground tracking-tight">
            {role}
            {company && `, ${company}`}
          </span> */}
        </figcaption>
        <blockquote className="mt-3" cite={`#${testimonialId}`}>
          <p className="text-foreground/80 text-sm tracking-wide">{quote}</p>
        </blockquote>
      </div>
    </figure>
  );
}
