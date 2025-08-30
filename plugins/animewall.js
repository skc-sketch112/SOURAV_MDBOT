const fetch = require("node-fetch");

module.exports = {
    name: "animewall",
    command: ["animewall", "wallpaper", "animewallpaper"],
    desc: "Fetch 5 realistic anime wallpapers from multiple APIs",
    execute: async (sock, m, args) => {
        try {
            // Categories for wallpapers
            const categories = ["scenery", "cityscape", "nature", "fantasy", "cyberpunk", "magic", "mecha", "landscape"];
            const category = args[0]?.toLowerCase();
            const chosenCategory = categories.includes(category)
                ? category
                : categories[Math.floor(Math.random() * categories.length)];

            // 8+ reliable APIs for realistic anime wallpapers
            const apiList = [
                `https://getimg.ai/api/v1/anime/${chosenCategory}`,
                `https://deepai.org/api/v1/anime-portrait-generator`,
                `https://pixai.art/api/v1/anime/${chosenCategory}`,
                `https://pic.re/api/v1/${chosenCategory}`,
                `https://ideogram.ai/api/v1/generate?style=realistic&category=${chosenCategory}`,
                `https://novelai.net/api/v1/anime/${chosenCategory}`,
                `https://openart.ai/api/v1/anime/${chosenCategory}`,
                `https://fotor.com/api/v1/anime/${chosenCategory}`,
                `https://wallhaven.cc/api/v1/search?q=${chosenCategory}&categories=100` // extra wallpaper source
            ];

            const images = [];
            let attempts = 0;

            // Fetch 5 unique wallpapers
            while (images.length < 5 && attempts < 30) {
                attempts++;
                const apiUrl = apiList[Math.floor(Math.random() * apiList.length)];
                try {
                    const res = await fetch(apiUrl, { timeout: 6000 });
                    const contentType = res.headers.get("content-type");
                    if (!contentType || !contentType.includes("application/json")) continue;

                    const data = await res.json();
                    let imageUrl = data.url || data.image || data.images?.[0] || data.data?.[0]?.path;
                    if (imageUrl && !images.includes(imageUrl)) images.push(imageUrl);
                } catch (err) {
                    console.error(`Error fetching from ${apiUrl}:`, err);
                    continue;
                }
            }

            if (images.length === 0) {
                return await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to fetch anime wallpapers. Try again!" }, { quoted: m });
            }

            // Send all 5 wallpapers
            for (const img of images) {
                await sock.sendMessage(m.key.remoteJid, {
                    image: { url: img },
                    caption: `✨ *Anime Wallpaper (${chosenCategory})*`
                }, { quoted: m });
            }

        } catch (err) {
            console.error("❌ AnimeWall.js error:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Something went wrong while fetching anime wallpapers." }, { quoted: m });
        }
    }
};
