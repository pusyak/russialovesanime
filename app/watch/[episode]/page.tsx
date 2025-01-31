"use client";

import { useParams } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import Link from "next/link";

export default function WatchPage() {
  const params = useParams();
  const episode = params.episode as string;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  return (
    <div className="min-h-screen p-4">
      <Link
        href="/"
        className="inline-block mb-4 text-blue-500 hover:text-blue-400"
      >
        ← Назад к списку
      </Link>

      <VideoPlayer src={`${apiUrl}/video/${episode}`} />
    </div>
  );
}
