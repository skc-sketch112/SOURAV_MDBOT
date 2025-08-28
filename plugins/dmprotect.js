const fs = require("fs");
const path = require("path");

// Database path
const dbPath = path.join(__dirname, "../database/dmprotect.json");
let db = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : {};

// Save database
function saveDB() {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// DM Protection toggle
let dmProtectEnabled = true; // Set to false to disable DM protection

module.exports = {
    name: "dmprotect",
    description: "Protects your DM from unknown users. Powered by SOURAV_,MD",
    async execute(sock, msg, ownerNumber) {
        try {
            if (!dmProtectEnabled) return;

            const from = msg.key.remoteJid;
            const isGroup = from.endsWith("@g.us");
            const sender = msg.key.participant || msg.key.remoteJid;

            // Ignore groups
            if (isGroup) return;

            // Owner bypass
            if (sender.includes(ownerNumber)) return;

            // Initialize sender in DB
            if (!db[sender]) {
                db[sender] = { warnings: 0, blocked: false };
            }

            // Already blocked
            if (db[sender].blocked) return;

            // Increase warning count
            db[sender].warnings++;
            saveDB();

            const warnCount = db[sender].warnings;
            const maxWarnings = 3;

            // Respond with warning
            if (warnCount < maxWarnings) {
                await sock.sendMessage(from, {
                    text: `⚠️ *Warning from ${ownerNumber}*\n\n` +
                          `💬 My master is busy right now. Please contact later.\n` +
                          `⚡ You have received *${warnCount}/${maxWarnings}* warnings.\n` +
                          `❗ Continued messages will result in an automatic block.`
                }, { quoted: msg });
            } else {
                // Block user after max warnings
                db[sender].blocked = true;
                saveDB();

                await sock.sendMessage(from, {
                    text: `🚫 You have been *blocked* for repeatedly messaging my master.\n` +
                          `❌ Reason: Exceeded ${maxWarnings} warnings.`
                }, { quoted: msg });

                await sock.updateBlockStatus(sender, "block");

                // Notify master
                await sock.sendMessage(ownerNumber + "@s.whatsapp.net", {
                    text: `⚠️ User @${sender.split("@")[0]} has been automatically blocked in DM.\n` +
                          `Reason: Exceeded ${maxWarnings} warnings.`
                }, { mentions: [sender] });
            }

        } catch (err) {
            console.error("DMProtect Error:", err);
        }
    },

    // Optional helper to toggle protection
    toggle(value) {
        dmProtectEnabled = value;
        console.log(`[DMProtect] DM protection is now ${value ? "ON" : "OFF"}`);
    },

    // Optional helper to reset a user
    resetUser(user) {
        if (db[user]) {
            db[user].warnings = 0;
            db[user].blocked = false;
            saveDB();
        }
    }
};
