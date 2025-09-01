// lmao.js
module.exports = {
    name: "lmao",
    command: ["lmao"],
    desc: "Funny moving emoji line in one single message",
    category: "fun",
    usage: ".lmao",
    execute: async (sock, m, args) => {
        try {
            const jid = m.key.remoteJid;

            // Base emoji set
            const emojis = ["😂", "🤣", "😹", "😆", "😜", "🤪"];

            // Build a continuous looping string
            let message = "";
            for (let i = 0; i < 100; i++) { // 100 = loop count (adjust if needed)
                message += emojis[i % emojis.length] + " ";
            }

            // Send only one single message
            await sock.sendMessage(jid, { text: message }, { quoted: m });

        } catch (e) {
            console.error("❌ Error in lmao.js:", e);
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Error running .lmao" }, { quoted: m });
        }
    }
};
