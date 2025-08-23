const fs = require("fs");

// Database for warnings (simple JSON storage)
const dbPath = "./database/dmprotect.json";
let db = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : {};

function saveDB() {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

module.exports = {
    name: "dmprotect",
    description: "Protects your DM from unknown users",
    author: "SOURAV_MD",
    async execute(sock, msg, ownerNumber) {
        try {
            const from = msg.key.remoteJid;
            const isGroup = from.endsWith("@g.us");
            const sender = msg.key.participant || msg.key.remoteJid;

            // Ignore groups
            if (isGroup) return;

            // Owner bypass
            if (sender.includes(ownerNumber)) return;

            // Initialize if not exists
            if (!db[sender]) {
                db[sender] = { warnings: 0, blocked: false };
            }

            // Already blocked
            if (db[sender].blocked) return;

            // Increase warning
            db[sender].warnings++;
            saveDB();

            let warnCount = db[sender].warnings;
            let maxWarnings = 3; // change this limit if you want

            if (warnCount < maxWarnings) {
                await sock.sendMessage(from, {
                    text: `⚠️ *Warning from ${ownerNumber}*\n\n` +
                          `📌 Please don't DM unnecessarily.\n\n` +
                          `⚡ You have received *${warnCount}/${maxWarnings}* warnings.\n\n` +
                          `If you continue, you will be *blocked automatically*!`
                });
            } else {
                db[sender].blocked = true;
                saveDB();
                await sock.sendMessage(from, {
                    text: `🚫 You have been *blocked* for spamming my owner's inbox.\n\n` +
                          `❌ Reason: Exceeded maximum warnings (${maxWarnings}).`
                });
                await sock.updateBlockStatus(sender, "block");
            }

        } catch (e) {
            console.error("DMProtect Error:", e);
        }
    }
};
