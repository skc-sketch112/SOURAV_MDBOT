// plugins/antiban.js
let antiBanEnabled = true; // default ON

module.exports = {
    name: "Anti-Ban System",
    command: ["antiban"],
    info: "Toggle Anti-Ban (add delay + typing presence)",
    async execute(sock, m, args) {
        const jid = m.key.remoteJid;

        if (!args[0]) {
            await sock.sendMessage(jid, {
                text: `🔒 Anti-Ban is currently *${antiBanEnabled ? "ON ✅" : "OFF ❌"}*\n\nUse:\n.antiban on\n.antiban off`
            }, { quoted: m });
            return;
        }

        if (args[0].toLowerCase() === "on") {
            antiBanEnabled = true;
            await sock.sendMessage(jid, { text: "✅ Anti-Ban Mode is now *ON*" }, { quoted: m });
        } else if (args[0].toLowerCase() === "off") {
            antiBanEnabled = false;
            await sock.sendMessage(jid, { text: "❌ Anti-Ban Mode is now *OFF*" }, { quoted: m });
        } else {
            await sock.sendMessage(jid, { text: "⚠️ Invalid option. Use `.antiban on` or `.antiban off`" }, { quoted: m });
        }
    },
    // 🔥 Middleware hook
    async applyAntiBan(sock, m) {
        if (!antiBanEnabled) return;

        const jid = m.key.remoteJid;

        // Simulate typing
        await sock.sendPresenceUpdate("composing", jid);

        // Delay 500ms – 2000ms
        const delay = ms => new Promise(r => setTimeout(r, ms));
        await delay(500 + Math.random() * 1500);
    }
};
