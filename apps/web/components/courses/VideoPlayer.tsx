"use client";

import { useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CourseDetail } from "@/utils/mock";

interface VideoPlayerProps {
  course: Pick<CourseDetail, "course" | "duration" | "videoPlaceholder" | "videoSrc">;
  className?: string;
}

export function VideoPlayer({ course, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(true);

  const hasVideo = Boolean(course.videoSrc);

  const toggle = async () => {
    const video = videoRef.current;
    if (!video || !hasVideo) return;

    if (video.paused) {
      try {
        await video.play();
        setPlaying(true);
        setStarted(true);
      } catch {
        setPlaying(false);
      }
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <div className={cn("group relative", className)}>
      <div
        className="relative overflow-hidden border border-[rgba(47,78,64,0.12)] bg-[rgba(47,78,64,0.06)]"
        style={{ aspectRatio: "16/9" }}
      >
        {hasVideo ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            poster={course.videoPlaceholder}
            playsInline
            muted={muted}
            preload="metadata"
            onEnded={() => {
              setPlaying(false);
              setStarted(false);
            }}
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
            src={course.videoSrc}
            aria-label={`${course.course} program overview video`}
          />
        ) : (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${course.videoPlaceholder})` }}
            role="img"
            aria-label={`${course.course} program preview`}
          />
        )}

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(26,26,26,0.55)] via-[rgba(26,26,26,0.08)] to-transparent transition-opacity duration-300"
          style={{ opacity: started && playing ? 0.35 : 1 }}
        />

        {hasVideo ? (
          <button
            type="button"
            onClick={toggle}
            aria-label={
              playing
                ? `Pause ${course.course} video`
                : `Play ${course.course} program overview`
            }
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-3 transition-opacity duration-300",
              started && playing && "pointer-events-none opacity-0",
            )}
          >
            <span className="grid h-16 w-16 place-items-center border border-[rgba(255,255,255,0.35)] bg-[rgba(255,255,255,0.12)] text-white backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
              {playing ? (
                <Pause size={28} strokeWidth={1.75} />
              ) : (
                <Play size={28} strokeWidth={1.75} className="ml-0.5" />
              )}
            </span>
            <span className="font-[family-name:var(--font-dm-sans)] text-[0.85rem] font-semibold tracking-wide text-white/90">
              Watch Program Overview
            </span>
          </button>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <span className="grid h-14 w-14 place-items-center border border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.1)] text-white/80">
              <Play size={24} strokeWidth={1.75} />
            </span>
            <p className="font-[family-name:var(--font-dm-sans)] text-sm font-medium text-white/85">
              Program overview video coming soon
            </p>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-3 border-t border-[rgba(255,255,255,0.12)] bg-[rgba(26,26,26,0.55)] px-4 py-3 backdrop-blur-sm">
          <p className="font-[family-name:var(--font-dm-sans)] text-[0.78rem] font-medium text-white/85">
            {course.course} · {course.duration}
          </p>
          {hasVideo ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const video = videoRef.current;
                  if (!video) return;
                  video.muted = !video.muted;
                  setMuted(video.muted);
                }}
                className="grid h-8 w-8 place-items-center text-white/80 transition-colors hover:text-white"
                aria-label={muted ? "Unmute video" : "Mute video"}
              >
                {muted ? (
                  <VolumeX size={16} strokeWidth={2} />
                ) : (
                  <Volume2 size={16} strokeWidth={2} />
                )}
              </button>
              <button
                type="button"
                onClick={toggle}
                className="font-[family-name:var(--font-dm-sans)] text-[0.75rem] font-semibold uppercase tracking-wide text-white/90 transition-colors hover:text-white"
              >
                {playing ? "Pause" : "Play"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
