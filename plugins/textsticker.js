const { createCanvas, registerFont } = require("canvas");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const path = require("path");

module.exports = {
  name: "textsticker",
  command: ["textsticker", "tsticker", "ts"],
  desc: "Make colorful transparent text sticker - SOURAV_MD",

  async execute(sock, m, args) {
    try {
      if (!args[0]) {
        return await sock.sendMessage(
          m.key.remoteJid,
          { text: "⚠️ Give me some text!\nExample: `.textsticker SOURAV`" },
          { quoted: m }
        );
      }

      const text = args.join(" ");
      const width = 512;
      const height = 512;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Transparent background
      ctx.clearRect(0, 0, width, height);

      // Fonts (system fallback)
      const fonts = ["Arial", "Sans", "Courier", "Georgia", "Impact"];
      const fontSize = 120;
      ctx.font = `bold ${fontSize}px ${fonts[Math.floor(Math.random() * fonts.length)]}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Colorful gradient
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "red");
      gradient.addColorStop(0.5, "lime");
      gradient.addColorStop(1, "blue");
      ctx.fillStyle = gradient;

      // Draw text centered
      ctx.fillText(text, width / 2, height / 2);

      // Export buffer
      const buffer = canvas.toBuffer("image/png");

      // Convert to sticker
      const sticker = new Sticker(buffer, {
        pack: "🔥 SOURAV_MD STICKERS",
        author: "SOURAV_MD 💎",
        type: StickerTypes.FULL,
        quality: 100,
      });

      const stickerBuffer = await sticker.build();

      await sock.sendMessage(
        m.key.remoteJid,
        { sticker: stickerBuffer },
        { quoted: m }
      );
    } catch (err) {
      console.error("TextSticker Error:", err);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "❌ Failed to create sticker." },
        { quoted: m }
      );
    }
  },
};
