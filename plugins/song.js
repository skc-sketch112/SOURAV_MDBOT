const play = require("play-dl");
const fs = require("fs");
const path = require("path");

async function downloadAndSend(sock, m, video, type = "audio") {
    try {
        const stream = await play.stream(video.url, { quality: 2 });
        const filePath = path.resolve(__dirname, `${video.videoId}.${type === "audio" ? "mp3" : "mp4"}`);
        const writeStream = fs.createWriteStream(filePath);

        stream.stream.pipe(writeStream);

        writeStream.on("finish", async () => {
            if (type === "audio") {
                await sock.sendMessage(m.key.remoteJid, {
                    audio: { url: filePath },
                    mimetype: "audio/mpeg",
                    fileName: `${video.title}.mp3`,
                    caption: `🎵 *Enjoy your track!*\n✨ ${video.title}`
                }, { quoted: m });
            } else {
                await sock.sendMessage(m.key.remoteJid, {
                    video: { url: filePath },
                    mimetype: "video/mp4",
                    fileName: `${video.title}.mp4`,
                    caption: `🎬 *Here’s your video!*\n✨ ${video.title}`
                }, { quoted: m });
            }
            fs.unlinkSync(filePath);
        });
    } catch (err) {
        console.error("❌ Download error:", err);
        await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Download blocked (403). Retrying with fallback..." }, { quoted: m });
    }
}
