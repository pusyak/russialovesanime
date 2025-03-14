"use client"

import { useEffect, useRef, useMemo } from "react"
import Hls from "hls.js"
import Plyr from "plyr/dist/plyr"
import type { Options } from "plyr"
import { PlyrOptions } from "../types/player"
import { BASE_PLYR_CONFIG } from "../utils/video"
import type { PlyrWithConfig } from "../types/player"
import { HLS_CONFIG, QUALITY_LABELS, createQualityOptions, createQualityToLevelMap, mapLevelsToQualities, updateAutoQualityLabel } from "../utils/video"

export function useHls(videoRef: React.RefObject<HTMLVideoElement | null>, src: string) {
    const hlsRef = useRef<Hls | null>(null)
    const playerRef = useRef<PlyrWithConfig | null>(null)
    const errorRef = useRef<string | null>(null)

    // Мемоизируем конфигурацию HLS
    const hlsConfig = useMemo(
        () => ({
            ...HLS_CONFIG,
            // Добавляем автоматическое восстановление после ошибок
            maxLoadingRetry: 5,
            enableWorker: true
        }),
        []
    )

    useEffect(() => {
        if (!videoRef.current || !Hls.isSupported()) {
            errorRef.current = !Hls.isSupported() ? "HLS не поддерживается в этом браузере" : null
            return
        }

        const video = videoRef.current
        const hls = new Hls(hlsConfig)

        hlsRef.current = hls
        hls.loadSource(src)
        hls.attachMedia(video)

        let qualityMap: number[] = []
        const qualityToLevelIndex = new Map<number, number>()

        // Обработка ошибок HLS
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        // Пробуем восстановиться после сетевой ошибки
                        console.error("Сетевая ошибка HLS", data)
                        hls.startLoad()
                        break
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        // Пробуем восстановиться после ошибки медиа
                        console.error("Ошибка медиа HLS", data)
                        hls.recoverMediaError()
                        break
                    default:
                        // Неисправимая ошибка
                        console.error("Неисправимая ошибка HLS", data)
                        errorRef.current = `Ошибка воспроизведения: ${data.details}`
                        hls.destroy()
                        break
                }
            }
        })

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            qualityMap = mapLevelsToQualities(data.levels)
            const qualityOptions = createQualityOptions(qualityMap)
            Object.assign(qualityToLevelIndex, createQualityToLevelMap(qualityMap))

            // Уничтожаем предыдущий плеер, если он существует
            if (playerRef.current) {
                playerRef.current.destroy()
            }

            playerRef.current = new Plyr(video, {
                ...BASE_PLYR_CONFIG,
                quality: {
                    default: "auto",
                    options: qualityOptions,
                    forced: true
                } as unknown as NonNullable<Options["quality"]>
            } satisfies PlyrOptions) as PlyrWithConfig

            playerRef.current.config.i18n = {
                ...playerRef.current.config.i18n,
                qualityLabel: "Качество",
                quality: QUALITY_LABELS
            }

            hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
                if ((playerRef.current?.quality as unknown as string) === "auto" && hls.currentLevel === -1) {
                    const height = qualityMap[data.level]
                    const autoSpan = document.querySelector(".plyr__menu__container [data-plyr='quality'][value='auto'] span")
                    updateAutoQualityLabel(height, autoSpan)
                }
            })
        })

        return () => {
            playerRef.current?.destroy()
            hls.destroy()
        }
    }, [src, videoRef, hlsConfig])

    return { hlsRef, error: errorRef.current }
}
