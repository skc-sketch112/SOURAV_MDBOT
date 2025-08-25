const axios = require("axios");

module.exports = {
    name: "dictionary",
    command: ["dict", "meaning"],
    execute: async (sock, m, args) => {
        if (!args[0]) {
            return sock.sendMessage(m.key.remoteJid, { text: "❓ Type a word. Example: .dict hello" }, { quoted: m });
        }

        let word = args.join(" ");
        try {
            let res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            let data = res.data[0];

            let phonetic = data.phonetic || (data.phonetics[0] ? data.phonetics[0].text : "");
            let meaning = data.meanings[0]?.definitions[0]?.definition || "No meaning found";
            let example = data.meanings[0]?.definitions[0]?.example || "No example found";

            let reply = `📖 *Word:* ${word}\n🔊 *Pronunciation:* ${phonetic}\n\n📌 *Meaning:* ${meaning}\n💡 *Example:* ${example}`;
            
            await sock.sendMessage(m.key.remoteJid, { text: reply }, { quoted: m });
        } catch (e) {
            console.error("Dictionary Error:", e.response?.data || e.message);
            await sock.sendMessage(m.key.remoteJid, { text: `❌ Could not find meaning for "${word}"` }, { quoted: m });
        }
    }
};
