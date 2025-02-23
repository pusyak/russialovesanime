import { useEffect, useState } from "react"
import Link from "next/link"

interface Episode {
    filename: string
    hasHls: boolean
}

interface EpisodeListProps {
    title: string
}

export default function EpisodeList({ title }: EpisodeListProps) {
    const [episodes, setEpisodes] = useState<Episode[]>([])
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    useEffect(() => {
        fetch(`${apiUrl}/list/${encodeURIComponent(title)}`)
            .then((res) => res.json())
            .then((files) => {
                setEpisodes(
                    files.sort((a: Episode, b: Episode) => {
                        const numA = parseInt(a.filename.match(/\d+/)?.[0] || "0")
                        const numB = parseInt(b.filename.match(/\d+/)?.[0] || "0")
                        return numA - numB
                    })
                )
            })
    }, [apiUrl, title])

    return (
        <div className="grid gap-4">
            {episodes.map((episode, index) => (
                <Link
                    key={episode.filename}
                    href={`/watch/${title}/episode-${index + 1}`}
                    className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                >
                    <span className="text-xl">Эпизод {index + 1}</span>
                    {episode.hasHls && <span className="ml-2 px-2 py-1 text-xs bg-blue-500 rounded">HLS</span>}
                </Link>
            ))}
        </div>
    )
}
