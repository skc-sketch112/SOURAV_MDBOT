// plugins/pdf.js
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const axios = require("axios");

/**
 * Helper: download media buffer
 */
async function downloadMediaMessage(message, type = "image") {
  const stream = await downloadContentFromMessage(message, type);
  let buffer = Buffer.from([]);
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }
  return buffer;
}

/**
 * Helper: text wrap for PDF
 */
function wrapText(text, maxLineLength = 80) {
  const words = text.split(" ");
  let lines = [], line = "";
  for (const word of words) {
    if ((line + word).length > maxLineLength) {
      lines.push(line.trim());
      line = "";
    }
    line += word + " ";
  }
  if (line) lines.push(line.trim());
  return lines;
}

module.exports = {
  name: "pdf",
  alias: ["pdfimg", "pdfdoc", "pdftext"],
  category: "tools",
  desc: "Create PDF from text or images",
  async execute(sock, msg, args) {
    try {
      const text = args.join(" ");
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      // নতুন PDF বানাও
      const pdfDoc = await PDFDocument.create();

      // === Case 1: Images to PDF ===
      if (msg.message?.imageMessage || quoted?.imageMessage || (args[0] && args[0].startsWith("http"))) {
        let buffers = [];

        if (msg.message?.imageMessage) {
          buffers.push(await downloadMediaMessage(msg.message.imageMessage, "image"));
        } else if (quoted?.imageMessage) {
          buffers.push(await downloadMediaMessage(quoted.imageMessage, "image"));
        } else if (args[0] && args[0].startsWith("http")) {
          const res = await axios.get(args[0], { responseType: "arraybuffer" });
          buffers.push(Buffer.from(res.data));
        }

        for (const buffer of buffers) {
          let img, page;
          if (buffer[0] === 0x89) {
            img = await pdfDoc.embedPng(buffer);
          } else {
            img = await pdfDoc.embedJpg(buffer);
          }
          page = pdfDoc.addPage([img.width, img.height]);
          page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        }

      } else {
        // === Case 2: Text to PDF ===
        const page = pdfDoc.addPage([595, 842]); // A4 size
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const lines = wrapText(text || "⚠️ No text provided!", 80);
        let y = 780;

        for (const line of lines) {
          page.drawText(line, {
            x: 50,
            y,
            size: 18,
            font,
            color: rgb(0, 0, 0),
          });
          y -= 24; // gap between lines
        }
      }

      // === Save & Send ===
      const pdfBytes = await pdfDoc.save();

      await sock.sendMessage(msg.key.remoteJid, {
        document: Buffer.from(pdfBytes),
        mimetype: "application/pdf",
        fileName: "SOURAV_MD.pdf",
        caption: "✅ Here’s your PDF, made by *SOURAV_MD Bot* 🚀"
      }, { quoted: msg });

    } catch (err) {
      console.error("❌ PDF Plugin Error:", err);
      await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ Failed to generate PDF. Try again!" }, { quoted: msg });
    }
  }
};
