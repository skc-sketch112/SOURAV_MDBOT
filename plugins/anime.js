module.exports = {
    name: "anime",
    command: ["anime", "animes"],
    description: "Send 5 random anime images",
    category: "Fun",

    async execute(sock, m, args) {
        try {
            // 🖼️ Anime images (add as many as you want here)
            const animeImages = [
                "https://i.imgur.com/5M9N6XU.jpg",
                "https://i.imgur.com/F3QpYwK.jpg",
                "https://i.imgur.com/Ul4KppC.jpg",
                "https://i.imgur.com/n60EMvA.jpg",
                "https://i.imgur.com/ci0v6Mn.jpg",
                "https://i.imgur.com/5W3hshV.jpg",
                "https://i.imgur.com/PaSWK6N.jpg",
                "https://i.imgur.com/xuAobfG.jpg",
                "https://i.imgur.com/H6aVx85.jpg",
                "https://i.imgur.com/Yh3N8rL.jpg",
                "https://i.imgur.com/h1V9Ywr.jpg",
                "https://i.imgur.com/rScXfFa.jpg",
                "https://i.imgur.com/1WfKQhX.jpg",
                "https://i.imgur.com/6mhLHQy.jpg",
                "https://i.imgur.com/qfZnR7N.jpg"
            ];

            // 🎲 Pick 5 random images
            let selected = [];
            for (let i = 0; i < 5; i++) {
                let img = animeImages[Math.floor(Math.random() * animeImages.length)];
                selected.push(img);
            }

            // 📤 Send images one by one
            for (let url of selected) {
                await sock.sendMessage(
                    m.key.remoteJid,
                    { image: { url }, caption: "✨ Anime Image" },
                    { quoted: m }
                );
            }

        } catch (err) {
            console.error("❌ Error in anime command:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Error while sending anime images." },
                { quoted: m }
            );
        }
    }
};
