// rate.js
module.exports = {
  name: "rate",
  command: ["rate", "rating"],
  description: "Rate a user on fun metrics! Unlimited. Powered by SOURAV_,MD",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const targetUser = mentioned[0] || m.sender || "unknown@user";
    const name = targetUser.split("@")[0];

    const rating = Math.floor(Math.random() * 101);
    const metrics = ["Coolness", "Cuteness", "Genius", "Luck", "Charisma"];
    const metric = metrics[Math.floor(Math.random() * metrics.length)];

    const reply = `⭐ *Rating Check!* - Powered by SOURAV_,MD

User: @${name}
${metric} Rating: ${rating}/100`;

    await sock.sendMessage(jid, { text: reply, mentions: [targetUser] }, { quoted: m });
  }
};
