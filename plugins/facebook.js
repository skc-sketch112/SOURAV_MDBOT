// plugins/facebook.js
const axios = require("axios");

module.exports = {
    name: "facebook",
    command: ["facebook", "fb", "fbvid"],

    async execute(sock, m, args) {
        if (!args[0]) {
            return sock.sendMessage(m.key.remoteJid, {
                text: "❌ Usage: .facebook <fb-video-link>\nExample: .fb https://fb.watch/xxxxxx/"
            }, { quoted: m });
        }

        let url = args[0];

        try {
            // External powerful API (Fast + HD support)
            let api = `https://api.ryzendesu.vip/api/downloader/fb?url=${encodeURIComponent(url)}`;

            let res = await axios.get(api);
            let data = res.data;

            if (!data || !data.result || (!data.result.hd && !data.result.sd)) {
                return sock.sendMessage(m.key.remoteJid, {
                    text: "⚠️ Failed to fetch video. Make sure link is valid & public!"
                }, { quoted: m });
            }

            let videoUrl = data.result.hd || data.result.sd;

            await sock.sendMessage(
                m.key.remoteJid,
                {
                    video: { url: videoUrl },
                    caption: `✅ Facebook Video Downloaded!\n\n🎥 Quality: ${data.result.hd ? "HD" : "SD"}`
                },
                { quoted: m }
            );

        } catch (err) {
            console.error("FB Plugin Error:", err.message);
            await sock.sendMessage(m.key.remoteJid, {
                text: "❌ Error downloading video. Try again later!"
            }, { quoted: m });
        }
    }
};
