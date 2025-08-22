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

// ================== HEARTBEAT (PREVENT CRASH) ==================
setInterval(() => {
    console.log("💓 Heartbeat: Bot still running...");
}, 1000 * 60 * 5); // every 5 minutes

// ================== LOAD PLUGINS ==================
const commands = new Map();

fs.readdirSync(path.join(__dirname, "plugins")).forEach(file => {
    if (file.endsWith(".js")) {
        try {
            const plugin = require(`./plugins/${file}`);
            if (plugin.name && plugin.command && plugin.execute) {
                plugin.command.forEach(alias => {
                    commands.set(alias.toLowerCase(), plugin);
                });
                console.log(`✅ Loaded plugin: ${plugin.name} [${plugin.command.join(", ")}]`);
            } else {
                console.log(`⚠️ Skipped ${file}: Missing name/command/execute`);
            }
        } catch (err) {
            console.error(`❌ Failed to load plugin ${file}:`, err);
        }
    }
});

// ================== START BOT ==================
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
    });

    // QR Code link
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
                setTimeout(startBot, 5000); // 🔄 Safe auto-reconnect
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
