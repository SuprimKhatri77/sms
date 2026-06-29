import Image from "next/image";
import { Status, STATUS_META } from "./StudentDetail";
import { cn } from "@/lib/utils";

export function StudentAvatar({
  imageUrl,
  fullName,
  status,
}: {
  imageUrl?: string | null;
  fullName: string;
  status: Status;
}) {
  const meta = STATUS_META[status];
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative w-fit shrink-0 self-start">
      <div
        className={cn(
          "relative h-20 w-20 overflow-hidden rounded-full border-2 border-white ring-2 ring-offset-2 ring-offset-white sm:h-24 sm:w-24",
          meta.ringClass,
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={fullName}
            fill
            sizes="96px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[rgba(47,78,64,0.08)]">
            <span className="font-[family-name:var(--font-lora)] text-xl font-bold text-(--brand-green)">
              {initials}
            </span>
          </div>
        )}
      </div>
      <span
        className={cn(
          "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white",
          meta.dotClass,
        )}
      />
    </div>
  );
}
