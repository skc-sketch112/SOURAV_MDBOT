const axios = require("axios");

module.exports = {
    name: "pinterest",
    command: ["pinterest", "pin", "pint"],
    description: "Fetch Pinterest images by search query",

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
            await sock.sendMessage(m.key.remoteJid, { text: `🔍 Searching Pinterest for *${query}* ...` }, { quoted: m });

            let results = [];

            // 🌐 Try first API
            try {
                const res = await axios.get(`https://pinterest-api-one.vercel.app/?q=${encodeURIComponent(query)}`, { timeout: 15000 });
                if (res.data && Array.isArray(res.data)) results = res.data;
            } catch (e) {
                console.log("⚠️ API 1 failed, trying fallback...");
            }

            // 🔁 Fallback API if first fails
            if (!results.length) {
                const res2 = await axios.get(`https://bx-hunter.herokuapp.com/api/pinterest?text=${encodeURIComponent(query)}&apikey=freeapi`, { timeout: 15000 });
                if (res2.data && res2.data.result) results = res2.data.result;
            }

            if (!results.length) {
                return await sock.sendMessage(m.key.remoteJid, { text: "⚠️ No results found for your search." }, { quoted: m });
            }

            // 🎲 Random pick
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
            console.error("❌ Pinterest command error:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Error while fetching Pinterest images. Try again later." },
                { quoted: m }
            );
        }
    }
};
