import { PlyrOptions } from "./types"

export const DEFAULT_CONTROLS = ["play-large", "play", "progress", "current-time", "duration", "mute", "volume", "settings", "fullscreen"] as string[]

export const BASE_PLYR_CONFIG: PlyrOptions = {
    controls: DEFAULT_CONTROLS,
    settings: ["quality"]
}
