interface UserAvatarProps {
  name: string;
  imageUrl: string | null;
  size?: "sm" | "lg";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserAvatar({ name, imageUrl, size = "sm" }: UserAvatarProps) {
  const sizeClasses =
    size === "lg" ? "w-20 h-20 text-2xl border-2" : "w-8 h-8 text-xs border";

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={`${name}&apos;s avatar`}
        className={`${sizeClasses} border-[rgba(47,78,64,0.25)] object-cover rounded-none`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} flex shrink-0 items-center justify-center rounded-none border-[rgba(47,78,64,0.25)] bg-[rgba(47,78,64,0.08)] font-mono font-bold text-(--brand-green)`}
      aria-label={`Avatar placeholder for ${name}`}
    >
      {getInitials(name)}
    </div>
  );
}
