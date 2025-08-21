const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");
const express = require("express");
const qrcode = require("qrcode");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

async function getAuthPath() {
  const diskPath = "/data/auth"; 
  const localPath = path.join(__dirname, "auth_info");

  try {
    await fs.promises.access("/data", fs.constants.W_OK);
    console.log("✅ Using persistent disk at /data");
    return diskPath;
  } catch {
    console.log("⚠️ No disk found. Using local auth_info (resets on redeploy).");
    if (!fs.existsSync(localPath)) fs.mkdirSync(localPath);
    return localPath;
  }
}

async function startBot() {
  const authPath = await getAuthPath();
  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  let qrCodeData = null; // store QR temporarily

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: false, // ❌ don’t print in logs
    auth: state,
    browser: ["RenderBot", "Chrome", "1.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (connection) console.log("🔌 Connection Status:", connection);

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("❌ Disconnected:", lastDisconnect?.error);
      if (shouldReconnect) startBot();
    } else if (connection === "open") {
      console.log("✅ Bot connected successfully!");
      qrCodeData = null; // clear QR once connected
    }

    // 🟡 If QR is available, save it
    if (qr) {
      console.log("📲 New QR generated, scan on webpage");
      qrCodeData = await qrcode.toDataURL(qr); // convert to image
    }
  });

  // 🌐 Express server to show QR
  const app = express();
  app.get("/", (req, res) => {
    if (qrCodeData) {
      res.send(`
        <html>
          <head><title>WhatsApp Bot QR</title></head>
          <body style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;font-family:sans-serif;">
            <h2>Scan this QR to connect WhatsApp</h2>
            <img src="${qrCodeData}" />
          </body>
        </html>
      `);
    } else {
      res.send("<h2>✅ Bot already connected. No QR available.</h2>");
    }
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🌍 QR available at: http://localhost:${PORT}`);
  });
}

startBot();
