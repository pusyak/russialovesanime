import { BackToListButton } from "./BackToListButton"
import { NextEpisodeButton } from "./NextEpisodeButton"

interface EpisodeNavigationProps {
    title: string
    currentEpisodeNumber: number
    hasNextEpisode: boolean
}

export function EpisodeNavigation({ title, currentEpisodeNumber, hasNextEpisode }: EpisodeNavigationProps) {
    return (
        <div className="flex mb-4 gap-4">
            <BackToListButton title={title} />
            <NextEpisodeButton
                title={title}
                currentEpisodeNumber={currentEpisodeNumber}
                hasNextEpisode={hasNextEpisode}
            />
        </div>
    )
}
