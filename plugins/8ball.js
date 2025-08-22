module.exports = {
  name: "8ball",
  command: ["8ball", "magic8", "m8"],
  category: "fun",
  description: "Ask the magic 8-ball a question",
  use: ".8ball <your question>",
  /**
   * @param {import('@whiskeysockets/baileys').WASocket} sock
   * @param {*} m - the raw message object
   * @param {string[]} args
   */
  execute: async (sock, m, args) => {
    // Safe reply helper (works even if m.reply doesn't exist)
    const jid = m?.key?.remoteJid;
    const reply = async (text) => {
      if (typeof m?.reply === "function") return m.reply(text);
      return sock.sendMessage(jid, { text }, { quoted: m });
    };

    try {
      const question = (args || []).join(" ").trim();
      if (!question) {
        return reply(
          "🎱 Ask me something!\n\nExample:\n.8ball Am I lucky today?\n.8ball Will I pass the exam?"
        );
      }

      // Large set of fun answers
      const responses = [
        "✅ Yes, definitely!",
        "❌ No, never!",
        "🤔 Maybe, who knows?",
        "😎 Absolutely!",
        "🙅 Not at all!",
        "💯 For sure!",
        "☁️ The future is unclear...",
        "✨ Without a doubt!",
        "⚡ Yes, but be careful.",
        "🔥 No way!",
        "🌙 Ask again later...",
        "🌈 Signs point to YES!",
        "🌪 My reply is NO.",
        "☀️ Looks positive!",
        "🌊 Chances are low...",
        "🍀 Luck is with you!",
        "💔 Unfortunately not.",
        "🎯 Definitely yes!",
        "🚫 Don't count on it.",
        "⚖️ It's 50-50.",
        "👑 You already know the answer 😉",
        "😅 Better not to tell you now.",
        "🐉 Energy says YES!",
        "🕊 Peaceful vibes: NO.",
        "🚀 Success is coming!",
        "🌌 Stars say NO.",
        "🍎 Absolutely positive!",
        "🥀 It's doubtful.",
        "🎵 Music says YES!",
        "🎭 Drama ahead, maybe NO.",
        "🎁 Surprise YES!",
        "💎 Crystal clear: YES.",
        "🧩 Puzzle says NO.",
        "💤 Sleep on it...",
        "👻 Spirits whisper YES.",
        "🔥 The universe screams NO!",
        "💡 Yes, if you try.",
        "🛑 Stop! Answer is NO.",
        "🍫 Sweet YES!",
        "🥶 Cold NO.",
        "🌻 Bright YES!",
        "⚔️ Fight for it, then YES.",
        "🪞 Mirror says NO.",
        "🌍 The world agrees: YES.",
        "📿 Destiny says NO.",
        "🪐 Cosmic answer: YES.",
        "📌 Not likely.",
        "🖤 Sadly, NO.",
        "🤍 Pure YES."
      ];

      const answer = responses[Math.floor(Math.random() * responses.length)];

      await reply(`🎱 *Question:* ${question}\n\n✨ *Answer:* ${answer}`);
    } catch (err) {
      console.error("8ball plugin error:", err);
      await sock.sendMessage(
        jid,
        { text: "❌ Error while executing 8ball. (Check logs)" },
        { quoted: m }
      );
    }
  }
};
