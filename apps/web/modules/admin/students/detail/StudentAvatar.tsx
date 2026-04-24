import Image from "next/image";
import { Status, STATUS_META } from "./StudentDetail";

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
    <div className="relative shrink-0">
      {/* Avatar circle */}
      <div
        className={`relative h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-[#f4f1ec] ${meta.ringClass}`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={fullName}
            fill
            sizes="(max-width: 640px) 56px, 64px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#2d4a3e]/10">
            <span
              className="text-[1rem] font-bold text-[#2d4a3e]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {initials}
            </span>
          </div>
        )}
      </div>
      {/* Status dot badge */}
      <span
        className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-[#f4f1ec] ${meta.dotClass}`}
      />
    </div>
  );
}
