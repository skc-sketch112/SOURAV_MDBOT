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
          output += "\n\n"; // space এর জন্য gap
        } else {
          output += `${emoji} `.repeat(5) + "\n"; // প্রতিটা অক্ষরের জন্য emoji line
        }
        output += "\n";
      }

      await m.reply(output.trim());

    } catch (err) {
      console.error("EmojiText Error:", err);
      m.reply("❌ EmojiText বানানো গেল না।");
    }
  }
};
