const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

// Set FFmpeg path (ensure FFmpeg is installed)
const ffmpegPath = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = {
    name: "song",
    command: ["song"], // Ensures .song is the trigger
    description: "Download and send a song from YouTube as an MP3 file.",

    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        if (!args[0]) {
            return sock.sendMessage(
                jid,
                { text: "❌ Please provide a song name.\nExample: `.song despacito`" },
                { quoted: m }
            );
        }

        const query = args.join(" ");
        try {
            // 🔍 Search YouTube
            console.log(`[Song] Searching for: ${query}`);
            const search = await yts(query);
            if (!search.videos || search.videos.length === 0) {
                return sock.sendMessage(jid, { text: "❌ No results found for your query." }, { quoted: m });
            }

            const video = search.videos[0]; // Best match
            const url = video.url;
            console.log(`[Song] Selected video: ${video.title} (${url})`);

            // Create downloads folder if it doesn't exist
            const downloadsDir = path.join(__dirname, "../downloads");
            if (!fs.existsSync(downloadsDir)) {
                fs.mkdirSync(downloadsDir, { recursive: true });
            }

            const outFile = path.join(downloadsDir, `${Date.now()}.mp3`);

            // Notify user
            await sock.sendMessage(
                jid,
                { text: `🎶 Downloading *${video.title}*...\n⏳ Please wait (this may take a few seconds)...` },
                { quoted: m }
            );

            // Validate YouTube URL
            if (!ytdl.validateURL(url)) {
                throw new Error("Invalid YouTube URL.");
            }

            // Download and convert audio using ytdl-core and fluent-ffmpeg
            await new Promise((resolve, reject) => {
                const stream = ytdl(url, {
                    filter: "audioonly",
                    quality: "highestaudio"
                });

                ffmpeg(stream)
                    .audioBitrate(128)
                    .format("mp3")
                    .save(outFile)
                    .on("end", () => {
                        console.log(`[Song] Audio saved to: ${outFile}`);
                        resolve();
                    })
                    .on("error", (err) => {
                        console.error("[Song] FFmpeg error:", err.message);
                        reject(err);
                    });
            });

            // Verify file exists and is not empty
            if (!fs.existsSync(outFile) || fs.statSync(outFile).size === 0) {
                throw new Error("Downloaded audio file is missing or empty.");
            }

            // ✅ Send song to WhatsApp
            await sock.sendMessage(
                jid,
                {
                    audio: { url: outFile },
                    mimetype: "audio/mpeg",
                    fileName: `${video.title}.mp3`
                },
                { quoted: m }
            );

            // Clean up
            fs.unlinkSync(outFile);
            console.log(`[Song] Cleaned up: ${outFile}`);
        } catch (err) {
            console.error("[Song] Unexpected error:", err.message);
            await sock.sendMessage(
                jid,
                { text: `❌ Failed to process song.\nError: ${err.message}\nPlease try again later or use a different song name.` },
                { quoted: m }
            );
        }
    }
};
