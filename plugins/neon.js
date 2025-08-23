const axios = require("axios");

module.exports = {
    name: "neon",
    command: ["neon", "neonlogo"],
    description: "Generate a Neon style logo with your text",

    async execute(sock, m, args) {
        const text = args.join(" ");
        if (!text) {
            return await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Provide text!\n\nExample: `.neon Shadow Bot`" },
                { quoted: m }
            );
        }

        const jid = m.key.remoteJid;

        // --- Multiple Stable APIs for Neon ---
        const apis = [
            // 1. TextPro clone
            `https://api.textpro.me/logo/neon?text=${encodeURIComponent(text)}`,

            // 2. Another TextPro neon style
            `https://textproapi.vercel.app/api/neon?text=${encodeURIComponent(text)}`,

            // 3. Dummy image fallback with neon color scheme
            `https://dummyimage.com/800x400/0000ff/ffffff&text=${encodeURIComponent(text)}`
        ];

        let success = false;
        for (let url of apis) {
            try {
                // try direct fetch
                await axios.get(url);

                await sock.sendMessage(
                    jid,
                    {
                        image: { url },
                        caption: `💡 Neon Logo for: *${text}*`
                    },
                    { quoted: m }
                );

                success = true;
                break; // stop when one works
            } catch (err) {
                console.error(`Neon logo fetch failed: ${url}`, err.message);
            }
        }

        if (!success) {
            await sock.sendMessage(
                jid,
                { text: "❌ Neon logo generation failed. Try again later." },
                { quoted: m }
            );
        }
    }
};
