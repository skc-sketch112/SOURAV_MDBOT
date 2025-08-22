// Global antiban state
let antiBanEnabled = true;

module.exports = {
    name: "antiban",
    command: ["antiban"],
    description: "Toggle Anti-Ban protection (on/off).",
    category: "Security",

    async execute(sock, m, args) {
        try {
            if (!args[0]) {
                return sock.sendMessage(
                    m.key.remoteJid,
                    { text: `⚙️ Anti-Ban is currently *${antiBanEnabled ? "ON ✅" : "OFF ❌"}*\n\nUse:\n.antiban on\n.antiban off` },
                    { quoted: m }
                );
            }

            let option = args[0].toLowerCase();
            if (option === "on") {
                antiBanEnabled = true;
                await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "🛡️ Anti-Ban has been *ENABLED* ✅" },
                    { quoted: m }
                );
            } else if (option === "off") {
                antiBanEnabled = false;
                await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "🚫 Anti-Ban has been *DISABLED* ❌" },
                    { quoted: m }
                );
            } else {
                await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ Invalid option. Use `.antiban on` or `.antiban off`" },
                    { quoted: m }
                );
            }
        } catch (err) {
            console.error("❌ Error in antiban command:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Error while toggling Anti-Ban." },
                { quoted: m }
            );
        }
    },

    // 🚨 This will be checked before processing risky actions
    isEnabled() {
        return antiBanEnabled;
    }
};
