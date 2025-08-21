// plugins/quran.js

// Use native fetch if available, otherwise fallback to node-fetch
const fetch = global.fetch || ((...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args))
);

module.exports = {
  name: "quran",
  command: ["quran"],
  description: "📖 Get Quran Surah by number (1–114)",
  async execute(sock, m, args) {
    const chatId = m.key.remoteJid;

    // Check if user provided surah number
    if (!args[0]) {
      await sock.sendMessage(chatId, {
        text: "⚠️ Please provide a Surah number (1–114)\nExample: `.quran 1`",
      });
      return;
    }

    const surahNumber = parseInt(args[0]);

    if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
      await sock.sendMessage(chatId, {
        text: "❌ Invalid input. Surah number must be between 1 and 114.",
      });
      return;
    }

    try {
      // Fetch Surah data
      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}`
      );
      const data = await response.json();

      if (!data.data) {
        await sock.sendMessage(chatId, {
          text: "❌ Could not fetch Surah data. Please try again later.",
        });
        return;
      }

      const surah = data.data;
      const message = `📖 Surah ${surah.englishName} (${surah.englishNameTranslation})\n` +
                      `🔢 Surah Number: ${surah.number}\n` +
                      `📚 Ayahs: ${surah.numberOfAyahs}\n\n` +
                      `🌙 Revelation: ${surah.revelationType}\n\n` +
                      `👉 Use .ayah <surah> <ayah> to get specific ayah.`;

      await sock.sendMessage(chatId, { text: message });
    } catch (err) {
      console.error("❌ Quran API Error:", err);
      await sock.sendMessage(chatId, {
        text: "⚠️ Error fetching Surah. Please try again later.",
      });
    }
  },
};
