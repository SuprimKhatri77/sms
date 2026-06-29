import { accountingTableWrapClass } from "../shared/accounting-styles";

export function BankSkeleton() {
  return (
    <div className={`${accountingTableWrapClass} animate-pulse`}>
      <div className="border-b border-[rgba(47,78,64,0.08)] px-5 py-3.5">
        <div className="flex gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 w-20 bg-[rgba(47,78,64,0.08)]" />
          ))}
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-8 border-b border-[rgba(47,78,64,0.06)] px-5 py-4 last:border-0"
        >
          <div className="h-4 w-40 bg-[rgba(47,78,64,0.08)]" />
          <div className="h-[22px] w-10 rounded-full bg-[rgba(47,78,64,0.08)]" />
          <div className="h-4 w-24 bg-[rgba(47,78,64,0.06)]" />
          <div className="ml-auto flex gap-2">
            <div className="h-8 w-8 bg-[rgba(47,78,64,0.06)]" />
            <div className="h-8 w-8 bg-[rgba(47,78,64,0.06)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
