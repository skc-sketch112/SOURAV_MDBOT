const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");
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

function loadPlugins(sock) {
  const pluginDir = path.join(__dirname, "plugins");
  if (!fs.existsSync(pluginDir)) return;
  fs.readdirSync(pluginDir).forEach(file => {
    if (file.endsWith(".js")) {
      require(path.join(pluginDir, file))(sock);
      console.log(`✅ Loaded plugin: ${file}`);
    }
  });
}

async function startBot() {
  const authPath = await getAuthPath();
  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    auth: state,
    browser: ["RenderBot", "Chrome", "1.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("❌ Disconnected:", lastDisconnect?.error);
      if (shouldReconnect) startBot();
    } else if (connection === "open") {
      console.log("✅ Bot connected successfully!");
    }

    // 🔑 request pairing code only AFTER socket is open
    if (!sock.authState.creds.registered && connection === "open") {
      const phoneNumber = process.env.PHONE_NUMBER || "91XXXXXXXXXX";
      try {
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(`📲 Pairing Code for ${phoneNumber}: ${code}`);
      } catch (err) {
        console.error("❌ Failed to get pairing code, retrying in 5s:", err.message);
        setTimeout(async () => {
          try {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log(`📲 Pairing Code (retry) for ${phoneNumber}: ${code}`);
          } catch (err2) {
            console.error("❌ Still failed:", err2.message);
          }
        }, 5000);
      }
    }
  });

  loadPlugins(sock);
}

startBot();
