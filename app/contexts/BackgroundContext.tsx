"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

const CHANGE_INTERVAL = 5 * 60 * 1000 // 5 минут
const BG_OPTIONS = ["ass-bg.jpeg", "tit-bg.gif", "tit-bg2.gif"]

type BackgroundContextType = {
    bgUrl: string
    updateBg: () => void
}

const BackgroundContext = createContext<BackgroundContextType | null>(null)

export const BackgroundProvider = ({ children }: { children: React.ReactNode }) => {
    const [bgUrl, setBgUrl] = useState<string>("")

    const getRandomBg = useCallback(() => {
        const randomIndex = Math.floor(Math.random() * BG_OPTIONS.length)
        return `/images/${BG_OPTIONS[randomIndex]}`
    }, [])

    const updateBg = useCallback(() => {
        setBgUrl(getRandomBg())
    }, [getRandomBg])

    useEffect(() => {
        updateBg()
        const interval = setInterval(updateBg, CHANGE_INTERVAL)
        return () => clearInterval(interval)
    }, [updateBg])

    return <BackgroundContext.Provider value={{ bgUrl, updateBg }}>{children}</BackgroundContext.Provider>
}

export const useBackground = () => {
    const context = useContext(BackgroundContext)
    if (!context) throw new Error("useBackground must be used within BackgroundProvider")
    return context
}
