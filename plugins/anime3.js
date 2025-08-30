const fetch = require("node-fetch");

module.exports = {
    name: "anime3",
    command: ["anime3"],
    execute: async (sock, m, args) => {
        try {
            // Anime landscape/art categories
            const categories = ["landscape", "scenery", "art", "cityscape", "nature"];
            const category = args[0]?.toLowerCase();
            const chosenCategory = categories.includes(category)
                ? category
                : categories[Math.floor(Math.random() * categories.length)];

            // 7+ APIs for variety
            const apiList = [
                `https://api.waifu.pics/sfw/${chosenCategory}`,
                `https://nekos.life/api/v2/img/${chosenCategory}`,
                `https://nekos.best/api/v2/${chosenCategory}`,
                `https://nekosia.cat/api/${chosenCategory}`,
                `https://pic.re/api/${chosenCategory}`,
                `https://waifu.pics/api/v1/${chosenCategory}`,
                `https://anime-api.com/api/v1/${chosenCategory}`
            ];

            const images = [];

            // Fetch 5 images
            for (let i = 0; i < 5; i++) {
                const apiUrl = apiList[Math.floor(Math.random() * apiList.length)];
                try {
                    const res = await fetch(apiUrl);
                    const contentType = res.headers.get("content-type");
                    if (!contentType || !contentType.includes("application/json")) {
                        console.error(`Invalid JSON from ${apiUrl}, skipping`);
                        continue;
                    }
                    const data = await res.json();
                    let imageUrl = data.url || data.image || data.images?.[0];
                    if (imageUrl) images.push(imageUrl);
                } catch (err) {
                    console.error(`Error fetching from ${apiUrl}:`, err);
                }
            }

            if (images.length === 0) {
                return await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to fetch anime images. Try again!" }, { quoted: m });
            }

            // Send all 5 images
            for (const img of images) {
                await sock.sendMessage(m.key.remoteJid, {
                    image: { url: img },
                    caption: `✨ *Anime (${chosenCategory})*`
                }, { quoted: m });
            }

        } catch (err) {
            console.error("❌ Anime3.js error:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Something went wrong while fetching anime." }, { quoted: m });
        }
    }
};
