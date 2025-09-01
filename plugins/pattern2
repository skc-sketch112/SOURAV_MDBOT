const patterns = {
  hi: `
H   H  IIIII
H   H    I
HHHHH    I
H   H    I
H   H  IIIII
`,
  hello: `
H   H  EEEEE  L      L       OOO
H   H  E      L      L      O   O
HHHHH  EEEE   L      L      O   O
H   H  E      L      L      O   O
H   H  EEEEE  LLLLL  LLLLL   OOO
`,
  love: `
L      OOO   V   V  EEEEE
L     O   O  V   V  E
L     O   O  V   V  EEEE
L     O   O   V V   E
LLLL   OOO     V    EEEEE
`
};

module.exports = {
  name: "pattern2",
  alias: ["pattern2", "tp"],
  desc: "Send styled ASCII patterns",
  category: "fun",
  usage: ".pattern2 <word>",
  async execute(sock, msg, args) {
    try {
      const jid = msg?.key?.remoteJid || msg?.chat || msg?.sender;
      if (!jid) {
        console.error("❌ No JID found in message.");
        return;
      }

      if (args.length === 0) {
        return await sock.sendMessage(jid, { text: "❌ Please provide a word!\nExample: .pattern hi" }, { quoted: msg });
      }

      const input = args[0].toLowerCase();
      const art = patterns[input];

      if (!art) {
        return await sock.sendMessage(jid, { text: `❌ No pattern found for "${input}".\nTry: hi, hello, love` }, { quoted: msg });
      }

      await sock.sendMessage(jid, { text: art }, { quoted: msg });

    } catch (e) {
      console.error("Error in pattern.js:", e);
      const jid = msg?.key?.remoteJid || msg?.chat || msg?.sender;
      if (jid) {
        await sock.sendMessage(jid, { text: "⚠️ Error while generating pattern." }, { quoted: msg });
      }
    }
  },
};
