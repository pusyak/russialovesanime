"use client"

import { useParams } from "next/navigation"
import VideoPlayer from "@/app/components/VideoPlayer/VideoPlayer"
import { useEffect, useState, useRef } from "react"
import { useVideoUrl } from "@/app/hooks/useVideoUrl"
import { fetchEpisodeInfo, fetchEpisodes } from "@/app/services/api"
import type { Episode } from "@/app/services/episodes"
import { EpisodeNavigation } from "@/app/components/Navigation"

export default function WatchPage() {
    const params = useParams()
    const title = decodeURIComponent(params.title as string)
    const episode = decodeURIComponent(params.episode as string)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const [episodeData, setEpisodeData] = useState<Episode | null>(null)
    const [allEpisodes, setAllEpisodes] = useState<Episode[]>([])
    const [error, setError] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)
    const videoRef = useRef<HTMLVideoElement>(null)

    // Получаем номер текущего эпизода из URL
    const currentEpisodeNumber = parseInt(episode.replace("episode-", ""))

    // Загружаем информацию о текущем эпизоде
    useEffect(() => {
        setIsLoading(true)
        fetchEpisodeInfo(title, episode)
            .then(setEpisodeData)
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false))
    }, [title, episode])

    // Загружаем список всех эпизодов
    useEffect(() => {
        fetchEpisodes(title)
            .then(setAllEpisodes)
            .catch((err) => console.error("Не удалось загрузить список эпизодов:", err))
    }, [title])

    const videoUrl = useVideoUrl({
        filename: episodeData?.filename || "",
        hasHls: episodeData?.hasHls || false,
        title,
        apiUrl,
        videoRef
    })

    // Проверяем, есть ли следующий эпизод
    const hasNextEpisode = allEpisodes.length > currentEpisodeNumber

    if (error) return <div className="min-h-screen p-4 text-red-500">{error}</div>
    if (isLoading || !episodeData) return <div className="min-h-screen p-4">Loading...</div>

    return (
        <div className="min-h-screen p-4">
            <EpisodeNavigation
                title={title}
                currentEpisodeNumber={currentEpisodeNumber}
                hasNextEpisode={hasNextEpisode}
            />

            {videoUrl && (
                <VideoPlayer
                    src={videoUrl}
                    isHls={episodeData.hasHls}
                    videoRef={videoRef}
                />
            )}
        </div>
    )
}
