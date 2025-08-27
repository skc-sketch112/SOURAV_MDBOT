// meme.js - Ultra Pro Meme Generator Plugin
const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");
const { loadImage } = require("canvas");

module.exports = {
  name: "meme",
  command: ["meme", "memegen", "m"],
  description: "Generate a meme with unlimited text in Bengali, English, or Hindi.",

  async execute(sock, m, args, { axios, fetch }) {
    const jid = m.key.remoteJid;
    console.log(`[Meme] Command received at 01:51 PM IST, Aug 27, 2025: ${m.body} from ${jid}`);

    // Default meme template (e.g., Drake Hotline Bling)
    const defaultTemplate = "https://i.imgur.com/8nP0e2b.jpg"; // Drake template; replace with your preferred URL

    try {
      // Parse input (e.g., .meme top: হাসি bottom: মজা)
      let topText = "";
      let bottomText = "";
      if (args.length) {
        args.forEach(arg => {
          if (arg.toLowerCase().startsWith("top:")) topText = arg.slice(4).trim();
          else if (arg.toLowerCase().startsWith("bottom:")) bottomText = arg.slice(7).trim();
        });
      }

      // Use full input as top text if no split provided
      if (!topText && args.length) topText = args.join(" ").trim();
      if (!topText) {
        return sock.sendMessage(jid, { text: "❌ Please provide text.\nExample: `.meme top: হাসি bottom: মজা` or `.meme Laugh Fun`" }, { quoted: m });
      }

      console.log(`[Meme] Processing: Top: ${topText}, Bottom: ${bottomText}`);

      // Load template image
      const image = await loadImage(defaultTemplate);
      const width = image.width;
      const height = image.height;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Draw image
      ctx.drawImage(image, 0, 0, width, height);

      // Set font with multi-language support (e.g., Noto Sans for Bengali/Hindi)
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.textAlign = "center";
      ctx.font = "bold 40px 'Noto Sans', 'Segoe UI Emoji'";

      // Add top text
      wrapText(ctx, topText, width / 2, 50, width - 40, 40);
      // Add bottom text
      wrapText(ctx, bottomText, width / 2, height - 50, width - 40, 40);

      // Convert to buffer
      const buffer = canvas.toBuffer("image/png");
      if (!buffer || buffer.length === 0) {
        throw new Error("Failed to generate meme buffer.");
      }

      // Save temp file
      const downloadsDir = path.join(__dirname, "../downloads");
      if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
      const tempFile = path.join(downloadsDir, `meme_${Date.now()}.png`);
      fs.writeFileSync(tempFile, buffer);
      console.log(`[Meme] Saved temp file: ${tempFile}, size: ${buffer.length / 1024}KB`);

      // Send meme
      await sock.sendMessage(jid, {
        image: { url: tempFile },
        caption: "😂 Your meme is ready! 😂",
      }, { quoted: m });

      // Clean up
      fs.unlinkSync(tempFile);
      console.log(`[Meme] Cleaned up: ${tempFile}`);

    } catch (err) {
      console.error("[Meme Error]:", err.message);
      await sock.sendMessage(jid, { text: `❌ Failed to generate meme.\nError: ${err.message}` }, { quoted: m });
    }
  }
};

// Function to wrap text for unlimited length
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  const lines = [];

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && i > 0) {
      lines.push(line.trim());
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  lines.forEach((line, index) => {
    ctx.strokeText(line, x, y + (index * lineHeight));
    ctx.fillText(line, x, y + (index * lineHeight));
  });
}
