module.exports = {
    name: "anime",
    command: ["anime", "animes"],
    description: "Send 5 random anime images",
    category: "Fun",

    async execute(sock, m, args) {
        try {
            // Anime image links (add unlimited here)
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
                selected.push({ image: { url: randomImg } });
            }

            // Send as one album (single message)
            await sock.sendMessage(
                m.key.remoteJid,
                { 
                    forwarded: true, 
                    messages: selected.map(img => ({ message: img })) 
                },
                { quoted: m }
            );

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
