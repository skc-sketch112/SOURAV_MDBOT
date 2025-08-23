const axios = require("axios");

module.exports = {
    name: "logo",
    command: ["logo", "logomaker", "textlogo"],
    description: "Generate stylish logos with your text",

    async execute(sock, m, args) {
        const text = args.join(" ");
        if (!text) {
            return await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Provide text!\n\nExample: `.logo Shadow Bot`" },
                { quoted: m }
            );
        }

        const jid = m.key.remoteJid;

        // --- Multiple APIs ---
        const apis = [
            // TextPro API (different host, more stable)
            `https://api.textpro.me/logo/neon?text=${encodeURIComponent(text)}`,

            // Photooxy API (stylish fire effect)
            `https://api.photooxy.me/logo/fiery?text=${encodeURIComponent(text)}`,

            // Unsplash fallback with styled bg
            `https://dummyimage.com/800x400/000/fff&text=${encodeURIComponent(text)}`
        ];

        let success = false;
        for (let url of apis) {
            try {
                // Try to fetch image
                const response = await axios.get(url, { responseType: "arraybuffer" });

                await sock.sendMessage(
                    jid,
                    {
                        image: { url }, // if direct URL
                        caption: `✨ Logo for: *${text}*`
                    },
                    { quoted: m }
                );
                success = true;
                break; // ✅ stop if success
            } catch (err) {
                console.error(`Logo fetch failed for ${url}:`, err.message);
            }
        }

        if (!success) {
            await sock.sendMessage(
                jid,
                { text: "❌ Logo generation failed. Try again later." },
                { quoted: m }
            );
        }
    }
};
