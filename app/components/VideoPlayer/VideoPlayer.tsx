"use client"

import { useRef, useEffect } from "react"
import Plyr from "plyr"
import "plyr/dist/plyr.css"

import { VideoPlayerProps } from "./types"
import { useHls } from "../../hooks/useHls"
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts"
import { BASE_PLYR_CONFIG } from "./config"

function RegularPlayer({ src }: { src: string }) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const playerRef = useRef<Plyr>(null)
    useKeyboardShortcuts(videoRef)

    useEffect(() => {
        if (!videoRef.current) return

        playerRef.current = new Plyr(videoRef.current, BASE_PLYR_CONFIG)
    }, [])

    return (
        <video
            ref={videoRef}
            className="w-full aspect-video max-h-[calc(100vh-theme(spacing.24))]"
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
    useHls(videoRef, src)
    useKeyboardShortcuts(videoRef)

    return (
        <video
            ref={videoRef}
            className="w-full aspect-video max-h-[calc(100vh-theme(spacing.24))]"
        />
    )
}

export default function VideoPlayer({ src, isHls = false }: VideoPlayerProps) {
    return isHls ? <HLSPlayer src={src} /> : <RegularPlayer src={src} />
}
