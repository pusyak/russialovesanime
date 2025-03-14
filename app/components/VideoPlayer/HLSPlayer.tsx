"use client"

import { useState, useEffect } from "react"
import { useHls } from "../../hooks/useHls"
import { BaseVideoPlayer } from "./BaseVideoPlayer"

interface HLSPlayerProps {
    src: string
    videoRef: React.RefObject<HTMLVideoElement | null>
}

export function HLSPlayer({ src, videoRef }: HLSPlayerProps) {
    const [error, setError] = useState<string | null>(null)
    const { error: hlsError } = useHls(videoRef, src)

    useEffect(() => {
        if (hlsError) {
            setError(hlsError)
        }
    }, [hlsError])

    if (error) {
        return (
            <div className="bg-red-900 bg-opacity-50 p-4 rounded text-white">
                <p className="font-bold mb-2">Ошибка воспроизведения HLS:</p>
                <p>{error}</p>
                <button
                    className="mt-4 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
                    onClick={() => window.location.reload()}
                >
                    Перезагрузить
                </button>
            </div>
        )
    }

    return <BaseVideoPlayer videoRef={videoRef} />
}
