const fetch = require("node-fetch");

module.exports = {
    name: "anime",
    command: ["anime"],
    execute: async (sock, m, args) => {
        try {
            // List of anime categories
            const categories = ["neko", "kitsune", "foxgirl", "blush", "waifu", "trap", "yandere", "kemonomimi", "smile", "cry", "angry", "hug", "kiss", "tickle", "pat"];
            // Pick a category based on user input or randomly
            const category = args[0]?.toLowerCase();
            const chosenCategory = categories.includes(category)
                ? category
                : categories[Math.floor(Math.random() * categories.length)];

            // List of anime image APIs
            const apiList = [
                `https://api.waifu.pics/sfw/${chosenCategory}`,
                `https://nekos.life/api/v2/img/${chosenCategory}`,
                `https://nekos.best/api/v2/${chosenCategory}`,
                `https://nekosia.cat/api/${chosenCategory}`,
                `https://pic.re/api/v1/${chosenCategory}`,
                `https://api.waifu.im/sfw/${chosenCategory}`,
                `https://api.nekos.dev/api/v3/${chosenCategory}`,
                `https://api.jikan.moe/v4/random/anime`,
                `https://api.trace.moe/search?url=${encodeURIComponent(m.message.imageUrl)}`,
                `https://api.animechan.vercel.app/api/random`
            ];

            const images = [];

            // Fetch 5 images from different APIs
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
                return await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to fetch anime images. Try again!" }, { quoted: m });
            }

            // Send all 5 images
            for (const img of images) {
                await sock.sendMessage(m.key.remoteJid, {
                    image: { url: img },
                    caption: `✨ *Anime Image (${chosenCategory})*`
                }, { quoted: m });
            }

        } catch (err) {
            console.error("❌ Anime.js error:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Something went wrong while fetching anime images." }, { quoted: m });
        }
    }
};
