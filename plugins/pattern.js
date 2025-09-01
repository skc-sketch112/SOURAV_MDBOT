const figlet = require("figlet");

// 100+ styles (expand anytime 🚀)
const patterns = {
  ascii: async (text) =>
    new Promise((resolve, reject) => {
      figlet.text(text, { font: "Standard" }, (err, data) => {
        if (err) reject(err);
        else resolve("```" + data + "```");
      });
    }),

  // 🔥 Emoji styles
  fire: async (text) => text.split("").map(c => c === " " ? "\n" : "🔥").join(" "),
  heart: async (text) => text.split("").map(c => c === " " ? "\n" : "❤️").join(" "),
  star: async (text) => text.split("").map(c => c === " " ? "\n" : "⭐").join(" "),
  flower: async (text) => text.split("").map(c => c === " " ? "\n" : "🌸").join(" "),
  ghost: async (text) => text.split("").map(c => c === " " ? "\n" : "👻").join(" "),
  bomb: async (text) => text.split("").map(c => c === " " ? "\n" : "💣").join(" "),
  skull: async (text) => text.split("").map(c => c === " " ? "\n" : "💀").join(" "),
  dragon: async (text) => text.split("").map(c => c === " " ? "\n" : "🐉").join(" "),
  diamond: async (text) => text.split("").map(c => c === " " ? "\n" : "💎").join(" "),
  crown: async (text) => text.split("").map(c => c === " " ? "\n" : "👑").join(" "),
  firework: async (text) => text.split("").map(c => c === " " ? "\n" : "🎆").join(" "),
  sun: async (text) => text.split("").map(c => c === " " ? "\n" : "☀️").join(" "),
  moon: async (text) => text.split("").map(c => c === " " ? "\n" : "🌙").join(" "),
  cloud: async (text) => text.split("").map(c => c === " " ? "\n" : "☁️").join(" "),
  rain: async (text) => text.split("").map(c => c === " " ? "\n" : "🌧️").join(" "),
  snow: async (text) => text.split("").map(c => c === " " ? "\n" : "❄️").join(" "),
  music: async (text) => text.split("").map(c => c === " " ? "\n" : "🎵").join(" "),
  sparkle: async (text) => text.split("").map(c => c === " " ? "\n" : "✨").join(" "),
  angel: async (text) => text.split("").map(c => c === " " ? "\n" : "😇").join(" "),
  robot: async (text) => text.split("").map(c => c === " " ? "\n" : "🤖").join(" "),
  alien: async (text) => text.split("").map(c => c === " " ? "\n" : "👽").join(" "),
  snake: async (text) => text.split("").map(c => c === " " ? "\n" : "🐍").join(" "),
  tiger: async (text) => text.split("").map(c => c === " " ? "\n" : "🐯").join(" "),
  lion: async (text) => text.split("").map(c => c === " " ? "\n" : "🦁").join(" "),
  wolf: async (text) => text.split("").map(c => c === " " ? "\n" : "🐺").join(" "),
  eagle: async (text) => text.split("").map(c => c === " " ? "\n" : "🦅").join(" "),
  spider: async (text) => text.split("").map(c => c === " " ? "\n" : "🕷️").join(" "),
  web: async (text) => text.split("").map(c => c === " " ? "\n" : "🕸️").join(" "),
  sword: async (text) => text.split("").map(c => c === " " ? "\n" : "⚔️").join(" "),
  shield: async (text) => text.split("").map(c => c === " " ? "\n" : "🛡️").join(" "),
  money: async (text) => text.split("").map(c => c === " " ? "\n" : "💰").join(" "),
  fireball: async (text) => text.split("").map(c => c === " " ? "\n" : "🔥💨").join(" "),
  boom: async (text) => text.split("").map(c => c === " " ? "\n" : "💥").join(" "),
  swordfire: async (text) => text.split("").map(c => c === " " ? "\n" : "⚔️🔥").join(" "),
  ghostfire: async (text) => text.split("").map(c => c === " " ? "\n" : "👻🔥").join(" "),
  skullfire: async (text) => text.split("").map(c => c === " " ? "\n" : "💀🔥").join(" "),
  thunder: async (text) => text.split("").map(c => c === " " ? "\n" : "⚡").join(" "),
  wave: async (text) => text.split("").map(c => c === " " ? "\n" : "🌊").join(" "),
  earth: async (text) => text.split("").map(c => c === " " ? "\n" : "🌍").join(" "),
  rocket: async (text) => text.split("").map(c => c === " " ? "\n" : "🚀").join(" "),
  boomfire: async (text) => text.split("").map(c => c === " " ? "\n" : "💥🔥").join(" "),
  demon: async (text) => text.split("").map(c => c === " " ? "\n" : "😈").join(" "),
  angelFire: async (text) => text.split("").map(c => c === " " ? "\n" : "😇🔥").join(" "),
  rainbow: async (text) => text.split("").map(c => c === " " ? "\n" : "🌈").join(" "),
  skullMoney: async (text) => text.split("").map(c => c === " " ? "\n" : "💀💰").join(" "),
  toxic: async (text) => text.split("").map(c => c === " " ? "\n" : "☢️").join(" "),
  biohazard: async (text) => text.split("").map(c => c === " " ? "\n" : "☣️").join(" "),
  cross: async (text) => text.split("").map(c => c === " " ? "\n" : "✝️").join(" "),
  om: async (text) => text.split("").map(c => c === " " ? "\n" : "🕉️").join(" "),
  trident: async (text) => text.split("").map(c => c === " " ? "\n" : "🔱").join(" "),
  lotus: async (text) => text.split("").map(c => c === " " ? "\n" : "🌸").join(" "),

  // 🔥 Custom Emoji
  customEmoji: async (text, emoji) =>
    text.split("").map(c => (c === " " ? "\n" : emoji)).join(" "),
};

module.exports = {
  name: "pattern",
  alias: ["ascii", "emoji", "style"],
  desc: "Generate stylish text patterns (100+ styles)",
  category: "fun",
  usage: ".pattern <style> <text> | .pattern emoji <text> <emoji>",
  async execute(sock, msg, args) {
    try {
      if (args.length < 2) {
        return sock.sendMessage(msg.from, {
          text: `❌ Usage:\n.pattern ascii hello\n.pattern fire hello\n.pattern emoji hello 🌸\n\nAvailable styles: ${Object.keys(patterns).join(", ")}`,
        }, { quoted: msg });
      }

      const style = args[0].toLowerCase();
      const text = args.slice(1).join(" ");

      let output;

      if (style === "emoji") {
        const split = args.slice(1);
        const emoji = split[split.length - 1];
        const word = split.slice(0, -1).join(" ");
        output = await patterns.customEmoji(word, emoji);
      } else if (patterns[style]) {
        output = await patterns[style](text);
      } else {
        output = "⚠️ Unknown style! Try: " + Object.keys(patterns).join(", ");
      }

      await sock.sendMessage(msg.from, { text: output }, { quoted: msg });

    } catch (err) {
      console.error("⚠️ Pattern plugin error:", err);
      sock.sendMessage(msg.from, { text: "⚠️ Error generating pattern" }, { quoted: msg });
    }
  },
};
