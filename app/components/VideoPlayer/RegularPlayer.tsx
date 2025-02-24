"use client"

import "plyr/dist/plyr.css"
import { usePlyr } from "../../hooks/usePlyr"
import { BaseVideoPlayer } from "./BaseVideoPlayer"

interface RegularPlayerProps {
    src: string
    videoRef: React.RefObject<HTMLVideoElement | null>
}

export function RegularPlayer({ src, videoRef }: RegularPlayerProps) {
    usePlyr(videoRef, src)

    return (
        <BaseVideoPlayer videoRef={videoRef}>
            <source
                src={src}
                type="video/mp4"
            />
        </BaseVideoPlayer>
    )
}
