const fetch = require("node-fetch");

module.exports = {
    name: "anime",
    description: "Get random anime images (unlimited)",
    run: async (sock, from, args) => {
        try {
            // Available categories
            const categories = ["waifu", "neko", "shinobu", "megumin", "bully", "happy", "cry", "dance"];
            const category = args[0]?.toLowerCase() || categories[Math.floor(Math.random() * categories.length)];

            // Fallback API list
            const apis = [
                `https://api.waifu.pics/sfw/${category}`,
                `https://nekos.best/api/v2/${category}`,
                `https://some-random-api.com/animu/${category}`
            ];

            let imageUrl = null;

            for (let api of apis) {
                try {
                    const res = await fetch(api);
                    if (!res.ok) continue;
                    const data = await res.json();

                    // waifu.pics
                    if (data.url) imageUrl = data.url;

                    // nekos.best
                    if (data.results && data.results[0]?.url) imageUrl = data.results[0].url;

                    // some-random-api
                    if (data.link) imageUrl = data.link;

                    if (imageUrl) break; // ✅ got a working link
                } catch (e) {
                    continue; // try next API
                }
            }

            if (!imageUrl) {
                return await sock.sendMessage(from, { text: "❌ Couldn’t fetch anime image. Try again." });
            }

            await sock.sendMessage(from, {
                image: { url: imageUrl },
                caption: `✨ *Here’s your anime (${category})*`
            });

        } catch (err) {
            console.error("Anime command error:", err);
            await sock.sendMessage(from, { text: "❌ Error while fetching anime image." });
        }
    }
};
