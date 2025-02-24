"use client"

import { useHls } from "../../hooks/useHls"
import { BaseVideoPlayer } from "./BaseVideoPlayer"

interface HLSPlayerProps {
    src: string
    videoRef: React.RefObject<HTMLVideoElement | null>
}

export function HLSPlayer({ src, videoRef }: HLSPlayerProps) {
    useHls(videoRef, src)
    return <BaseVideoPlayer videoRef={videoRef} />
}
