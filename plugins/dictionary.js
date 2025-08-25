const fetch = require("node-fetch");

module.exports = {
  name: "dictionary",
  command: ["dict", "dictionary"], // ✅ only these two
  category: "tools",
  description: "Get meaning, examples, synonyms, antonyms, and Bengali translation of a word",
  use: ".dict <word>",

  execute: async (sock, m, args) => {
    const jid = m?.key?.remoteJid;
    const reply = (text) => sock.sendMessage(jid, { text }, { quoted: m });

    if (!args.length) {
      return reply("❌ Please provide a word.\nExample: `.dict hello`");
    }

    const word = args.join(" ");

    try {
      // English dictionary API
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = await res.json();

      if (!Array.isArray(data)) {
        return reply(`⚠️ No results found for *${word}*`);
      }

      const entry = data[0];
      const phonetic = entry?.phonetic || "N/A";
      let response = `📘 *Dictionary*\n\n🔤 Word: *${word}*\n🔊 Pronunciation: ${phonetic}\n\n`;

      entry.meanings.forEach((mng, i) => {
        const partOfSpeech = mng.partOfSpeech || "N/A";
        const defs = mng.definitions || [];

        defs.slice(0, 3).forEach((def, j) => {
          response += `*${i + 1}.${j + 1}* (${partOfSpeech}) ${def.definition}\n`;
          if (def.example) response += `💡 Example: ${def.example}\n`;
          if (def.synonyms?.length) response += `✨ Synonyms: ${def.synonyms.slice(0, 5).join(", ")}\n`;
          if (def.antonyms?.length) response += `⚡ Antonyms: ${def.antonyms.slice(0, 5).join(", ")}\n`;
          response += `\n`;
        });
      });

      // Bengali translation
      try {
        const transRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|bn`);
        const transData = await transRes.json();
        const bengali = transData?.responseData?.translatedText || "N/A";
        response += `🌍 Bengali: *${bengali}*`;
      } catch {
        response += `🌍 Bengali: N/A (translation failed)`;
      }

      reply(response);

    } catch (err) {
      console.error("dictionary.js error:", err);
      reply("❌ Error fetching dictionary data. Please try again later.");
    }
  }
};
