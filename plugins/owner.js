module.exports = {
  name: "owner",
  alias: ["creator", "admin"],
  desc: "Show bot owner information",
  category: "general",
  usage: ".owner",
  async execute(sock, msg, args) {
    try {
      // 🔹 Owner info text
      const text = `
╔════ ◈ OWNER INFO ◈ ════╗
┃ 👑 OWNER  : SOURAV
┃ 🌍 REGION : INDIAN
┃ 📩 NOTE   : Feel free to contact if any error
╚═══════════════════════╝
      `;

      // 🔹 vCard (WhatsApp contact card)
      const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:SOURAV
ORG:BOT OWNER;
TEL;type=CELL;type=VOICE;waid=919476189681:+91 94761 89681
END:VCARD
      `;

      // send info text
      await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });

      // send vCard contact
      await sock.sendMessage(msg.key.remoteJid, {
        contacts: {
          displayName: "SOURAV",
          contacts: [{ vcard }]
        }
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ Error in owner.js:", e);
      await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Failed to load owner info." }, { quoted: msg });
    }
  }
};
