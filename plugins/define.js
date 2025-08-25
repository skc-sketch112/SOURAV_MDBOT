const axios = require("axios");

module.exports = {
    name: "define",
    command: ["define", "meaning"], // no dict/dictionary if you don’t want
    execute: async (sock, m, args) => {
        if (!args[0]) {
            return sock.sendMessage(m.key.remoteJid, { text: "❌ Please provide a word. Example: .define love" }, { quoted: m });
        }

        let word = args[0];
        let lang = args[1] || "en";

        try {
            let url = `https://api.dictionaryapi.dev/api/v2/entries/${lang}/${word}`;
            let res = await axios.get(url);
            let data = res.data[0];

            let meaning = data.meanings[0].definitions[0].definition;
            let example = data.meanings[0].definitions[0].example || "No example found.";
            let phonetic = data.phonetics[0]?.text || "N/A";

            let replyMsg = `📖 *Word:* ${data.word}\n🔊 *Phonetic:* ${phonetic}\n\n💡 *Meaning:* ${meaning}\n✍️ *Example:* ${example}`;
            await sock.sendMessage(m.key.remoteJid, { text: replyMsg }, { quoted: m });
        } catch (e) {
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Word not found!" }, { quoted: m });
        }
    }
};
