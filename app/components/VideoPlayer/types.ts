import { Options as PlyrBaseOptions } from "plyr"

export interface VideoPlayerProps {
    src: string
    isHls?: boolean
}

export type PlyrOptions = PlyrBaseOptions
