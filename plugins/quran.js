// plugins/quran.js

// Use native fetch if available, otherwise fallback to node-fetch
const fetch = global.fetch || ((...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args))
);

module.exports = {
  name: "quran",
  command: ["quran"],
  description: "📖 Get full Quran Surah text (1–114)",
  async execute(sock, m, args) {
    const chatId = m.key.remoteJid;

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
      // Fetch Surah with text
      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}/en.asad`
      );
      const data = await response.json();

      if (!data.data) {
        await sock.sendMessage(chatId, {
          text: "❌ Could not fetch Surah data. Please try again later.",
        });
        return;
      }

      const surah = data.data;
      const header = `📖 Surah ${surah.englishName} (${surah.englishNameTranslation})\n` +
                     `🔢 Number: ${surah.number}\n` +
                     `📚 Ayahs: ${surah.numberOfAyahs}\n\n`;

      // Build full Surah text
      let text = header;
      surah.ayahs.forEach((ayah) => {
        text += `${ayah.numberInSurah}. ${ayah.text}\n`;
      });

      // WhatsApp messages have a limit (~4000 chars), split into chunks
      const chunks = text.match(/[\s\S]{1,3500}/g);

      for (const chunk of chunks) {
        await sock.sendMessage(chatId, { text: chunk }, { quoted: m });
      }

    } catch (err) {
      console.error("❌ Quran API Error:", err);
      await sock.sendMessage(chatId, {
        text: "⚠️ Error fetching Surah. Please try again later.",
      });
    }
  },
};
