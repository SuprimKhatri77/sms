import { CourseDetail } from "@/utils/mock";
import { PlayCircle } from "lucide-react";

export function VideoPlayer({ course }: { course: CourseDetail }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl"
      style={{ aspectRatio: "16/9" }}
    >
      {/* Poster image (replace src with actual video later) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={course.videoPlaceholder}
        alt={`${course.course} program preview`}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:bg-black/50" />

      {/* Play button */}
      <button
        type="button"
        aria-label={`Play ${course.course} program video`}
        className="absolute inset-0 flex flex-col items-center justify-center gap-4 focus-visible:outline focus-visible:outline-white"
      >
        <div className="flex h-18 w-18 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm ring-2 ring-white/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/25">
          <PlayCircle className="h-10 w-10 text-white" strokeWidth={1.5} />
        </div>
        <p className="text-[0.85rem] font-semibold tracking-wide text-white/80">
          Watch Program Overview
        </p>
      </button>

      {/* Duration badge */}
      <span className="absolute bottom-5 right-5 rounded-lg bg-black/60 px-3 py-1.5 text-[0.78rem] font-semibold text-white/90 backdrop-blur-sm">
        {course.duration} Program
      </span>
    </div>
  );
}
