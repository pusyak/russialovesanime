import { useMemo, useEffect } from "react"

interface UseVideoUrlProps {
    filename: string
    hasHls: boolean
    title: string
    apiUrl?: string
    videoRef: React.RefObject<HTMLVideoElement | null>
}

export function useVideoUrl({ filename, hasHls, title, apiUrl = "", videoRef }: UseVideoUrlProps) {
    useEffect(() => {
        if (!filename || !apiUrl) return

        // Сначала проверим есть ли уже превьюхи
        const previewPath = `/previews/${title}/${filename.replace(".mp4", "")}/thumbnails.vtt`

        fetch(`${apiUrl}${previewPath}`)
            .then((res) => {
                if (res.ok && videoRef.current?.plyr) {
                    // Если есть - сразу подключаем
                    videoRef.current.plyr.setPreviewThumbnails({ src: `${apiUrl}${previewPath}` })
                    return
                }
                // Если нет - генерируем
                return fetch(`${apiUrl}/generate-previews/${title}/${filename}`, {
                    method: "POST"
                })
            })
            .then((res) => {
                if (!res || !res.ok) throw new Error("Failed to generate previews")
                return res.json()
            })
            .then((data) => {
                if (data.success && videoRef.current?.plyr) {
                    videoRef.current.plyr.setPreviewThumbnails({ src: `${apiUrl}${data.previewsPath}/thumbnails.vtt` })
                }
            })
            .catch((err) => {
                console.error("Preview handling error:", err)
            })
    }, [filename, apiUrl, title, videoRef])

    return useMemo(() => {
        if (!filename || !apiUrl) return ""
        const hlsFilename = filename.replace(".mp4", "")
        return hasHls ? `${apiUrl}/hls/${title}/${hlsFilename}/master.m3u8` : `${apiUrl}/video/${title}/${filename}`
    }, [filename, hasHls, apiUrl, title])
}
