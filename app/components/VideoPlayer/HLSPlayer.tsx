"use client"

import { useHls } from "../../hooks/useHls"
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts"
import { useFullscreenState } from "../../hooks/useFullscreenState"

interface HLSPlayerProps {
    src: string
    videoRef: React.RefObject<HTMLVideoElement | null>
}

export function HLSPlayer({ src, videoRef }: HLSPlayerProps) {
    const isFullscreen = useFullscreenState()
    useHls(videoRef, src)
    useKeyboardShortcuts(videoRef)

    return (
        <video
            ref={videoRef}
            className={`w-full aspect-video ${!isFullscreen ? "max-h-[calc(100vh-theme(spacing.24))]" : ""}`}
        />
    )
}
