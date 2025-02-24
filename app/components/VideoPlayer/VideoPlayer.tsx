"use client"

import { useRef, useEffect } from "react"
import Plyr from "plyr"
import "plyr/dist/plyr.css"

import { VideoPlayerProps } from "./types"
import { useHls } from "../../hooks/useHls"
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts"
import { useFullscreenState } from "../../hooks/useFullscreenState"
import { BASE_PLYR_CONFIG } from "./config"

function RegularPlayer({ src }: { src: string }) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const playerRef = useRef<Plyr>(null)
    const isFullscreen = useFullscreenState()
    useKeyboardShortcuts(videoRef)

    useEffect(() => {
        if (!videoRef.current) return

        playerRef.current = new Plyr(videoRef.current, BASE_PLYR_CONFIG)
    }, [])

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

function HLSPlayer({ src }: { src: string }) {
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

export default function VideoPlayer({ src, isHls = false }: VideoPlayerProps) {
    if (isHls) {
        return <HLSPlayer src={src} />
    }

    return <RegularPlayer src={src} />
}
