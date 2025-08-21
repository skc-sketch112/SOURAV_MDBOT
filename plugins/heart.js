module.exports = {
    name: "heart",
    command: ["heart", "hearts"],
    execute: async (sock, m, args) => {
        try {
            const heartMap = {
                red: "❤️ Red Heart",
                blue: "💙 Blue Heart",
                green: "💚 Green Heart",
                yellow: "💛 Yellow Heart",
                purple: "💜 Purple Heart",
                black: "🖤 Black Heart",
                white: "🤍 White Heart",
                sparkling: "💖 Sparkling Heart",
                arrow: "💘 Heart with Arrow",
                ribbon: "💝 Heart with Ribbon"
            };

            let response;

            if (args.length === 0) {
                // Show full heart menu
                const list = Object.values(heartMap).map(h => `👉 ${h}`).join("\n");
                response = `💖 *Heart Menu* 💖\n\n${list}`;
            } else {
                // Show single heart if it exists
                const query = args[0].toLowerCase();
                response = heartMap[query] || `⚠️ Heart "${query}" not found!`;
            }

            await sock.sendMessage(
                m.key.remoteJid,
                { text: response },
                { quoted: m }
            );
        } catch (err) {
            console.error("❌ Error in heart.js:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Something went wrong in heart command!" },
                { quoted: m }
            );
        }
    }
};
