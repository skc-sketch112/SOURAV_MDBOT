module.exports = {
  name: "emojitext",
  alias: ["etext", "emo"],
  desc: "Convert text into emoji art",
  category: "fun",

  async exec({ m, args }) {
    try {
      if (args.length < 2) {
        return m.reply("⚠️ Usage: `.emojitext 🙂 Sourav`");
      }

      const emoji = args[0]; // প্রথম argument হবে emoji
      const text = args.slice(1).join(" ").toUpperCase(); // নাম/টেক্সট

      let output = "";

      // প্রতিটা অক্ষরকে emoji দিয়ে গঠন করা হবে
      for (let char of text) {
        if (char === " ") {
          output += "\n"; // space এর জন্য gap
        } else {
          // প্রতিটা অক্ষরের জন্য 5x3 block emoji
          for (let i = 0; i < 3; i++) {
            output += `${emoji} `.repeat(5) + "\n";
          }
          output += "\n";
        }
      }

      await m.reply(output.trim());

    } catch (err) {
      console.error("EmojiText Error:", err);
      m.reply("❌ EmojiText বানানো গেল না।");
    }
  }
};
