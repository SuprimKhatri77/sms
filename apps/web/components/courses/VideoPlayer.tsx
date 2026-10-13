"use client";

import { useRef, useState } from "react";
import {
  PauseIcon,
  PlayIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
} from "@phosphor-icons/react/ssr";
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
      <div className="relative aspect-video overflow-hidden bg-surface font-site">
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
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent transition-opacity duration-500"
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
              "absolute inset-0 flex flex-col items-center justify-center gap-4 outline-none transition-opacity duration-500 focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-inset",
              started && playing && "pointer-events-none opacity-0",
            )}
          >
            <span className="grid size-16 place-items-center rounded-full bg-paper text-ink transition-transform duration-500 ease-out-expo group-hover:scale-110">
              {playing ? (
                <PauseIcon weight="fill" className="size-5" />
              ) : (
                <PlayIcon weight="fill" className="ml-0.5 size-5" />
              )}
            </span>
            <span className="hidden font-label text-[0.6875rem] tracking-[0.16em] text-paper uppercase sm:block">
              Watch the program overview
            </span>
          </button>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <span className="grid size-14 place-items-center rounded-full border border-paper/40 text-paper/85">
              <PlayIcon weight="light" className="size-5" />
            </span>
            <p className="font-label text-[0.6875rem] tracking-[0.16em] text-paper/85 uppercase">
              Program overview video coming soon
            </p>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <p className="font-label text-[0.625rem] tracking-[0.14em] text-paper/85 uppercase">
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
                className="grid size-8 place-items-center text-paper/80 outline-none transition-colors hover:text-paper focus-visible:ring-2 focus-visible:ring-clay"
                aria-label={muted ? "Unmute video" : "Mute video"}
              >
                {muted ? (
                  <SpeakerSlashIcon weight="light" className="size-4" />
                ) : (
                  <SpeakerHighIcon weight="light" className="size-4" />
                )}
              </button>
              <button
                type="button"
                onClick={toggle}
                className="font-label text-[0.625rem] tracking-[0.14em] text-paper/90 uppercase outline-none transition-colors hover:text-paper focus-visible:ring-2 focus-visible:ring-clay"
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
