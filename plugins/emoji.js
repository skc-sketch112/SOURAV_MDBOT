// plugins/emoji.js
module.exports = {
    name: "emoji",
    description: "Send fun emojis",
    command: ["emoji", "emojis"],
    async execute(sock, m, args) {
        try {
            const emojis = [
                "😀😁😂🤣😃😄😅😆😉😊",
                "😍🥰😘😗😙😚😋😛😜🤪",
                "😎🤓🧐😏😒😞😔😟😕🙁",
                "😮😯😲😳🥺😢😭😤😠😡",
                "👍👌🤙🤞✌️🤟👏🙌🙏🤝"
            ];

            if (!args[0]) {
                await sock.sendMessage(m.key.remoteJid, {
                    text: `✨ Emoji Menu ✨\n\n1. smile\n2. love\n3. cool\n4. sad\n5. hands\n\nUse: .emoji <name>`
                });
                return;
            }

            let type = args[0].toLowerCase();
            let text = "";

            if (type === "smile") text = emojis[0];
            else if (type === "love") text = emojis[1];
            else if (type === "cool") text = emojis[2];
            else if (type === "sad") text = emojis[3];
            else if (type === "hands") text = emojis[4];
            else text = "⚠️ Unknown option! Try: .emoji smile/love/cool/sad/hands";

            await sock.sendMessage(m.key.remoteJid, { text });
        } catch (e) {
            console.error("Emoji plugin error:", e);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Error sending emojis." });
        }
    }
};
