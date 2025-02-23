import { useEffect, useState } from "react"
import Link from "next/link"

interface EpisodeListProps {
    title: string
}

export default function EpisodeList({ title }: EpisodeListProps) {
    const [episodes, setEpisodes] = useState<string[]>([])
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    useEffect(() => {
        fetch(`${apiUrl}/list/${encodeURIComponent(title)}`)
            .then((res) => res.json())
            .then((files) => {
                setEpisodes(
                    files.sort((a: string, b: string) => {
                        const numA = parseInt(a.match(/\d+/)?.[0] || "0")
                        const numB = parseInt(b.match(/\d+/)?.[0] || "0")
                        return numA - numB
                    })
                )
            })
    }, [apiUrl, title])

    return (
        <div className="grid gap-4">
            {episodes.map((episode, index) => (
                <Link
                    key={episode}
                    href={`/watch/${title}/${encodeURIComponent(episode)}`}
                    className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                >
                    <span className="text-xl">Эпизод {index + 1}</span>
                </Link>
            ))}
        </div>
    )
}
