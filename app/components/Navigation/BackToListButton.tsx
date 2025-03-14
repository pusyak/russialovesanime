import Link from "next/link"

interface BackToListButtonProps {
    title: string
}

export function BackToListButton({ title }: BackToListButtonProps) {
    return (
        <Link
            href={`/anime/${encodeURIComponent(title)}`}
            className="inline-block text-blue-500 hover:text-blue-400"
        >
            ← Назад к списку
        </Link>
    )
}
