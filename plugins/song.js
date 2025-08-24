const axios = require("axios");

module.exports = {
    name: "song",
    command: ["song"],
    execute: async (sock, m, args) => {
        try {
            if (!args[0]) {
                return sock.sendMessage(m.key.remoteJid, { text: "❌ Please provide a song name." }, { quoted: m });
            }

            const query = args.join(" ");
            await sock.sendMessage(m.key.remoteJid, { text: `🔎 Searching for *${query}*...` }, { quoted: m });

            // Step 1: Search YouTube
            const search = await axios.get(`https://api.vreden.my.id/api/ytsearch?text=${encodeURIComponent(query)}`);
            if (!search.data || !search.data[0]) {
                return sock.sendMessage(m.key.remoteJid, { text: "⚠️ No results found." }, { quoted: m });
            }

            const video = search.data[0];
            const url = video.url;

            // Step 2: List of APIs (fallback rotation)
            const apis = [
                `https://api.vreden.my.id/api/ytdl?url=${encodeURIComponent(url)}&filter=audioonly&quality=highestaudio`,
                `https://api.ryzendesu.vip/api/download/ytmp3?url=${encodeURIComponent(url)}`,
                `https://api-smd.vercel.app/api/ytmp3?url=${encodeURIComponent(url)}`,
                `https://widipe.com/download/ytmp3?url=${encodeURIComponent(url)}`
            ];

            let dlUrl = null;

            // Step 3: Try APIs one by one
            for (let api of apis) {
                try {
                    const res = await axios.get(api);
                    if (res.data.url) {
                        dlUrl = res.data.url;
                        break;
                    } else if (res.data.result?.download_url) {
                        dlUrl = res.data.result.download_url;
                        break;
                    } else if (res.data.result) {
                        dlUrl = res.data.result;
                        break;
                    }
                } catch (e) {
                    console.log(`❌ API failed: ${api}`);
                }
            }

            // Step 4: If all APIs fail
            if (!dlUrl) {
                return sock.sendMessage(m.key.remoteJid, { text: "⚠️ All servers failed. Please try again later." }, { quoted: m });
            }

            // Step 5: Download MP3
            const audioFile = await axios.get(dlUrl, { responseType: "arraybuffer" });

            // Step 6: Send Thumbnail + Info (Spotify Style)
            await sock.sendMessage(
                m.key.remoteJid,
                {
                    image: { url: video.thumbnail },
                    caption: `🎵 *${video.title}*\n👤 Channel: ${video.author?.name || "Unknown"}\n⏱ Duration: ${video.timestamp || "N/A"}\n🔗 ${url}`
                },
                { quoted: m }
            );

            // Step 7: Send Audio
            await sock.sendMessage(
                m.key.remoteJid,
                {
                    audio: audioFile.data,
                    mimetype: "audio/mpeg",
                    fileName: `${video.title}.mp3`
                },
                { quoted: m }
            );

        } catch (err) {
            console.error("Song command error:", err.message);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Error downloading song. Try again later." }, { quoted: m });
        }
    },
};
