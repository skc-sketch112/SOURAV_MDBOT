const ytdl = require("youtube-dl-exec");
const playdl = require("play-dl");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
    name: "song",
    command: ["song"],
    execute: async (sock, m, args) => {
        const chatId = m.key.remoteJid;
        const query = args && args.length > 0 ? args.join(" ") : null;

        if (!query) {
            return sock.sendMessage(chatId, { text: "❌ Please provide a song name or YouTube link!\n\nExample: `.song despacito`" }, { quoted: m });
        }

        let file = path.join(__dirname, "song.mp3");

        try {
            // ✅ If user gave name → search on YouTube
            let url = query;
            if (!query.startsWith("http")) {
                let search = await yts(query);
                if (!search.videos.length) {
                    return sock.sendMessage(chatId, { text: "❌ No results found for `" + query + "`" }, { quoted: m });
                }
                url = search.videos[0].url;
            }

            // 🔹 Try yt-dlp first
            try {
                await ytdl(url, {
                    extractAudio: true,
                    audioFormat: "mp3",
                    audioQuality: "0",
                    output: file,
                });
                await sock.sendMessage(chatId, { audio: fs.readFileSync(file), mimetype: "audio/mpeg", fileName: `${query}.mp3` }, { quoted: m });
                fs.unlinkSync(file);
                return;
            } catch (err) {
                console.log("⚠️ yt-dlp failed:", err.message);
            }

            // 🔹 Try play-dl second
            try {
                let stream = await playdl.stream(url);
                const writer = fs.createWriteStream(file);
                stream.stream.pipe(writer);
                await new Promise(resolve => writer.on("finish", resolve));

                await sock.sendMessage(chatId, { audio: fs.readFileSync(file), mimetype: "audio/mpeg", fileName: `${query}.mp3` }, { quoted: m });
                fs.unlinkSync(file);
                return;
            } catch (err) {
                console.log("⚠️ play-dl failed:", err.message);
            }

            // 🔹 Last fallback: API
            try {
                let fallback = await axios.get(`https://api-viper-x.koyeb.app/api/song?text=${encodeURIComponent(query)}`);
                if (fallback.data?.result?.download_url) {
                    let audio = await axios.get(fallback.data.result.download_url, { responseType: "arraybuffer" });
                    await sock.sendMessage(chatId, { audio: audio.data, mimetype: "audio/mpeg", fileName: `${query}.mp3` }, { quoted: m });
                    return;
                }
            } catch (err) {
                console.log("⚠️ API fallback failed:", err.message);
            }

            // If everything fails
            await sock.sendMessage(chatId, { text: "❌ Could not download song. Try again later." }, { quoted: m });

        } catch (e) {
            console.error("🔥 Fatal Error:", e);
            await sock.sendMessage(chatId, { text: "⚠️ Something went wrong while processing your request." }, { quoted: m });
        }
    }
};
