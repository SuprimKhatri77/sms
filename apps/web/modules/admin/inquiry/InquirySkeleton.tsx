"use client";

export default function InquiryListSkeleton() {
  return (
    <div className="overflow-hidden border border-[rgba(47,78,64,0.18)] bg-white">
      <div className="border-b border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.04)] px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-3 w-20 animate-pulse bg-[rgba(47,78,64,0.08)]"
            />
          ))}
        </div>
      </div>
      {Array.from({ length: 6 }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 border-b border-[rgba(47,78,64,0.08)] px-4 py-4 last:border-b-0"
        >
          <div className="h-8 w-8 shrink-0 animate-pulse bg-[rgba(47,78,64,0.06)]" />
          <div className="h-4 flex-1 animate-pulse bg-[rgba(47,78,64,0.06)]" />
          <div className="h-4 w-24 animate-pulse bg-[rgba(47,78,64,0.06)]" />
          <div className="h-6 w-16 animate-pulse bg-[rgba(47,78,64,0.06)]" />
          <div className="h-8 w-16 animate-pulse bg-[rgba(47,78,64,0.06)]" />
        </div>
      ))}
    </div>
  );
}
