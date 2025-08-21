const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const path = require("path");

async function startBot() {
    const { version } = await fetchLatestBaileysVersion();
    const authDir = path.join(__dirname, "auth_info");
    const { state, saveCreds } = await useMultiFileAuthState(authDir);

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
    });

    // 🔄 Handle connection
    sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
        if (qr) {
            console.log("📲 Scan this QR:");
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

    // 📩 Handle messages
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;

        // 🔍 Extract message text safely
        let textMessage =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption ||
            msg.message.documentWithCaptionMessage?.message?.documentMessage?.caption ||
            "";

        textMessage = textMessage.trim();

        console.log(`💬 From ${sender}: ${textMessage}`);

        // 🟢 Prefix check
        if (!textMessage.startsWith(".")) return;
        const command = textMessage.slice(1).toLowerCase();

        // ⚡ Commands
        if (command === "ping") {
            await sock.sendMessage(sender, { text: "pong ✅" });
        }

        if (command === "menu") {
            await sock.sendMessage(sender, {
                text: "🤖 *Bot Menu*\n\n1. .ping → pong\n2. .menu → show this menu"
            });
        }
    });
}

startBot();
