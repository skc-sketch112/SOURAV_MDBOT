// plugins/define.js
const fetch = require("node-fetch");

module.exports = {
  command: ["define", "meaning"], // removed dict & dictionary
  description: "Define a word with meaning, pronunciation, synonyms, antonyms, and example (multi-language)",

  async handler(sock, m, args) {
    if (!args[0]) {
      return sock.sendMessage(
        m.chat,
        { text: "📖 Usage: *.define <word> [lang]*\nExample: *.define hello en* or *.define প্রেম bn*" },
        { quoted: m }
      );
    }

    let word = args[0];
    let lang = args[1] ? args[1].toLowerCase() : "en"; // default English

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/${lang}/${word}`);
      if (!res.ok) throw new Error("Word not found");
      const data = await res.json();

      const entry = data[0];
      const phonetic = entry.phonetics?.[0]?.text || "N/A";
      const audio = entry.phonetics?.find(p => p.audio)?.audio || null;

      let replyText = `📖 *Word:* ${entry.word}\n`;
      replyText += `🌍 *Language:* ${lang.toUpperCase()}\n`;
      replyText += `🔊 *Pronunciation:* ${phonetic}\n\n`;

      entry.meanings.slice(0, 3).forEach((meaning, i) => {
        replyText += `💡 *${meaning.partOfSpeech.toUpperCase()}*\n`;
        meaning.definitions.slice(0, 2).forEach((def, j) => {
          replyText += `   • ${def.definition}\n`;
          if (def.example) replyText += `   ✏️ Example: ${def.example}\n`;
        });
        if (meaning.synonyms?.length) {
          replyText += `   🔗 Synonyms: ${meaning.synonyms.slice(0, 5).join(", ")}\n`;
        }
        if (meaning.antonyms?.length) {
          replyText += `   🚫 Antonyms: ${meaning.antonyms.slice(0, 5).join(", ")}\n`;
        }
        replyText += `\n`;
      });

      await sock.sendMessage(m.chat, { text: replyText.trim() }, { quoted: m });

      if (audio) {
        const audioRes = await fetch(audio);
        const buffer = Buffer.from(await audioRes.arrayBuffer());
        await sock.sendMessage(
          m.chat,
          { audio: buffer, mimetype: "audio/mpeg", ptt: true },
          { quoted: m }
        );
      }
    } catch (err) {
      console.error("Dictionary error:", err);
      await sock.sendMessage(
        m.chat,
        { text: `❌ Could not find definition for *${word}* in ${lang.toUpperCase()}.` },
        { quoted: m }
      );
    }
  },
};
