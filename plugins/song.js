const ytSearch = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

async function downloadAndSend(sock, m, video, type = "audio") {
    try {
        const filePath = path.resolve(__dirname, `${video.videoId}.${type === "audio" ? "mp3" : "mp4"}`);

        if (type === "audio") {
            const stream = ytdl(video.url, { filter: "audioonly", quality: "highestaudio" })
                .pipe(fs.createWriteStream(filePath));

            stream.on("finish", async () => {
                await sock.sendMessage(m.key.remoteJid, {
                    audio: { url: filePath },
                    mimetype: "audio/mpeg",
                    fileName: `${video.title}.mp3`,
                    caption: `🎵 *Enjoy your track!*\n✨ ${video.title}`
                }, { quoted: m });

                fs.unlinkSync(filePath);
            });
        } else {
            const stream = ytdl(video.url, { filter: "audioandvideo", quality: "highestvideo" })
                .pipe(fs.createWriteStream(filePath));

            stream.on("finish", async () => {
                await sock.sendMessage(m.key.remoteJid, {
                    video: { url: filePath },
                    mimetype: "video/mp4",
                    fileName: `${video.title}.mp4`,
                    caption: `🎬 *Here’s your video!*\n✨ ${video.title}`
                }, { quoted: m });

                fs.unlinkSync(filePath);
            });
        }
    } catch (err) {
        console.error("❌ Download error:", err);
        await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Failed to process your request." }, { quoted: m });
    }
}

module.exports = {
    name: "song",
    command: ["song", "music"],
    execute: async (sock, m, args) => {
        if (!args.length) {
            return sock.sendMessage(m.key.remoteJid, {
                text: "🎧 Please provide a song name!\n\nExample:\n.song Believer\n.song Tum Hi Ho"
            }, { quoted: m });
        }

        const query = args.join(" ");
        const search = await ytSearch(query);
        if (!search.videos.length) {
            return sock.sendMessage(m.key.remoteJid, { text: "❌ No results found!" }, { quoted: m });
        }

        const video = search.videos[0];

        await sock.sendMessage(m.key.remoteJid, {
            image: { url: video.thumbnail },
            caption: `🎶 *Now Fetching Your Song...*\n\n` +
                     `📌 *Title:* ${video.title}\n` +
                     `⏱️ *Duration:* ${video.timestamp}\n` +
                     `📺 *Channel:* ${video.author.name}\n` +
                     `🔗 *Link:* ${video.url}\n\n` +
                     `⚡ Use:\n.song <name> → Audio 🎵\n.video <name> → Video 🎬`
        }, { quoted: m });

        // Auto send audio directly
        await downloadAndSend(sock, m, video, "audio");
    }
};

// Extra command for video
module.exports.video = {
    name: "video",
    command: ["video", "vid"],
    execute: async (sock, m, args) => {
        if (!args.length) {
            return sock.sendMessage(m.key.remoteJid, {
                text: "📽️ Please provide a video name!\n\nExample:\n.video Faded\n.video On My Way"
            }, { quoted: m });
        }

        const query = args.join(" ");
        const search = await ytSearch(query);
        if (!search.videos.length) {
            return sock.sendMessage(m.key.remoteJid, { text: "❌ No results found!" }, { quoted: m });
        }

        const video = search.videos[0];
        await sock.sendMessage(m.key.remoteJid, {
            image: { url: video.thumbnail },
            caption: `📽️ *Now Fetching Your Video...*\n\n` +
                     `📌 *Title:* ${video.title}\n` +
                     `⏱️ *Duration:* ${video.timestamp}\n` +
                     `📺 *Channel:* ${video.author.name}\n` +
                     `🔗 *Link:* ${video.url}`
        }, { quoted: m });

        await downloadAndSend(sock, m, video, "video");
    }
};
