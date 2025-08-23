// plugins/autoreact.js
module.exports = {
    name: "autoreact",
    command: ["autoreact"],
    description: "Auto react to every incoming message",
    autoreactEnabled: false,
    emojiList: ["🔥", "😂", "😍", "😎", "👍", "💀", "🤯", "👑", "⚡", "❤️"],

    execute: async (sock, m, args) => {
        const jid = m.key.remoteJid;
        const option = args[0]?.toLowerCase();

        // Turn ON AutoReact
        if (option === "on") {
            if (module.exports.autoreactEnabled) {
                await sock.sendMessage(jid, { text: "✅ AutoReact already running!" }, { quoted: m });
                return;
            }
            module.exports.autoreactEnabled = true;
            await sock.sendMessage(jid, { text: "⚡ AutoReact enabled! Will react to every message." }, { quoted: m });
        }

        // Turn OFF AutoReact
        else if (option === "off") {
            if (!module.exports.autoreactEnabled) {
                await sock.sendMessage(jid, { text: "⚠️ AutoReact is not running." }, { quoted: m });
                return;
            }
            module.exports.autoreactEnabled = false;
            await sock.sendMessage(jid, { text: "🛑 AutoReact stopped." }, { quoted: m });
        }

        // Help menu
        else {
            await sock.sendMessage(jid, { 
                text: `⚡ AutoReact Commands:
.autoreact on → Start reacting to all messages
.autoreact off → Stop reacting
(Current Status: ${module.exports.autoreactEnabled ? "✅ ON" : "❌ OFF"})`
            }, { quoted: m });
        }
    },

    // This part auto runs when new messages come
    onMessage: async (sock, m) => {
        if (!module.exports.autoreactEnabled) return;
        try {
            const emoji = module.exports.emojiList[Math.floor(Math.random() * module.exports.emojiList.length)];
            await sock.sendMessage(m.key.remoteJid, {
                react: { text: emoji, key: m.key }
            });
            console.log(`✅ Reacted with ${emoji}`);
        } catch (err) {
            console.error("❌ AutoReact error:", err.message);
        }
    }
};
