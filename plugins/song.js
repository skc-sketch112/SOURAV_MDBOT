const play = require("play-dl");
const fs = require("fs");

module.exports = {
    name: "song",
    command: ["song", "play", "music"],
    execute: async (sock, m, args) => {
        if (!args.length) {
            return sock.sendMessage(m.key.remoteJid, { 
                text: "❌ *Please enter a song name or YouTube link!*\n👉 Example: `.song Believer` or `.song https://youtu.be/...`" 
            }, { quoted: m });
        }

        let query = args.join(" ");
        let song;

        try {
            // 📌 If it's a YouTube URL, use it directly
            if (play.yt_validate(query) === "video") {
                let yt_info = await play.video_info(query);
                song = yt_info.video_details;
            } else {
                // 🔎 Otherwise, search by name
                let results = await play.search(query, { limit: 1 });
                if (!results.length) {
                    return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Song not found!" }, { quoted: m });
                }
                song = results[0];
            }

            // 🎨 Info Card
            await sock.sendMessage(m.key.remoteJid, {
                image: { url: song.thumbnails[0].url },
                caption: `✨ *Now Playing* ✨\n\n` +
                         `🎶 *Title:* ${song.title}\n` +
                         `📀 *Channel:* ${song.channel?.name || "Unknown"}\n` +
                         `⏱️ *Duration:* ${song.durationRaw || "N/A"}\n` +
                         `👁️ *Views:* ${song.views?.toLocaleString() || "N/A"}\n\n` +
                         `🔗 ${song.url}`
            }, { quoted: m });

            // 🎵 Download & Send
            let stream = await play.stream(song.url);
            let filePath = `./${Date.now()}.mp3`;

            const writeStream = fs.createWriteStream(filePath);
            stream.stream.pipe(writeStream);

            writeStream.on("finish", async () => {
                await sock.sendMessage(m.key.remoteJid, {
                    audio: { url: filePath },
                    mimetype: "audio/mpeg",
                    fileName: `${song.title}.mp3`
                }, { quoted: m });

                fs.unlinkSync(filePath); // delete after sending
            });

        } catch (err) {
            console.error(err);
            sock.sendMessage(m.key.remoteJid, { 
                text: "❌ Failed to fetch the song. Try another link or name!" 
            }, { quoted: m });
        }
    }
};
