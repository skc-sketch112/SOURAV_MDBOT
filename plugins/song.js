const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");

module.exports = {
    name: "song",
    command: ["song"],
    execute: async (sock, m, args) => {
        try {
            if (!args[0]) {
                return await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "🎵 Example: .song kesariya" },
                    { quoted: m }
                );
            }

            let query = args.join(" ");
            let search = await yts(query);
            let video = search.videos[0];
            if (!video) {
                return await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ No results found." },
                    { quoted: m }
                );
            }

            let info = await ytdl.getInfo(video.url);
            let audioFormat = ytdl.chooseFormat(info.formats, { filter: "audioonly" });

            const filePath = "./song.mp3";
            const stream = ytdl(video.url, { filter: "audioonly", quality: "highestaudio" })
                .pipe(fs.createWriteStream(filePath));

            stream.on("finish", async () => {
                await sock.sendMessage(
                    m.key.remoteJid,
                    {
                        audio: fs.readFileSync(filePath),
                        mimetype: "audio/mpeg",
                        fileName: `${video.title}.mp3`
                    },
                    { quoted: m }
                );

                fs.unlinkSync(filePath);
            });
        } catch (e) {
            await sock.sendMessage(
                m.key.remoteJid,
                { text: `⚠️ Error while executing song: ${e.message}` },
                { quoted: m }
            );
        }
    }
};
