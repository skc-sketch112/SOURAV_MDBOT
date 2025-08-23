const fs = require("fs");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

module.exports = {
  name: "pdf",
  command: ["pdf", "makepdf", "textpdf"],
  description: "Convert any text into a PDF file",

  async execute(sock, m, args) {
    try {
      const sender = m.key.remoteJid;
      if (!args || args.length === 0) {
        return sock.sendMessage(sender, {
          text: "📕 Usage: *.pdf <your text>*\nExample: *.pdf Hello this is my first custom PDF!*"
        });
      }

      const content = args.join(" ");

      // Create new PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const { height } = page.getSize();

      const fontSize = 12;
      const margin = 50;
      let y = height - margin;

      // Split text into lines (so even huge texts fit page)
      const words = content.split(" ");
      let line = "";

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " ";
        const width = font.widthOfTextAtSize(testLine, fontSize);

        if (width > page.getWidth() - 2 * margin) {
          page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
          line = words[i] + " ";
          y -= fontSize + 5;

          // New page if text exceeds
          if (y < margin) {
            y = height - margin;
            const newPage = pdfDoc.addPage([595, 842]);
            page = newPage;
          }
        } else {
          line = testLine;
        }
      }

      if (line.length > 0) {
        page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
      }

      const pdfBytes = await pdfDoc.save();
      const filePath = "./output.pdf";
      fs.writeFileSync(filePath, pdfBytes);

      await sock.sendMessage(sender, {
        document: { url: filePath },
        mimetype: "application/pdf",
        fileName: "generated.pdf",
        caption: "✅ Your text has been converted into PDF successfully!"
      });

      fs.unlinkSync(filePath); // cleanup

    } catch (err) {
      console.error("❌ PDF generation error:", err.message);
      return sock.sendMessage(m.key.remoteJid, {
        text: "⚠️ Error generating PDF. Try again!"
      });
    }
  }
};
