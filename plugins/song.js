const ytdl = require("youtube-dl-exec");
const playdl = require("play-dl");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "song",
    command: ["song"],
    execute: async (sock, m, args) => {
        const query = args.join(" ");
        if (!query) return sock.sendMessage(m.key.remoteJid, { text: "❌ Please provide a song name or YouTube link!" }, { quoted: m });

        const chatId = m.key.remoteJid;
        let file = path.join(__dirname, "song.mp3");

        try {
            // ✅ 1. If direct YouTube link given
            let url = query;
            if (!query.startsWith("http")) {
                let search = await yts(query);
                if (!search.videos.length) return sock.sendMessage(chatId, { text: "❌ No results found!" }, { quoted: m });
                url = search.videos[0].url;
            }

            // ✅ Primary: yt-dlp direct
            try {
                await ytdl(url, {
                    extractAudio: true,
                    audioFormat: "mp3",
                    audioQuality: "0",
                    output: file,
                });
                await sock.sendMessage(chatId, { audio: fs.readFileSync(file), mimetype: "audio/mpeg", fileName: "song.mp3" }, { quoted: m });
                fs.unlinkSync(file);
                return;
            } catch (err) {
                console.log("⚠️ yt-dlp failed:", err.message);
            }

            // ✅ Backup: play-dl
            try {
                let stream = await playdl.stream(url);
                const { createWriteStream } = require("fs");
                const writer = createWriteStream(file);
                stream.stream.pipe(writer);
                await new Promise(resolve => writer.on("finish", resolve));

                await sock.sendMessage(chatId, { audio: fs.readFileSync(file), mimetype: "audio/mpeg", fileName: "song.mp3" }, { quoted: m });
                fs.unlinkSync(file);
                return;
            } catch (err) {
                console.log("⚠️ play-dl failed:", err.message);
            }

            // ✅ Last Fallback: simple API
            try {
                let fallback = await fetch(`https://api-viper-x.koyeb.app/api/song?text=${encodeURIComponent(query)}`);
                let data = await fallback.json();
                if (data.status && data.result?.download_url) {
                    const axios = require("axios");
                    const audio = await axios.get(data.result.download_url, { responseType: "arraybuffer" });
                    await sock.sendMessage(chatId, { audio: audio.data, mimetype: "audio/mpeg", fileName: "song.mp3" }, { quoted: m });
                    return;
                }
            } catch (err) {
                console.log("⚠️ API fallback failed:", err.message);
            }

            // If all failed
            await sock.sendMessage(chatId, { text: "❌ All sources failed. Try again later." }, { quoted: m });

        } catch (e) {
            console.error("🔥 Fatal Error:", e);
            await sock.sendMessage(chatId, { text: "⚠️ Error processing your request." }, { quoted: m });
        }
    }
};
