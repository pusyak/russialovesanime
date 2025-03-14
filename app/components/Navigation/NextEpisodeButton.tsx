import Link from "next/link"

interface NextEpisodeButtonProps {
    title: string
    currentEpisodeNumber: number
    hasNextEpisode: boolean
}

export function NextEpisodeButton({ title, currentEpisodeNumber, hasNextEpisode }: NextEpisodeButtonProps) {
    if (!hasNextEpisode) return null

    return (
        <Link
            href={`/watch/${encodeURIComponent(title)}/episode-${currentEpisodeNumber + 1}`}
            className="inline-block text-green-500 hover:text-green-400"
        >
            Следующая серия →
        </Link>
    )
}
