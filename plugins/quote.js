const fetch = require("node-fetch");

module.exports = {
    name: "quote",
    command: ["quote", "quotes", "motivate"],
    description: "Get random inspirational quotes",

    execute: async (sock, m, args) => {
        try {
            // 🌐 Fetch a random quote
            const response = await fetch("https://zenquotes.io/api/random");
            const data = await response.json();

            if (!data || !data[0]) {
                throw new Error("No quote found");
            }

            const quote = data[0].q;
            const author = data[0].a;

            // ✨ Styled message
            const msg = `
🌟 *Quote of the Moment* 🌟

💭 "${quote}"
✍️ — ${author}
`;

            await sock.sendMessage(
                m.key.remoteJid,
                { text: msg },
                { quoted: m }
            );
        } catch (err) {
            console.error("❌ Quote error:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Failed to fetch quote. Try again later." },
                { quoted: m }
            );
        }
    }
};
