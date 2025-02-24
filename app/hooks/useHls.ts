"use client"

import { useEffect, useRef } from "react"
import Hls from "hls.js"
import Plyr from "plyr"
import type { Options } from "plyr"
import { PlyrOptions } from "../types/player"
import { BASE_PLYR_CONFIG } from "../utils/video"
import type { PlyrWithConfig } from "../types/player"
import { HLS_CONFIG, QUALITY_LABELS, createQualityOptions, createQualityToLevelMap, mapLevelsToQualities, updateAutoQualityLabel } from "../utils/video"

export function useHls(videoRef: React.RefObject<HTMLVideoElement | null>, src: string) {
    const playerRef = useRef<PlyrWithConfig | null>(null)
    const hlsRef = useRef<Hls | null>(null)

    useEffect(() => {
        if (!videoRef.current || !Hls.isSupported()) return

        const video = videoRef.current
        const hls = new Hls(HLS_CONFIG)

        hlsRef.current = hls
        hls.loadSource(src)
        hls.attachMedia(video)

        let qualityMap: number[] = []
        const qualityToLevelIndex = new Map<number, number>()
        let player: PlyrWithConfig | null = null

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            qualityMap = mapLevelsToQualities(data.levels)
            const qualityOptions = createQualityOptions(qualityMap)
            Object.assign(qualityToLevelIndex, createQualityToLevelMap(qualityMap))

            player = new Plyr(video, {
                ...BASE_PLYR_CONFIG,
                quality: {
                    default: "auto",
                    options: qualityOptions,
                    forced: true
                } as unknown as NonNullable<Options["quality"]>
            } satisfies PlyrOptions) as PlyrWithConfig

            player.config.i18n = {
                ...player.config.i18n,
                qualityLabel: "Качество",
                quality: QUALITY_LABELS
            }

            playerRef.current = player

            hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
                if ((player?.quality as unknown as string) === "auto" && hls.currentLevel === -1) {
                    const height = qualityMap[data.level]
                    const autoSpan = document.querySelector(".plyr__menu__container [data-plyr='quality'][value='auto'] span")
                    updateAutoQualityLabel(height, autoSpan)
                }
            })
        })

        return () => {
            player?.destroy()
            hls.destroy()
        }
    }, [src, videoRef])

    return { playerRef, hlsRef }
}
