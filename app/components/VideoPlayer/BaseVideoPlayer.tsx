"use client"

import { useFullscreenState } from "../../hooks/useFullscreenState"
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts"
import { ReactNode } from "react"

interface BaseVideoPlayerProps {
    videoRef: React.RefObject<HTMLVideoElement | null>
    children?: ReactNode
}

export function BaseVideoPlayer({ videoRef, children }: BaseVideoPlayerProps) {
    const isFullscreen = useFullscreenState()
    useKeyboardShortcuts(videoRef)

    return (
        <video
            ref={videoRef}
            className={`w-full aspect-video ${!isFullscreen ? "max-h-[calc(100vh-theme(spacing.24))]" : ""}`}
        >
            {children}
        </video>
    )
}
