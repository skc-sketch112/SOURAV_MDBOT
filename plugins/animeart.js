const fetch = require("node-fetch");

module.exports = {
    name: "animeart",
    command: ["animeart"],
    execute: async (sock, m, args) => {
        try {
            // Categories for realistic/fantasy anime art
            const categories = ["art", "scenery", "cityscape", "fantasy", "nature", "magic"];
            const category = args[0]?.toLowerCase();
            const chosenCategory = categories.includes(category)
                ? category
                : categories[Math.floor(Math.random() * categories.length)];

            // 6+ reliable APIs
            const apiList = [
                `https://api.waifu.pics/sfw/${chosenCategory}`,
                `https://nekos.life/api/v2/img/${chosenCategory}`,
                `https://nekos.best/api/v2/${chosenCategory}`,
                `https://api.waifu.pics/sfw/${chosenCategory}`,
                `https://nekos.life/api/v2/img/${chosenCategory}`,
                `https://nekos.best/api/v2/${chosenCategory}`
            ];

            const images = [];

            // Fetch 5 images safely with fallback
            let attempts = 0;
            while (images.length < 5 && attempts < 25) {
                attempts++;
                const apiUrl = apiList[Math.floor(Math.random() * apiList.length)];
                try {
                    const res = await fetch(apiUrl, { timeout: 5000 });
                    const contentType = res.headers.get("content-type");
                    if (!contentType || !contentType.includes("application/json")) continue;

                    const data = await res.json();
                    let imageUrl = data.url || data.image || data.images?.[0];
                    if (imageUrl && !images.includes(imageUrl)) images.push(imageUrl);
                } catch (err) {
                    console.error(`Error fetching from ${apiUrl}:`, err);
                    continue;
                }
            }

            if (images.length === 0) {
                return await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to fetch anime art images. Try again!" }, { quoted: m });
            }

            // Send all 5 images
            for (const img of images) {
                await sock.sendMessage(m.key.remoteJid, {
                    image: { url: img },
                    caption: `✨ *Anime Art (${chosenCategory})*`
                }, { quoted: m });
            }

        } catch (err) {
            console.error("❌ AnimeArt.js error:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Something went wrong while fetching anime art." }, { quoted: m });
        }
    }
};
