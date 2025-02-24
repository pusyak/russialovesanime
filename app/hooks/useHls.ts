"use client"

import { useEffect, useRef } from "react"
import Hls from "hls.js"
import Plyr from "plyr"
import type { Options } from "plyr"
import { PlyrOptions } from "../components/VideoPlayer/types"
import { BASE_PLYR_CONFIG } from "../components/VideoPlayer/config"

export interface PlyrWithConfig extends Plyr {
    config: {
        quality: {
            default: string
            options: string[]
            forced: boolean
            onChange: (quality: string) => void
        }
        i18n: {
            qualityLabel: string
            quality: { [key: string]: string }
            [key: string]: string | Record<string, string>
        }
    }
}

export function useHls(videoRef: React.RefObject<HTMLVideoElement | null>, src: string) {
    const playerRef = useRef<PlyrWithConfig | null>(null)
    const hlsRef = useRef<Hls | null>(null)

    useEffect(() => {
        if (!videoRef.current || !Hls.isSupported()) return

        const video = videoRef.current

        const hls = new Hls({
            enableWorker: true,
            startLevel: 3,
            capLevelToPlayerSize: false,
            autoStartLoad: true,
            startFragPrefetch: true
        })

        hlsRef.current = hls
        hls.loadSource(src)
        hls.attachMedia(video)

        let qualityMap: number[] = []
        const qualityToLevelIndex = new Map<number, number>()
        let qualityOptions: string[] = []
        let player: PlyrWithConfig | null = null

        const initQualitySettings = (levels: { bitrate: number; height?: number }[]) => {
            qualityMap = levels.map((level) => {
                const bitrate = level.bitrate
                if (bitrate >= 5000000) return 1080
                if (bitrate >= 2800000) return 720
                if (bitrate >= 1400000) return 480
                return 360
            })

            const uniqueQualities = Array.from(new Set(qualityMap)).sort((a, b) => b - a)
            qualityOptions = ["auto", ...uniqueQualities.map((q) => q.toString())]

            qualityMap.forEach((quality, index) => {
                qualityToLevelIndex.set(quality, index)
            })
        }

        const handleQualityChange = (quality: string) => {
            if (!player) return

            if (quality === "auto") {
                hls.currentLevel = -1
                hls.loadLevel = -1
                hls.nextLevel = -1
            } else {
                const qualityNum = parseInt(quality)
                const levelIndex = qualityToLevelIndex.get(qualityNum)

                if (levelIndex !== undefined) {
                    hls.currentLevel = levelIndex
                }
            }
        }

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            initQualitySettings(data.levels)

            player = new Plyr(video, {
                ...BASE_PLYR_CONFIG,
                quality: {
                    default: "auto",
                    options: qualityOptions,
                    forced: true,
                    onChange: handleQualityChange
                } as unknown as NonNullable<Options["quality"]>
            } satisfies PlyrOptions) as PlyrWithConfig

            player.config.i18n = {
                ...player.config.i18n,
                qualityLabel: "Качество",
                quality: {
                    auto: "Авто",
                    "720": "720p HD",
                    "480": "480p",
                    "360": "360p"
                }
            }

            playerRef.current = player

            hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
                if ((player?.quality as unknown as string) === "auto" && hls.currentLevel === -1) {
                    const height = qualityMap[data.level]
                    const autoSpan = document.querySelector(".plyr__menu__container [data-plyr='quality'][value='auto'] span")
                    if (autoSpan) {
                        autoSpan.textContent = `Авто (${height}p)`
                    }
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
