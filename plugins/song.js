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

            // =============================
            // 1. Try YouTube first
            // =============================
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
                    const title = video.title;
                    const duration = video.duration;
                    const thumbnail = video.thumbnail;
                    const url = video.webpage_url;

                    // Download mp3
                    await youtubedl(url, {
                        extractAudio: true,
                        audioFormat: "mp3",
                        audioQuality: 0,
                        output: file,
                    });

                    // Send info
                    await sock.sendMessage(m.key.remoteJid, {
                        image: { url: thumbnail },
                        caption: `🎶 *${title}*\n⏱ Duration: ${duration}\n🔗 [YouTube Link](${url})`
                    }, { quoted: m });

                    // Send audio
                    await sock.sendMessage(m.key.remoteJid, {
                        audio: { url: file },
                        mimetype: "audio/mp4",
                        ptt: false
                    }, { quoted: m });

                    fs.unlinkSync(file);
                    return;
                }
            } catch (ytErr) {
                console.log("YouTube failed, switching to API…");
            }

            // =============================
            // 2. Fallback: JioSaavn API
            // =============================
            try {
                const res = await axios.get(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}`);
                if (res.data.data && res.data.data.results.length > 0) {
                    const song = res.data.data.results[0];
                    const title = song.name;
                    const artists = song.primaryArtists;
                    const url = song.downloadUrl[4].link; // 320kbps mp3
                    const thumbnail = song.image[2].link;

                    await sock.sendMessage(m.key.remoteJid, {
                        image: { url: thumbnail },
                        caption: `🎶 *${title}*\n👤 ${artists}\n🔗 Saavn`
                    }, { quoted: m });

                    await sock.sendMessage(m.key.remoteJid, {
                        audio: { url },
                        mimetype: "audio/mp4",
                        ptt: false
                    }, { quoted: m });
                    return;
                }
            } catch (sErr) {
                console.log("Saavn API also failed");
            }

            // =============================
            // 3. Final fallback: generic API
            // =============================
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Sorry, all servers failed. Try another song name." }, { quoted: m });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Error fetching song. Try again later." }, { quoted: m });
        }
    }
};
