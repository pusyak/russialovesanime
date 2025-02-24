"use client"

import { useRef, useEffect } from "react"
import Plyr from "plyr"
import "plyr/dist/plyr.css"

import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts"
import { useFullscreenState } from "../../hooks/useFullscreenState"
import { BASE_PLYR_CONFIG } from "@/app/utils/video"

interface RegularPlayerProps {
    src: string
    videoRef: React.RefObject<HTMLVideoElement | null>
}

export function RegularPlayer({ src, videoRef }: RegularPlayerProps) {
    const playerRef = useRef<Plyr>(null)
    const isFullscreen = useFullscreenState()
    useKeyboardShortcuts(videoRef)

    useEffect(() => {
        if (!videoRef.current) return

        playerRef.current = new Plyr(videoRef.current, BASE_PLYR_CONFIG)
    })

    return (
        <video
            ref={videoRef}
            className={`w-full aspect-video ${!isFullscreen ? "max-h-[calc(100vh-theme(spacing.24))]" : ""}`}
        >
            <source
                src={src}
                type="video/mp4"
            />
        </video>
    )
}
