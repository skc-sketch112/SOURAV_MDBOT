// plugins/coinflip.js
// Coin flip plugin 🪙

module.exports = {
  name: "coinflip",
  command: ["coinflip", "flip", "coin"],
  description: "Flip a coin (Heads or Tails).",
  usage: ".coinflip",
  execute: async (sock, m) => {
    const jid = m.key.remoteJid;

    // Random Heads/Tails
    const isHeads = Math.random() < 0.5;
    const result = isHeads ? "🪙 Heads" : "🪙 Tails";

    await sock.sendMessage(jid, { text: `🎯 *Coin Flip Result:* ${result}` }, { quoted: m });
  }
};
