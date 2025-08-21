const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")
const pino = require("pino")
const path = require("path")

async function startBot() {
    const { version } = await fetchLatestBaileysVersion()
    const authDir = path.join(__dirname, "auth_info")
    const { state, saveCreds } = await useMultiFileAuthState(authDir)

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
    })

    // Connection handling
    sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
        if (qr) {
            console.log("====================================")
            console.log("📲 Scan this QR to connect:")
            console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`)
            console.log("====================================")
        }

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            console.log("❌ Connection closed. Reconnect:", shouldReconnect)
            if (shouldReconnect) startBot()
        } else if (connection === "open") {
            console.log("✅ Connected to WhatsApp!")
        }
    })

    sock.ev.on("creds.update", saveCreds)

    // 📩 Listen for messages
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return

        const sender = msg.key.remoteJid
        const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text || ""

        console.log(`💬 Message from ${sender}: ${textMessage}`)

        // ⚡ Commands
        if (textMessage.toLowerCase() === "ping") {
            await sock.sendMessage(sender, { text: "pong ✅" })
        }

        if (textMessage.toLowerCase() === "menu") {
            await sock.sendMessage(sender, {
                text: "🤖 *Bot Menu*\n\n1. ping → pong\n2. menu → show this menu"
            })
        }
    })
}

startBot()
