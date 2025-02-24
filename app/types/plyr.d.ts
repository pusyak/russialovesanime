declare module "plyr/dist/plyr" {
    import { Options } from "plyr"
    export default class Plyr {
        constructor(target: HTMLElement, options?: Options)
        elements: Elements
        destroy(): void
    }
}

declare module "plyr" {
    interface Elements {
        progress?: HTMLElement
    }

    export interface Options {
        controls?: string[]
        settings?: string[]
        quality?: {
            default: string
            options: string[]
            forced: boolean
        }
        previewThumbnails?: {
            enabled: boolean
            src?: string
        }
    }
}
