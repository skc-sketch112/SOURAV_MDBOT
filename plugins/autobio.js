// plugins/autobio.js
const { delay } = require("@whiskeysockets/baileys");

let autobioInterval = null;

module.exports = {
    name: "autobio",
    command: ["autobio"],
    execute: async (sock, m, args) => {
        const jid = m.key.remoteJid;

        if (!args[0]) {
            return await sock.sendMessage(jid, { text: "⚠️ Usage: .autobio on/off/time/quotes/custom <text>" }, { quoted: m });
        }

        const option = args[0].toLowerCase();

        if (option === "off") {
            clearInterval(autobioInterval);
            autobioInterval = null;
            return await sock.sendMessage(jid, { text: "❌ AutoBio system stopped." }, { quoted: m });
        }

        if (option === "on" || option === "time") {
            startAutoBio(sock, "time");
            return await sock.sendMessage(jid, { text: "✅ AutoBio started in ⏰ Time & Date mode." }, { quoted: m });
        }

        if (option === "quotes") {
            startAutoBio(sock, "quotes");
            return await sock.sendMessage(jid, { text: "✅ AutoBio started in 💡 Quotes mode." }, { quoted: m });
        }

        if (option === "custom") {
            const text = args.slice(1).join(" ");
            if (!text) {
                return await sock.sendMessage(jid, { text: "⚠️ Usage: .autobio custom <your text>" }, { quoted: m });
            }
            startAutoBio(sock, "custom", text);
            return await sock.sendMessage(jid, { text: `✅ AutoBio started in ✍️ Custom mode:\n${text}` }, { quoted: m });
        }

        return await sock.sendMessage(jid, { text: "⚠️ Invalid option. Use .autobio on/off/time/quotes/custom" }, { quoted: m });
    }
};

function startAutoBio(sock, mode, customText = "") {
    clearInterval(autobioInterval);

    autobioInterval = setInterval(async () => {
        try {
            let newBio = "";

            if (mode === "time") {
                let time = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
                let date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                newBio = `⚡ BOT ACTIVE | ⏰ ${time} | 📅 ${date}`;
            }

            if (mode === "quotes") {
                const quotes = [
                    "⚡ Powered by WhatsApp Bot",
                    "🔥 Stay strong, the best is yet to come!",
                    "💡 Code. Sleep. Repeat.",
                    "✨ Dream big, work hard.",
                    "📱 WhatsApp Automation FTW!",
                    "🚀 Built with Baileys."
                ];
                newBio = quotes[Math.floor(Math.random() * quotes.length)];
            }

            if (mode === "custom") {
                newBio = customText;
            }

            if (newBio) {
                await sock.updateProfileStatus(newBio);
                console.log(`✅ AutoBio Updated: ${newBio}`);
            }
        } catch (err) {
            console.error("❌ Error updating bio:", err);
        }
    }, 1000 * 60 * 5); // every 5 minutes
}
