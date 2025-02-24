"use client"

import { useParams } from "next/navigation"
import VideoPlayer from "@/app/components/VideoPlayer/VideoPlayer"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useVideoUrl } from "@/app/hooks/useVideoUrl"
import { fetchEpisode } from "@/app/services/episodes"
import type { Episode } from "@/app/services/episodes"

export default function WatchPage() {
    const params = useParams()
    const title = decodeURIComponent(params.title as string)
    const episode = decodeURIComponent(params.episode as string)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const [episodeData, setEpisodeData] = useState<Episode | null>(null)
    const [error, setError] = useState<string>("")

    useEffect(() => {
        fetchEpisode(title, episode)
            .then(setEpisodeData)
            .catch((err) => setError(err.message))
    }, [title, episode])

    const videoUrl = useVideoUrl({
        filename: episodeData?.filename || "",
        hasHls: episodeData?.hasHls || false,
        title,
        apiUrl
    })

    if (error) return <div className="min-h-screen p-4 text-red-500">{error}</div>
    if (!episodeData) return <div className="min-h-screen p-4">Loading...</div>

    return (
        <div className="min-h-screen p-4">
            <Link
                href={`/anime/${encodeURIComponent(title)}`}
                className="inline-block mb-4 text-blue-500 hover:text-blue-400"
            >
                ← Назад к списку
            </Link>

            {videoUrl && (
                <VideoPlayer
                    src={videoUrl}
                    isHls={episodeData.hasHls}
                />
            )}
        </div>
    )
}
