import { Episode } from "./episodes"

// Интерфейс для кэша
interface Cache<T> {
    data: T
    timestamp: number
}

// Время жизни кэша в миллисекундах (5 минут)
const CACHE_TTL = 5 * 60 * 1000

// Объект для хранения кэша
const cache: Record<string, Cache<unknown>> = {}

// Функция для получения данных с кэшированием
async function fetchWithCache<T>(url: string, cacheKey: string, options?: RequestInit): Promise<T> {
    // Проверяем кэш
    const cachedData = cache[cacheKey]
    const now = Date.now()

    // Если есть кэш и он не устарел, возвращаем его
    if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
        return cachedData.data as T
    }

    // Иначе делаем запрос
    const response = await fetch(url, options)

    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Сохраняем в кэш
    cache[cacheKey] = {
        data,
        timestamp: now
    }

    return data
}

// Очистка кэша для конкретного ключа
export function invalidateCache(cacheKey: string): void {
    delete cache[cacheKey]
}

// Получение списка всех тайтлов
export async function fetchTitles(): Promise<string[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    return fetchWithCache<string[]>(`${apiUrl}/titles`, "titles")
}

// Получение списка эпизодов для тайтла
export async function fetchEpisodes(title: string): Promise<Episode[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    return fetchWithCache<Episode[]>(`${apiUrl}/list/${encodeURIComponent(title)}`, `episodes:${title}`)
}

// Получение информации о конкретном эпизоде
export async function fetchEpisodeInfo(title: string, episode: string): Promise<Episode> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    return fetchWithCache<Episode>(`${apiUrl}/episodes/${encodeURIComponent(title)}/${episode}`, `episode:${title}:${episode}`)
}

// Сортировка эпизодов по номеру
export function sortEpisodes(episodes: Episode[]): Episode[] {
    return [...episodes].sort((a, b) => {
        const numA = parseInt(a.filename.match(/\d+/)?.[0] || "0")
        const numB = parseInt(b.filename.match(/\d+/)?.[0] || "0")
        return numA - numB
    })
}
