const youtubedl = require("youtube-dl-exec");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "song",
    command: ["song"],
    execute: async (sock, m, args) => {
        try {
            if (!args[0]) {
                return sock.sendMessage(m.key.remoteJid, { text: "❌ Please provide a song name.\nExample: *.song despacito*" }, { quoted: m });
            }

            let query = args.join(" ");
            let file = path.join(__dirname, "song.mp3");

            // ========== 1. YouTube First ==========
            try {
                const result = await youtubedl(`ytsearch1:${query}`, {
                    dumpSingleJson: true,
                    noCheckCertificates: true,
                    noWarnings: true,
                    preferFreeFormats: true,
                    addHeader: ["referer:youtube.com", "user-agent:googlebot"]
                });

                if (result?.entries?.length > 0) {
                    const video = result.entries[0];
                    const url = video.webpage_url;
                    const title = video.title;

                    await youtubedl(url, {
                        extractAudio: true,
                        audioFormat: "mp3",
                        audioQuality: 0,
                        output: file,
                    });

                    await sock.sendMessage(m.key.remoteJid, {
                        audio: { url: file },
                        mimetype: "audio/mp4"
                    }, { quoted: m });

                    fs.unlinkSync(file);
                    return;
                }
            } catch (ytErr) {
                console.log("❌ YouTube failed, switching…");
            }

            // ========== 2. Stable Fallback (Piyush API) ==========
            try {
                const api = await axios.get(`https://api-piyush.up.railway.app/song?query=${encodeURIComponent(query)}`);
                if (api.data.status && api.data.downloadUrl) {
                    await sock.sendMessage(m.key.remoteJid, {
                        audio: { url: api.data.downloadUrl },
                        mimetype: "audio/mp4"
                    }, { quoted: m });
                    return;
                }
            } catch (apiErr) {
                console.log("❌ API fallback failed");
            }

            // If all fail
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Sorry, servers failed. Try another song or check API." }, { quoted: m });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Error fetching song." }, { quoted: m });
        }
    }
};
