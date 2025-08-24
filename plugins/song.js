// plugins/song.js
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const fs = require("fs");

module.exports = {
    name: "song",
    command: ["song", "music", "play"],
    info: "Download unlimited songs (Hindi, Bengali, English, etc)",
    execute: async (sock, m, args) => {
        try {
            if (!args[0]) {
                return await sock.sendMessage(m.key.remoteJid, {
                    text: "🎶 Please type the song name.\n\nExample: *.song arijit singh tum hi ho*"
                }, { quoted: m });
            }

            const query = args.join(" ");
            await sock.sendMessage(m.key.remoteJid, {
                text: `🔍 Searching for: *${query}* ...`
            }, { quoted: m });

            // 🔎 YouTube search (unlimited results, no API needed)
            const result = await yts(query);
            if (!result.videos || result.videos.length === 0) {
                return await sock.sendMessage(m.key.remoteJid, {
                    text: "❌ No songs found. Try different keywords."
                }, { quoted: m });
            }

            // Take best match
            const song = result.videos[0];
            const url = song.url;

            // 🎵 Send song info
            await sock.sendMessage(m.key.remoteJid, {
                image: { url: song.thumbnail },
                caption: `🎧 *Now Playing*\n\n🎤 Title: ${song.title}\n👁 Views: ${song.views}\n🕒 Duration: ${song.timestamp}\n📅 Uploaded: ${song.ago}\n📎 Link: ${song.url}\n\n⬇️ Downloading audio, please wait...`
            }, { quoted: m });

            // 📥 Download high quality audio
            const filePath = `./${song.videoId}.mp3`;
            const stream = ytdl(url, {
                filter: "audioonly",
                quality: "highestaudio",
                highWaterMark: 1 << 25 // prevent slow download
            });

            stream.pipe(fs.createWriteStream(filePath));

            stream.on("end", async () => {
                await sock.sendMessage(m.key.remoteJid, {
                    audio: { url: filePath },
                    mimetype: "audio/mp4",
                    fileName: `${song.title}.mp3`
                }, { quoted: m });

                // cleanup
                fs.unlinkSync(filePath);
            });

        } catch (err) {
            console.error("SONG.JS ERROR:", err);
            await sock.sendMessage(m.key.remoteJid, {
                text: "⚠️ Error while fetching the song. Try again later."
            }, { quoted: m });
        }
    }
};
