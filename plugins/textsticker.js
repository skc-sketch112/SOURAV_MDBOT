const { createCanvas } = require("canvas");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");

module.exports = {
  name: "textsticker",
  alias: ["tsticker", "ts"],
  desc: "Create colorful emoji/text stickers",
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

      // Gradient fill
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, `hsl(${Math.random()*360},100%,50%)`);
      gradient.addColorStop(1, `hsl(${Math.random()*360},100%,50%)`);
      ctx.fillStyle = gradient;

      // Random font
      const fonts = ["Sans", "Serif", "Arial", "Courier", "Georgia", "Impact"];
      ctx.font = `bold ${Math.floor(Math.random()*80+60)}px ${fonts[Math.floor(Math.random()*fonts.length)]}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, width/2, height/2);

      const buffer = canvas.toBuffer();
      const sticker = new Sticker(buffer, {
        pack: "🔥 RANDOM STICKER",
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

    } catch (err) {
      console.error("TextSticker Error:", err);
      await sock.sendMessage(
        m.chat,
        { text: "❌ Failed to create sticker." },
        { quoted: m }
      );
    }
  },
};
