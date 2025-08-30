const fetch = require("node-fetch");

module.exports = {
    name: "anime4",
    command: ["anime4"],
    execute: async (sock, m, args) => {
        try {
            // Action/fight anime categories
            const categories = ["fight", "battle", "attack", "kick", "punch", "explosion", "magic"];
            const category = args[0]?.toLowerCase();
            const chosenCategory = categories.includes(category)
                ? category
                : categories[Math.floor(Math.random() * categories.length)];

            // 7+ reliable APIs
            const apiList = [
                `https://api.waifu.pics/sfw/${chosenCategory}`,
                `https://nekos.life/api/v2/img/${chosenCategory}`,
                `https://nekos.best/api/v2/${chosenCategory}`,
                `https://api.waifu.pics/sfw/${chosenCategory}`,
                `https://nekos.life/api/v2/img/${chosenCategory}`,
                `https://nekos.best/api/v2/${chosenCategory}`,
                `https://api.waifu.pics/sfw/${chosenCategory}`
            ];

            const images = [];

            // Fetch 5 images with advanced fallback
            let attempts = 0;
            while (images.length < 5 && attempts < 20) { // try up to 20 times to get 5 images
                attempts++;
                const apiUrl = apiList[Math.floor(Math.random() * apiList.length)];
                try {
                    const res = await fetch(apiUrl, { timeout: 5000 });
                    const contentType = res.headers.get("content-type");
                    if (!contentType || !contentType.includes("application/json")) {
                        continue; // skip invalid responses
                    }

                    const data = await res.json();
                    let imageUrl = data.url || data.image || data.images?.[0];
                    if (imageUrl && !images.includes(imageUrl)) {
                        images.push(imageUrl); // avoid duplicates
                    }

                } catch (err) {
                    console.error(`Error fetching from ${apiUrl}:`, err);
                    continue; // skip failed API
                }
            }

            if (images.length === 0) {
                return await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed to fetch action anime images. Try again!" }, { quoted: m });
            }

            // Send all images
            for (const img of images) {
                await sock.sendMessage(m.key.remoteJid, {
                    image: { url: img },
                    caption: `⚔️ *Action Anime (${chosenCategory})*`
                }, { quoted: m });
            }

        } catch (err) {
            console.error("❌ Anime4.js error:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Something went wrong while fetching anime." }, { quoted: m });
        }
    }
};
