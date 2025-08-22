module.exports = {
  name: "morning",
  command: ["morning", "gm", "goodmorning"],
  description: "Send unlimited stylish good morning greetings",

  execute: async (sock, m, args) => {
    try {
      // 🌞 Stylish Good Morning messages
      const greetings = [
        "🌞✨ Good Morning, have a magical day ahead! 🌸💫",
        "☀️🌼 Rise and shine! Wishing you a day full of smiles and success 🌈💖",
        "🌸💛 A fresh start, a new blessing, a new hope. Good Morning 🌞🌻",
        "🌈☕ Good Morning! May your coffee be strong and your day be brighter 💫🌹",
        "💐💎 Sending positive vibes your way! Have a wonderful morning 🌞🌸",
        "🌞✨ Every sunrise is a chance to make today better than yesterday 🌼🌈",
        "💖🌸 Good Morning! Start the day with happiness and end it with success ☀️🌹",
        "🌅🌸 Rise like the sun, shine like the stars, and bloom like the flowers 💛✨",
        "🌞☕ Smile, because it’s a brand new day filled with endless opportunities 🌸💫",
        "🌻🌈 Good Morning! May your heart be light and your dreams take flight 💐💖",
        "🌅🔥 A new morning, a new blessing, a new you — Good Morning 🌞💫",
        "🌹☀️ Keep shining! The world is waiting for your energy 🌸💎",
      ];

      // 🎲 Pick a random message each time
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

      await sock.sendMessage(
        m.key.remoteJid,
        { text: randomGreeting },
        { quoted: m }
      );
    } catch (err) {
      console.error("❌ Morning plugin error:", err);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "⚠️ Oops! Couldn't send Good Morning. Try again." },
        { quoted: m }
      );
    }
  },
};
