"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [episodes, setEpisodes] = useState<string[]>([]);

  useEffect(() => {
    fetch("http://5.35.98.122/list")
      .then((res) => res.json())
      .then((files) => {
        setEpisodes(
          files.sort((a: string, b: string) => {
            const numA = parseInt(a.match(/\d+/)?.[0] || "0");
            const numB = parseInt(b.match(/\d+/)?.[0] || "0");
            return numA - numB;
          })
        );
      });
  }, []);

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Dandadan</h1>
      <div className="grid gap-4">
        {episodes.map((episode, index) => (
          <Link
            key={episode}
            href={`/watch/${encodeURIComponent(episode)}`}
            className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
          >
            <span className="text-xl">Эпизод {index + 1}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
