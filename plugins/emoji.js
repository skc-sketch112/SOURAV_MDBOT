module.exports = {
    name: "fruit",
    command: ["fruit", "fruits"],
    execute: async (sock, m, args) => {
        try {
            const fruitMap = {
                apple: "🍎 Apple",
                banana: "🍌 Banana",
                grapes: "🍇 Grapes",
                watermelon: "🍉 Watermelon",
                mango: "🥭 Mango",
                pineapple: "🍍 Pineapple",
                peach: "🍑 Peach",
                cherries: "🍒 Cherries",
                coconut: "🥥 Coconut",
                strawberry: "🍓 Strawberry"
            };

            let response;

            if (args.length === 0) {
                // Show full fruit menu
                const list = Object.values(fruitMap).map(f => `👉 ${f}`).join("\n");
                response = `🍓 *Fruit Menu* 🍓\n\n${list}`;
            } else {
                // Show single fruit if it exists
                const query = args[0].toLowerCase();
                response = fruitMap[query] || `⚠️ Fruit "${query}" not found!`;
            }

            await sock.sendMessage(
                m.key.remoteJid,
                { text: response },
                { quoted: m }
            );
        } catch (err) {
            console.error("❌ Error in fruit.js:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Something went wrong in fruit command!" },
                { quoted: m }
            );
        }
    }
};
