// activate.js
const fs = require("fs");
const path = require("path");
const moment = require("moment");

const dbPath = path.join(__dirname, "../database/activation.json");

// Load or create database
let db = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : {};

function saveDB() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

module.exports = {
  name: "activate",
  command: ["activate", "startbot", "enable"],
  description: "Activate the bot for a specific duration (24h, 3d, etc.)",
  async execute(sock, m, args) {
    try {
      const jid = m.key.remoteJid;
      const sender = m.sender;

      // Time parsing
      const durations = {
        "24h": 24 * 60 * 60 * 1000,
        "1d": 24 * 60 * 60 * 1000,
        "3d": 3 * 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000
      };

      let durationArg = args[0] ? args[0].toLowerCase() : "24h";
      let duration = durations[durationArg];

      if (!duration) {
        return await sock.sendMessage(jid, { text: `❌ Invalid duration!\nAvailable: 24h, 3d, 7d\nUsage: .activate 3d` }, { quoted: m });
      }

      const now = Date.now();
      const expireTime = now + duration;

      db[sender] = {
        activatedAt: now,
        expiresAt: expireTime
      };

      saveDB();

      await sock.sendMessage(jid, {
        text: `✅ Bot successfully activated for *${durationArg}*!\n\nActivation expires on: ${moment(expireTime).format("DD/MM/YYYY HH:mm:ss")}\n\nEnjoy using SOURAV_MD BOT 🚀`
      }, { quoted: m });

      // Optional: send reminder 1 hour before expiration
      setTimeout(async () => {
        if (db[sender] && db[sender].expiresAt === expireTime) {
          await sock.sendMessage(jid, { text: `⏰ Reminder: Your bot activation will expire in 1 hour! Use .activate to extend.` });
        }
      }, duration - 60 * 60 * 1000);

    } catch (err) {
      console.error("❌ Activate plugin error:", err.message);
      await sock.sendMessage(m.key.remoteJid, { text: `⚠️ Error activating bot: ${err.message}` }, { quoted: m });
    }
  },

  // Optional: check activation status
  async onMessage(sock, m) {
    try {
      const sender = m.sender;
      if (!db[sender]) return;

      const now = Date.now();
      if (db[sender].expiresAt && now > db[sender].expiresAt) {
        delete db[sender];
        saveDB();
        await sock.sendMessage(m.key.remoteJid, { text: `⚠️ Your bot activation has expired! Please use .activate to reactivate.` }, { quoted: m });
      }
    } catch (err) {
      console.error("❌ Activate onMessage error:", err.message);
    }
  }
};
