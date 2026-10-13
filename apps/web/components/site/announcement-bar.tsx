import { siteInfo } from "@/utils/site-info";

/**
 * A slow ticker of academy notices; static for reduced-motion users. It
 * pauses on hover, and a checkbox toggle (no client script) stops it for
 * good, since moving content must be pausable.
 */
export function AnnouncementBar() {
  const notices = [
    ...siteInfo.announcement,
    `WhatsApp ${siteInfo.contact.phone}`,
  ];
  // Two copies side by side make the -50% marquee loop seamless.
  const items = [...notices, ...notices];
  return (
    <div className="group/ticker relative overflow-hidden bg-pine text-paper">
      <p className="sr-only">{notices.join(". ")}</p>
      <div
        aria-hidden
        className="animate-marquee flex w-max group-hover/ticker:[animation-play-state:paused] group-has-checked/ticker:[animation-play-state:paused]"
      >
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0">
            {items.map((text, i) => (
              <li
                key={`${copy}-${i}`}
                className="flex h-9 items-center px-8 font-label text-[0.6875rem] tracking-[0.14em] uppercase"
              >
                {text}
                <span className="ml-16 text-clay">✦</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
      <label className="absolute inset-y-0 right-0 flex w-9 cursor-pointer items-center justify-center bg-pine has-focus-visible:ring-2 has-focus-visible:ring-clay motion-reduce:hidden">
        <input type="checkbox" className="peer sr-only" />
        <span className="sr-only">Pause the announcements</span>
        <span aria-hidden className="flex gap-[3px] opacity-60 peer-checked:hidden">
          <span className="h-2.5 w-[2px] bg-current" />
          <span className="h-2.5 w-[2px] bg-current" />
        </span>
        <span
          aria-hidden
          className="hidden size-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-current opacity-60 peer-checked:block"
        />
      </label>
    </div>
  );
}
