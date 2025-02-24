"use client"

import { useParams } from "next/navigation"
import EpisodeList from "@/app/components/EpisodeList"
import Link from "next/link"

export default function AnimePage() {
    const { title } = useParams()
    const decodedTitle = decodeURIComponent(title as string)

    return (
        <main className="min-h-screen p-8">
            <div className="mb-8 flex items-center gap-4">
                <Link
                    href="/"
                    className="text-blue-400 hover:underline"
                >
                    ← Назад
                </Link>
                <h1 className="text-3xl font-bold capitalize">{decodedTitle}</h1>
            </div>
            <EpisodeList title={decodedTitle} />
        </main>
    )
}
