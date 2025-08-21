// plugins/mathquiz.js
module.exports = {
  name: "mathquiz",
  command: ["mathquiz", "math"],
  description: "Solve a random math problem",
  usage: ".mathquiz",

  execute: async (sock, m) => {
    const jid = m.key.remoteJid;
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const ops = ["+", "-", "*"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const answer = eval(`${num1} ${op} ${num2}`);

    await sock.sendMessage(jid, { text: `🧮 Solve: *${num1} ${op} ${num2}*` }, { quoted: m });

    sock.ev.once("messages.upsert", async ({ messages }) => {
      const msg = messages[0];
      if (!msg.message) return;

      const userAns = parseInt(msg.message.conversation?.trim());
      if (userAns === answer) {
        await sock.sendMessage(jid, { text: "✅ Correct! 🎉" }, { quoted: msg });
      } else {
        await sock.sendMessage(jid, { text: `❌ Wrong! The answer was *${answer}*.` }, { quoted: msg });
      }
    });
  }
};
