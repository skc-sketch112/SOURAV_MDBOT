const axios = require("axios");

module.exports = {
    name: "pin",
    command: ["pin", "pin1", "pin2", "pin3", "pin4", "pin5"],
    description: "Fetch Pinterest images by search query (with Unsplash fallback)",

    async execute(sock, m, args) {
        let query = args.join(" ");
        if (!query) {
            return await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Provide a keyword!\n\nExample: `.pin cat` or `.pin3 anime`" },
                { quoted: m }
            );
        }

        // Detect actual command (pin, pin2, pin3…)
        let body = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
        let cmdName = body.split(" ")[0].replace(".", ""); // remove prefix "."

        // Default = 1 image
        let num = 1;
        if (cmdName.length > 3) {
            let n = parseInt(cmdName.slice(3));
            if (!isNaN(n) && n > 0 && n <= 10) num = n; // max 10
        }

        let jid = m.key.remoteJid;
        let urls = [];

        // 🔹 Try Pinterest first
        try {
            const res = await axios.get(
                `https://www.pinterest.com/resource/BaseSearchResource/get/`,
                {
                    params: {
                        source_url: `/search/pins/?q=${encodeURIComponent(query)}`,
                        data: JSON.stringify({
                            options: {
                                query,
                                page_size: 20,
                                redux_normalize_feed: true
                            },
                            context: {}
                        }),
                    },
                }
            );

            if (res.data?.resource_response?.data?.results) {
                res.data.resource_response.data.results.forEach(item => {
                    if (item.images?.orig?.url) {
                        urls.push(item.images.orig.url);
                    }
                });
            }
        } catch (err) {
            console.error("Pinterest fetch failed:", err.message);
        }

        // 🔹 Fallback: Unsplash if no good Pinterest result
        try {
            if (urls.length < num) {
                const res2 = await axios.get(`https://api.unsplash.com/search/photos`, {
                    params: { query, per_page: 10 },
                    headers: {
                        Authorization: "Client-ID Uebb0QGhkVela_0V0ZidmqYXDqAEHRYpV2UnemVHgLY"
                    },
                });

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

        // Shuffle results to avoid repetition
        urls = urls.sort(() => 0.5 - Math.random());

        // Send requested number of images
        for (let i = 0; i < Math.min(num, urls.length); i++) {
            await sock.sendMessage(
                jid,
                {
                    image: { url: urls[i] },
                    caption: `📌 *${query}* [${i + 1}/${num}]`
                },
                { quoted: m }
            );
        }
    }
};
