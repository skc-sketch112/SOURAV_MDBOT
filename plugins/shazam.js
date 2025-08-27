// plugins/shazam.js
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { Shazam } = require("node-shazam");

module.exports = {
  name: "shazam",
  command: ["shazam", "findsong", "whatmusic"],
  description: "Identify any song from a voice note or audio.",

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    try {
      if (!msg.message.audioMessage && !msg.message.videoMessage) {
        return sock.sendMessage(jid, { text: "🎵 Please reply to an *audio/voice note* to recognize the song." }, { quoted: msg });
      }

      // Download media buffer
      const buffer = await downloadMediaMessage(
        msg,
        "buffer",
        {},
        { reuploadRequest: sock.waUploadToServer }
      );

      // Run Shazam recognition
      const shazam = new Shazam();
      const result = await shazam.recognizeSong(buffer);

      if (!result || !result.track) {
        return sock.sendMessage(jid, { text: "❌ Couldn’t recognize the song. Try again with clearer audio." }, { quoted: msg });
      }

      const track = result.track;
      let response = `🎶 *Song Found!*\n\n`;
      response += `🎤 Artist: ${track.subtitle}\n`;
      response += `🎵 Title: ${track.title}\n`;
      response += track.url ? `🔗 Link: ${track.url}` : "";

      await sock.sendMessage(jid, { text: response }, { quoted: msg });

    } catch (err) {
      console.error("[Shazam Error]:", err);
      await sock.sendMessage(jid, { text: "⚠️ Failed to recognize song. Please try again." }, { quoted: msg });
    }
  }
};
