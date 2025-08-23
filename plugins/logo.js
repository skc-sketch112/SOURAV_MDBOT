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

        // --- List of Logo APIs (fallbacks) ---
        const apis = [
            // Free TextPro API (unofficial, stable)
            `https://textpro-api-new.vercel.app/api/logo?style=neon&text=${encodeURIComponent(text)}`,

            // Alternative (flaming text style)
            `https://textpro-api-new.vercel.app/api/logo?style=flaming&text=${encodeURIComponent(text)}`,

            // Unsplash fallback (stylized background text)
            `https://source.unsplash.com/800x400/?neon,${encodeURIComponent(text)}`
        ];

        let success = false;
        for (let url of apis) {
            try {
                await sock.sendMessage(
                    jid,
                    {
                        image: { url },
                        caption: `✨ Logo for: *${text}*`
                    },
                    { quoted: m }
                );
                success = true;
                break; // ✅ stop at first working API
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
