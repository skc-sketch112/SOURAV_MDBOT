module.exports = {
  name: "party",
  alias: ["party"],
  desc: "Animated rotating party emojis",
  category: "fun",
  usage: ".party",
  async execute(sock, msg, args) {
    try {
      const emojiPool = ["🎉","🥳","🎊","🎂","🍾","🎶"];
      const chosen = [];
      while (chosen.length < 6) {
        const e = emojiPool[Math.floor(Math.random() * emojiPool.length)];
        if (!chosen.includes(e)) chosen.push(e);
      }

      let text = chosen.join("");
      let sentMsg = await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });

      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 500));
        chosen.push(chosen.shift());
        text = chosen.join("");
        await sock.sendMessage(msg.key.remoteJid, { text, edit: sentMsg.key });
      }
    } catch (e) {
      console.error("❌ Error in party animation:", e);
    }
  }
};
