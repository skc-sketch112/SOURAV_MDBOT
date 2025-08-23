const fs = require("fs");

module.exports = {
    name: "dmprotect",
    command: ["dmprotect"],
    description: "DM Auto-reply & Spam Protection",

    async execute(sock, m, args) {
        const sender = m.key.remoteJid;
        const isGroup = sender.endsWith("@g.us");
        if (isGroup) return; // ✅ Only works in DMs

        // === CONFIG ===
        const logGroup = "120363999999999999@g.us"; // replace with your admin group JID
        const ownerName = "Sourav_md";
        const photoUrl = "https://i.ibb.co/4Y7tZq3/sourav-md.jpg"; // ✅ replace with working image URL

        // === DB LOAD ===
        let db = { warnings: {}, cooldown: {}, blacklist: [], enabled: true };
        if (fs.existsSync("./dmprotect.json")) {
            db = JSON.parse(fs.readFileSync("./dmprotect.json"));
        }

        // === ADMIN CONTROL ===
        if (args && args.length > 0) {
            if (args[0] === "on") {
                db.enabled = true;
                fs.writeFileSync("./dmprotect.json", JSON.stringify(db, null, 2));
                return sock.sendMessage(sender, { text: "✅ DM Protection has been *enabled*." });
            }
            if (args[0] === "off") {
                db.enabled = false;
                fs.writeFileSync("./dmprotect.json", JSON.stringify(db, null, 2));
                return sock.sendMessage(sender, { text: "❌ DM Protection has been *disabled*." });
            }
        }

        // If disabled, do nothing
        if (!db.enabled) return;

        const userId = sender.split("@")[0];

        // === BLACKLIST CHECK ===
        if (db.blacklist.includes(userId)) return;

        // === COOLDOWN (10s) ===
        const now = Date.now();
        if (db.cooldown[userId] && now - db.cooldown[userId] < 10000) {
            db.warnings[userId] = (db.warnings[userId] || 0) + 1;
        }
        db.cooldown[userId] = now;

        // Save DB
        fs.writeFileSync("./dmprotect.json", JSON.stringify(db, null, 2));

        // === BLOCK IF TOO MANY WARNINGS ===
        if (db.warnings[userId] >= 3) {
            db.blacklist.push(userId);
            fs.writeFileSync("./dmprotect.json", JSON.stringify(db, null, 2));

            await sock.sendMessage(sender, {
                text: "⛔ You are *blocked* for spamming my owner's DM!"
            });
            await sock.updateBlockStatus(sender, "block");

            // Log in admin group
            await sock.sendMessage(logGroup, {
                text: `🚨 User @${userId} has been *blocked* for spam.`,
                mentions: [`${userId}@s.whatsapp.net`]
            });
            return;
        }

        // === NORMAL AUTO REPLY ===
        await sock.sendMessage(sender, {
            image: { url: photoUrl }, // ✅ Fixed working image
            caption: `⚠️ My owner *${ownerName}* is busy right now.\n\n📌 Please state your reason.\n\n⚡ Warning: ${db.warnings[userId] || 0
