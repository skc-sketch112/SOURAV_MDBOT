const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");

// Optional: custom font (tumi font.ttf diye replace korte parba)
try {
  registerFont(path.join(__dirname, "Arial.ttf"), { family: "CustomFont" });
} catch {}

module.exports = {
  name: "textsticker",
  alias: ["ts", "txtsticker"],
  desc: "Make colorful text sticker",
  category: "sticker",
  async exec({ m, sock, args }) {
    try {
      if (!args[0]) return m.reply("⚠️ Use: `.textsticker YourText`");

      const text = args.join(" ");

      // Canvas create
      const canvas = createCanvas(512, 512);
      const ctx = canvas.getContext("2d");

      // 🔥 Random gradient background
      const gradient = ctx.createLinearGradient(0, 0, 512, 512);
      const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#FFD433"];
      gradient.addColorStop(0, colors[Math.floor(Math.random() * colors.length)]);
      gradient.addColorStop(1, colors[Math.floor(Math.random() * colors.length)]);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);

      // Text style
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 6;
      ctx.font = "bold 70px CustomFont, Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Add text (emoji supported)
      ctx.strokeText(text, 256, 256);
      ctx.fillText(text, 256, 256);

      const buffer = canvas.toBuffer();

      // Sticker object
      const sticker = new Sticker(buffer, {
        pack: "TextSticker Pack",
        author: "SOURAV_MD",
        type: StickerTypes.FULL,
        quality: 100,
      });

      const stickerBuffer = await sticker.toBuffer();
      await sock.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });

    } catch (err) {
      console.error(err);
      m.reply("❌ Failed to create colorful text sticker!");
    }
  },
};
