const { proto } = require("@whiskeysockets/baileys");

module.exports = {
    name: "setbio",
    description: "Change your WhatsApp bio automatically",
    command: ["setbio"],
    async execute(sock, m, args) {
        try {
            if (!args.length) {
                return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Please type a bio!\nExample: `.setbio Hello World`" }, { quoted: m });
            }

            let newBio = args.join(" ");

            // ✅ Set bio using Baileys
            await sock.updateProfileStatus(newBio);

            await sock.sendMessage(m.key.remoteJid, { 
                text: `✅ Bio updated successfully!\n\n🌐 New Bio: \n${newBio}` 
            }, { quoted: m });

        } catch (e) {
            console.error("❌ Error in setbio.js:", e);
            await sock.sendMessage(m.key.remoteJid, { 
                text: "❌ Failed to update bio. Please try again." 
            }, { quoted: m });
        }
    }
};
