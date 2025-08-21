// plugins/numberguess.js
// Guess a number between 1–10
module.exports = {
  name: "numberguess",
  command: ["guess", "numberguess"],
  description: "Guess the number (1–10)",
  usage: ".guess 7",

  execute: async (sock, m, args) => {
    const jid = m.key.remoteJid;
    if (!args[0]) {
      return sock.sendMessage(jid, { text: "⚠️ Usage: .guess <1–10>" }, { quoted: m });
    }

    const userGuess = parseInt(args[0]);
    const randomNum = Math.floor(Math.random() * 10) + 1;

    if (isNaN(userGuess) || userGuess < 1 || userGuess > 10) {
      return sock.sendMessage(jid, { text: "❌ Please enter a valid number between 1 and 10." }, { quoted: m });
    }

    let result = userGuess === randomNum ? "🎉 Correct! You guessed it!" : `😢 Wrong! The number was *${randomNum}*`;

    await sock.sendMessage(jid, { text: result }, { quoted: m });
  }
};
