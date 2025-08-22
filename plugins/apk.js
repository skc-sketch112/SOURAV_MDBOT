const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
    name: "APK Downloader",
    command: ["apk", "app", "getapk"],
    description: "Search and download APK files (unlimited, no error).",

    async execute(sock, m, args) {
        const query = args.join(" ");
        if (!query) {
            return sock.sendMessage(m.key.remoteJid, { text: "❌ Please provide an app name.\n\nExample: `.apk whatsapp`" }, { quoted: m });
        }

        try {
            await sock.sendMessage(m.key.remoteJid, { text: `🔎 Searching APK for: *${query}* ...` }, { quoted: m });

            // === Scraping from ApkCombo (Fast & Stable) ===
            const searchUrl = `https://apkcombo.com/en/search/?q=${encodeURIComponent(query)}`;
            const { data } = await axios.get(searchUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
            const $ = cheerio.load(data);

            let results = [];
            $(".search-result a").each((i, el) => {
                if (i < 5) { // fetch top 5 apps
                    results.push({
                        name: $(el).find(".title").text().trim(),
                        link: "https://apkcombo.com" + $(el).attr("href"),
                        icon: $(el).find("img").attr("src")
                    });
                }
            });

            if (results.length === 0) {
                return sock.sendMessage(m.key.remoteJid, { text: `❌ No results found for: *${query}*` }, { quoted: m });
            }

            let caption = `📱 *Top APK Results for: ${query}*\n\n`;
            results.forEach((res, i) => {
                caption += `*${i + 1}. ${res.name}*\n🔗 ${res.link}\n\n`;
            });

            await sock.sendMessage(m.key.remoteJid, { text: caption }, { quoted: m });

            // === Auto Fetch Download Link for First App ===
            const firstApp = results[0];
            const { data: appPage } = await axios.get(firstApp.link, { headers: { "User-Agent": "Mozilla/5.0" } });
            const $$ = cheerio.load(appPage);
            const dlPage = "https://apkcombo.com" + $$(".apk").attr("href");

            if (!dlPage) {
                return sock.sendMessage(m.key.remoteJid, { text: `⚠️ Could not fetch direct APK link for ${firstApp.name}` }, { quoted: m });
            }

            // Get final download link
            const { data: dlData } = await axios.get(dlPage, { headers: { "User-Agent": "Mozilla/5.0" } });
            const $$$ = cheerio.load(dlData);
            const finalLink = $$$("a#download_button").attr("href");
