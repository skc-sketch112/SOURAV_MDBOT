const axios = require("axios");

module.exports = {
    name: "pinterest",
    command: ["pinterest", "pin", "pint"],
    description: "Fetch Pinterest images by scraping JSON data",

    async execute(sock, m, args) {
        try {
            if (!args || args.length < 1) {
                return await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ Usage: .pinterest <search term>\nExample: .pinterest cat" },
                    { quoted: m }
                );
            }

            const query = args.join(" ");
            await sock.sendMessage(
                m.key.remoteJid,
                { text: `🔍 Searching Pinterest for *${query}* ...` },
                { quoted: m }
            );

            // 🔥 Use Pinterest mobile site (easier to scrape)
            const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
            const res = await axios.get(url, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36"
                }
            });

            // Extract JSON data from page source
            const regex = /<script id="__PWS_DATA__" type="application\/json">(.+?)<\/script>/;
            const match = res.data.match(regex);

            if (!match) {
                return await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ Could not parse Pinterest page. Try again later." },
                    { quoted: m }
                );
            }

            const jsonData = JSON.parse(match[1]);
            let results = [];

            try {
                const pins = jsonData.props.initialReduxState.pins;
                for (let id in pins) {
                    let pin = pins[id];
                    if (pin?.images?.orig?.url) {
                        results.push(pin.images.orig.url);
                    }
                }
            } catch (e) {
                console.error("Parsing error:", e.message);
            }

            if (results.length === 0) {
                return await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ No images found. Try another search." },
                    { quoted: m }
                );
            }

            // 🎲 Pick random image
            const image = results[Math.floor(Math.random() * results.length)];

            await sock.sendMessage(
                m.key.remoteJid,
                {
                    image: { url: image },
                    caption: `✨ Pinterest Result for: *${query}*`
                },
                { quoted: m }
            );

        } catch (err) {
            console.error("❌ Pinterest scraper error:", err.message);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Error fetching images. Pinterest may have changed layout again." },
                { quoted: m }
            );
        }
    }
};
