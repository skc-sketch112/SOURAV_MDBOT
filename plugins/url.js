const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));

module.exports = {
    name: "url",
    command: ["url", "short", "shorturl"],
    description: "Shorten any long URL into a tiny link",
    category: "Utility",

    async execute(sock, m, args) {
        try {
            if (args.length === 0) {
                return sock.sendMessage(m.key.remoteJid, {
                    text: "❌ Please provide a URL!\n\nExample: `.url https://example.com/very/long/link`"
                }, { quoted: m });
            }

            let longUrl = args[0];

            // ✅ Using tinyurl API (no limit, no cheerio)
            let api = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`;
            let res = await fetch(api);
            let shortUrl = await res.text();

            await sock.sendMessage(
                m.key.remoteJid,
                { text: `🔗 *URL Shortener*\n\n🌍 Original: ${longUrl}\n✨ Short: ${shortUrl}` },
                { quoted: m }
            );
        } catch (err) {
            console.error("❌ Error in URL command:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Error while shortening URL." },
                { quoted: m }
            );
        }
    }
};
