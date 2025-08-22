const fetch = require("node-fetch");

module.exports = {
    name: "anime",  // 👈 this MUST match your command
    description: "Fetch random anime images",
    run: async (sock, from, args) => {
        try {
            const categories = ["waifu", "neko", "shinobu", "megumin", "bully", "happy", "cry", "dance", "smile", "highfive"];
            const category = args[0]?.toLowerCase();
            const chosen = categories.includes(category)
                ? category
                : categories[Math.floor(Math.random() * categories.length)];

            const url = `https://api.waifu.pics/sfw/${chosen}`;
            const res = await fetch(url);
            const data = await res.json();

            if (!data || !data.url) {
                return await sock.sendMessage(from, { text: "❌ No anime found, try again." });
            }

            await sock.sendMessage(from, {
                image: { url: data.url },
                caption: `✨ *Anime (${chosen})*`
            });

        } catch (err) {
            console.error("❌ Anime.js error:", err);
            await sock.sendMessage(from, { text: "⚠️ Failed to fetch anime." });
        }
    }
};
