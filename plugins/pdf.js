const fs = require("fs");
const axios = require("axios");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

module.exports = {
  name: "pdf",
  command: ["pdf", "pdfimg", "makepdf", "textpdf", "imgpdf"],
  description: "Convert text or images (single/multiple) into a PDF",

  async execute(sock, m, args, command) {
    try {
      const sender = m.key.remoteJid;

      // --- TEXT TO PDF ---
      if (command === "pdf" || command === "makepdf" || command === "textpdf") {
        if (!args || args.length === 0) {
          return sock.sendMessage(sender, {
            text: "📕 Usage: *.pdf <your text>*\nExample: *.pdf Hello world in PDF!*"
          });
        }

        const content = args.join(" ");
        const pdfDoc = await PDFDocument.create();
        let page = pdfDoc.addPage([595, 842]); // A4
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const { height } = page.getSize();

        const fontSize = 12;
        const margin = 50;
        let y = height - margin;

        const words = content.split(" ");
        let line = "";

        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + " ";
          const width = font.widthOfTextAtSize(testLine, fontSize);

          if (width > page.getWidth() - 2 * margin) {
            page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
            line = words[i] + " ";
            y -= fontSize + 5;

            if (y < margin) {
              y = height - margin;
              page = pdfDoc.addPage([595, 842]);
            }
          } else {
            line = testLine;
          }
        }

        if (line.length > 0) {
          page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
        }

        const pdfBytes = await pdfDoc.save();
        const filePath = "./output_text.pdf";
        fs.writeFileSync(filePath, pdfBytes);

        await sock.sendMessage(sender, {
          document: { url: filePath },
          mimetype: "application/pdf",
          fileName: "text_generated.pdf",
          caption: "✅ Text converted into PDF!"
        });

        fs.unlinkSync(filePath);
      }

      // --- IMAGES TO PDF (MULTIPLE) ---
      else if (command === "pdfimg" || command === "imgpdf") {
        let imageBuffers = [];

        // Case 1: User sends multiple URLs
        if (args && args.length > 0) {
          for (let url of args) {
            try {
              const res = await axios.get(url, { responseType: "arraybuffer" });
              imageBuffers.push(res.data);
            } catch (err) {
              console.log("❌ Failed to fetch image:", url);
            }
          }
        }

        // Case 2: User uploads one/multiple images
        if (m.message?.imageMessage) {
          const imgBuffer = await sock.downloadMediaMessage(m);
          imageBuffers.push(imgBuffer);
        }
        if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
          const imgBuffer = await sock.downloadMediaMessage({
            message: m.message.extendedTextMessage.contextInfo.quotedMessage,
          });
          imageBuffers.push(imgBuffer);
        }

        if (imageBuffers.length === 0) {
          return sock.sendMessage(sender, {
            text: "🖼️ Usage: *.pdfimg <image urls>* OR send/reply multiple images with caption *.pdfimg*"
          });
        }

        const pdfDoc = await PDFDocument.create();

        for (const buffer of imageBuffers) {
          let image;
          try {
            image = await pdfDoc.embedJpg(buffer);
          } catch {
            image = await pdfDoc.embedPng(buffer);
          }

          const page = pdfDoc.addPage([image.width, image.height]);
          page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        }

        const pdfBytes = await pdfDoc.save();
        const filePath = "./output_images.pdf";
        fs.writeFileSync(filePath, pdfBytes);

        await sock.sendMessage(sender, {
          document: { url: filePath },
          mimetype: "application/pdf",
          fileName: "images_generated.pdf",
          caption: "✅ All images combined into ONE PDF!"
        });

        fs.unlinkSync(filePath);
      }

    } catch (err) {
      console.error("❌ PDF generation error:", err);
      return sock.sendMessage(m.key.remoteJid, {
        text: "⚠️ Error generating PDF. Please try again."
      });
    }
  }
};
