// plugins/bhagavadgita.js

const fetch = global.fetch || ((...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args))
);

module.exports = {
  name: "gita",
  command: ["gita", "bhagavadgita"],
  description: "📖 Get Bhagavad Gita chapter (1–18)",

  async execute(sock, m, args) {
    const chatId = m.key.remoteJid;

    if (!args[0]) {
      await sock.sendMessage(chatId, {
        text: "⚠️ Please provide a chapter number (1–18)\nExample: `.gita 2`",
      });
      return;
    }

    const chapterNumber = parseInt(args[0]);
    if (isNaN(chapterNumber) || chapterNumber < 1 || chapterNumber > 18) {
      await sock.sendMessage(chatId, {
        text: "❌ Invalid input. Chapter number must be between 1 and 18.",
      });
      return;
    }

    try {
      // Fetch chapter from Bhagavad Gita API
      const response = await fetch(
        `https://bhagavadgitaapi.in/chapters/${chapterNumber}/verses/`
      );
      const verses = await response.json();

      if (!Array.isArray(verses)) {
        await sock.sendMessage(chatId, {
          text: "❌ Could not fetch chapter data. Try again later.",
        });
        return;
      }

      // Chapter header
      let text = `📖 Bhagavad Gita - Chapter ${chapterNumber}\n🔢 Verses: ${verses.length}\n\n`;

      // Build full chapter text
      verses.forEach((verse) => {
        text += `\n${verse.verse_number}. ${verse.text}\n`;
      });

      // Split into chunks for WhatsApp (max ~3500 chars)
      const chunks = text.match(/[\s\S]{1,3500}/g);
      for (const chunk of chunks) {
        await sock.sendMessage(chatId, { text: chunk }, { quoted: m });
      }
    } catch (err) {
      console.error("❌ Gita API Error:", err);
      await sock.sendMessage(chatId, {
        text: "⚠️ Error fetching Bhagavad Gita chapter. Please try again later.",
      });
    }
  },
};
