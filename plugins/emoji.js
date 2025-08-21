// plugins/emoji.js
module.exports = {
    name: "emoji",
    command: ["emoji"],
    async execute(sock, m, args) {
        try {
            const emojis = {
                smile: "😀😁😂🤣😃😄😅😆😉😊",
                love: "😍🥰😘😗😙😚😋😛😜🤪",
                cool: "😎🤓🧐😏😒😞😔😟😕🙁",
                sad: "😮😯😲😳🥺😢😭😤😠😡",
                hands: "👍👌🤙🤞✌️🤟👏🙌🙏🤝"
            };

            if (!args[0]) {
                await sock.sendMessage(m.key.remoteJid, {
                    text: "✨ Emoji Menu ✨\n\n.smile\n.love\n.cool\n.sad\n.hands\n\nUse: .emoji <type>"
                });
                return;
            }

            let choice = args[0].toLowerCase();
            let reply = emojis[choice] || "⚠️ Unknown option! Try: .emoji smile/love/cool/sad/hands";

            await sock.sendMessage(m.key.remoteJid, { text: reply }, { quoted: m });
        } catch (err) {
            console.log("❌ Emoji error:", err);
        }
    }
};
