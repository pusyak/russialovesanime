import type Plyr from "plyr"

declare global {
    interface HTMLVideoElement {
        plyr?: Plyr
    }
}
