// ================== WHATSAPP-WEB.JS CLIENT ==================
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR code received, scan it with WhatsApp.');
});

client.on('ready', () => {
    console.log('WhatsApp Userbot is ready!');
});

client.on('message', message => {
    if (message.body === '!ping') {
        message.reply('Pong!');
    }
});

client.initialize();

// ================== IMPORTS ==================
const express = require("express");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadContentFromMessage
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const fetch = require("node-fetch");
const moment = require("moment");
const figlet = require("figlet"); 
const chalk = require("chalk"); // Colorful console logs

// ================== DEBUG MODE ==================
const DEBUG_MODE = process.env.DEBUG_MODE === "true"; 
function debugLog(...msg) {
  if (DEBUG_MODE) console.log(chalk.cyan("[DEBUG]"), ...msg);
}

// ================== KEEP ALIVE SERVER ==================
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ SOURAV_MD BOT is running and alive!");
});

app.listen(PORT, () => console.log(chalk.green(`🌐 Keep-alive server running on port ${PORT}`)))
   .on("error", (err) => console.error(chalk.red("❌ Keep-alive server error:"), err.message));

// ================== BANNER ==================
figlet.text("SOURAV_MD BOT", {
  font: "Standard",
  horizontalLayout: "default",
  verticalLayout: "default",
}, function(err, data) {
  if (err) console.log(chalk.red("❌ Banner error:"), err);
  console.log(chalk.magenta("\n" + data));
  console.log(chalk.yellow("🔥 Welcome to SOURAV_MD BOT - Fully Powered & Professional!\n"));
});

// ================== HEARTBEAT ==================
setInterval(() => console.log(chalk.green("💓 Heartbeat: SOURAV_MD BOT still running...")), 5 * 60 * 1000);

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
    console.log(chalk.green(`✅ Loaded plugin:`), chalk.cyan(pluginName), `[${aliases.join(", ")}]`);
  } catch (err) {
    console.error(chalk.red(`❌ Failed to load plugin ${file}:`), err.message);
  }
}

function loadPlugins() {
  commands.clear();
  if (!fs.existsSync(PLUGIN_DIR)) return console.error(chalk.red(`❌ Plugins directory (${PLUGIN_DIR}) not found!`));
  fs.readdirSync(PLUGIN_DIR).forEach(file => file.endsWith(".js") && loadPlugin(file));
}
loadPlugins();

// Hot reload plugins
if (fs.existsSync(PLUGIN_DIR)) {
  fs.watch(PLUGIN_DIR, (eventType, filename) => {
    if (filename && filename.endsWith(".js")) {
      console.log(chalk.yellow(`♻️ Plugin change detected: ${filename}, reloading...`));
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
    version,
    keepAliveIntervalMs: 30000, // strong keep-alive
    syncFullHistory: true
  });

  // ================== CONNECTION HANDLER ==================
  sock.ev.on("connection.update", async (update) => {
    const { connection, qr } = update;
    debugLog("Connection Update:", update);

    if (qr) console.log(chalk.blue("📲 Scan QR:\n") + `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);

    if (connection === "close") {
      const reason = update.lastDisconnect?.error?.output?.statusCode;
      console.log(chalk.red("⚠️ Connection closed. Reason:"), reason);
      if (reason === DisconnectReason.loggedOut) console.log(chalk.red("❌ Logged out. Delete auth folder and reconnect."));
      else {
        console.log(chalk.yellow("🔄 Reconnecting in 5s..."));
        setTimeout(startBot, 5000);
      }
    } else if (connection === "open") {
      console.log(chalk.green("✅ SOURAV_MD BOT CONNECTED & ACTIVE!"));

      // ================== DELAYED WELCOME MESSAGE (2 MINUTES) ==================
      setTimeout(async () => {
        try {
          const userJid = sock.user?.id?.split(":")[0] + "@s.whatsapp.net" || null;
          if (!userJid) return console.warn(chalk.yellow("[Welcome] No valid user JID."));

          const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json")));
          const botVersion = packageJson.version || "3.0.0";
          const greetings = ["🎉 SOURAV_MD BOT is online!","🚀 SOURAV_MD BOT has landed!","🔥 SOURAV_MD BOT ready for action!"];
          const greeting = greetings[Math.floor(Math.random() * greetings.length)];
          const timestamp = moment().format("DD/MM/YYYY HH:mm:ss");

          const welcomeMessage = `
${greeting}

✅ *SOURAV_MD BOT Connected!* (v${botVersion})
🕒 Connected on: ${timestamp}

🔥 *Features:*
- 🎶 .song (Music Downloader)
- 📸 .setstatus (Update Status)
- 📸 .vv (Retrieve view-once photos)
- 🎨 .sticker (Sticker Creator)
- 🤖 AI-powered chat & fun
- ⚙️ Automation & advanced plugins
          `;

          await sock.sendMessage(userJid, { text: welcomeMessage });
          console.log(chalk.green("[Welcome] Welcome message sent."));
        } catch (err) { console.error(chalk.red("[Welcome] Error sending message:"), err.message); }
      }, 2 * 60 * 1000); // 2 minutes delay
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

    debugLog("📩 New Message:", body);

    // Run onMessage plugins
    for (let plugin of commands.values()) {
      if (typeof plugin.onMessage === "function") {
        try { 
          debugLog(`🔧 Running onMessage plugin: ${plugin.name}`);
          await plugin.onMessage(sock, m); 
        } catch (err) { console.error(chalk.red(`❌ onMessage plugin ${plugin.name}:`), err.message); }
      }
    }

    // Commands with "."
    if (!body.startsWith(".")) return;
    let args = body.slice(1).trim().split(/\s+/);
    let cmd = args.shift().toLowerCase();

    let command = commands.get(cmd);
    if (command && typeof command.execute === "function") {
      try {
        console.log(chalk.blue(`[Command] Executing: ${cmd} from ${m.key.remoteJid}`));
        console.time(`[Command Timer] ${cmd}`);
        await command.execute(sock, m, args, { axios, fetch, downloadContentFromMessage });
        console.timeEnd(`[Command Timer] ${cmd}`);
        console.log(chalk.green(`⚡ Command executed successfully: ${cmd}`));
      } catch (err) {
        console.error(chalk.red(`❌ Command ${cmd} error:`), err.stack || err.message);
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
      debugLog("🤖 AutoReact sent:", reaction);
    } catch (err) { console.error(chalk.red("AutoReact error:"), err.message); }
  });

  // ================== KEEP ALIVE PING ==================
  setInterval(async () => {
    try { 
      await sock.sendPresenceUpdate("available"); 
      debugLog("📡 Keep-alive ping sent!"); 
    } catch (err) { console.error(chalk.red("Keep-alive ping error:"), err.message); }
    }, 2 * 60 * 1000);

  // ================== ERROR HANDLERS ==================
  process.on("uncaughtException", (err) => console.error(chalk.red("❌ Uncaught Exception:"), err.stack || err.message));
  process.on("unhandledRejection", (reason) => console.error(chalk.red("❌ Unhandled Rejection:"), reason.stack || reason));
}

// ================== START BOT ==================
startBot();
