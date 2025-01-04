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
    });

    return () => {
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
