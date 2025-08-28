// iq.js
module.exports = {
  name: "iq",
  command: ["iq", "brain", "intelligence"],
  description: "Check your IQ randomly (unlimited) with fun rare events",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    // Determine target user (mentioned or self)
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const targetUser = mentioned[0] || m.sender;

    // Generate random IQ (0–200+)
    let iqValue = Math.floor(Math.random() * 201); // 0–200
    // Rare genius event (1% chance to exceed 200)
    if (Math.random() <= 0.01) {
      iqValue = 250 + Math.floor(Math.random() * 51); // 250–300 IQ
    }

    // IQ description
    let description = "";
    if (iqValue >= 250) description = "🌟 Super Genius! Einstein vibes!";
    else if (iqValue >= 140) description = "🧠 Genius level IQ!";
    else if (iqValue >= 120) description = "🙂 Above average intelligence";
    else if (iqValue >= 90) description = "😎 Average IQ";
    else if (iqValue >= 70) description = "😐 Below average";
    else description = "💀 Very low IQ! Need more brain juice!";

    // Fun IQ meter (10 blocks)
    const filled = Math.round((iqValue / 300) * 10);
    const empty = 10 - filled;
    const iqBar = "🧠".repeat(filled) + "⬜".repeat(empty);

    // Compose reply
    const name = targetUser.split("@")[0];
    const replyText = `
🧠 *IQ Check!* - Powered by SOURAV_,MD

User: @${name}
IQ: ${iqValue}
IQ Meter: ${iqBar}
Status: ${description}
`;

    // Send message with tagging
    await sock.sendMessage(
      jid,
      { text: replyText, mentions: [targetUser] },
      { quoted: m }
    );
  }
};
