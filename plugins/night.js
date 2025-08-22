module.exports = {
  name: "night",
  command: ["night", "gn", "goodnight"],
  description: "Send unlimited stylish good night greetings",

  execute: async (sock, m, args) => {
    try {
      const greetings = [
        "🌙✨ Good Night! May your dreams be sweet and your sleep peaceful 🌌💫",
        "😴🌟 Time to rest, recharge, and dream big 🌙💖",
        "🌌🌸 May the stars watch over you and bless you with serenity 🌠💎",
        "🌙💤 Good Night! Sleep tight and wake up with fresh energy ☀️🌸",
        "💫🌙 End the day with gratitude and start tomorrow with hope 🌸✨",
        "🌌🛏️ Sending hugs and prayers for a calm and restful night 🌙💖",
      ];

      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      await sock.sendMessage(m.key.remoteJid, { text: randomGreeting }, { quoted: m });
    } catch (err) {
      console.error("❌ Night plugin error:", err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Couldn't send Good Night." }, { quoted: m });
    }
  },
};
