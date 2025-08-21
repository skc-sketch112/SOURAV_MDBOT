module.exports = {
    name: "fruit",
    command: ["fruit", "fruits"],
    execute: async (sock, m, args) => {
        const fruits = [
            "🍎 Apple", "🍌 Banana", "🍇 Grapes", "🍉 Watermelon",
            "🥭 Mango", "🍍 Pineapple", "🍑 Peach", "🍒 Cherries",
            "🥥 Coconut", "🍓 Strawberry"
        ];

        const list = fruits.map(f => `- ${f}`).join("\n");
        await sock.sendMessage(m.key.remoteJid, { text: `🍓 *Fruit Menu* 🍓\n\n${list}` }, { quoted: m });
    }
};
