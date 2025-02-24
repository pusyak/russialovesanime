import type { QualityLevel } from "../types/player"
import type { PlyrOptions } from "../types/player"

export const DEFAULT_CONTROLS = ["play-large", "play", "progress", "current-time", "duration", "mute", "volume", "settings", "fullscreen"] as string[]

export const BASE_PLYR_CONFIG: PlyrOptions = {
    controls: DEFAULT_CONTROLS,
    settings: ["quality"],
    previewThumbnails: {
        enabled: true,
        src: "/previews/test/test.gif"
    }
}

export const HLS_CONFIG = {
    enableWorker: true,
    startLevel: 3,
    capLevelToPlayerSize: false,
    autoStartLoad: true,
    startFragPrefetch: true,
    maxBufferLength: 30,
    maxMaxBufferLength: 600,
    maxBufferSize: 60 * 1000 * 1000,
    backBufferLength: 30
} as const

export const QUALITY_BITRATE_MAP = {
    1080: 5000000,
    720: 2800000,
    480: 1400000,
    360: 0
} as const

export const QUALITY_LABELS = {
    auto: "Авто",
    "720": "720p HD",
    "480": "480p",
    "360": "360p"
} as const

export function mapLevelsToQualities(levels: QualityLevel[]): number[] {
    return levels.map((level) => {
        const bitrate = level.bitrate
        if (bitrate >= QUALITY_BITRATE_MAP[1080]) return 1080
        if (bitrate >= QUALITY_BITRATE_MAP[720]) return 720
        if (bitrate >= QUALITY_BITRATE_MAP[480]) return 480
        return 360
    })
}

export function createQualityOptions(qualityMap: number[]): string[] {
    const uniqueQualities = Array.from(new Set(qualityMap)).sort((a, b) => b - a)
    return ["auto", ...uniqueQualities.map((q) => q.toString())]
}

export function createQualityToLevelMap(qualityMap: number[]): Map<number, number> {
    const map = new Map<number, number>()
    qualityMap.forEach((quality, index) => {
        map.set(quality, index)
    })
    return map
}

export function updateAutoQualityLabel(height: number, autoSpanElement: Element | null) {
    if (autoSpanElement) {
        autoSpanElement.textContent = `Авто (${height}p)`
    }
}
