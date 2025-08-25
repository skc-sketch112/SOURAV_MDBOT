const axios = require("axios");

module.exports = {
    name: "dictionary",
    command: ["dict", "meaning"],  // ✅ unchanged main commands
    execute: async (sock, m, args) => {
        if (!args[0]) {
            return sock.sendMessage(
                m.key.remoteJid,
                { text: "❓ Type a word. Example: .dict hello" },
                { quoted: m }
            );
        }

        let word = args.join(" ");
        try {
            // 🔹 Fetch English definition
            let res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            let data = res.data[0];

            let phonetic = data.phonetic || (data.phonetics[0]?.text || "Not available");
            let origin = data.origin || "Not available";

            let reply = `📖 *Word:* ${data.word}\n🔊 *Pronunciation:* ${phonetic}\n🪶 *Origin:* ${origin}\n\n`;

            // Loop through meanings
            for (let i = 0; i < data.meanings.length; i++) {
                let meaning = data.meanings[i];
                reply += `📌 *${i + 1}. Part of Speech:* ${meaning.partOfSpeech}\n`;

                for (let j = 0; j < meaning.definitions.slice(0, 2).length; j++) {
                    let def = meaning.definitions[j];
                    reply += `   ➤ *Definition ${j + 1}:* ${def.definition}\n`;
                    if (def.example) reply += `   💡 *Example:* ${def.example}\n`;
                    if (def.synonyms?.length) reply += `   🔗 *Synonyms:* ${def.synonyms.slice(0, 5).join(", ")}\n`;
                    if (def.antonyms?.length) reply += `   🚫 *Antonyms:* ${def.antonyms.slice(0, 5).join(", ")}\n`;

                    // 🌍 Bengali translation of the definition
                    try {
                        let trans = await axios.get(
                            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(def.definition)}&langpair=en|bn`
                        );
                        let bengaliMeaning = trans.data?.responseData?.translatedText || "";
                        if (bengaliMeaning) {
                            reply += `   🌏 *Bengali:* ${bengaliMeaning}\n`;
                        }
                    } catch {
                        reply += `   🌏 *Bengali:* (translation unavailable)\n`;
                    }
                }

                reply += "\n";
            }

            await sock.sendMessage(m.key.remoteJid, { text: reply.trim() }, { quoted: m });
        } catch (e) {
            console.error("Dictionary Error:", e.response?.data || e.message);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: `❌ Could not find meaning for "${word}"` },
                { quoted: m }
            );
        }
    }
};
