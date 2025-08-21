// plugins/rolldice.js
// Dice rolling plugin 🎲

module.exports = {
  name: "dice",
  command: ["dice", "rolldice"],
  description: "Roll dice (1–6). Default is 1 die, but you can roll more.",
  usage: ".dice [number]",
  execute: async (sock, m, args) => {
    const jid = m.key.remoteJid;

    // Number of dice (default = 1, max = 10)
    let count = parseInt(args[0]) || 1;
    if (count < 1) count = 1;
    if (count > 10) count = 10;

    let rolls = [];
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * 6) + 1;
      let emoji = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][roll - 1];
      rolls.push(`${emoji} (${roll})`);
    }

    let text = `🎲 *Rolled ${count} dice* 🎲\n\n${rolls.join("  ")}`;

    await sock.sendMessage(jid, { text }, { quoted: m });
  }
};
