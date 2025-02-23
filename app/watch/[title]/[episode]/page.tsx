"use client"

import { useParams } from "next/navigation"
import VideoPlayer from "@/app/components/VideoPlayer/VideoPlayer"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Episode {
    filename: string
    hasHls: boolean
}

// Функция для очистки имени файла (такая же как на бэке)
function cleanFileName(fileName: string) {
    return fileName
        .replace(/\[([^\]]+)\]/g, "_$1_") // [Text] -> _Text_
        .replace(/\s+/g, "_") // пробелы -> _
}

export default function WatchPage() {
    const params = useParams()
    const title = decodeURIComponent(params.title as string)
    const episode = decodeURIComponent(params.episode as string)
    const episodeNumber = parseInt(episode.replace("episode-", ""))
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const [filename, setFilename] = useState<string>("")
    const [hasHls, setHasHls] = useState<boolean>(false)

    useEffect(() => {
        // Получаем список файлов и находим нужный по номеру эпизода
        fetch(`${apiUrl}/list/${encodeURIComponent(cleanFileName(title))}`)
            .then((res) => res.json())
            .then((files) => {
                const sortedFiles = files.sort((a: Episode, b: Episode) => {
                    const numA = parseInt(a.filename.match(/\d+/)?.[0] || "0")
                    const numB = parseInt(b.filename.match(/\d+/)?.[0] || "0")
                    return numA - numB
                })
                const episode = sortedFiles[episodeNumber - 1]
                if (episode) {
                    setFilename(episode.filename)
                    setHasHls(episode.hasHls)
                }
            })
    }, [apiUrl, title, episodeNumber])

    if (!filename) return <div>Loading...</div>

    const hlsFilename = filename.replace(".mp4", "")

    const videoUrl = hasHls ? `${apiUrl}/hls/bluelock/${encodeURIComponent(hlsFilename)}/master.m3u8` : `${apiUrl}/video/${encodeURIComponent(cleanFileName(title))}/${encodeURIComponent(filename)}`

    return (
        <div className="min-h-screen p-4">
            <Link
                href={`/anime/${encodeURIComponent(title)}`}
                className="inline-block mb-4 text-blue-500 hover:text-blue-400"
            >
                ← Назад к списку
            </Link>

            <VideoPlayer
                src={videoUrl}
                isHls={hasHls}
            />
        </div>
    )
}
