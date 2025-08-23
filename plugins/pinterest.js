const axios = require("axios");

module.exports = {
    name: "pinterest",
    command: ["pin", "pinterest"],
    desc: "Search images from Pinterest (via Google Images)",
    use: "<search term>",
    execute: async (sock, m, args) => {
        if (!args.length) {
            return sock.sendMessage(m.key.remoteJid, { text: "❌ Usage: .pinterest <search term>\nExample: .pinterest cat" }, { quoted: m });
        }

        const query = args.join(" ");
        const apiKey = process.env.SERPAPI_KEY || "YOUR_SERPAPI_KEY"; // put in .env or replace

        await sock.sendMessage(m.key.remoteJid, { text: `🔍 Searching Pinterest for *${query}* ...` }, { quoted: m });

        try {
            const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}+site:pinterest.com&tbm=isch&api_key=${apiKey}`;
            const res = await axios.get(url, { timeout: 15000 });

            if (!res.data.images_results || res.data.images_results.length === 0) {
                return sock.sendMessage(m.key.remoteJid, { text: "⚠️ No images found. Try another search." }, { quoted: m });
            }

            const images = res.data.images_results.map(img => img.original);
            const randomImg = images[Math.floor(Math.random() * images.length)];

            await sock.sendMessage(
                m.key.remoteJid,
                { image: { url: randomImg }, caption: `✅ Pinterest result for: *${query}*` },
                { quoted: m }
            );

        } catch (err) {
            console.error("❌ Pinterest command error:", err.message);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Error fetching images. Please try again." }, { quoted: m });
        }
    }
};
