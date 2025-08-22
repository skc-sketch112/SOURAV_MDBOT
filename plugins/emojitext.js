module.exports = {
  name: "emojitext",
  command: ["emojitext", "etext", "estyle"],
  description: "Convert text into stylish emoji decorated format",

  execute: async (sock, m, args) => {
    try {
      if (!args[0]) {
        return await sock.sendMessage(
          m.key.remoteJid,
          { text: "❌ Please provide text.\n👉 Example: .emojitext hello" },
          { quoted: m }
        );
      }

      // Join all words after command
      const inputText = args.join(" ");

      // Different emoji styles
      const styles = [
        `✨🌸 ${inputText.split("").join(" ✨ ")} 🌸✨`,
        `🔥💎 ${inputText.split("").join(" 💎 ")} 🔥`,
        `🌈⭐ ${inputText.split("").join(" 🌟 ")} ⭐🌈`,
        `🌹❤️ ${inputText.split("").join(" ❤️ ")} 🌹`,
        `⚡💫 ${inputText.split("").join(" 💫 ")} ⚡`,
        `🌙🌌 ${inputText.split("").join(" 🌌 ")} 🌙`,
      ];

      // Pick random style
      const styledText = styles[Math.floor(Math.random() * styles.length)];

      await sock.sendMessage(m.key.remoteJid, { text: styledText }, { quoted: m });
    } catch (err) {
      console.error("❌ EmojiText plugin error:", err);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "⚠️ Failed to generate emoji text." },
        { quoted: m }
      );
    }
  },
};
