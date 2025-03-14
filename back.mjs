import express from "express"
import cors from "cors"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { generateSpriteVtt } from "sprite-vtt-generator"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())

const VIDEOS_PATH = "/var/www/anime/videos"

// Функция для очистки имени файла
function cleanFileName(fileName) {
    // Заменяем [Erai-raws] на _Erai-raws_ и убираем пробелы
    return fileName
        .replace(/\[([^\]]+)\]/g, "_$1_") // [Text] -> _Text_
        .replace(/\s+/g, "_") // пробелы -> _
}

// Переименовываем все файлы в папке
function cleanupDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return

    const items = fs.readdirSync(dirPath, { withFileTypes: true })

    items.forEach((item) => {
        const oldPath = path.join(dirPath, item.name)
        const newName = cleanFileName(item.name)
        const newPath = path.join(dirPath, newName)

        if (oldPath !== newPath) {
            fs.renameSync(oldPath, newPath)
            console.log(`Renamed: ${item.name} -> ${newName}`)
        }

        // Если это директория - рекурсивно очищаем её
        if (item.isDirectory()) {
            cleanupDirectory(oldPath)
        }
    })
}

// Очищаем все имена при старте сервера
cleanupDirectory(VIDEOS_PATH)

// Эндпоинт для получения видоса
app.get("/video/:title/:filename", (req, res) => {
    const { title, filename } = req.params
    // Не чистим filename, он уже почищен
    const filePath = path.join(VIDEOS_PATH, cleanFileName(title), filename)

    // Проверяем существование файла
    if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found")
    }

    const stat = fs.statSync(filePath)
    const fileSize = stat.size
    const range = req.headers.range

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        const chunksize = end - start + 1
        const file = fs.createReadStream(filePath, { start, end })

        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": "video/mp4"
        })
        file.pipe(res)
    } else {
        res.writeHead(200, {
            "Content-Length": fileSize,
            "Content-Type": "video/mp4"
        })
        fs.createReadStream(filePath).pipe(res)
    }
})

// Эндпоинт для HLS стримов
app.get("/hls/:title/:filename/*", (req, res) => {
    const { title, filename } = req.params
    const hlsPath = req.params[0] // получаем остальной путь (master.m3u8 или segments)

    console.log("HLS request params:", {
        rawTitle: title,
        cleanedTitle: cleanFileName(title),
        filename,
        hlsPath
    })

    const filePath = path.join(VIDEOS_PATH, cleanFileName(title), "hls", filename, hlsPath)

    console.log("Full HLS path:", filePath)

    if (!fs.existsSync(filePath)) {
        console.error("HLS file not found:", filePath)
        // Проверим существование директорий
        console.log("Checking directories:")
        console.log("VIDEOS_PATH exists:", fs.existsSync(VIDEOS_PATH))
        const titlePath = path.join(VIDEOS_PATH, cleanFileName(title))
        const hlsPath = path.join(titlePath, "hls")
        const episodePath = path.join(hlsPath, filename)
        console.log("Title dir exists:", fs.existsSync(titlePath))
        console.log("HLS dir exists:", fs.existsSync(hlsPath))
        console.log("Episode dir exists:", fs.existsSync(episodePath))
        console.log("Looking for file:", filePath)
        return res.status(404).send("File not found")
    }

    // Определяем content-type на основе расширения
    const ext = path.extname(filePath)
    const contentType = ext === ".m3u8" ? "application/vnd.apple.mpegurl" : ext === ".ts" ? "video/MP2T" : "application/octet-stream"

    res.setHeader("Content-Type", contentType)
    fs.createReadStream(filePath).pipe(res)
})

// Получаем список всех тайтлов (папок)
app.get("/titles", (req, res) => {
    // Создаем папку если её нет
    if (!fs.existsSync(VIDEOS_PATH)) {
        fs.mkdirSync(VIDEOS_PATH)
    }

    const titles = fs
        .readdirSync(VIDEOS_PATH, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)

    res.json(titles)
})

// Получаем список серий для конкретного тайтла
app.get("/list/:title", (req, res) => {
    const title = req.params.title
    const titleDir = path.join(VIDEOS_PATH, cleanFileName(title))

    if (!fs.existsSync(titleDir)) {
        return res.status(404).json({ error: "Title not found" })
    }

    const files = fs
        .readdirSync(titleDir)
        .filter((file) => file.endsWith(".mp4"))
        .map((file) => {
            // Проверяем наличие HLS версии
            const hlsPath = path.join(titleDir, "hls", file.replace(".mp4", ""))
            const hasHls = fs.existsSync(hlsPath) && fs.existsSync(path.join(hlsPath, "master.m3u8"))

            return {
                filename: file,
                hasHls
            }
        })

    res.json(files)
})

// Получаем инфу о конкретном эпизоде
app.get("/episodes/:title/:episode", (req, res) => {
    const { title, episode } = req.params
    const episodeNumber = parseInt(episode.replace("episode-", ""))
    const titleDir = path.join(VIDEOS_PATH, cleanFileName(title))

    if (!fs.existsSync(titleDir)) {
        return res.status(404).json({ error: "Title not found" })
    }

    const files = fs
        .readdirSync(titleDir)
        .filter((file) => file.endsWith(".mp4"))
        .map((file) => {
            const hlsPath = path.join(titleDir, "hls", file.replace(".mp4", ""))
            const hasHls = fs.existsSync(hlsPath) && fs.existsSync(path.join(hlsPath, "master.m3u8"))
            return { filename: file, hasHls }
        })
        .sort((a, b) => {
            const numA = parseInt(a.filename.match(/\d+/)?.[0] || "0")
            const numB = parseInt(b.filename.match(/\d+/)?.[0] || "0")
            return numA - numB
        })

    const episode_info = files[episodeNumber - 1]
    if (!episode_info) {
        return res.status(404).json({ error: "Episode not found" })
    }

    res.json(episode_info)
})

app.post("/generate-previews/:title/:filename", async (req, res) => {
    const { title, filename } = req.params
    const videoPath = path.join(VIDEOS_PATH, cleanFileName(title), filename)

    console.log("Starting preview generation:", {
        title,
        filename,
        videoPath
    })

    if (!fs.existsSync(videoPath)) {
        return res.status(404).send("Video not found")
    }

    const previewsDir = path.join(VIDEOS_PATH, cleanFileName(title), "previews", filename.replace(".mp4", ""))

    // Создаем директорию если её нет
    if (!fs.existsSync(previewsDir)) {
        fs.mkdirSync(previewsDir, { recursive: true })
    }

    try {
        await generateSpriteVtt({
            input: videoPath,
            output: previewsDir,
            columns: 5,
            rows: 5,
            quality: 75,
            interval: 10, // каждые 10 секунд
            spriteSize: 150 // размер превьюхи
        })

        res.json({
            success: true,
            previewsPath: `/previews/${cleanFileName(title)}/${filename.replace(".mp4", "")}`
        })
    } catch (error) {
        console.error("Preview generation error:", error)
        res.status(500).json({ error: "Failed to generate previews" })
    }
})

// Отдача превьюх
app.get("/previews/:title/:filename/*", (req, res) => {
    const { title, filename } = req.params
    const previewPath = req.params[0]
    const filePath = path.join(VIDEOS_PATH, cleanFileName(title), "previews", filename, previewPath)

    if (!fs.existsSync(filePath)) {
        return res.status(404).send("Preview not found")
    }

    const ext = path.extname(filePath)
    const contentType = ext === ".vtt" ? "text/vtt" : "image/jpeg"

    res.setHeader("Content-Type", contentType)
    fs.createReadStream(filePath).pipe(res)
})
// Убираем обработку всех роутов, оставляем только API
const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
}).on("error", (err) => {
    if (err.code === "EACCES") {
        console.error(`Error: Requires elevated privileges to run on port ${PORT}`)
        console.log("Try running with administrator privileges or use a port above 1024")
    } else {
        console.error("Server error:", err)
    }
})
