const fs = require("fs");
const path = require("path");

module.exports = {
    name: "anime",
    command: ["anime", "animes"],
    description: "Send 5 random anime images",
    category: "Fun",

    async execute(sock, m, args) {
        try {
            // 📂 Folder where anime images are stored
            const animeFolder = path.join(__dirname, "../media/anime");

            // Get all image files from folder
            const files = fs.readdirSync(animeFolder).filter(file =>
                file.endsWith(".jpg") || file.endsWith(".png") || file.endsWith(".jpeg")
            );

            if (files.length < 1) {
                return sock.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ No anime images found in /media/anime folder!" },
                    { quoted: m }
                );
            }

            // 🎲 Pick 5 random images
            let selected = [];
            for (let i = 0; i < 5; i++) {
                let randomFile = files[Math.floor(Math.random() * files.length)];
                selected.push(path.join(animeFolder, randomFile));
            }

            // 📤 Send images one by one
            for (let img of selected) {
                await sock.sendMessage(
                    m.key.remoteJid,
                    { image: fs.readFileSync(img), caption: "✨ Anime Image" },
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
