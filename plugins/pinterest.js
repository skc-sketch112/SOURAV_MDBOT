const { pinterest } = require('@bochilteam/scraper');

module.exports = {
    name: "pinterest",
    command: ["pin", "pinterest"],
    execute: async (sock, m, args) => {
        try {
            if (!args[0]) {
                return sock.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ Usage: .pin <search term>\nExample: .pin cat" },
                    { quoted: m }
                );
            }

            const query = args.join(" ");
            await sock.sendMessage(
                m.key.remoteJid,
                { text: `🔍 Searching Pinterest for *${query}* ...` },
                { quoted: m }
            );

            // Fetch results
            const results = await pinterest(query);

            if (!results || results.length === 0) {
                return sock.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ No images found." },
                    { quoted: m }
                );
            }

            // Send up to 5 random images
            const shuffled = results.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 5);

            for (let img of selected) {
                await sock.sendMessage(
                    m.key.remoteJid,
                    { image: { url: img }, caption: `✅ Pinterest result for: *${query}*` },
                    { quoted: m }
                );
            }

        } catch (err) {
            console.error("Pinterest plugin error:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ Error fetching images. Please try again." },
                { quoted: m }
            );
        }
    }
};
