import { useEffect, useState } from "react"
import Link from "next/link"

export default function AnimeList() {
    const [titles, setTitles] = useState<string[]>([])
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    useEffect(() => {
        fetch(`${apiUrl}/titles`)
            .then((res) => res.json())
            .then(setTitles)
    }, [apiUrl])

    return (
        <div className="grid gap-4">
            {titles.map((title) => (
                <Link
                    key={title}
                    href={`/anime/${encodeURIComponent(title)}`}
                    className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                >
                    <span className="text-xl capitalize">{title}</span>
                </Link>
            ))}
        </div>
    )
}
