import Plyr from "plyr"

export interface PlyrWithConfig extends Plyr {
    config: {
        quality: {
            default: string
            options: string[]
            forced: boolean
            onChange: (quality: string) => void
        }
        i18n: {
            qualityLabel: string
            quality: { [key: string]: string }
            [key: string]: string | Record<string, string>
        }
    }
}

export interface QualityLevel {
    bitrate: number
    height?: number
}

export interface VideoPlayerProps {
    src: string
    isHls?: boolean
}

export type { Options as PlyrOptions } from "plyr"
