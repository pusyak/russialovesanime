"use client"

import { useSyncExternalStore } from "react"

export function useFullscreenState() {
    return useSyncExternalStore(
        (onChange) => {
            document.addEventListener("fullscreenchange", onChange)
            return () => document.removeEventListener("fullscreenchange", onChange)
        },
        () => !!document.fullscreenElement
    )
}
