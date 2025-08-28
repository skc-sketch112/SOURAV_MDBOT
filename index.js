// ================== IMPORTS ==================
const express = require("express");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const fetch = require("node-fetch");
const moment = require("moment");
const figlet = require("figlet"); // Banner library

// ================== KEEP ALIVE SERVER ==================
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ SOURAV_MD BOT is running and alive!");
});

app.listen(PORT, () => console.log(`🌐 Keep-alive server running on port ${PORT}`))
   .on("error", (err) => console.error("❌ Keep-alive server error:", err.message));

// ================== BANNER ==================
figlet.text("SOURAV_MD BOT", {
  font: "Standard",
  horizontalLayout: "default",
  verticalLayout: "default",
}, function(err, data) {
  if (err) console.log("❌ Banner error:", err);
  console.log("\n" + data);
  console.log("🔥 Welcome to SOURAV_MD BOT - Fully Powered & Professional!\n");
});

// ================== HEARTBEAT ==================
setInterval(() => console.log("💓 Heartbeat: SOURAV_MD BOT still running..."), 5 * 60 * 1000);

// ================== PLUGIN SYSTEM ==================
const commands = new Map();
const PLUGIN_DIR = path.join(__dirname, "plugins");

function loadPlugin(file) {
  try {
    delete require.cache[require.resolve(path.join(PLUGIN_DIR, file))];
    const plugin = require(path.join(PLUGIN_DIR, file));

    const pluginName = plugin.name || file.replace(".js", "");
    let aliases = [];

    if (plugin.command && Array.isArray(plugin.command)) aliases = plugin.command.map(c => c.toLowerCase());
    else if (plugin.command && typeof plugin.command === "string") aliases = [plugin.command.toLowerCase()];
    else aliases = [pluginName.toLowerCase()];

    aliases.forEach(alias => commands.set(alias, plugin));
    console.log(`✅ Loaded plugin: ${pluginName} [${aliases.join(", ")}]`);
  } catch (err) {
    console.error(`❌ Failed to load plugin ${file}:`, err.message);
  }
}

function loadPlugins() {
  commands.clear();
  if (!fs.existsSync(PLUGIN_DIR)) return console.error(`❌ Plugins directory (${PLUGIN_DIR}) not found!`);
  fs.readdirSync(PLUGIN_DIR).forEach(file => file.endsWith(".js") && loadPlugin(file));
}
loadPlugins();

// Hot reload plugins
if (fs.existsSync(PLUGIN_DIR)) {
  fs.watch(PLUGIN_DIR, (eventType, filename) => {
    if (filename && filename.endsWith(".js")) {
      console.log(`♻️ Plugin change detected: ${filename}, reloading...`);
      loadPlugins();
    }
  });
}

// ================== START BOT ==================
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    qrTimeout: 0,
    auth: state,
    version
  });

  // ================== CONNECTION HANDLER ==================
  sock.ev.on("connection.update", async (update) => {
    const { connection, qr } = update;

    if (qr) console.log("📲 Scan QR:\n" + `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);

    if (connection === "close") {
      const reason = update.lastDisconnect?.error?.output?.statusCode;
      if (reason === DisconnectReason.loggedOut) console.log("❌ Logged out. Delete auth folder and reconnect.");
      else {
        console.log("⚠️ Connection closed. Reconnecting in 5s...");
        setTimeout(startBot, 5000);
      }
    } else if (connection === "open") {
      console.log("✅ SOURAV_MD BOT CONNECTED & ACTIVE!");
      sendWelcome(sock);
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // ================== WELCOME MESSAGE ==================
  async function sendWelcome(sock) {
    try {
      const userJid = sock.user?.id?.split(":")[0] + "@s.whatsapp.net" || null;
      if (!userJid) return console.warn("[Welcome] No valid user JID.");

      const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json")));
      const botVersion = packageJson.version || "3.0.0";
      const greetings = [
        "🎉 SOURAV_MD BOT is online!",
        "🚀 SOURAV_MD BOT has landed!",
        "🔥 SOURAV_MD BOT ready for action!"
      ];
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      const timestamp = moment().format("DD/MM/YYYY HH:mm:ss");

      const welcomeMessage = `
${greeting}

✅ *SOURAV_MD BOT Connected!* (v${botVersion})
🕒 Connected on: ${timestamp}

🔥 *Features:*
- 🎶 .song (Music Downloader)
- 📸 .setstatus (Update Status)
- 🎨 .sticker (Sticker Creator)
- 🤖 AI-powered chat & fun
- ⚙️ Automation & advanced plugins

📢 Telegram: https://t.me/YOUR_CHANNEL
📱 WhatsApp: https://chat.whatsapp.com/YOUR_GROUP
Type *.menu* to explore commands!
      `;

      const pfpUrl = "https://i.imgur.com/YOUR_IMAGE.jpg";

      let imageBuffer = null;
      try {
        const res = await axios.get(pfpUrl, { responseType: "arraybuffer", timeout: 10000 });
        imageBuffer = Buffer.from(res.data);
      } catch (err) { console.warn("[Welcome] Failed to download PFP:", err.message); }

      await sock.sendMessage(userJid, {
        text: welcomeMessage,
        ...(imageBuffer ? { image: imageBuffer, caption: welcomeMessage } : {})
      });

      console.log("[Welcome] Welcome message sent.");
    } catch (err) { console.error("[Welcome] Error sending message:", err.message); }
  }

  // ================== MESSAGE HANDLER ==================
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m.message) return;

    let body =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      m.message.videoMessage?.caption ||
      "";

    // Run onMessage plugins
    for (let plugin of commands.values()) {
      if (typeof plugin.onMessage === "function") {
        try { await plugin.onMessage(sock, m); } 
        catch (err) { console.error(`❌ onMessage plugin ${plugin.name}:`, err.message); }
      }
    }

    // Commands with "."
    if (!body.startsWith(".")) return;
    let args = body.slice(1).trim().split(/\s+/);
    let cmd = args.shift().toLowerCase();

    let command = commands.get(cmd);
    if (command && typeof command.execute === "function") {
      try {
        console.log(`[Command] Executing: ${cmd} from ${m.key.remoteJid}`);
        await command.execute(sock, m, args, { axios, fetch, downloadMediaMessage });
        console.log(`⚡ Command executed: ${cmd}`);
      } catch (err) {
        console.error(`❌ Command ${cmd} error:`, err.stack || err.message);
        await sock.sendMessage(m.key.remoteJid, {
          text: `⚠️ Error while executing: ${cmd}\n${err.message}`
        }, { quoted: m });
      }
    }
  });

  // ================== AUTOREACT ==================
  global.autoReact = true;
  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      if (!global.autoReact) return;
      const msg = messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const emojis = ["🔥","😂","❤️","👍","🤯","👑","💀","🥳","✨","😎"];
      const reaction = emojis[Math.floor(Math.random() * emojis.length)];

      await sock.sendMessage(msg.key.remoteJid, { react: { text: reaction, key: msg.key } });
    } catch (err) { console.error("AutoReact error:", err.message); }
  });

  // ================== KEEP ALIVE PING ==================
  setInterval(async () => {
    try { await sock.sendPresenceUpdate("available"); console.log("📡 Keep-alive ping sent!"); } 
    catch (err) { console.error("Keep-alive ping error:", err.message); }
  }, 2 * 60 * 1000);

  // ================== ERROR HANDLERS ==================
  process.on("uncaughtException", (err) => console.error("❌ Uncaught Exception:", err.stack || err.message));
  process.on("unhandledRejection", (reason) => console.error("❌ Unhandled Rejection:", reason.stack || reason));
}

// ================== START BOT ==================
startBot();
