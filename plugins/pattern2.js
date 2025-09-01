const figlet = require("figlet");

module.exports = {
  name: "emojipattern",
  alias: ["epattern", "emojiart"],
  desc: "Turn text into big emoji letters",
  category: "fun",
  usage: ".emojipattern 😂 hello",
  execute: async (sock, m, args) => {
    try {
      if (args.length < 2) {
        return await sock.sendMessage(
          m.key.remoteJid,
          { text: "❌ Usage: .emojipattern <emoji> <text>\n👉 Example: .emojipattern 😂 hello" },
          { quoted: m }
        );
      }

      const emoji = args[0]; // first arg is emoji
      const text = args.slice(1).join(" "); // rest is text

      // generate ASCII with figlet
      const asciiArt = figlet.textSync(text.toUpperCase(), { font: "Standard" });

      // replace characters with emoji
      const emojiArt = asciiArt
        .replace(/#/g, emoji)   // filled blocks
        .replace(/\*/g, emoji) // some figlet fonts use *
        .replace(/A/g, emoji)  // fallback
        .replace(/[A-Z0-9]/g, emoji) // just in case
        .replace(/ /g, "  ");  // spacing

      await sock.sendMessage(
        m.key.remoteJid,
        { text: emojiArt },
        { quoted: m }
      );

    } catch (e) {
      console.error("❌ Error in emojipattern:", e);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Failed to generate emoji art." }, { quoted: m });
    }
  }
};
