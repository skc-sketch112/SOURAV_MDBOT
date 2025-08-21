const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

// 📂 Load all plugins from /plugins
function loadPlugins(sock) {
  const pluginDir = path.join(__dirname, "plugins");
  fs.readdirSync(pluginDir).forEach(file => {
    if (file.endsWith(".js")) {
      require(path.join(pluginDir, file))(sock);
      console.log(`✅ Loaded plugin: ${file}`);
    }
  });
}

async function startBot() {
  // Use /data/auth for persistent session in Render
  const { state, saveCreds } = await useMultiFileAuthState("/data/auth");

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: false, // we will use pairing code
    auth: state
  });

  sock.ev.on("creds.update", saveCreds);

  // Handle connection updates
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("❌ Disconnected:", lastDisconnect.error);
      if (shouldReconnect) startBot();
    } else if (connection === "open") {
      console.log("✅ Bot connected successfully!");
    }
  });

  // Load all plugins
  loadPlugins(sock);

  // Pairing code login (if fresh)
  if (!sock.authState.creds.registered) {
    const phoneNumber = process.env.PHONE_NUMBER || "91XXXXXXXXXX"; // Set in Render env
    let code = await sock.requestPairingCode(phoneNumber);
    console.log(`📲 Pairing Code for ${phoneNumber}: ${code}`);
  }
}

startBot();
