module.exports = {
  name: "evening",
  command: ["evening", "ge", "goodevening"],
  description: "Send unlimited stylish good evening greetings",

  execute: async (sock, m, args) => {
    try {
      const greetings = [
        "🌆✨ Good Evening! May your night be filled with peace and love 🌙💫",
        "🌇🌸 The sun has set but your light still shines 🌹🌙",
        "🌙💖 Sending you warm wishes for a beautiful evening 🌅✨",
        "🍵🌃 Good Evening! Relax, sip your tea, and enjoy the calm 🌸🌈",
        "🌆💎 May this evening bring you closer to your dreams 🌙💫",
        "🌇🌸 Evenings are life’s way of saying you survived the day 💖🌙",
      ];

      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      await sock.sendMessage(m.key.remoteJid, { text: randomGreeting }, { quoted: m });
    } catch (err) {
      console.error("❌ Evening plugin error:", err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Couldn't send Good Evening." }, { quoted: m });
    }
  },
};
