const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../database/dmprotect.json");
let db = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : {};

// DM Protection status (ON/OFF)
let isEnabled = true;

// Auto-unblock duration (in milliseconds), e.g., 24 hours
const UNBLOCK_TIME = 24 * 60 * 60 * 1000;

function saveDB() {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

module.exports = {
    name: "dmprotect",
    description: "Protect your DM with warnings, auto-block & auto-unblock",
    author: "SOURAV_MD",

    // Toggle protection ON/OFF
    toggle: (status) => {
        isEnabled = status === true;
        return `✅ DM Protection is now *${isEnabled ? "ON" : "OFF"}*`;
    },

    async execute(sock, msg, ownerNumber) {
        try {
            if (!isEnabled) return; // Protection OFF

            const from = msg.key.remoteJid;
            const isGroup = from.endsWith("@g.us");
            const sender = msg.key.participant || from;

            // Ignore group messages
            if (isGroup) return;

            // Owner bypass
            if (sender.includes(ownerNumber)) return;

            // Initialize sender in DB
            if (!db[sender]) db[sender] = { warnings: 0, blocked: false, lastWarn: 0, unblockAt: 0 };

            // Check auto-unblock
            if (db[sender].blocked && db[sender].unblockAt && Date.now() >= db[sender].unblockAt) {
                db[sender].blocked = false;
                db[sender].warnings = 0;
                db[sender].unblockAt = 0;
                saveDB();

                // Notify owner and user
                await sock.sendMessage(sender, {
                    text: `✅ You have been *unblocked* automatically. Please message responsibly.`
                });
                await sock.sendMessage(ownerNumber + "@s.whatsapp.net", {
                    text: `⚠️ User @${sender.split("@")[0]} has been automatically unblocked.`
                });
            }

            // Already blocked
            if (db[sender].blocked) return;

            // Increase warning only if last warn was more than 10 seconds ago
            if (Date.now() - db[sender].lastWarn > 10000) {
                db[sender].warnings++;
                db[sender].lastWarn = Date.now();
                saveDB();
            }

            const warnCount = db[sender].warnings;
            const maxWarnings = 3;

            // Send warning
            if (warnCount <= maxWarnings) {
                await sock.sendMessage(from, {
                    text: `⚠️ *DM Warning*\n\n` +
                          `Hello! My master is busy right now. Please contact later.\n` +
                          `📌 You have received *${warnCount}/${maxWarnings}* warnings.\n` +
                          `⚡ If you continue, you will be *blocked automatically*.`
                });
            }

            // Block after max warnings
            if (warnCount >= maxWarnings) {
                db[sender].blocked = true;
                db[sender].unblockAt = Date.now() + UNBLOCK_TIME; // Auto-unblock after 24h
                saveDB();

                await sock.sendMessage(from, {
                    text: `🚫 You have been *blocked* for spamming my master's inbox.\n` +
                          `❌ Reason: Exceeded maximum warnings (${maxWarnings}).`
                });

                // Notify owner
                await sock.sendMessage(ownerNumber + "@s.whatsapp.net", {
                    text: `⚠️ User @${sender.split("@")[0]} has been blocked automatically for spamming DMs.`
                });

                // Block the user
                await sock.updateBlockStatus(sender, "block");
            }

        } catch (err) {
            console.error("DMProtect Error:", err);
        }
    }
};
