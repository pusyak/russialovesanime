"use client"

import { useEffect, useRef } from "react"

interface UseVideoProgressProps {
    videoRef: React.RefObject<HTMLVideoElement | null>
    title: string
    episode: string
}

// Простая функция дебаунсинга
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return function (...args: Parameters<T>) {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

export function useVideoProgress({ videoRef, title, episode }: UseVideoProgressProps) {
    const storageKey = `video-progress:${title}:${episode}`
    const lastSavedTime = useRef<number>(0)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const savedTime = localStorage.getItem(storageKey)

        const handleMetadata = () => {
            if (savedTime) {
                const parsedTime = parseFloat(savedTime)
                // Проверяем, что сохраненное время меньше длительности видео
                if (parsedTime < video.duration) {
                    video.currentTime = parsedTime
                }
            }
        }

        // Дебаунсим сохранение прогресса
        const saveProgress = debounce(() => {
            // Сохраняем только если видео реально смотрели и прогресс изменился
            if (video.currentTime > 0 && Math.abs(video.currentTime - lastSavedTime.current) > 1) {
                localStorage.setItem(storageKey, video.currentTime.toString())
                lastSavedTime.current = video.currentTime
            }
        }, 1000) // Дебаунс в 1 секунду

        video.addEventListener("loadedmetadata", handleMetadata)
        video.addEventListener("timeupdate", saveProgress)
        video.addEventListener("pause", saveProgress)
        video.addEventListener("ended", () => {
            // При окончании видео удаляем сохраненный прогресс
            localStorage.removeItem(storageKey)
        })

        return () => {
            video.removeEventListener("timeupdate", saveProgress)
            video.removeEventListener("pause", saveProgress)
            video.removeEventListener("loadedmetadata", handleMetadata)
            video.removeEventListener("ended", () => {
                localStorage.removeItem(storageKey)
            })

            // Сохраняем при размонтировании компонента
            if (video.currentTime > 0 && video.currentTime < video.duration - 10) {
                localStorage.setItem(storageKey, video.currentTime.toString())
            }
        }
    }, [videoRef, storageKey])
}
