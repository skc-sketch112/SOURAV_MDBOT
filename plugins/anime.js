const fetch = require("node-fetch");

module.exports = {
    name: "anime",
    command: ["anime"],
    execute: async (sock, m, args) => {
        try {
            // List of catgirl-type anime categories
            const categories = ["neko", "kitsune", "foxgirl", "blush"];
            // Pick a category randomly or allow user argument
            const category = args[0]?.toLowerCase();
            const chosenCategory = categories.includes(category)
                ? category
                : categories[Math.floor(Math.random() * categories.length)];

            // Multiple APIs for catgirl images
            const apiList = [
                `https://api.waifu.pics/sfw/${chosenCategory}`,
                `https://nekos.life/api/v2/img/${chosenCategory}`,
                `https://nekos.best/api/v2/${chosenCategory}`,
                `https://nekosia.cat/api/${chosenCategory}`
            ];

            const images = [];

            // Fetch 5 images
            for (let i = 0; i < 5; i++) {
                const apiUrl = apiList[Math.floor(Math.random() * apiList.length)];
                try {
                    const res = await fetch(apiUrl);
                    const data = await res.json();

                    // Different APIs may have different response keys
                    let imageUrl = data.url || data.image || data.images?.[0];
                    if (imageUrl) images.push(imageUrl);
                } catch (err) {
                    console.error(`Error fetching from ${apiUrl}:`, err);
                }
            }

            if (images.length === 0) {
                return await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to fetch catgirl anime images. Try again!" }, { quoted: m });
            }

            // Send all 5 images
            for (const img of images) {
                await sock.sendMessage(m.key.remoteJid, {
                    image: { url: img },
                    caption: `✨ *Catgirl Anime (${chosenCategory})*`
                }, { quoted: m });
            }

        } catch (err) {
            console.error("❌ Anime.js error:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Something went wrong while fetching anime." }, { quoted: m });
        }
    }
};
