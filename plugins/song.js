const { execFile } = require("child_process");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "song",
    command: ["song"],
    execute: async (sock, m, args) => {
        if (!args[0]) {
            return sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ Please provide a song name.\nExample: `.song despacito`" },
                { quoted: m }
            );
        }

        const query = args.join(" ");
        try {
            // 🔍 Search YouTube for the song
            const search = await yts(query);
            if (!search.videos || search.videos.length === 0) {
                return sock.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ No results found." },
                    { quoted: m }
                );
            }

            const video = search.videos[0]; // Take first result
            const url = video.url;
            const downloadsDir = path.join(__dirname, "../downloads");
            const outFile = path.join(downloadsDir, `${Date.now()}.mp3`);

            // ✅ Ensure downloads folder exists
            if (!fs.existsSync(downloadsDir)) {
                fs.mkdirSync(downloadsDir, { recursive: true });
            }

            await sock.sendMessage(
                m.key.remoteJid,
                { text: `🎶 Downloading *${video.title}*...\n⏳ Please wait...` },
                { quoted: m }
            );

            // ⚡ Use local yt-dlp binary from render-build.sh
            const ytdlpPath = path.join(__dirname, "../yt-dlp");

            execFile(
                ytdlpPath,
                [
                    "-x",
                    "--audio-format", "mp3",
                    "-o", outFile,
                    url
                ],
                (error, stdout, stderr) => {
                    if (error) {
                        console.error("yt-dlp error:", error);
                        return sock.sendMessage(
                            m.key.remoteJid,
                            { text: "❌ Failed to download audio. Try again later." },
                            { quoted: m }
                        );
                    }

                    // ✅ Send audio to WhatsApp
                    sock.sendMessage(
                        m.key.remoteJid,
                        {
                            audio: { url: outFile },
                            mimetype: "audio/mpeg",
                            fileName: `${video.title}.mp3`
                        },
                        { quoted: m }
                    ).then(() => {
                        // Clean up temp file after sending
                        fs.unlink(outFile, (err) => {
                            if (err) console.error("Cleanup error:", err);
                        });
                    });
                }
            );
        } catch (err) {
            console.error("Song command error:", err);
            return sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ An unexpected error occurred while processing your request." },
                { quoted: m }
            );
        }
    }
};
