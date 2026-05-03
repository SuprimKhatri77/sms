"use client";

import { useRef, useState } from "react";
import { PlayCircle, Pause } from "lucide-react";
import type { CourseDetail } from "@/utils/mock";

interface VideoPlayerProps {
  course: CourseDetail;
}

export function VideoPlayer({ course }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false); // hides overlay once play begins

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setPlaying(true);
      setStarted(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-black"
      style={{ aspectRatio: "16/9" }}
    >
      {/*
        <video> is the correct element for playable media.

        poster         → Unsplash image shown before the user hits play.
                         Once you have a real video src, swap the src prop.
                         The poster will still work as the thumbnail.

        playsInline    → Prevents iOS from forcing fullscreen on play.
        preload="none" → Don't download anything until the user interacts.
        src            → Replace this with your actual video URL.
                         e.g. src="/videos/barista-overview.mp4"
                         or   src="https://your-cdn.com/barista.mp4"
      */}
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        poster={course.videoPlaceholder}
        playsInline
        preload="none"
        onEnded={() => {
          setPlaying(false);
          setStarted(false);
        }}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        // ↓ swap for real src when you have it
        src="https://www.pexels.com/download/video/35314714/"
        aria-label={`${course.course} program overview video`}
      />

      {/* Dark overlay — fades out once video is playing */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity duration-300"
        style={{ opacity: started && playing ? 0 : 1, pointerEvents: "none" }}
      />

      {/* Play / Pause button overlay */}
      <button
        type="button"
        onClick={toggle}
        aria-label={
          playing
            ? `Pause ${course.course} video`
            : `Play ${course.course} program overview`
        }
        className="absolute inset-0 flex flex-col items-center justify-center gap-4 focus-visible:outline focus-visible:outline-white"
        style={{ opacity: started && playing ? 0 : 1 }}
        // Keep accessible even when visually hidden
        tabIndex={0}
      >
        <div className="flex h-18 w-18 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm ring-2 ring-white/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/25">
          {playing ? (
            <Pause className="h-9 w-9 text-white" strokeWidth={1.5} />
          ) : (
            <PlayCircle className="h-10 w-10 text-white" strokeWidth={1.5} />
          )}
        </div>
        {!started && (
          <p className="text-[0.85rem] font-semibold tracking-wide text-white/80">
            Watch Program Overview
          </p>
        )}
      </button>

      {/* Duration badge */}
      <span className="pointer-events-none absolute bottom-5 right-5 rounded-lg bg-black/60 px-3 py-1.5 text-[0.78rem] font-semibold text-white/90 backdrop-blur-sm">
        {course.duration} Program
      </span>
    </div>
  );
}
