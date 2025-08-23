const axios = require("axios");

module.exports = {
    name: "img",
    command: ["img", "image", "imagesearch"],
    description: "Fetch 5 random images from DuckDuckGo + Unsplash fallback",

    async execute(sock, m, args) {
        const query = args.join(" ");
        if (!query) {
            return await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Provide a keyword!\n\nExample: `.img anime`" },
                { quoted: m }
            );
        }

        let jid = m.key.remoteJid;
        let urls = [];

        try {
            // ✅ Primary Source: DuckDuckGo
            const res = await axios.get(
                `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`
            );

            const regex = /"image":"(.*?)"/g;
            let match;
            while ((match = regex.exec(res.data)) !== null) {
                urls.push(match[1].replace(/\\u0026/g, "&"));
            }
        } catch (err) {
            console.error("DuckDuckGo fetch failed:", err.message);
        }

        // ✅ Fallback: Unsplash (random high-quality images)
        try {
            if (urls.length < 5) {
                const res2 = await axios.get(
                    `https://api.unsplash.com/search/photos`,
                    {
                        params: { query, per_page: 10 },
                        headers: {
                            Authorization: "Client-ID Uebb0QGhkVela_0V0ZidmqYXDqAEHRYpV2UnemVHgLY" 
                            // ⚠️ Replace with your Unsplash Access Key
                        },
                    }
                );

                res2.data.results.forEach(img => {
                    if (img.urls?.regular) urls.push(img.urls.regular);
                });
            }
        } catch (err) {
            console.error("Unsplash fetch failed:", err.message);
        }

        if (urls.length === 0) {
            return await sock.sendMessage(
                jid,
                { text: `❌ No images found for *${query}*.` },
                { quoted: m }
            );
        }

        // ✅ Send exactly 5 images
        let count = 0;
        for (let img of urls.slice(0, 5)) {
            count++;
            await sock.sendMessage(
                jid,
                {
                    image: { url: img },
                    caption: `✨ ${query} #${count}`
                },
                { quoted: m }
            );
        }
    }
};
