const ytdlp = require("yt-dlp-exec");
const fs = require("fs");
const axios = require("axios");

const PIPED_MIRRORS = [
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.syncpundit.io",
    "https://pipedapi.adminforge.de",
    "https://pipedapi.reallyaweso.me"
];

module.exports = {
    name: "song",
    command: ["song"],
    execute: async (sock, m, args) => {
        if (!args[0]) {
            return sock.sendMessage(m.key.remoteJid, { text: "⚡ Give me a song name or YouTube link!\n\nExample:\n.song despacito" }, { quoted: m });
        }

        const query = args.join(" ");
        const output = "song.mp3";

        try {
            await sock.sendMessage(m.key.remoteJid, { text: `🎶 Downloading *${query}* ...` }, { quoted: m });

            // Try yt-dlp first
            await ytdlp(query, {
                extractAudio: true,
                audioFormat: "mp3",
                audioQuality: 0,
                output,
                noCheckCertificates: true,
                noWarnings: true
            });

            await sock.sendMessage(m.key.remoteJid, {
                audio: fs.readFileSync(output),
                mimetype: "audio/mpeg",
                fileName: `${query}.mp3`
            }, { quoted: m });

            fs.unlinkSync(output);
        } catch (err) {
            console.error("yt-dlp failed, trying Piped mirrors:", err.message);

            let success = false;
            for (const mirror of PIPED_MIRRORS) {
                try {
                    const search = await axios.get(`${mirror}/search?q=${encodeURIComponent(query)}&filter=videos`);
                    const video = search.data.items?.[0];
                    if (!video) continue;

                    const videoId = video.url.split("v=")[1];
                    const streams = await axios.get(`${mirror}/streams/${videoId}`);
                    const audio = streams.data.audioStreams.find(a => a.mimeType.includes("audio/mp4"));

                    if (!audio) continue;

                    await sock.sendMessage(m.key.remoteJid, {
                        audio: { url: audio.url },
                        mimetype: "audio/mpeg",
                        fileName: `${video.title}.mp3`
                    }, { quoted: m });

                    success = true;
                    break; // stop at first working mirror
                } catch (e) {
                    console.error(`Mirror failed (${mirror}):`, e.message);
                    continue;
                }
            }

            if (!success) {
                await sock.sendMessage(m.key.remoteJid, { text: "❌ Song download failed from all sources." }, { quoted: m });
            }
        }
    }
};
