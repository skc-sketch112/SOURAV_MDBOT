const axios = require("axios");

module.exports = {
    name: "pin",
    command: ["pin", "pin1", "pin2", "pin3", "pin4", "pin5"],
    description: "Fetch Pinterest images by search query",

    async execute(sock, m, args, command) {
        let query = args.join(" ");
        if (!query) {
            return await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Provide a keyword!\n\nExample: `.pin cat` or `.pin2 anime`" },
                { quoted: m }
            );
        }

        // Number of images from command (default = 1)
        let num = 1;
        if (command.startsWith("pin") && command.length > 3) {
            let n = parseInt(command.slice(3));
            if (!isNaN(n) && n > 0 && n <= 10) num = n; // Limit to 10
        }

        let jid = m.key.remoteJid;
        let urls = [];

        try {
            // Pinterest scraping
            const res = await axios.get(
                `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`
            );

            const regex = /"url":"(https:\/\/i\.pinimg\.com[^"]+)"/g;
            let match;
            while ((match = regex.exec(res.data)) !== null) {
                urls.push(match[1].replace(/\\u0026/g, "&"));
            }
        } catch (err) {
            console.error("Pinterest fetch failed:", err.message);
        }

        if (urls.length === 0) {
            return await sock.sendMessage(
                jid,
                { text: `❌ No Pinterest images found for *${query}*.` },
                { quoted: m }
            );
        }

        // Shuffle for randomness but still search-based
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
