const fetch = require("node-fetch");

module.exports = {
    name: "quran",
    command: ["quran"],
    execute: async (sock, m, args) => {
        try {
            const jid = m.key.remoteJid;

            // If no args → show menu
            if (args.length === 0) {
                let menu = "📖 *Quran Surah Menu* (1 - 114)\n\n";
                menu += "Type `.quran <number>` to read a Surah.\n\n";
                for (let i = 1; i <= 114; i++) {
                    menu += `👉 Surah ${i}\n`;
                }
                await sock.sendMessage(jid, { text: menu }, { quoted: m });
                return;
            }

            const surahNum = parseInt(args[0]);
            if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
                await sock.sendMessage(jid, { text: "⚠️ Please enter a valid surah number (1-114)." }, { quoted: m });
                return;
            }

            // Fetch Surah (Arabic + English translation)
            const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/en.asad`);
            const data = await response.json();

            if (!data.data) {
                await sock.sendMessage(jid, { text: "❌ Failed to fetch Surah. Try again later." }, { quoted: m });
                return;
            }

            const surah = data.data;
            let text = `📖 *Surah ${surah.number}: ${surah.englishName}*\n(${surah.englishNameTranslation})\n\n`;

            surah.ayahs.slice(0, 10).forEach((a) => {
                text += `${a.numberInSurah}. ${a.text}\n\n`;
            });

            text += `✨ Showing first 10 ayahs only (to avoid spam).\nType ".quran ${surahNum}" again to reload.`;

            await sock.sendMessage(jid, { text }, { quoted: m });

        } catch (err) {
            console.error("❌ Error in quran.js:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Error while fetching Quran." },
                { quoted: m }
            );
        }
    }
};
