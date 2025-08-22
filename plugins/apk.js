const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
    name: "apk",
    command: ["apk"],
    description: "Search APKs from ApkPure",
    async execute(sock, m, args) {
        try {
            if (!args[0]) {
                return sock.sendMessage(m.key.remoteJid, { text: "❌ Usage: .apk <app name>" }, { quoted: m });
            }

            const query = args.join(" ");
            const searchUrl = `https://apkpure.com/search?q=${encodeURIComponent(query)}`;

            await sock.sendMessage(m.key.remoteJid, { text: `🔍 Searching for *${query}*...` }, { quoted: m });

            const { data } = await axios.get(searchUrl, { timeout: 15000 });
            const $ = cheerio.load(data);

            let firstApp = $(".main .search-dl .info")
                .first();

            if (!firstApp || firstApp.length === 0) {
                return sock.sendMessage(m.key.remoteJid, { text: "⚠️ No results found." }, { quoted: m });
            }

            const title = firstApp.find("a").attr("title") || "Unknown App";
            const link = "https://apkpure.com" + firstApp.find("a").attr("href");
            const icon = firstApp.parent().find("img").attr("src") || null;

            let msg = `📱 *App Found!*\n\n`;
            msg += `🔤 Name: ${title}\n`;
            msg += `🔗 Link: ${link}\n\n`;
            msg += `⬇️ Download from ApkPure`;

            if (icon) {
                await sock.sendMessage(
                    m.key.remoteJid,
                    { image: { url: icon }, caption: msg },
                    { quoted: m }
                );
            } else {
                await sock.sendMessage(m.key.remoteJid, { text: msg }, { quoted: m });
            }

        } catch (err) {
            console.error("APK Command Error:", err.message);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Error while searching APK. Try again later." }, { quoted: m });
        }
    }
};
