// index.js
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

async function startBot() {
    const { version } = await fetchLatestBaileysVersion();
    const authDir = path.join(__dirname, "auth_info");
    const { state, saveCreds } = await useMultiFileAuthState(authDir);

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false, // we will print custom QR link
        auth: state,
    });

    // ===================== 📂 Load Plugins =====================
    const commands = new Map();
    const pluginsDir = path.join(__dirname, "plugins");

    if (!fs.existsSync(pluginsDir)) {
        fs.mkdirSync(pluginsDir);
        console.log("📂 'plugins' folder created. Add your plugin files inside it!");
    }

    fs.readdirSync(pluginsDir).forEach(file => {
        if (file.endsWith(".js")) {
            try {
                const cmd = require(path.join(pluginsDir, file));
                if (cmd.name && typeof cmd.execute === "function") {
                    commands.set(cmd.name, cmd);
                    console.log(`✅ Loaded command: ${cmd.name}`);
                } else {
                    console.log(`⚠️ Skipped ${file}: Missing name/execute`);
                }
            } catch (err) {
                console.error(`❌ Failed to load plugin ${file}:`, err);
            }
        }
    });

    // ===================== 🔗 Connection Handling =====================
    sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
        if (qr) {
            console.log("📲 Scan this QR to connect:");
            console.log(
                `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`
            );
        }

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("❌ Connection closed. Reconnect:", shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            console.log("✅ Connected to WhatsApp!");
        }
    });

    sock.ev.on("creds.update", saveCreds);

    // ===================== 📩 Message Handler =====================
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const sender = msg.key.remoteJid;

        // Extract text
        let textMessage =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            "";

        textMessage = textMessage.trim();
        if (!textMessage) return;

        console.log(`💬 Message from ${sender}: ${textMessage}`);

        // Prefix
        const prefix = ".";
        if (!textMessage.startsWith(prefix)) return;

        // Args + command
        const args = textMessage.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Find plugin
        const command = commands.get(commandName);
        if (!command) {
            console.log(`⚠️ Command not found: ${commandName}`);
            return;
        }

        try {
            await command.execute(sock, msg, args);
            console.log(`✅ Executed command: ${commandName}`);
        } catch (err) {
            console.error(`❌ Error running ${commandName}:`, err);
            await sock.sendMessage(sender, { text: `⚠️ Error executing command: ${commandName}` });
        }
    });
}

startBot();
