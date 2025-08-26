const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { writeFileSync, unlinkSync } = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const { tmpdir } = require("os");

module.exports = {
  name: "sticker",
  command: ["sticker", "s"],
  description: "Convert photo/video to sticker",
  
  async execute(sock, m, args) {
    try {
      // detect quoted or direct media
      const quoted =
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const msg =
        m.message?.imageMessage ||
        m.message?.videoMessage ||
        quoted?.imageMessage ||
        quoted?.videoMessage;

      if (!msg) {
        return await sock.sendMessage(
          m.key.remoteJid,
          { text: "⚠️ Reply with an *image/video* or send one with `.sticker`" },
          { quoted: m }
        );
      }

      // download buffer
      const buffer = await downloadMediaMessage(
        { message: msg },
        "buffer",
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage }
      );

      // temp file path
      const inputPath = path.join(tmpdir(), `${Date.now()}.mp4`);
      const outputPath = path.join(tmpdir(), `${Date.now()}.webp`);

      writeFileSync(inputPath, buffer);

      // convert with ffmpeg
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .inputFormat(msg.imageMessage ? "jpg" : "mp4")
          .duration(10) // max 10 sec
          .outputOptions([
            "-vcodec", "libwebp",
            "-vf",
            "scale=512:512:force_original_aspect_ratio=decrease,fps=15, pad=512:512:-1:-1:color=white@0.0,split [a][b];[a] palettegen=reserve_transparent=on:transparency_color=ffffff [p];[b][p] paletteuse"
          ])
          .save(outputPath)
          .on("end", resolve)
          .on("error", reject);
      });

      // send sticker with pack name + author
      await sock.sendMessage(
        m.key.remoteJid,
        { 
          sticker: { url: outputPath },
          contextInfo: {
            externalAdReply: {
              title: "🔥 Ultra Pro Sticker",
              body: "Made with YourBot",
              sourceUrl: "https://github.com/",
            },
          },
        },
        { quoted: m }
      );

      // cleanup
      unlinkSync(inputPath);
      unlinkSync(outputPath);

    } catch (err) {
      console.error("Sticker Error:", err);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: `❌ Failed to make sticker: ${err.message}` },
        { quoted: m }
      );
    }
  },
};
