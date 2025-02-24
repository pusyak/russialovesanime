"use client"

import { VideoPlayerProps } from "@/app/types/player"
import { RegularPlayer } from "./RegularPlayer"
import { HLSPlayer } from "./HLSPlayer"
import { useVideoProgress } from "@/app/hooks/useVideoProgress"
import { useParams } from "next/navigation"

export default function VideoPlayer({ src, isHls = false, videoRef }: VideoPlayerProps) {
    const params = useParams()
    const title = decodeURIComponent(params.title as string)
    const episode = decodeURIComponent(params.episode as string)

    useVideoProgress({
        videoRef,
        title,
        episode
    })

    if (isHls) {
        return (
            <HLSPlayer
                src={src}
                videoRef={videoRef}
            />
        )
    }

    return (
        <RegularPlayer
            src={src}
            videoRef={videoRef}
        />
    )
}
