"use client"

import Plyr from "plyr"
import "plyr/dist/plyr.css"
import { useEffect, useRef } from "react"

interface VideoPlayerProps {
    src: string
}

export default function VideoPlayer({ src }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const playerRef = useRef<Plyr | null>(null)

    useEffect(() => {
        if (!videoRef.current) return

        const video = videoRef.current
        const initPlayer = () => {
            if (playerRef.current) {
                playerRef.current.destroy()
            }

            playerRef.current = new Plyr(video, {
                controls: ["play-large", "play", "progress", "current-time", "duration", "mute", "volume", "fullscreen"],
                keyboard: { focused: false, global: false }
            })
        }

        const handleKeyPress = (e: KeyboardEvent) => {
            if (!videoRef.current) return

            if (e.key === "ArrowLeft") {
                e.preventDefault()
                videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5)
            } else if (e.key === "ArrowRight") {
                e.preventDefault()
                videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 5)
            }
        }

        videoRef.current.addEventListener("loadedmetadata", initPlayer)
        document.addEventListener("keydown", handleKeyPress)

        return () => {
            document.removeEventListener("keydown", handleKeyPress)
            video.removeEventListener("loadedmetadata", initPlayer)
            if (playerRef.current) {
                playerRef.current.destroy()
            }
        }
    }, [src])

    return (
        <video
            ref={videoRef}
            className="w-full aspect-video"
            controls
            crossOrigin="anonymous"
        >
            <source
                src={src}
                type="video/mp4"
            />
        </video>
    )
}
