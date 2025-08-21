const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

async function getAuthPath() {
  const diskPath = "/data/auth"; // Persistent Disk path
  const localPath = path.join(__dirname, "auth_info");

  try {
    await fs.promises.access("/data", fs.constants.W_OK);
    console.log("✅ Using persistent disk at /data");
    return diskPath;
  } catch {
    console.log("⚠️ No disk found. Using local auth_info (will reset on redeploy).");
    if (!fs.existsSync(localPath)) {
      fs.mkdirSync(localPath);
    }
    return localPath;
  }
}

// 📂 Load all plugins from /plugins
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
    auth: state
  });

  sock.ev.on("creds.update", saveCreds);

  // Handle connection updates
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("❌ Disconnected:", lastDisconnect?.error);
      if (shouldReconnect) startBot();
    } else if (connection === "open") {
      console.log("✅ Bot connected successfully!");
    }
  });

  // Load all plugins
  loadPlugins(sock);

  // Pairing code login (if fresh)
  if (!sock.authState.creds.registered) {
    const phoneNumber = process.env.PHONE_NUMBER || "91XXXXXXXXXX"; // set in Render env
    let code = await sock.requestPairingCode(phoneNumber);
    console.log(`📲 Pairing Code for ${phoneNumber}: ${code}`);
  }
}

startBot();
