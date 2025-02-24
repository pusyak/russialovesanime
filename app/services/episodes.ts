export interface Episode {
    filename: string
    hasHls: boolean
}

export const fetchEpisode = async (title: string, episode: string): Promise<Episode> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(`${apiUrl}/episodes/${encodeURIComponent(title)}/${episode}`)

    if (!response.ok) throw new Error("Episode not found")

    return response.json()
}
