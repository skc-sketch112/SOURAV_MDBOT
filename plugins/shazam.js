// plugins/shazam.js
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const Shazam = require("node-shazam");

module.exports = {
  name: "shazam",
  command: ["shazam", "findsong"],
  description: "Identify any song from audio.",

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const audioMsg = msg.message?.audioMessage || quoted?.audioMessage;

      if (!audioMsg) {
        return sock.sendMessage(jid, { text: "🎵 Please reply to an *audio message*." }, { quoted: msg });
      }

      const buffer = await downloadMediaMessage(
        { message: quoted || msg.message },
        "buffer",
        {},
        { reuploadRequest: sock.updateMediaMessage }
      );

      const song = await Shazam.identifySong(buffer);

      if (!song || !song.track) {
        return sock.sendMessage(jid, { text: "⚠️ Couldn’t identify this song." }, { quoted: msg });
      }

      await sock.sendMessage(jid, {
        text: `🎶 *${song.track.title}*\n👤 ${song.track.subtitle}\n🔗 ${song.track.url}`
      }, { quoted: msg });

    } catch (err) {
      console.error("Shazam Error:", err);
      await sock.sendMessage(jid, { text: "❌ Failed to identify song." }, { quoted: msg });
    }
  }
};
