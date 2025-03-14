import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { fetchEpisodes, sortEpisodes } from "@/app/services/api"
import { Episode } from "@/app/services/episodes"

interface EpisodeListProps {
    title: string
}

export default function EpisodeList({ title }: EpisodeListProps) {
    const [episodes, setEpisodes] = useState<Episode[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setIsLoading(true)
        fetchEpisodes(title)
            .then((data) => {
                setEpisodes(sortEpisodes(data))
            })
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false))
    }, [title])

    // Мемоизируем список эпизодов
    const memoizedEpisodesList = useMemo(() => {
        return episodes.map((episode, index) => (
            <Link
                key={episode.filename}
                href={`/watch/${title}/episode-${index + 1}`}
                className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
            >
                <span className="text-xl">Эпизод {index + 1}</span>
                {episode.hasHls && <span className="ml-2 px-2 py-1 text-xs bg-blue-500 rounded">HLS</span>}
            </Link>
        ))
    }, [episodes, title])

    if (error) return <div className="text-red-500">{error}</div>
    if (isLoading) return <div className="text-gray-400">Загрузка...</div>
    if (episodes.length === 0) return <div>Эпизоды не найдены</div>

    return <div className="grid gap-4">{memoizedEpisodesList}</div>
}
