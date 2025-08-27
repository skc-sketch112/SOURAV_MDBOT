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

// ================== KEEP ALIVE SERVER ==================
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ SouravMD is running and alive!");
});

app.listen(PORT, () => {
  console.log(`🌐 Keep-alive server running on port ${PORT}`);
});

// ================== HEARTBEAT ==================
setInterval(() => {
  console.log("💓 Heartbeat: SouravMD still running...");
}, 1000 * 60 * 5);

// ================== PLUGIN SYSTEM ==================
const commands = new Map();
const PLUGIN_DIR = path.join(__dirname, "plugins");

function loadPlugin(file) {
  try {
    delete require.cache[require.resolve(path.join(PLUGIN_DIR, file))];
    const plugin = require(path.join(PLUGIN_DIR, file));

    let pluginName = plugin.name || file.replace(".js", "");
    let aliases = [];

    if (plugin.command && Array.isArray(plugin.command)) {
      aliases = plugin.command.map(c => c.toLowerCase());
    } else if (plugin.command && typeof plugin.command === "string") {
      aliases = [plugin.command.toLowerCase()];
    } else {
      aliases = [pluginName.toLowerCase()];
    }

    aliases.forEach(alias => commands.set(alias, plugin));
    console.log(`✅ Loaded plugin: ${pluginName} [${aliases.join(", ")}]`);
  } catch (err) {
    console.error(`❌ Failed to load plugin ${file}:`, err.message);
  }
}

function loadPlugins() {
  commands.clear();
  if (!fs.existsSync(PLUGIN_DIR)) {
    console.error(`❌ Plugins directory (${PLUGIN_DIR}) not found!`);
    return;
  }
  fs.readdirSync(PLUGIN_DIR).forEach(file => {
    if (file.endsWith(".js")) loadPlugin(file);
  });
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

  // Connection update
  sock.ev.on("connection.update", async (update) => {
    const { connection, qr } = update;

    if (qr) {
      console.log("📲 Scan this QR to connect:");
      console.log(
        `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`
      );
    }

    if (connection === "close") {
      const reason = update.lastDisconnect?.error?.output?.statusCode;
      if (reason === DisconnectReason.loggedOut) {
        console.log("❌ Logged out. Delete auth folder and reconnect.");
      } else {
        console.log("⚠️ Connection closed. Reconnecting in 5s...");
        setTimeout(startBot, 5000);
      }
    } else if (connection === "open") {
      console.log("✅ SOURAVMD CONNECTED & ACTIVE!");
      
      // Send advanced welcome message to the user who scanned the QR
      try {
        // Get the authenticated user's JID (phone number)
        const userJid = sock.user?.id?.split(":")[0] + "@s.whatsapp.net" || null;
        const recipients = userJid ? [userJid] : []; // Only send to the QR scanner

        if (!recipients.length) {
          console.warn("[Welcome] No valid user JID found for welcome message.");
          return;
        }

        const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json")));
        const botVersion = packageJson.version || "3.0.0";
        const greetings = [
          "🎉 SouravMD is now online!",
          "🚀 SouravMD has landed!",
          "🔥 SouravMD is ready to rock!"
        ];
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
        const timestamp = moment().format("DD/MM/YYYY HH:mm:ss");
        
        const welcomeMessage = `
${greeting}

✅ *SouravMD Connected Successfully!* (v${botVersion})
🕒 Connected on: ${timestamp}

🔥 *Why SouravMD?*
- 🎶 Download music with .song
- 📸 Set status with .setstatus
- 🎨 Create stickers with .sticker
- 🤖 AI-powered chats
- ⚙️ Advanced automation & scrapers

📢 Join our Telegram: https://t.me/YOUR_CHANNEL
📱 Join our WhatsApp group: https://chat.whatsapp.com/YOUR_GROUP_LINK
Type *.menu* to explore all commands! 🚀
        `;
        
        const pfpUrl = "https://i.imgur.com/YOUR_IMAGE.jpg"; // Replace with your bot's logo URL
        
        for (const recipient of recipients) {
          let attempts = 0;
          const maxAttempts = 3;
          while (attempts < maxAttempts) {
            try {
              await new Promise(resolve => setTimeout(resolve, 2000));
              let imageBuffer = null;
              try {
                const response = await axios.get(pfpUrl, { responseType: "arraybuffer", timeout: 10000 });
                imageBuffer = Buffer.from(response.data);
              } catch (imgErr) {
                console.warn(`[Welcome] Failed to download PFP: ${imgErr.message}`);
              }

              await sock.sendMessage(recipient, {
                text: welcomeMessage,
                ...(imageBuffer ? { image: imageBuffer, caption: welcomeMessage } : {})
              });
              
              console.log(`[Welcome] Sent welcome message to ${recipient}`);
              break;
            } catch (err) {
              console.error(`[Welcome] Attempt ${attempts + 1} failed for ${recipient}:`, err.message);
              attempts++;
              if (attempts >= maxAttempts) {
                console.error(`[Welcome Error]: Failed to send to ${recipient} after ${maxAttempts} attempts`);
              }
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
          }
        }
      } catch (err) {
        console.error("[Welcome Error]: Failed to process welcome message:", err.message);
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

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

    // 🔹 Run onMessage plugins
    for (let plugin of commands.values()) {
      if (typeof plugin.onMessage === "function") {
        try {
          await plugin.onMessage(sock, m);
        } catch (err) {
          console.error(`❌ Error in onMessage plugin ${plugin.name || "unknown"}:`, err.message);
        }
      }
    }

    // 🔹 Commands with prefix `.`
    if (!body.startsWith(".")) return;
    let args = body.slice(1).trim().split(/\s+/);
    let cmd = args.shift().toLowerCase();

    let command = commands.get(cmd);
    if (command && typeof command.execute === "function") {
      try {
        console.log(`[Command] Attempting to execute: ${cmd} from ${m.key.remoteJid}`);
        await command.execute(sock, m, args, { axios, fetch, downloadMediaMessage });
        console.log(`⚡ Command executed: ${cmd}`);
      } catch (err) {
        console.error(`❌ Error in command ${cmd}:`, err.stack || err.message);
        await sock.sendMessage(
          m.key.remoteJid,
          { text: `⚠️ Error while executing: ${cmd}\n${err.message}` },
          { quoted: m }
        );
      }
    } else {
      console.log(`[Command] Unknown command: ${cmd} from ${m.key.remoteJid}`);
    }
  });

  // ================== AUTOREACT ==================
  global.autoReact = false;
  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      if (!global.autoReact) return;
      const msg = messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const emojis = ["🔥", "😂", "❤️", "👍", "🤯", "👑", "💀", "🥳", "✨", "😎"];
      const reaction = emojis[Math.floor(Math.random() * emojis.length)];

      await sock.sendMessage(msg.key.remoteJid, {
        react: { text: reaction, key: msg.key }
      });
    } catch (err) {
      console.error("AutoReact error:", err.message);
    }
  });

  // ================== KEEP ALIVE PING ==================
  setInterval(async () => {
    try {
      await sock.sendPresenceUpdate("available");
      console.log("📡 Keep-alive ping sent!");
    } catch (err) {
      console.error("Keep-alive ping error:", err.message);
    }
  }, 1000 * 60 * 2);
}

// ================== ERROR HANDLERS ==================
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.stack || err.message);
});
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason.stack || reason);
});

startBot();
