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
            // 🔍 Search YouTube
            const search = await yts(query);
            if (!search.videos || search.videos.length === 0) {
                return sock.sendMessage(m.key.remoteJid, { text: "❌ No results found." }, { quoted: m });
            }

            const video = search.videos[0]; // best match
            const url = video.url;

            // Create downloads folder if not exists
            const downloadsDir = path.join(__dirname, "../downloads");
            if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);

            const outFile = path.join(downloadsDir, `${Date.now()}.mp3`);

            // Notify user
            await sock.sendMessage(
                m.key.remoteJid,
                { text: `🎶 Downloading *${video.title}*...\n⏳ Please wait...` },
                { quoted: m }
            );

            // ⚡ Use yt-dlp binary from project root
            execFile(
                path.join(__dirname, "../yt-dlp"),
                [
                    "-x",
                    "--audio-format", "mp3",
                    "--audio-quality", "0", // best quality
                    "-o", outFile,
                    url
                ],
                async (error, stdout, stderr) => {
                    if (error) {
                        console.error("yt-dlp error:", error, stderr);
                        return sock.sendMessage(
                            m.key.remoteJid,
                            { text: "❌ Failed to download audio. Try again later." },
                            { quoted: m }
                        );
                    }

                    // ✅ Send song to WhatsApp
                    await sock.sendMessage(
                        m.key.remoteJid,
                        {
                            audio: { url: outFile },
                            mimetype: "audio/mpeg",
                            fileName: `${video.title}.mp3`
                        },
                        { quoted: m }
                    );

                    // Clean up
                    fs.unlinkSync(outFile);
                }
            );
        } catch (err) {
            console.error("Song command error:", err);
            sock.sendMessage(m.key.remoteJid, { text: "❌ Unexpected error occurred." }, { quoted: m });
        }
    }
};                    
