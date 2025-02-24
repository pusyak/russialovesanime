"use client"

import { useEffect } from "react"

export function useKeyboardShortcuts(videoRef: React.RefObject<HTMLVideoElement | null>) {
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!videoRef.current) return

            if (e.key === "ArrowLeft") {
                e.preventDefault()
                videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5)
            } else if (e.key === "ArrowRight") {
                e.preventDefault()
                videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 5)
            }
        }

        document.addEventListener("keydown", handleKeyPress)

        return () => {
            document.removeEventListener("keydown", handleKeyPress)
        }
    }, [videoRef])
}
