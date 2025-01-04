"use client";

import Plyr from "plyr";
import "plyr/dist/plyr.css";
import { useEffect, useRef } from "react";

interface VideoPlayerProps {
  src: string;
}

export default function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const player = new Plyr(videoRef.current, {
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "duration",
        "mute",
        "volume",
        "fullscreen",
      ],
      keyboard: { focused: true, global: true },
    });

    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      if (e.key === "ArrowLeft") {
        videoRef.current.currentTime = Math.max(
          0,
          videoRef.current.currentTime - 5
        );
      } else if (e.key === "ArrowRight") {
        videoRef.current.currentTime = Math.min(
          videoRef.current.duration,
          videoRef.current.currentTime + 5
        );
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      player.destroy();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="w-full aspect-video"
      controls
      crossOrigin="anonymous"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
