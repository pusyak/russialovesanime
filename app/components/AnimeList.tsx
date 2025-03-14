import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { fetchTitles } from "@/app/services/api"

// Компонент скелетона для загрузки
const SkeletonItem = () => (
    <div className="p-4 bg-gray-800 rounded-lg animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-3/4"></div>
    </div>
)

// Отрисовка элемента списка
const AnimeItem = ({ title }: { title: string }) => (
    <Link
        href={`/anime/${encodeURIComponent(title)}`}
        className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
    >
        <span className="text-xl capitalize">{title}</span>
    </Link>
)

// Компонент группы аниме
const AnimeGroup = ({ letter, titles }: { letter: string; titles: string[] }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-blue-400 border-b border-blue-500 pb-2">{letter}</h2>
        <div className="grid gap-3">
            {titles.map((title) => (
                <AnimeItem
                    key={title}
                    title={title}
                />
            ))}
        </div>
    </div>
)

// Компонент поисковой строки
const SearchBar = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <div className="mb-6 relative">
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Поиск аниме..."
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        />
        {value && (
            <button
                onClick={() => onChange("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
                ✕
            </button>
        )}
    </div>
)

// Боковое меню с алфавитом
const AlphabetNav = ({ groups, onSelect, activeGroup }: { groups: string[]; onSelect: (group: string) => void; activeGroup: string | null }) => (
    <div className="hidden lg:block sticky top-4 bg-gray-900 p-4 rounded-lg mb-4 shadow-lg">
        <h3 className="text-lg font-bold mb-2 text-center">Алфавит</h3>
        <div className="flex flex-wrap justify-center gap-2">
            {groups.map((letter) => (
                <button
                    key={letter}
                    onClick={() => onSelect(letter)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition
                        ${activeGroup === letter ? "bg-blue-500 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-300"}`}
                >
                    {letter}
                </button>
            ))}
        </div>
    </div>
)

// Группировка тайтлов по первой букве
function groupTitlesByFirstLetter(titles: string[]): Record<string, string[]> {
    return titles.reduce((groups, title) => {
        if (!title) return groups

        // Используем первую букву заглавной
        const firstLetter = title.charAt(0).toUpperCase()

        if (!groups[firstLetter]) {
            groups[firstLetter] = []
        }

        groups[firstLetter].push(title)
        return groups
    }, {} as Record<string, string[]>)
}

export default function AnimeList() {
    const [titles, setTitles] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [retryCount, setRetryCount] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeGroup, setActiveGroup] = useState<string | null>(null)

    // Функция загрузки с автоматическим retry
    const loadTitles = async () => {
        setIsLoading(true)
        try {
            const data = await fetchTitles()
            setTitles(data)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Произошла ошибка")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadTitles()
    }, [retryCount])

    // Функция повторной загрузки
    const handleRetry = () => {
        setRetryCount((count) => count + 1)
    }

    // Сбрасываем активную группу при поиске
    useEffect(() => {
        if (searchQuery) {
            setActiveGroup(null)
        }
    }, [searchQuery])

    // Прокрутка к выбранной группе
    const scrollToGroup = (group: string) => {
        setActiveGroup(group)
        const element = document.getElementById(`group-${group}`)
        if (element) {
            element.scrollIntoView({ behavior: "smooth" })
        }
    }

    // Фильтруем тайтлы по поисковому запросу
    const filteredTitles = useMemo(() => {
        if (!searchQuery.trim()) return titles

        const query = searchQuery.toLowerCase().trim()
        return titles.filter((title) => title.toLowerCase().includes(query))
    }, [titles, searchQuery])

    // Группируем тайтлы по первой букве
    const groupedTitles = useMemo(() => {
        // Если поиск, не группируем
        if (searchQuery) return null

        return groupTitlesByFirstLetter(titles)
    }, [titles, searchQuery])

    // Получаем список групп для навигации
    const groups = useMemo(() => {
        if (!groupedTitles) return []
        return Object.keys(groupedTitles).sort()
    }, [groupedTitles])

    if (error) {
        return (
            <div className="text-center">
                <div className="text-red-500 mb-4">{error}</div>
                <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
                >
                    Попробовать снова
                </button>
            </div>
        )
    }

    return (
        <div>
            <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
            />

            {isLoading ? (
                // Скелетон-лоадеры во время загрузки
                <div className="grid gap-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <SkeletonItem key={index} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Навигация по группам показываем только если нет поиска и есть группы */}
                    {!searchQuery && groups.length > 0 && (
                        <div className="lg:w-1/5">
                            <AlphabetNav
                                groups={groups}
                                onSelect={scrollToGroup}
                                activeGroup={activeGroup}
                            />
                        </div>
                    )}

                    <div className={`${!searchQuery && groups.length > 0 ? "lg:w-4/5" : "w-full"}`}>
                        {filteredTitles.length === 0 ? (
                            <div className="text-center p-8 text-gray-400">{searchQuery ? "Ничего не найдено. Попробуйте изменить запрос." : "Список аниме пуст."}</div>
                        ) : (
                            <>
                                {/* Сгруппированный список или обычный в зависимости от поиска */}
                                {searchQuery ? (
                                    <div className="grid gap-4">
                                        {filteredTitles.map((title) => (
                                            <AnimeItem
                                                key={title}
                                                title={title}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    groups.map((letter) => (
                                        <div
                                            key={letter}
                                            id={`group-${letter}`}
                                        >
                                            <AnimeGroup
                                                letter={letter}
                                                titles={groupedTitles?.[letter] || []}
                                            />
                                        </div>
                                    ))
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
