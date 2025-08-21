// plugins/slot.js
// Slot Machine 🎰
module.exports = {
  name: "slot",
  command: ["slot", "slots"],
  description: "Play the slot machine 🎰",
  usage: ".slot",

  execute: async (sock, m) => {
    const jid = m.key.remoteJid;
    const items = ["🍒", "🍋", "🍉", "⭐", "🍇"];
    const slot1 = items[Math.floor(Math.random() * items.length)];
    const slot2 = items[Math.floor(Math.random() * items.length)];
    const slot3 = items[Math.floor(Math.random() * items.length)];

    let result = (slot1 === slot2 && slot2 === slot3) ? "🎉 JACKPOT! You win!" : "😢 Better luck next time!";

    const reply = `
🎰 *Slot Machine* 🎰
-------------------
 ${slot1} | ${slot2} | ${slot3}
-------------------
➡️ ${result}
    `;

    await sock.sendMessage(jid, { text: reply }, { quoted: m });
  }
};
