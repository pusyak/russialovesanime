"use client"

import { useRef } from "react"

import { useHls } from "../../hooks/useHls"
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts"
import { useFullscreenState } from "../../hooks/useFullscreenState"

interface HLSPlayerProps {
    src: string
}

export function HLSPlayer({ src }: HLSPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
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
