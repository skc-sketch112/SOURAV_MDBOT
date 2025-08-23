// ================== IMPORTS ==================
const express = require("express");
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

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

// ================== LOAD PLUGINS ==================
const commands = new Map();
const PLUGIN_DIR = path.join(__dirname, "plugins");

function loadPlugin(file) {
    try {
        delete require.cache[require.resolve(path.join(PLUGIN_DIR, file))]; // hot reload
        const plugin = require(path.join(PLUGIN_DIR, file));

        let pluginName = plugin.name || file.replace(".js", "");
        let aliases = [];

        if (plugin.command && Array.isArray(plugin.command)) {
            aliases = plugin.command.map(c => c.toLowerCase());
        } else if (plugin.command && typeof plugin.command === "string") {
            aliases = [plugin.command.toLowerCase()];
        } else {
            aliases = [pluginName.toLowerCase()]; // fallback
        }

        aliases.forEach(alias => {
            commands.set(alias, plugin);
        });

        console.log(`✅ Loaded plugin: ${pluginName} [${aliases.join(", ")}]`);
    } catch (err) {
        console.error(`❌ Failed to load plugin ${file}:`, err.message);
    }
}

function loadPlugins() {
    commands.clear();
    fs.readdirSync(PLUGIN_DIR).forEach(file => {
        if (file.endsWith(".js")) {
            loadPlugin(file);
        }
    });
}

// Watch plugin folder for changes
fs.watch(PLUGIN_DIR, (eventType, filename) => {
    if (filename && filename.endsWith(".js")) {
        console.log(`♻️ Plugin change detected: ${filename}, reloading...`);
        loadPlugins();
    }
});

loadPlugins();

// ================== ANTI-BAN SYSTEM ==================
let antiBanEnabled = true;

async function applyAntiBan(sock, m) {
    if (!antiBanEnabled) return;

    const jid = m.key.remoteJid;
    try {
        await sock.sendPresenceUpdate("composing", jid);
        await new Promise(r => setTimeout(r, 500 + Math.random() * 1500));
    } catch { }
}

// ================== START BOT ==================
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
    });

    // QR Code Link in Console
    sock.ev.on("connection.update", (update) => {
        const { connection, qr } = update;
        if (qr) {
            console.log(
                "📲 Scan this QR to connect:\n" +
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
            console.log("✅ Bot connected!");
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
            "";

        if (!body.startsWith(".")) return; // prefix = "."

        let args = body.slice(1).trim().split(/\s+/);
        let cmd = args.shift().toLowerCase();

        let command = commands.get(cmd);

        if (command && typeof command.execute === "function") {
            try {
                await applyAntiBan(sock, m);
                await command.execute(sock, m, args);
                console.log(`⚡ Command executed: ${cmd}`);
            } catch (err) {
                console.error(`❌ Error in command ${cmd}:`, err);
                await sock.sendMessage(
                    m.key.remoteJid,
                    { text: `⚠️ Error while executing: ${cmd}` },
                    { quoted: m }
                );
            }
        } else {
            await sock.sendMessage(
                m.key.remoteJid,
                { text: `⚠️ Command not found: ${cmd}` },
                { quoted: m }
            );
        }
    });
}

startBot();
