import { useMemo } from "react"

interface UseVideoUrlProps {
    filename: string
    hasHls: boolean
    title: string
    apiUrl?: string
}

export function useVideoUrl({ filename, hasHls, title, apiUrl = "" }: UseVideoUrlProps) {
    return useMemo(() => {
        if (!filename || !apiUrl) return ""
        const hlsFilename = filename.replace(".mp4", "")
        return hasHls ? `${apiUrl}/hls/${title}/${hlsFilename}/master.m3u8` : `${apiUrl}/video/${title}/${filename}`
    }, [filename, hasHls, apiUrl, title])
}
