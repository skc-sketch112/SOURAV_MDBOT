module.exports = {
    name: "anime",
    command: ["anime", "animes"],
    description: "Send 5 random anime images safely",
    category: "Fun",

    async execute(sock, m, args) {
        try {
            // Anime image links (you can add unlimited here)
            const animeImages = [
                "https://i.imgur.com/W1aD1zC.jpg",
                "https://i.imgur.com/jt3A6Qp.jpg",
                "https://i.imgur.com/6dXKQJQ.jpg",
                "https://i.imgur.com/ox2eXnM.jpg",
                "https://i.imgur.com/5Y2hZ7A.jpg",
                "https://i.imgur.com/8dfU0wV.jpg",
                "https://i.imgur.com/4jK2tZT.jpg",
                "https://i.imgur.com/L9U3vYj.jpg",
                "https://i.imgur.com/VV3DFJf.jpg",
                "https://i.imgur.com/1cO5h0h.jpg"
            ];

            // Pick 5 random images
            let selected = [];
            for (let i = 0; i < 5; i++) {
                let randomImg = animeImages[Math.floor(Math.random() * animeImages.length)];
                selected.push(randomImg);
            }

            // Send images one by one with delay
            for (let img of selected) {
                await sock.sendMessage(
                    m.key.remoteJid,
                    { image: { url: img }, caption: "🌸 Anime Pic" },
                    { quoted: m }
                );
                // Safe delay (1s) so no spam/429 error
                await new Promise(resolve => setTimeout(resolve, 1000));
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
