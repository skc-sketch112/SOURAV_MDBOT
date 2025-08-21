const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")
const pino = require("pino")
const path = require("path")
const fs = require("fs")

const prefix = "." // ✅ prefix set

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
            console.log("📲 Scan this QR to connect:")
            console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`)
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

        // ✅ Strong Message Parser
        let textMessage = ""
        try {
            if (msg.message.conversation) {
                textMessage = msg.message.conversation
            } else if (msg.message.extendedTextMessage?.text) {
                textMessage = msg.message.extendedTextMessage.text
            } else if (msg.message.imageMessage?.caption) {
                textMessage = msg.message.imageMessage.caption
            } else if (msg.message.videoMessage?.caption) {
                textMessage = msg.message.videoMessage.caption
            } else if (msg.message.documentMessage?.caption) {
                textMessage = msg.message.documentMessage.caption
            } else if (msg.message?.ephemeralMessage?.message) {
                const ephemeral = msg.message.ephemeralMessage.message
                textMessage =
                    ephemeral.conversation ||
                    ephemeral.extendedTextMessage?.text ||
                    ""
            }
        } catch (e) {
            console.error("❌ Message parsing error:", e)
        }

        textMessage = textMessage.trim()
        console.log(`💬 Message from ${sender}: "${textMessage}"`)

        // ✅ Prefix Check
        if (!textMessage.startsWith(prefix)) return
        const args = textMessage.slice(prefix.length).trim().split(/ +/)
        const command = args.shift().toLowerCase()

        // ⚡ Commands
        if (command === "ping") {
            await sock.sendMessage(sender, { text: "pong ✅" })
        }

        if (command === "menu") {
            await sock.sendMessage(sender, {
                text: "🤖 *Bot Menu*\n\n1. .ping → pong\n2. .menu → show this menu"
            })
        }
    })
}

startBot()
