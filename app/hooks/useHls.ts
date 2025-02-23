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

        // Cleanup previous instances
        if (playerRef.current) {
            playerRef.current.destroy()
        }
        if (hlsRef.current) {
            hlsRef.current.destroy()
            hlsRef.current = null
        }

        hlsRef.current = new Hls({
            debug: false,
            enableWorker: true,
            startLevel: -1, // Auto quality
            capLevelToPlayerSize: false // Отключаем автоматическое ограничение качества
        })

        hlsRef.current.loadSource(src)
        hlsRef.current.attachMedia(video)

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy()
            }
            if (hlsRef.current) {
                hlsRef.current.destroy()
            }
        }
    }, [src, videoRef])

    // Отдельный useEffect для Plyr
    useEffect(() => {
        if (!videoRef.current || !hlsRef.current) return

        const video = videoRef.current
        const hls = hlsRef.current

        let qualityMap: number[] = []
        const qualityToLevelIndex = new Map<number, number>()
        let qualityOptions: string[] = []

        const initQualitySettings = (levels: { bitrate: number }[]) => {
            // Convert bitrates to quality numbers
            qualityMap = levels.map((level) => {
                const bitrate = level.bitrate
                const quality = bitrate > 2000000 ? 1080 : bitrate > 1000000 ? 720 : 480
                console.log(`🎥 Mapping bitrate ${bitrate} to ${quality}p`)
                return quality
            })

            console.log("🎥 Quality map:", qualityMap)

            // Добавляем авто-качество в начало списка
            const uniqueQualities = Array.from(new Set(qualityMap)).sort((a, b) => b - a)
            qualityOptions = ["auto", ...uniqueQualities.map((q) => q.toString())]

            // Create reverse mapping for quality to level index
            qualityMap.forEach((quality, index) => {
                qualityToLevelIndex.set(quality, index)
            })
        }

        const handleQualityChange = (quality: string, playerInstance: PlyrWithConfig) => {
            console.log("🎥 Trying to change quality to:", quality)
            console.log("🎥 Current levels:", hls.levels)
            console.log("🎥 Current Plyr quality:", playerInstance.quality)

            if (quality === "auto") {
                console.log("🎥 Setting auto quality mode")
                hls.currentLevel = -1
                hls.loadLevel = -1
                hls.nextLevel = -1
                playerInstance.quality = "auto" as any
            } else {
                const qualityNum = parseInt(quality)
                console.log("🎥 Looking for quality:", qualityNum)
                const levelIndex = qualityToLevelIndex.get(qualityNum)
                console.log("🎥 Found level index for quality:", levelIndex)

                if (levelIndex !== undefined) {
                    hls.config.startLevel = levelIndex
                    hls.currentLevel = levelIndex
                    playerInstance.quality = quality as any
                    console.log("🎥 Quality forced to level:", levelIndex)
                }
            }
        }

        // Ждем пока HLS распарсит манифест
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            console.log("🎥 Available levels:", data.levels)
            initQualitySettings(data.levels)

            const player = new Plyr(video, {
                ...BASE_PLYR_CONFIG,
                quality: {
                    default: "auto",
                    options: qualityOptions,
                    forced: true,
                    onChange: (quality: string) => handleQualityChange(quality, player)
                } as unknown as NonNullable<Options["quality"]>
            } satisfies PlyrOptions) as PlyrWithConfig

            // Set custom labels
            player.config.i18n = {
                ...player.config.i18n,
                qualityLabel: "Качество",
                quality: {
                    auto: "Авто",
                    "480": "480p SD",
                    "720": "720p HD",
                    "1080": "1080p HD"
                }
            }

            playerRef.current = player

            // Update auto quality label when quality changes
            hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
                console.log("🎥 Level switched event:", data)
                console.log("🎥 Current level:", hls.currentLevel)

                const currentQuality = player.quality as unknown as string
                console.log("🎥 Current Plyr quality:", currentQuality)

                if (currentQuality === "auto" && hls.currentLevel === -1) {
                    const height = qualityMap[data.level]
                    console.log("🎥 Auto quality changed to height:", height)
                    const autoSpan = document.querySelector(".plyr__menu__container [data-plyr='quality'][value='auto'] span")
                    if (autoSpan) {
                        autoSpan.textContent = `Авто (${height}p)`
                    }
                }
            })

            console.log("🎥 Unique qualities:", qualityOptions)
        })

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy()
            }
        }
    }, [videoRef])

    return { playerRef, hlsRef }
}
