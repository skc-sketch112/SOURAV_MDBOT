const ytSearch = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "song",
    command: ["song"],
    execute: async (sock, m, args) => {
        try {
            if (!args[0]) {
                return sock.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ Please provide a song name.\nExample: *.song despacito*" },
                    { quoted: m }
                );
            }

            let query = args.join(" ");
            let search = await ytSearch(query);

            if (!search.videos.length) {
                return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Song not found." }, { quoted: m });
            }

            let video = search.videos[0];
            let file = path.join(__dirname, "song.mp3");

            // 🎵 Send thumbnail + info first
            await sock.sendMessage(
                m.key.remoteJid,
                {
                    image: { url: video.thumbnail },
                    caption: `🎶 *${video.title}*\n\n⏱ Duration: ${video.timestamp}\n👀 Views: ${video.views.toLocaleString()}\n📤 Upload: ${video.ago}\n\n⬇️ Downloading, please wait...`
                },
                { quoted: m }
            );

            // 📥 Download audio
            const stream = ytdl(video.url, { filter: "audioonly", quality: "highestaudio" })
                .pipe(fs.createWriteStream(file));

            stream.on("finish", async () => {
                await sock.sendMessage(
                    m.key.remoteJid,
                    { audio: { url: file }, mimetype: "audio/mp4", ptt: false },
                    { quoted: m }
                );
                fs.unlinkSync(file); // delete file after sending
            });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Error while fetching song." }, { quoted: m });
        }
    }
};
