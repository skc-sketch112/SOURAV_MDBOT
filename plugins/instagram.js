// plugins/instagram.js
const { igdl } = require("@bochilteam/scraper");

module.exports = {
    name: "instagram",
    alias: ["ig", "insta", "reel", "igdl"],
    desc: "Download Instagram Reels/Videos",
    category: "downloader",

    async execute(sock, m, args) {
        try {
            if (!args[0]) {
                return await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Please provide an Instagram link!\nExample: .instagram https://www.instagram.com/reel/xyz" }, { quoted: m });
            }

            const url = args[0];
            await sock.sendMessage(m.key.remoteJid, { text: "⏳ Downloading Instagram Video... Please wait!" }, { quoted: m });

            const result = await igdl(url);

            if (!result || !result[0]?.url) {
                return await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to fetch video. Try another link!" }, { quoted: m });
            }

            for (let i = 0; i < result.length; i++) {
                await sock.sendMessage(m.key.remoteJid, {
                    video: { url: result[i].url },
                    caption: `✅ Downloaded by *SOURAV_MD* 🚀`
                }, { quoted: m });
            }

        } catch (e) {
            console.error("Instagram Plugin Error:", e);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Error fetching Instagram video!" }, { quoted: m });
        }
    }
};
