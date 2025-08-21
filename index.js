const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")
const pino = require("pino")
const path = require("path")

const PREFIX = "."

async function startBot() {
  const { version } = await fetchLatestBaileysVersion()
  const authDir = path.join(__dirname, "auth_info")
  const { state, saveCreds } = await useMultiFileAuthState(authDir)

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: true, // still prints QR in logs
    auth: state,
  })

  // Handle connection
  sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
    if (qr) {
      console.log("📲 Scan QR to connect:")
      console.log(
        `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
          qr
        )}`
      )
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log("❌ Connection closed. Reconnect:", shouldReconnect)
      if (shouldReconnect) startBot()
    } else if (connection === "open") {
      console.log("✅ Bot connected to WhatsApp!")
    }
  })

  sock.ev.on("creds.update", saveCreds)

  // Listen for messages
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const sender = msg.key.remoteJid

    // Get text from message (different formats)
    let textMessage =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      ""

    textMessage = textMessage.trim()

    if (!textMessage.startsWith(PREFIX)) return
    const command = textMessage.slice(1).toLowerCase()

    console.log(`💬 Command from ${sender}: ${command}`)

    // Commands
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
