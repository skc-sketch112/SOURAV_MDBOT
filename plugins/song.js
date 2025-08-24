const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");

module.exports = {
    name: "song",
    command: ["song", "play"],
    execute: async (sock, m, args) => {
        try {
            if (!args.length) {
                return sock.sendMessage(m.key.remoteJid, { text: "❌ Please provide a song name!\nExample: .song Tum Hi Ho" }, { quoted: m });
            }

            const query = args.join(" ");
            const search = await yts(query);

            if (!search.videos.length) {
                return sock.sendMessage(m.key.remoteJid, { text: "⚠️ No results found!" }, { quoted: m });
            }

            const video = search.videos[0];
            const filePath = `./${video.videoId}.mp3`;

            // download audio
            const stream = ytdl(video.url, { filter: "audioonly", quality: "highestaudio" });
            const writeStream = fs.createWriteStream(filePath);
            stream.pipe(writeStream);

            writeStream.on("finish", async () => {
                // send song info first
                await sock.sendMessage(m.key.remoteJid, { 
                    image: { url: video.thumbnail }, 
                    caption: `🎵 *${video.title}*\n⏱️ ${video.timestamp}\n📺 ${video.author.name}\n🔗 ${video.url}` 
                }, { quoted: m });

                // send audio so everyone in group sees
                await sock.sendMessage(m.key.remoteJid, { 
                    audio: { url: filePath }, 
                    mimetype: "audio/mp4", 
                    fileName: `${video.title}.mp3` 
                }, { quoted: m });

                // ❌ removed auto delete (file stays in folder)
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Error fetching song!" }, { quoted: m });
        }
    }
};
