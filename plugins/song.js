const yts = require("yt-search");
const play = require("play-dl");
const scdl = require("soundcloud-downloader");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "song",
    command: ["song"],
    execute: async (sock, m, args) => {
        try {
            if (!args[0]) {
                return sock.sendMessage(m.key.remoteJid, { text: "❌ Please provide a song name." }, { quoted: m });
            }

            const query = args.join(" ");
            const search = await yts(query);

            if (!search.videos.length) {
                return sock.sendMessage(m.key.remoteJid, { text: "❌ Song not found." }, { quoted: m });
            }

            const video = search.videos[0];
            const title = video.title;
            const url = video.url;

            // Temporary file
            const filePath = path.join(__dirname, `${Date.now()}.mp3`);

            // ✅ YouTube Download (using play-dl)
            if (url.includes("youtube.com")) {
                const stream = await play.stream(url, { quality: 2 });
                const writable = fs.createWriteStream(filePath);
                stream.stream.pipe(writable);

                await new Promise((resolve, reject) => {
                    writable.on("finish", resolve);
                    writable.on("error", reject);
                });
            }

            // ✅ SoundCloud Download
            else if (url.includes("soundcloud.com")) {
                const buffer = await scdl.download(url);
                fs.writeFileSync(filePath, buffer);
            }

            // Send to WhatsApp
            await sock.sendMessage(m.key.remoteJid, {
                audio: { url: filePath },
                mimetype: "audio/mp4",
                fileName: `${title}.mp3`,
                ptt: false
            }, { quoted: m });

            // Cleanup temp file
            fs.unlinkSync(filePath);

        } catch (err) {
            console.error("SONG ERROR:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Error downloading song." }, { quoted: m });
        }
    }
};
