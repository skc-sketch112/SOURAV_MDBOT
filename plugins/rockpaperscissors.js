// plugins/rockpaperscissors.js
// Rock Paper Scissors Game ✊📄✂️

module.exports = {
  name: "rockpaperscissors",
  command: ["rps", "rockpaperscissors", "rock", "paper", "scissors"],
  description: "Play Rock-Paper-Scissors with the bot",
  usage: ".rps rock / .rps paper / .rps scissors",

  execute: async (sock, m, args) => {
    const jid = m.key.remoteJid;

    if (args.length < 1) {
      await sock.sendMessage(jid, {
        text: "⚠️ Usage: .rps rock | .rps paper | .rps scissors"
      }, { quoted: m });
      return;
    }

    const userChoice = args[0].toLowerCase();
    const choices = ["rock", "paper", "scissors"];
    if (!choices.includes(userChoice)) {
      await sock.sendMessage(jid, {
        text: "❌ Invalid choice! Use: rock, paper, or scissors."
      }, { quoted: m });
      return;
    }

    // Bot random choice
    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    // Decide winner
    let result;
    if (userChoice === botChoice) {
      result = "😐 It's a *tie*!";
    } else if (
      (userChoice === "rock" && botChoice === "scissors") ||
      (userChoice === "paper" && botChoice === "rock") ||
      (userChoice === "scissors" && botChoice === "paper")
    ) {
      result = "🎉 You *win*!";
    } else {
      result = "😢 You *lose*! Bot wins!";
    }

    // Reply message
    const reply = `
✊📄✂️ *Rock Paper Scissors* ✊📄✂️

🧑 You chose: *${userChoice}*
🤖 Bot chose: *${botChoice}*

➡️ ${result}
    `;

    await sock.sendMessage(jid, { text: reply }, { quoted: m });
  }
};
