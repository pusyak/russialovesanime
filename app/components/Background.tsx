"use client"

import { useBackground } from "../contexts/BackgroundContext"

export default function Background() {
    const { bgUrl } = useBackground()

    return (
        <div
            className="bg-overlay"
            style={{ backgroundImage: `url(${bgUrl})` }}
        />
    )
}
