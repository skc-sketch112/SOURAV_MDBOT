module.exports = {
  name: "heart",
  alias: ["loveheart", "hearts"],
  desc: "Animated rotating heart emojis",
  category: "fun",
  usage: ".heart",
  async execute(sock, msg, args) {
    try {
      // 💖 Pool of heart emojis
      const emojiPool = ["❤️","💖","💕","💓","💞","💘","💝","♥️"];
      const chosen = [];

      // Pick 6 random unique emojis
      while (chosen.length < 6) {
        const e = emojiPool[Math.floor(Math.random() * emojiPool.length)];
        if (!chosen.includes(e)) chosen.push(e);
      }

      // Send first line
      let text = chosen.join("");
      let sentMsg = await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });

      // Animate by rotating emojis
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 500));
        chosen.push(chosen.shift()); // move first to last
        text = chosen.join("");
        await sock.sendMessage(msg.key.remoteJid, { text, edit: sentMsg.key });
      }
    } catch (e) {
      console.error("❌ Error in heart animation:", e);
    }
  }
};
