const fetch = require("node-fetch");

module.exports = {
    name: "anime2",
    command: ["anime2"],
    execute: async (sock, m, args) => {
        try {
            // Anime fun/emotion categories
            const categories = ["happy", "dance", "smile", "cry", "highfive", "hug"];
            // Pick a category randomly or allow user argument
            const category = args[0]?.toLowerCase();
            const chosenCategory = categories.includes(category)
                ? category
                : categories[Math.floor(Math.random() * categories.length)];

            // 6 APIs for variety
            const apiList = [
                `https://api.waifu.pics/sfw/${chosenCategory}`,
                `https://nekos.life/api/v2/img/${chosenCategory}`,
                `https://nekos.best/api/v2/${chosenCategory}`,
                `https://api.waifu.pics/sfw/${chosenCategory}`, // repeated intentionally for reliability
                `https://nekos.life/api/v2/img/${chosenCategory}`, 
                `https://nekos.best/api/v2/${chosenCategory}`
            ];

            const images = [];

            // Fetch 5 images randomly from the 6 APIs
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
            console.error("❌ Anime2.js error:", err);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Something went wrong while fetching anime." }, { quoted: m });
        }
    }
};
