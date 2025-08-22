const fetch = require("node-fetch");

module.exports = {
    name: "anime",
    description: "Fetch random anime images (multi-API, unlimited)",
    run: async (sock, from, args) => {
        try {
            // All supported categories
            const categories = ["waifu", "neko", "shinobu", "megumin", "bully", "happy", "cry", "dance", "smile", "highfive"];
            
            // If user types `.anime neko` use that, otherwise pick random
            const category = args[0]?.toLowerCase();
            const chosen = categories.includes(category) ? category : categories[Math.floor(Math.random() * categories.length)];

            // APIs to try (fallback system)
            const apis = [
                `https://api.waifu.pics/sfw/${chosen}`,
                `https://nekos.best/api/v2/${chosen}`,
                `https://some-random-api.com/animu/${chosen}`
            ];

            let imageUrl = null;

            for (let api of apis) {
                try {
                    const res = await fetch(api);
                    if (!res.ok) continue;
                    const data = await res.json();

                    if (data.url) imageUrl = data.url;                          // waifu.pics
                    if (data.results && data.results[0]?.url) imageUrl = data.results[0].url; // nekos.best
                    if (data.link) imageUrl = data.link;                        // some-random-api

                    if (imageUrl) break;
                } catch (err) {
                    continue;
                }
            }

            if (!imageUrl) {
                return await sock.sendMessage(from, { text: "❌ Couldn’t fetch anime image. Try again later." });
            }

            await sock.sendMessage(from, {
                image: { url: imageUrl },
                caption: `✨ *Here’s your Anime (${chosen})*`
            });

        } catch (err) {
            console.error("❌ Anime command error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to fetch anime image." });
        }
    }
};
