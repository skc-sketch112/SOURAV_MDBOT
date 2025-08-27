// meme.js - Ultra Pro Random Meme Generator Plugin
const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");
const { loadImage } = require("canvas");

module.exports = {
  name: "meme",
  command: ["meme", "memegen", "m"],
  description: "Generate a random meme with unlimited text in Bengali, English, or Hindi.",

  async execute(sock, m, args, { axios, fetch }) {
    const jid = m.key.remoteJid;
    console.log(`[Meme] Command received at 02:08 PM IST, Aug 27, 2025: ${m.body} from ${jid}`);

    // Pool of random meme templates
    const memeTemplates = [
      "https://i.imgur.com/8nP0e2b.jpg", // Drake
      "https://i.imgur.com/1gQ2E2c.jpg", // Distracted Boyfriend
      "https://i.imgur.com/5Q1E7k9.jpg", // Change My Mind
      "https://i.imgur.com/9jK8L3m.jpg"  // Success Kid (add more URLs as needed)
    ];

    try {
      // Use random template
      const randomTemplate = memeTemplates[Math.floor(Math.random() * memeTemplates.length)];
      const image = await loadImage(randomTemplate);
      const width = image.width;
      const height = image.height;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Draw image
      ctx.drawImage(image, 0, 0, width, height);

      // Set font with multi-language support
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.textAlign = "center";
      ctx.font = "bold 40px 'Noto Sans', 'Segoe UI Emoji'";

      // Use full input as text (no "top:" or "bottom:" parsing)
      const text = args.join(" ").trim() || "Random Meme Time!";
      console.log(`[Meme] Processing text: ${text}`);

      // Add text at random positions
      const yPositions = [50, height / 2, height - 50];
      const randomY = yPositions[Math.floor(Math.random() * yPositions.length)];
      wrapText(ctx, text, width / 2, randomY, width - 40, 40);

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
        caption: "😂 Random meme generated! 😂",
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
