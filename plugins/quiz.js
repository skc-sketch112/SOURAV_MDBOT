// plugins/quiz.js
const fetch = require("node-fetch");

module.exports = {
  name: "quiz",
  command: ["quiz", "trivia", "question"],
  description: "Get a random quiz question from Open Trivia DB",
  usage: ".quiz",

  execute: async (sock, m) => {
    const jid = m.key.remoteJid;

    try {
      // Fetch random question
      const res = await fetch("https://opentdb.com/api.php?amount=1&type=multiple");
      const data = await res.json();

      if (!data.results || !data.results.length) {
        return sock.sendMessage(jid, { text: "⚠️ Could not fetch quiz question." }, { quoted: m });
      }

      const q = data.results[0];
      const question = decodeHtml(q.question);
      const correct = decodeHtml(q.correct_answer);
      const options = [...q.incorrect_answers.map(decodeHtml), correct];

      // Shuffle options
      options.sort(() => Math.random() - 0.5);

      let msg = `❓ *Quiz Time!*\n\n${question}\n\n`;
      options.forEach((opt, i) => {
        msg += `${i + 1}. ${opt}\n`;
      });

      await sock.sendMessage(jid, { text: msg }, { quoted: m });

      // Wait for user answer
      sock.ev.once("messages.upsert", async ({ messages }) => {
        const reply = messages[0];
        if (!reply.message) return;

        const body = reply.message.conversation?.trim();
        if (!body) return;

        let userAnswer = options[parseInt(body) - 1] || body;

        if (userAnswer.toLowerCase() === correct.toLowerCase()) {
          await sock.sendMessage(jid, { text: "✅ Correct! 🎉" }, { quoted: reply });
        } else {
          await sock.sendMessage(jid, { text: `❌ Wrong! Correct answer: *${correct}*` }, { quoted: reply });
        }
      });
    } catch (e) {
      console.error("Quiz error:", e);
      await sock.sendMessage(jid, { text: "⚠️ Error fetching quiz. Try again later." }, { quoted: m });
    }
  },
};

// Helper: decode HTML entities
function decodeHtml(html) {
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&eacute;/g, "é")
    .replace(/&uuml;/g, "ü")
    .replace(/&rsquo;/g, "’");
}
