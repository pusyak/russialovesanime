"use client"

import { useEffect } from "react"

interface UseVideoProgressProps {
    videoRef: React.RefObject<HTMLVideoElement | null>
    title: string
    episode: string
}

export function useVideoProgress({ videoRef, title, episode }: UseVideoProgressProps) {
    const storageKey = `video-progress:${title}:${episode}`

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const savedTime = localStorage.getItem(storageKey)

        const handleMetadata = () => {
            if (savedTime) {
                video.currentTime = parseFloat(savedTime)
            }
        }

        // Сохраняем каждые 5 секунд и при паузе
        const saveProgress = () => {
            // Не сохраняем если видео только загрузилось
            if (video.currentTime > 0) {
                localStorage.setItem(storageKey, video.currentTime.toString())
            }
        }

        video.addEventListener("loadedmetadata", handleMetadata)
        const interval = setInterval(saveProgress, 5000)
        video.addEventListener("pause", saveProgress)

        return () => {
            clearInterval(interval)
            video.removeEventListener("pause", saveProgress)
            video.removeEventListener("loadedmetadata", handleMetadata)
            // Сохраняем только если реально смотрели
            if (video.currentTime > 0) {
                saveProgress()
            }
        }
    }, [videoRef, storageKey])
}
