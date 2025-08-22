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

fs.readdirSync(path.join(__dirname, "plugins")).forEach(file => {
    if (file.endsWith(".js")) {
        try {
            const plugin = require(`./plugins/${file}`);
            // accept BOTH old style (name, execute) and new style (name, command[])
            if (plugin.name && plugin.execute) {
                if (plugin.command && Array.isArray(plugin.command)) {
                    plugin.command.forEach(alias => {
                        commands.set(alias.toLowerCase(), plugin);
                    });
                } else {
                    // fallback: use plugin.name as single command
                    commands.set(plugin.name.toLowerCase(), plugin);
                }
                console.log(`✅ Loaded plugin: ${plugin.name}`);
            } else {
                console.log(`⚠️ Skipped ${file}: missing name/execute`);
            }
        } catch (err) {
            console.error(`❌ Failed to load plugin ${file}:`, err);
        }
    }
});

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

    // Message handler
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

        if (command) {
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
