// plugins/song.js
const fs = require("fs");
const path = require("path");
const play = require("play-dl");

module.exports = {
    name: "song",
    command: ["song", "play", "music"],
    description: "Download unlimited real songs from YouTube or SoundCloud",
    execute: async (sock, m, args) => {
        try {
            if (!args[0]) {
                return sock.sendMessage(m.key.remoteJid, { 
                    text: "🎵 Please give me a song name!\nExample: *.song Tum Hi Ho*" 
                }, { quoted: m });
            }

            const query = args.join(" ");
            await sock.sendMessage(m.key.remoteJid, { text: `⏳ Searching for: *${query}*` }, { quoted: m });

            // 🔎 Search on YouTube
            let info;
            try {
                const yt_result = await play.search(query, { limit: 1 });
                if (!yt_result || yt_result.length === 0) throw new Error("No YouTube result");
                info = yt_result[0];
            } catch {
                // 🔄 Fallback to SoundCloud
                const sc_result = await play.search(query, { source: { soundcloud: "tracks" }, limit: 1 });
                if (!sc_result || sc_result.length === 0) {
                    return sock.sendMessage(m.key.remoteJid, { text: "❌ No song found anywhere! Try another query." }, { quoted: m });
                }
                info = sc_result[0];
            }

            const url = info.url;
            const title = info.title;
            const channel = info.channel?.name || "Unknown Artist";
            const duration = info.durationRaw || "N/A";
            const thumbnail = info.thumbnails?.[0]?.url || "";

            // 🎧 Download highest quality stream
            const stream = await play.stream(url, { quality: 2 }); // 2 = highest audio
            const filePath = path.join(__dirname, `${Date.now()}.mp3`);
            const writer = fs.createWriteStream(filePath);

            stream.stream.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            // 🎶 Send song card
            await sock.sendMessage(m.key.remoteJid, {
                image: { url: thumbnail },
                caption: `🎶 *${title}*\n👤 Artist: ${channel}\n⏱ Duration: ${duration}\n📻 Requested by: ${m.pushName || "User"}`
            }, { quoted: m });

            // 📤 Send audio
            await sock.sendMessage(m.key.remoteJid, {
                audio: { url: filePath },
                mimetype: "audio/mpeg",
                fileName: `${title}.mp3`
            }, { quoted: m });

            fs.unlinkSync(filePath); // 🧹 cleanup

        } catch (err) {
            console.error("SONG ERROR:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to get song. Please try again!" }, { quoted: m });
        }
    }
};
