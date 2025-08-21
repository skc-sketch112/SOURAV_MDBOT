const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

async function getAuthPath() {
  const diskPath = "/data/auth"; // persistent disk path if mounted
  const localPath = path.join(__dirname, "auth_info"); // fallback path

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

    if (connection) console.log("🔌 Connection Status:", connection);

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("❌ Disconnected:", lastDisconnect?.error);
      if (shouldReconnect) startBot();
    } else if (connection === "open") {
      console.log("✅ Bot connected successfully!");
    }

    // 🔑 Pairing code if fresh session
    if (!sock.authState.creds.registered && connection === "open") {
      console.log("🟡 No session found → requesting pairing code...");
      const phoneNumber = process.env.PHONE_NUMBER || "91XXXXXXXXXX";
      try {
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(`📲 Pairing Code for ${phoneNumber}: ${code}`);
      } catch (err) {
        console.error("❌ Failed to get pairing code:", err.message);
      }
    } else if (sock.authState.creds.registered) {
      console.log("🟢 Already logged in, skipping pairing code.");
    }
  });

  loadPlugins(sock);
}

startBot();
