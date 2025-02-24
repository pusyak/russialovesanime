"use client"

import { useEffect, useRef } from "react"
import Plyr from "plyr"
import { BASE_PLYR_CONFIG } from "../utils/video"

export function usePlyr(videoRef: React.RefObject<HTMLVideoElement | null>, src: string) {
    const playerRef = useRef<Plyr | null>(null)

    useEffect(() => {
        if (!videoRef.current) return

        playerRef.current = new Plyr(videoRef.current, BASE_PLYR_CONFIG)
    }, [src, videoRef])

    return { playerRef }
}
