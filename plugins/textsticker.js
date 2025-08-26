const { createCanvas } = require("canvas");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");

module.exports = {
  name: "textsticker",
  alias: ["tsticker", "ts"],
  desc: "Create random styled transparent text stickers",
  category: "converter",

  async exec({ m, sock, args }) {
    try {
      if (!args[0])
        return await sock.sendMessage(
          m.chat,
          { text: "⚠️ Give me some text!\nExample: `.textsticker SOURAV_MD`" },
          { quoted: m }
        );

      const text = args.join(" ");
      const width = 512;
      const height = 512;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Transparent background
      ctx.clearRect(0, 0, width, height);

      // Random Colors / Gradient
      function randomColor() {
        return `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;
      }
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, randomColor());
      gradient.addColorStop(1, randomColor());

      // Random Font Size & Style
      const fontSize = Math.floor(Math.random() * 80) + 60;
      const fonts = ["Sans", "Serif", "Arial", "Courier", "Georgia", "Impact", "Verdana"];
      const font = fonts[Math.floor(Math.random() * fonts.length)];

      ctx.fillStyle = gradient;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `bold ${fontSize}px ${font}`;

      // Shadow effect random
      ctx.shadowColor = randomColor();
      ctx.shadowBlur = Math.floor(Math.random() * 30);

      // Draw Text
      ctx.fillText(text, width / 2, height / 2);

      // Convert to sticker
      const buffer = canvas.toBuffer();

      const sticker = new Sticker(buffer, {
        pack: "🔥 SOURAV_MD RANDOM",
        author: "SOURAV_MD 💎",
        type: StickerTypes.FULL,
        quality: 100,
      });

      const stickerBuffer = await sticker.build();

      await sock.sendMessage(
        m.chat,
        { sticker: stickerBuffer },
        { quoted: m }
      );

    } catch (e) {
      console.error("TextSticker Error:", e);
      await sock.sendMessage(
        m.chat,
        { text: "❌ Failed to create random text sticker." },
        { quoted: m }
      );
    }
  },
};
