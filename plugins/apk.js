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

            // === Search from ApkCombo ===
            const searchUrl = `https://apkcombo.com/en/search/?q=${encodeURIComponent(query)}`;
            const { data } = await axios.get(searchUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
            const $ = cheerio.load(data);

            let results = [];
            $(".search-result a").each((i, el) => {
                if (i < 5) {
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

            // === Try to fetch direct download for first app ===
            try {
                const firstApp = results[0];
                const { data: appPage } = await axios.get(firstApp.link, { headers: { "User-Agent": "Mozilla/5.0" } });
                const $$ = cheerio.load(appPage);

                let dlPage = $$(".variant").first().find("a").attr("href");
                if (!dlPage) dlPage = $$(".apk").attr("href"); // fallback

                if (dlPage) {
                    const fullDlPage = "https://apkcombo.com" + dlPage;
                    const { data: dlData } = await axios.get(fullDlPage, { headers: { "User-Agent": "Mozilla/5.0" } });
                    const $$$ = cheerio.load(dlData);
                    const finalLink = $$$("a#download_button").attr("href");

                    if (finalLink) {
                        await sock.sendMessage(m.key.remoteJid, {
                            document: { url: finalLink },
                            mimetype: "application/vnd.android.package-archive",
                            fileName: `${firstApp.name}.apk`
                        }, { quoted: m });
                    } else {
                        await sock.sendMessage(m.key.remoteJid, { text: `⚠️ Could not fetch direct APK for ${firstApp.name}. Use the website link above.` }, { quoted: m });
                    }
                } else {
                    await sock.sendMessage(m.key.remoteJid, { text: "⚠️ No direct APK found, use the link above." }, { quoted: m });
                }
            } catch (innerErr) {
                console.error("⚠️ Download link fetch failed:", innerErr.message);
                await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Could not auto-download APK, but links are provided above ✅" }, { quoted: m });
            }

        } catch (err) {
            console.error("❌ APK Error:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Error while fetching APK. Please try again later." }, { quoted: m });
        }
    }
};
