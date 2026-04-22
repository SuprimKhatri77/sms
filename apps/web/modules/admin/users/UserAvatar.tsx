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
        className={`${sizeClasses} border-black object-cover rounded-none`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} border-black bg-zinc-100 flex items-center justify-center font-mono font-bold text-black rounded-none flex-shrink-0`}
      aria-label={`Avatar placeholder for ${name}`}
    >
      {getInitials(name)}
    </div>
  );
}
