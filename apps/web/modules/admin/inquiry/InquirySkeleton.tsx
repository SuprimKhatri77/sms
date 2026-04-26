"use client";

export default function InquirySkeleton() {
  return (
    <div className="w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div
            className="h-8 w-48 rounded-lg mb-2"
            style={{ backgroundColor: "#d6cbb8", opacity: 0.5 }}
          />
          <div
            className="h-4 w-64 rounded"
            style={{ backgroundColor: "#d6cbb8", opacity: 0.35 }}
          />
        </div>
        <div className="flex gap-3">
          <div
            className="h-10 w-28 rounded-xl"
            style={{ backgroundColor: "#d6cbb8", opacity: 0.4 }}
          />
          <div
            className="h-10 w-32 rounded-xl"
            style={{ backgroundColor: "#d6cbb8", opacity: 0.4 }}
          />
        </div>
      </div>

      {/* Stats Row Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 flex flex-col gap-3"
            style={{ backgroundColor: "#d6cbb8", opacity: 0.25 }}
          >
            <div
              className="h-3 w-16 rounded"
              style={{ backgroundColor: "#6b9e6b", opacity: 0.3 }}
            />
            <div
              className="h-8 w-12 rounded-lg"
              style={{ backgroundColor: "#2d4a3e", opacity: 0.2 }}
            />
          </div>
        ))}
      </div>

      {/* Filter Bar Skeleton */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-9 rounded-full"
            style={{
              width: `${60 + i * 14}px`,
              backgroundColor: "#d6cbb8",
              opacity: 0.35,
            }}
          />
        ))}
        <div
          className="ml-auto h-9 w-48 rounded-xl"
          style={{ backgroundColor: "#d6cbb8", opacity: 0.35 }}
        />
      </div>

      {/* Table Skeleton */}
      <div
        className="rounded-2xl overflow-hidden border"
        style={{ borderColor: "#d6cbb8" }}
      >
        {/* Table Header */}
        <div
          className="grid grid-cols-12 gap-4 px-6 py-4"
          style={{ backgroundColor: "#2d4a3e", opacity: 0.08 }}
        >
          {[3, 2, 2, 2, 1, 2].map((cols, i) => (
            <div
              key={i}
              className={`col-span-${cols} h-3 rounded`}
              style={{ backgroundColor: "#2d4a3e", opacity: 0.3 }}
            />
          ))}
        </div>

        {/* Table Rows */}
        {[...Array(6)].map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-12 gap-4 px-6 py-5 border-t"
            style={{
              borderColor: "#d6cbb8",
              backgroundColor: rowIndex % 2 === 0 ? "transparent" : "#d6cbb824",
            }}
          >
            {/* Name + avatar */}
            <div className="col-span-3 flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex-shrink-0"
                style={{ backgroundColor: "#d6cbb8", opacity: 0.5 }}
              />
              <div className="flex flex-col gap-1.5 flex-1">
                <div
                  className="h-3.5 w-28 rounded"
                  style={{ backgroundColor: "#d6cbb8", opacity: 0.55 }}
                />
                <div
                  className="h-2.5 w-20 rounded"
                  style={{ backgroundColor: "#d6cbb8", opacity: 0.35 }}
                />
              </div>
            </div>
            {/* Phone */}
            <div className="col-span-2 flex items-center">
              <div
                className="h-3 w-24 rounded"
                style={{ backgroundColor: "#d6cbb8", opacity: 0.4 }}
              />
            </div>
            {/* Source */}
            <div className="col-span-2 flex items-center">
              <div
                className="h-6 w-16 rounded-full"
                style={{ backgroundColor: "#d6cbb8", opacity: 0.4 }}
              />
            </div>
            {/* Message snippet */}
            <div className="col-span-2 flex items-center">
              <div
                className="h-3 w-full rounded"
                style={{ backgroundColor: "#d6cbb8", opacity: 0.35 }}
              />
            </div>
            {/* Status */}
            <div className="col-span-1 flex items-center">
              <div
                className="h-6 w-14 rounded-full"
                style={{ backgroundColor: "#d6cbb8", opacity: 0.4 }}
              />
            </div>
            {/* Actions */}
            <div className="col-span-2 flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-lg"
                style={{ backgroundColor: "#d6cbb8", opacity: 0.4 }}
              />
              <div
                className="h-8 w-8 rounded-lg"
                style={{ backgroundColor: "#d6cbb8", opacity: 0.4 }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between mt-6">
        <div
          className="h-4 w-36 rounded"
          style={{ backgroundColor: "#d6cbb8", opacity: 0.4 }}
        />
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-9 w-9 rounded-lg"
              style={{
                backgroundColor: "#d6cbb8",
                opacity: i === 1 ? 0.7 : 0.35,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
