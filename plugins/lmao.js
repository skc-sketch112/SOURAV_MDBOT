module.exports = {
  name: "lmao",
  alias: ["lmao"],
  desc: "Send animated emoji shooting pattern",
  category: "fun",
  usage: ".lmao",
  async execute(sock, msg, args) {
    try {
      // 🎭 Emoji pool
      const emojiPool = ["😂","🤣","😹","😆","😜","😝","😛","🙃","🤪","😍","🎨","🏨","🔥","✨","😎"];

      // Pick 6 random emojis
      const chosen = [];
      while (chosen.length < 6) {
        const e = emojiPool[Math.floor(Math.random() * emojiPool.length)];
        if (!chosen.includes(e)) chosen.push(e);
      }

      let text = chosen.join(""); // first frame

      // Send initial message
      let sentMsg = await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });

      // 🔄 Animate by rotating emojis
      let loops = 30; // how many shifts
      for (let i = 0; i < loops; i++) {
        await new Promise(r => setTimeout(r, 500)); // 0.5s delay
        // rotate left
        chosen.push(chosen.shift());
        text = chosen.join("");
        await sock.sendMessage(msg.key.remoteJid, {
          text,
          edit: sentMsg.key // 🌀 edit same message
        });
      }

    } catch (e) {
      console.error("❌ Error in lmao animation:", e);
      await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Error while animating." }, { quoted: msg });
    }
  }
};
