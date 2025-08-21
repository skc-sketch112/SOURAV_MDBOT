// plugins/emojiquiz.js
module.exports = {
  name: "emojiquiz",
  command: ["emojiquiz", "eq"],
  description: "Guess the word from emojis",
  usage: ".emojiquiz",

  execute: async (sock, m) => {
    const jid = m.key.remoteJid;

    const puzzles = [
      { q: "🍎📱", a: "apple" },
      { q: "🎬🍿", a: "movie" },
      { q: "⚽🥅", a: "football" },
      { q: "🎸🎶", a: "music" },
    ];

    const random = puzzles[Math.floor(Math.random() * puzzles.length)];
    await sock.sendMessage(jid, { text: `❓ Guess this: ${random.q}` }, { quoted: m });

    sock.ev.once("messages.upsert", async ({ messages }) => {
      const msg = messages[0];
      if (!msg.message) return;

      const ans = msg.message.conversation?.toLowerCase();
      if (ans.includes(random.a)) {
        await sock.sendMessage(jid, { text: "✅ Correct! 🎉" }, { quoted: msg });
      } else {
        await sock.sendMessage(jid, { text: `❌ Wrong! Answer: *${random.a}*` }, { quoted: msg });
      }
    });
  }
};
