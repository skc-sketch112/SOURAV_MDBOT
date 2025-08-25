const axios = require("axios");

module.exports = {
    name: "dictionary",
    command: ["dict", "meaning"], // ✅ Only .dict and .meaning
    execute: async (sock, m, args) => {
        if (!args[0]) {
            return sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ Please provide a word. Example: `.dict power`" },
                { quoted: m }
            );
        }

        let word = args.join(" ").toLowerCase();

        try {
            // English meaning
            const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            const data = res.data[0];

            let phonetics = data.phonetics?.[0]?.text || "";
            let meanings = data.meanings || [];

            let allMeanings = meanings.map((mObj, idx) => {
                let defs = mObj.definitions
                    .map((d, i) => `   ${i + 1}. ${d.definition}${d.example ? `\n      💡 Example: ${d.example}` : ""}`)
                    .join("\n");

                let syns = mObj.synonyms?.slice(0, 8).join(", ") || "Not available";
                let ants = mObj.antonyms?.slice(0, 8).join(", ") || "Not available";

                return `🔹 *Part of Speech:* ${mObj.partOfSpeech}\n${defs}\n\n🔑 *Synonyms:* ${syns}\n❌ *Antonyms:* ${ants}`;
            }).join("\n\n━━━━━━━━━━━━━━━\n\n");

            // Bengali translation
            const trans = await axios.get(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=bn&dt=t&q=${encodeURIComponent(word)}`
            );
            let bengali = trans.data[0][0][0];

            // Build response
            let reply = `📖 *Word:* ${word}
🔊 *Pronunciation:* ${phonetics}

🌍 *Bengali:* ${bengali}

━━━━━━━━━━━━━━━
${allMeanings}`;

            await sock.sendMessage(m.key.remoteJid, { text: reply }, { quoted: m });

        } catch (e) {
            console.error("Dictionary Error:", e.message);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Word not found or API error!" }, { quoted: m });
        }
    }
};
