// lucky.js
module.exports = {
  name: "lucky",
  command: ["lucky", "luck", "fortune"],
  description: "Check your luck! Unlimited random fun results. Powered by SOURAV_,MD",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const targetUser = mentioned[0] || m.sender || "unknown@user";
    const name = targetUser.split("@")[0];

    const luck = Math.floor(Math.random() * 101);
    let rareEvent = "";
    if (luck === 100) rareEvent = "\n🎉 Jackpot! Extremely lucky today!";

    const reply = `🍀 *Luck Check!* - Powered by SOURAV_,MD

User: @${name}
Luck: ${luck}/100${rareEvent}`;

    await sock.sendMessage(jid, { text: reply, mentions: [targetUser] }, { quoted: m });
  }
};
