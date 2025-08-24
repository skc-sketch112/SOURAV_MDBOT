const ytSearch = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "song",
    command: ["song", "music"],
    execute: async (sock, m, args) => {
        try {
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
            const audioPath = path.resolve(__dirname, `${video.videoId}.mp3`);
            const videoPath = path.resolve(__dirname, `${video.videoId}.mp4`);

            // 🎶 Send details card first
            await sock.sendMessage(m.key.remoteJid, {
                image: { url: video.thumbnail },
                caption: `🎶 *Now Fetching Your Song...*\n\n` +
                         `📌 *Title:* ${video.title}\n` +
                         `⏱️ *Duration:* ${video.timestamp}\n` +
                         `📺 *Channel:* ${video.author.name}\n` +
                         `🔗 *Link:* ${video.url}\n\n` +
                         `⚡ Reply with: \n 1️⃣ Audio 🎵 \n 2️⃣ Video 🎬`
            }, { quoted: m });

            // ✨ Wait for user reply (audio/video choice)
            sock.ev.once("messages.upsert", async (msgUpdate) => {
                try {
                    const msg = msgUpdate.messages[0];
                    if (!msg.message || msg.key.fromMe) return;

                    const choice = msg.message.conversation?.trim();
                    if (choice === "1" || choice.toLowerCase() === "audio") {
                        // Download Audio
                        const stream = ytdl(video.url, { filter: "audioonly", quality: "highestaudio" })
                            .pipe(fs.createWriteStream(audioPath));

                        stream.on("finish", async () => {
                            await sock.sendMessage(m.key.remoteJid, {
                                audio: { url: audioPath },
                                mimetype: "audio/mpeg",
                                fileName: `${video.title}.mp3`,
                                caption: `🎵 *Enjoy your track!*\n✨ ${video.title}`
                            }, { quoted: m });

                            fs.unlinkSync(audioPath); // cleanup
                        });
                    } 
                    else if (choice === "2" || choice.toLowerCase() === "video") {
                        // Download Video
                        const stream = ytdl(video.url, { filter: "audioandvideo", quality: "highestvideo" })
                            .pipe(fs.createWriteStream(videoPath));

                        stream.on("finish", async () => {
                            await sock.sendMessage(m.key.remoteJid, {
                                video: { url: videoPath },
                                mimetype: "video/mp4",
                                fileName: `${video.title}.mp4`,
                                caption: `🎬 *Here’s your video!*\n✨ ${video.title}`
                            }, { quoted: m });

                            fs.unlinkSync(videoPath); // cleanup
                        });
                    } else {
                        await sock.sendMessage(m.key.remoteJid, { text: "❌ Invalid choice. Reply with `1` for Audio or `2` for Video." }, { quoted: m });
                    }
                } catch (err) {
                    console.error("❌ Error in choice handling:", err);
                }
            });

        } catch (err) {
            console.error("❌ Error in song.js:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Failed to fetch song. Try again later." }, { quoted: m });
        }
    }
};
