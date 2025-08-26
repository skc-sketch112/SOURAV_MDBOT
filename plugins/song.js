const playdl = require("play-dl");
const yts = require("yt-search"); // Fallback for search if needed
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

// Set FFmpeg path (ensure FFmpeg is installed)
const ffmpegPath = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = {
    name: "song",
    command: ["song"], // Ensures .song is the trigger
    description: "Download and send a song from YouTube as an MP3 file. Supports YouTube, Spotify, SoundCloud.",

    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        if (!args[0]) {
            return sock.sendMessage(
                jid,
                { text: "❌ Please provide a song name or URL.\nExample: `.song despacito` or `.song https://www.youtube.com/watch?v=example`" },
                { quoted: m }
            );
        }

        const query = args.join(" ");
        try {
            // Determine if query is URL or search term
            let isUrl = query.startsWith("http://") || query.startsWith("https://");
            let videoInfo;

            if (isUrl) {
                // Validate URL
                if (playdl.is_expired()) await playdl.refreshToken();
                videoInfo = await playdl.video_basic_info(query);
            } else {
                // Search on YouTube
                console.log(`[Song] Searching for: ${query}`);
                const searchResults = await playdl.search(query, { limit: 1, source: { youtube: "video" } });
                if (!searchResults || searchResults.length === 0) {
                    // Fallback to yt-search if play-dl search fails
                    const ytSearch = await yts(query);
                    if (!ytSearch.videos || ytSearch.videos.length === 0) {
                        return sock.sendMessage(jid, { text: "❌ No results found for your query." }, { quoted: m });
                    }
                    videoInfo = { video: { title: ytSearch.videos[0].title, url: ytSearch.videos[0].url } };
                } else {
                    videoInfo = { video: { title: searchResults[0].title, url: searchResults[0].url } };
                }
            }

            const title = videoInfo.video.title;
            const url = videoInfo.video.url;
            console.log(`[Song] Selected: ${title} (${url})`);

            // Create downloads folder
            const downloadsDir = path.join(__dirname, "../downloads");
            if (!fs.existsSync(downloadsDir)) {
                fs.mkdirSync(downloadsDir, { recursive: true });
            }

            const outFile = path.join(downloadsDir, `${Date.now()}.mp3`);

            // Notify user
            await sock.sendMessage(
                jid,
                { text: `🎶 Downloading *${title}*...\n⏳ Please wait...` },
                { quoted: m }
            );

            // Get stream from play-dl (supports YT, Spotify, SoundCloud)
            if (playdl.is_expired()) await playdl.refreshToken();
            const stream = await playdl.stream(url);

            // Convert to MP3 using fluent-ffmpeg
            await new Promise((resolve, reject) => {
                ffmpeg(stream.stream)
                    .inputFormat(stream.type)
                    .audioBitrate(128)
                    .format("mp3")
                    .save(outFile)
                    .on("end", resolve)
                    .on("error", reject);
            });

            // Verify file
            if (!fs.existsSync(outFile) || fs.statSync(outFile).size === 0) {
                throw new Error("Downloaded audio file is missing or empty.");
            }

            // Send audio
            await sock.sendMessage(
                jid,
                {
                    audio: { url: outFile },
                    mimetype: "audio/mpeg",
                    fileName: `${title}.mp3`
                },
                { quoted: m }
            );

            // Clean up
            fs.unlinkSync(outFile);
        } catch (err) {
            console.error("[Song] Error:", err.message);
            await sock.sendMessage(
                jid,
                { text: `❌ Failed to process song.\nError: ${err.message}\nTry a different query or URL.` },
                { quoted: m }
            );
        }
    }
};
