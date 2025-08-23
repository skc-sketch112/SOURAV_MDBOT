// plugins/autobio.js
module.exports = {
    name: "autobio",
    command: ["autobio"],
    description: "Auto bio update with custom template + time/date",
    autobioInterval: null,
    autobioTemplate: "⚡ Sourav_MD Bot Active | ⏰ {time} | 📅 {date}",

    execute: async (sock, m, args) => {
        const jid = m.key.remoteJid;
        const option = args[0]?.toLowerCase();

        // No args → show help
        if (!option) {
            await sock.sendMessage(jid, { 
                text: `⚡ AutoBio Commands:
.autobio on → Start AutoBio
.autobio off → Stop AutoBio
.autobio set Your custom text → Set new template (use {time} {date})
Current Template: ${module.exports.autobioTemplate}`
            }, { quoted: m });
            return;
        }

        // Turn ON AutoBio
        if (option === "on") {
            if (module.exports.autobioInterval) {
                await sock.sendMessage(jid, { text: "✅ AutoBio is already running!" }, { quoted: m });
                return;
            }

            const updateBio = async () => {
                try {
                    const now = new Date();
                    const time = now.toLocaleTimeString("en-IN", { hour12: true });
                    const date = now.toLocaleDateString("en-IN");

                    const bio = module.exports.autobioTemplate
                        .replace("{time}", time)
                        .replace("{date}", date);

                    await sock.updateProfileStatus(bio);
                    console.log(`✅ AutoBio updated: ${bio}`);
                } catch (err) {
                    console.error("❌ Error updating bio:", err.message);
                }
            };

            await updateBio(); // Update instantly
            module.exports.autobioInterval = setInterval(updateBio, 1000 * 60 * 2); // Every 2 min

            await sock.sendMessage(jid, { text: "✅ AutoBio started!" }, { quoted: m });
        }

        // Turn OFF AutoBio
        else if (option === "off") {
            if (module.exports.autobioInterval) {
                clearInterval(module.exports.autobioInterval);
                module.exports.autobioInterval = null;
                await sock.sendMessage(jid, { text: "🛑 AutoBio stopped." }, { quoted: m });
            } else {
                await sock.sendMessage(jid, { text: "⚠️ AutoBio is not running." }, { quoted: m });
            }
        }

        // Set new template
        else if (option === "set") {
            const newTemplate = args.slice(1).join(" ");
            if (!newTemplate) {
                await sock.sendMessage(jid, { text: "⚠️ Usage: .autobio set Your custom text (use {time} {date})" }, { quoted: m });
                return;
            }

            module.exports.autobioTemplate = newTemplate;
            await sock.sendMessage(jid, { 
                text: `✅ AutoBio template updated!\nNow using:\n${newTemplate}` 
            }, { quoted: m });
        }

        else {
            await sock.sendMessage(jid, { text: "⚠️ Invalid option! Use .autobio on/off/set" }, { quoted: m });
        }
    }
};
