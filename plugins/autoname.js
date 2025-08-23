// plugins/autoname.js
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "autoname",
    command: ["autoname"],
    description: "Auto profile name update with custom template + time/date",
    autonameInterval: null,
    autonameTemplate: "⚡ Sourav_MD | ⏰ {time} | 📅 {date}",

    execute: async (sock, m, args) => {
        const jid = m.key.remoteJid;
        const option = args[0]?.toLowerCase();

        // No args → show help
        if (!option) {
            await sock.sendMessage(jid, { 
                text: `⚡ AutoName Commands:
.autoname on → Start AutoName
.autoname off → Stop AutoName
.autoname set Your custom name → Set new template (use {time} {date})
Current Template: ${module.exports.autonameTemplate}`
            }, { quoted: m });
            return;
        }

        // Turn ON AutoName
        if (option === "on") {
            if (module.exports.autonameInterval) {
                await sock.sendMessage(jid, { text: "✅ AutoName is already running!" }, { quoted: m });
                return;
            }

            const updateName = async () => {
                try {
                    const now = new Date();
                    const time = now.toLocaleTimeString("en-IN", { hour12: true });
                    const date = now.toLocaleDateString("en-IN");

                    const name = module.exports.autonameTemplate
                        .replace("{time}", time)
                        .replace("{date}", date);

                    await sock.updateProfileName(name);
                    console.log(`✅ AutoName updated: ${name}`);
                } catch (err) {
                    console.error("❌ Error updating name:", err.message);
                }
            };

            await updateName(); // Update instantly
            module.exports.autonameInterval = setInterval(updateName, 1000 * 60 * 2); // Every 2 min

            await sock.sendMessage(jid, { text: "✅ AutoName started!" }, { quoted: m });
        }

        // Turn OFF AutoName
        else if (option === "off") {
            if (module.exports.autonameInterval) {
                clearInterval(module.exports.autonameInterval);
                module.exports.autonameInterval = null;
                await sock.sendMessage(jid, { text: "🛑 AutoName stopped." }, { quoted: m });
            } else {
                await sock.sendMessage(jid, { text: "⚠️ AutoName is not running." }, { quoted: m });
            }
        }

        // Set new template
        else if (option === "set") {
            const newTemplate = args.slice(1).join(" ");
            if (!newTemplate) {
                await sock.sendMessage(jid, { text: "⚠️ Usage: .autoname set Your custom name (use {time} {date})" }, { quoted: m });
                return;
            }

            module.exports.autonameTemplate = newTemplate;
            await sock.sendMessage(jid, { 
                text: `✅ AutoName template updated!\nNow using:\n${newTemplate}` 
            }, { quoted: m });
        }

        else {
            await sock.sendMessage(jid, { text: "⚠️ Invalid option! Use .autoname on/off/set" }, { quoted: m });
        }
    }
};
