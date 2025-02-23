"use client"

import AnimeList from "./components/AnimeList"

export default function Home() {
    return (
        <main className="min-h-screen p-8">
            <h1 className="text-3xl font-bold mb-8">Аниме</h1>
            <AnimeList />
        </main>
    )
}
