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
        printQRInTerminal: false,   // we don’t want ASCII QR
        auth: state,
    })

    // When pairing code or QR is required
    if (!sock.authState.creds.registered) {
        try {
            const phoneNumber = process.env.PHONE_NUMBER || "91XXXXXXXXXX" // <--- put your phone number with country code
            const code = await sock.requestPairingCode(phoneNumber)

            console.log("====================================")
            console.log("✅ Pairing Code:", code)
            console.log("📲 Or scan this QR:")
            console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(code)}`)
            console.log("====================================")
        } catch (err) {
            console.error("❌ Failed to generate pairing code:", err)
        }
    }

    sock.ev.on("creds.update", saveCreds)
    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            console.log("❌ Connection closed. Reconnect:", shouldReconnect)
            if (shouldReconnect) startBot()
        } else if (connection === "open") {
            console.log("✅ Connected to WhatsApp!")
        }
    })
}

startBot()
