const fs = require("fs");

module.exports = {
    name: "dmprotect",
    command: ["dmprotect"],
    description: "Auto-reply & spam protection in DMs",

    async execute(sock, m) {
        const sender = m.key.remoteJid;
        const isGroup = sender.endsWith("@g.us");
        if (isGroup) return; // ✅ Only works in DMs

        const userId = sender.split("@")[0];

        // ⚡ Setup log group JID (where warnings/blocks are reported)
        const logGroup = "120363999999999999@g.us"; // replace with your admin group JID

        // Load warnings DB
        let db = { warnings: {}, cooldown: {}, blacklist: [] };
        if (fs.existsSync("./warnings.json")) {
            db = JSON.parse(fs.readFileSync("./warnings.json"));
        }

        // Blacklist check
        if (db.blacklist.includes(userId)) return;

        // Cooldown check (10 sec per msg)
        const now = Date.now();
        if (db.cooldown[userId] && now - db.cooldown[userId] < 10000) {
            db.warnings[userId] = (db.warnings[userId] || 0) + 1;
        }
        db.cooldown[userId] = now;

        // Save DB
        fs.writeFileSync("./warnings.json", JSON.stringify(db, null, 2));

        // 🚨 Block if too many warnings
        if (db.warnings[userId] >= 3) {
            db.blacklist.push(userId);
            fs.writeFileSync("./warnings.json", JSON.stringify(db, null, 2));

            await sock.sendMessage(sender, {
                text: "⛔ You have been *blocked* for spamming my owner's DM!"
            });
            await sock.updateBlockStatus(sender, "block");

            // Log in admin group
            await sock.sendMessage(logGroup, {
                text: `🚨 User @${userId} has been blocked for spamming.`,
                mentions: [`${userId}@s.whatsapp.net`]
            });
            return;
        }

        // ✅ Normal auto-reply
        await sock.sendMessage(sender, {
            image: { url: "https://i.imgur.com/4M34hi2.jpeg" }, // 🔗 replace with your Sourav_md photo
            caption: `⚠️ My owner *Sourav_md* is busy right now.\n\n📌 Please state your reason.\n\n⚡ Warning: ${db.warnings[userId] || 0}/3`
        });

        // Log warnings
        await sock.sendMessage(logGroup, {
            text: `⚠️ User @${userId} messaged in DM.\nWarnings: ${db.warnings[userId] || 0}/3`,
            mentions: [`${userId}@s.whatsapp.net`]
        });
    }
};
