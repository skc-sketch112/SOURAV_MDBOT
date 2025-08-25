// plugins/dictionary.js
const axios = require("axios");

module.exports = {
  command: ["dict", "dictionary"],
  description: "Get the meaning, pronunciation & example of a word",
  
  async handler(sock, m, args) {
    const word = args.join(" ").trim();
    if (!word) {
      return sock.sendMessage(m.chat, { text: "📖 Usage: *!dict <word>*" }, { quoted: m });
    }

    try {
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
      const { data } = await axios.get(url);

      const entry = data[0];
      let msg = `📘 *Word:* ${entry.word}`;

      if (entry.phonetics && entry.phonetics.length && entry.phonetics[0].text) {
        msg += `\n🔊 *Pronunciation:* ${entry.phonetics[0].text}`;
      }

      if (entry.meanings && entry.meanings.length > 0) {
        entry.meanings.forEach((meaning, i) => {
          msg += `\n\n👉 *${i + 1}. ${meaning.partOfSpeech}*`;
          meaning.definitions.forEach((def, j) => {
            msg += `\n   ${j + 1}) ${def.definition}`;
            if (def.example) msg += `\n      💡 Example: _${def.example}_`;
          });
        });
      }

      await sock.sendMessage(m.chat, { text: msg }, { quoted: m });

    } catch (err) {
      console.error("Dictionary Error:", err.message);
      await sock.sendMessage(
        m.chat,
        { text: `❌ No results found for *${word}*.` },
        { quoted: m }
      );
    }
  }
};
