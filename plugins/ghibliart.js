const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

const PHOTO_DIR = path.join(__dirname, "../downloads");
if (!fs.existsSync(PHOTO_DIR)) fs.mkdirSync(PHOTO_DIR, { recursive: true });

// ================== FREE GHIBLI ART APIS ==================
// (These are demo-style endpoints, many mirror free art filters)
// You can swap / add new ones if you find more
const GHIBLI_APIS = [
  (img) => `https://api.devgpt.art/ghibli?url=${img}`,
  (img) => `https://imageai-studio.vercel.app/api/ghibli?img=${img}`,
  (img) => `https://artflow-api.onrender.com/ghibli?source=${img}`,
  (img) => `https://anime-style-api.vercel.app/ghibli?url=${img}`,
  (img) => `https://filter-api.arkana.ai/ghibli?img=${img}`,
  (img) => `https://cartoonify.art/api/ghibli?src=${img}`,
  (img) => `https://free-art-render.glitch.me/ghibli?img=${img}`,
  (img) => `https://deepanime-api.vercel.app/ghibli?url=${img}`,
  (img) => `https://dreamanime.art/api/ghibli?img=${img}`,
  (img) => `https://pixai.vercel.app/api/ghibli?src=${img}`,
  (img) => `https://artify-api.glitch.me/ghibli?url=${img}`,
  (img) => `https://studioanime.freeapi.art/ghibli?img=${img}`,
  (img) => `https://anime-filter-api.onrender.com/ghibli?url=${img}`,
  (img) => `https://toonlab.art/api/ghibli?src=${img}`,
  (img) => `https://magicstyle-api.vercel.app/ghibli?url=${img}`,
];

module.exports = {
  name: "ghibli",
  command: ["ghibli", "ghibliart"],
  description: "Transform any replied image into Studio Ghibli style art.",

  async execute(sock, msg) {
    const chat = msg.key.remoteJid;

    try {
      // Detect replied image
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted?.imageMessage) {
        return sock.sendMessage(chat, { text: "🖼️ Please reply to an *image* to transform into Ghibli art." }, { quoted: msg });
      }

      // Download the quoted image
      const buffer = await downloadMediaMessage(quoted, "buffer", {}, { reuploadRequest: sock.waUploadToServer });
      if (!buffer) throw new Error("Failed to download image");

      // Save temp file
      const tempFile = path.join(PHOTO_DIR, `ghibli_${Date.now()}.jpg`);
      fs.writeFileSync(tempFile, buffer);

      // Upload image to file hosting (imgbb free API)
      const imgbbKey = "YOUR_IMGBB_API_KEY"; // 🔑 Replace with free key from imgbb.com
      const form = new FormData();
      form.append("image", fs.createReadStream(tempFile));
      const upload = await axios.post(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, form, {
        headers: form.getHeaders(),
      });

      const imageUrl = upload.data.data.url;

      // Try each Ghibli API until one succeeds
      let ghibliUrl = null;
      for (let api of GHIBLI_APIS) {
        try {
          const url = api(imageUrl);
          const res = await axios.get(url, { responseType: "arraybuffer", timeout: 20000 });
          if (res.status === 200 && res.data) {
            const outputFile = path.join(PHOTO_DIR, `ghibli_out_${Date.now()}.jpg`);
            fs.writeFileSync(outputFile, res.data);
            ghibliUrl = outputFile;
            break;
          }
        } catch (err) {
          console.log("❌ API failed, trying next:", api(imageUrl));
          continue;
        }
      }

      // Clean temp
      fs.unlinkSync(tempFile);

      if (!ghibliUrl) {
        return sock.sendMessage(chat, { text: "⚠️ All Ghibli APIs failed, try again later." }, { quoted: msg });
      }

      // Send result
      await sock.sendMessage(chat, {
        image: fs.readFileSync(ghibliUrl),
        caption: "✨ Here’s your Studio Ghibli art!\nPowered by SOURAV_MD"
      }, { quoted: msg });

      // Delete result after sending
      fs.unlinkSync(ghibliUrl);

    } catch (err) {
      console.error("[Ghibli Error]:", err);
      await sock.sendMessage(chat, { text: "❌ Failed to transform image into Ghibli style." }, { quoted: msg });
    }
  }
};
