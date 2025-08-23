const axios = require("axios");

module.exports = {
    name: "pinterest",
    command: ["pinterest", "pin"], // ✅ matches your system
    execute: async (sock, m, args) => {
        if (!args.length) {
            return sock.sendMessage(
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

        // multiple APIs (backup system)
        const apis = [
            `https://api.akuari.my.id/search/pinterest?query=${encodeURIComponent(query)}`,
            `https://bx-hunter.herokuapp.com/api/pinterest?text=${encodeURIComponent(query)}&apikey=Ikyy69`,
            `https://vihangayt.me/search/pinterest?q=${encodeURIComponent(query)}`
        ];

        let images = [];

        for (let api of apis) {
            try {
                const res = await axios.get(api, { timeout: 10000 });
                if (res.data) {
                    if (res.data.result) images = res.data.result;
                    else if (res.data.data) images = res.data.data;
                    else if (res.data.image) images = res.data.image;
                }
                if (images && images.length > 0) break; // ✅ got results
            } catch (e) {
                console.log(`⚠️ API failed: ${api}`);
            }
        }

        if (!images || images.length === 0) {
            return sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ No images found or all APIs down. Try again later." },
                { quoted: m }
            );
        }

        const randomImg = images[Math.floor(Math.random() * images.length)];

        await sock.sendMessage(
            m.key.remoteJid,
            { image: { url: randomImg }, caption: `✅ Pinterest result for: *${query}*` },
            { quoted: m }
        );
    }
};
