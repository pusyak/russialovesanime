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
            } else if (e.key === "ArrowUp") {
                e.preventDefault()
                videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.05)
            } else if (e.key === "ArrowDown") {
                e.preventDefault()
                videoRef.current.volume = Math.max(0, videoRef.current.volume - 0.05)
            } else if (e.key === " ") {
                e.preventDefault()
                if (videoRef.current.paused) {
                    videoRef.current.play()
                } else {
                    videoRef.current.pause()
                }
            } else if (e.key.toLowerCase() === "f" || e.key.toLowerCase() === "а") {
                e.preventDefault()
                if (videoRef.current.plyr) {
                    videoRef.current.plyr.fullscreen.toggle()
                }
            }
        }

        document.addEventListener("keydown", handleKeyPress)

        return () => {
            document.removeEventListener("keydown", handleKeyPress)
        }
    }, [videoRef])
}
