"use client"

import Plyr from "plyr"
import "plyr/dist/plyr.css"
import { useEffect, useRef } from "react"
import Hls from "hls.js"

interface VideoPlayerProps {
    src: string
    isHls?: boolean
}

export default function VideoPlayer({ src, isHls = false }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const playerRef = useRef<Plyr | null>(null)
    const hlsRef = useRef<Hls | null>(null)

    useEffect(() => {
        if (!videoRef.current) return

        const video = videoRef.current
        const initPlayer = () => {
            if (playerRef.current) {
                playerRef.current.destroy()
            }

            if (isHls && Hls.isSupported()) {
                hlsRef.current = new Hls()
                hlsRef.current.loadSource(src)
                hlsRef.current.attachMedia(video)
            }

            playerRef.current = new Plyr(video, {
                controls: ["play-large", "play", "progress", "current-time", "duration", "mute", "volume", "settings", "fullscreen"],
                settings: ["quality"],
                keyboard: { focused: false, global: false }
            })

            if (isHls && hlsRef.current) {
                hlsRef.current.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
                    const availableQualities = data.levels.map((l) => ({
                        label: `${l.height}p`,
                        value: l.height
                    }))
                    const defaultQuality = availableQualities[availableQualities.length - 1].value

                    if (playerRef.current) {
                        // @ts-expect-error - plyr types are not perfect with quality
                        playerRef.current.quality = availableQualities
                        playerRef.current.quality = defaultQuality
                    }
                })
            }
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
            if (hlsRef.current) {
                hlsRef.current.destroy()
            }
        }
    }, [src, isHls])

    return (
        <video
            ref={videoRef}
            className="w-full aspect-video max-h-[calc(100vh-theme(spacing.24))]"
            controls
            crossOrigin="anonymous"
        >
            <source
                src={src}
                type={isHls ? "application/x-mpegURL" : "video/mp4"}
            />
        </video>
    )
}
