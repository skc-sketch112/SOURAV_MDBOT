// rate.js
module.exports = {
  name: "rate",
  command: ["rate", "rating", "rateuser"],
  description: "Rate a user, self or anything randomly (unlimited)",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    // Determine target user or thing
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let target = mentioned[0] || args.join(" ") || m.sender;

    // Generate random rating 0–100%
    let rating = Math.floor(Math.random() * 101);

    // Rare event: 1% chance of max rating (101%)
    if (Math.random() <= 0.01) {
      rating = 101;
    }

    // Fun rating description
    let description = "";
    if (rating === 101) description = "🌟 Perfect! Legendary rating!";
    else if (rating >= 90) description = "😎 Amazing! Top tier!";
    else if (rating >= 70) description = "👍 Good! Quite impressive!";
    else if (rating >= 50) description = "🙂 Average. Could be better!";
    else if (rating >= 30) description = "😐 Low rating. Try harder!";
    else description = "💀 Very bad rating! Ouch!";

    // Rating meter (10 blocks)
    const filled = Math.round((rating / 101) * 10);
    const empty = 10 - filled;
    const rateBar = "⭐".repeat(filled) + "⬜".repeat(empty);

    // Compose reply
    const name = typeof target === "string" && target.includes("@") ? target.split("@")[0] : target;
    const mentions = typeof target === "string" && target.includes("@") ? [target] : [];

    const replyText = `
🎯 *Rating System* - Powered by SOURAV_,MD

Target: ${name}
Rating: ${rating}%
Rating Meter: ${rateBar}
Status: ${description}
`;

    // Send message
    await sock.sendMessage(
      jid,
      { text: replyText, mentions },
      { quoted: m }
    );
  }
};
