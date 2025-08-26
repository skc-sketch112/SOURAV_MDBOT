const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: "sticker",
  command: ["sticker", "s"],
  description: "Make sticker from image/video",

  async execute(sock, m, args) {
    try {
      // quoted ba direct media
      const quoted = m.quoted ? m.quoted : m;

      const type = Object.keys(quoted.message)[0]; // imageMessage, videoMessage
      if (type !== "imageMessage" && type !== "videoMessage") {
        return sock.sendMessage(
          m.chat,
          { text: "⚠️ Reply or send an *image/video (max 10s)* with .sticker" },
          { quoted: m }
        );
      }

      // media download
      const stream = await downloadContentFromMessage(
        quoted.message[type],
        type.includes("video") ? "video" : "image"
      );

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // send sticker
      await sock.sendMessage(
        m.chat,
        { sticker: buffer },
        { quoted: m }
      );

    } catch (e) {
      console.error("Sticker Error:", e);
      await sock.sendMessage(
        m.chat,
        { text: "❌ Sticker convert failed, try again!" },
        { quoted: m }
      );
    }
