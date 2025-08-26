// ================== IMPORTS ==================
const express = require("express");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const fetch = require("node-fetch");

// ================== KEEP ALIVE SERVER ==================
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Bot is running and alive!");
});

app.listen(PORT, () => {
  console.log(`🌐 Keep-alive server running on port ${PORT}`);
});

// ================== HEARTBEAT ==================
setInterval(() => {
  console.log("💓 Heartbeat: Bot still running...");
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
  if (!fs.existsSync(PLUGIN_DIR)) return;
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

// ================== ANTI-BAN ==================
let antiBanEnabled = true;
async function applyAntiBan(sock, m) {
  if (!antiBanEnabled) return;
  const jid = m.key.remoteJid;
  try {
    await sock.sendPresenceUpdate("composing", jid);
    await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
  } catch { }
}

// ================== START BOT ==================
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true, // প্রথমবার টার্মিনালে QR দেখাবে
    qrTimeout: 0, // ❗ QR expire হবে না
    auth: state,
    version
  });

  // QR / Connection update
  sock.ev.on("connection.update", (update) => {
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
      console.log("✅ BOT CONNECTED & ACTIVE!");
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
          console.error(`❌ Error in onMessage plugin:`, err.message);
        }
      }
    }

    // 🔹 Commands with prefix `.`
    if (!body.startsWith(".")) return;
    let args = body.slice(1).trim().split(/\s+/);
    let cmd = args.shift().toLowerCase();

    // Built-in commands
    if (cmd === "ping") {
      await sock.sendMessage(m.key.remoteJid, { text: "🏓 Pong! Bot is alive ✅" }, { quoted: m });
      return;
    }
    if (cmd === "menu") {
      await sock.sendMessage(m.key.remoteJid, { text: "📜 Full Menu Coming Soon..." }, { quoted: m });
      return;
    }

    // Plugin commands
    let command = commands.get(cmd);
    if (command && typeof command.execute === "function") {
      try {
        await applyAntiBan(sock, m);
        await command.execute(sock, m, args, { axios, fetch });
        console.log(`⚡ Command executed: ${cmd}`);
      } catch (err) {
        console.error(`❌ Error in command ${cmd}:`, err);
        await sock.sendMessage(
          m.key.remoteJid,
          { text: `⚠️ Error while executing: ${cmd}\n${err.message}` },
          { quoted: m }
        );
      }
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
      console.error("AutoReact error:", err);
    }
  });

  // ================== KEEP ALIVE PING ==================
  setInterval(() => {
    console.log("⚡ Keeping bot alive...");
  }, 25 * 60 * 1000);
}

startBot();
