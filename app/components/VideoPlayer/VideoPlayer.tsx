"use client"

import { VideoPlayerProps } from "@/app/types/player"
import { RegularPlayer } from "./RegularPlayer"
import { HLSPlayer } from "./HLSPlayer"

export default function VideoPlayer({ src, isHls = false }: VideoPlayerProps) {
    if (isHls) {
        return <HLSPlayer src={src} />
    }

    return <RegularPlayer src={src} />
}
