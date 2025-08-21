const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  getContentType
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
    printQRInTerminal: true,
    auth: state,
  })

  sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
    if (qr) {
      console.log("📲 Scan QR here:")
      console.log(
        `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`
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

  // 📩 Handle all messages
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg || msg.key.fromMe) return

    const sender = msg.key.remoteJid
    const type = getContentType(msg.message) // Detect message type
    let textMessage = ""

    if (type === "conversation") textMessage = msg.message.conversation
    else if (type === "extendedTextMessage") textMessage = msg.message.extendedTextMessage.text
    else if (type === "imageMessage") textMessage = msg.message.imageMessage.caption
    else if (type === "videoMessage") textMessage = msg.message.videoMessage.caption
    else if (type === "ephemeralMessage")
      textMessage = msg.message.ephemeralMessage.message?.extendedTextMessage?.text

    textMessage = (textMessage || "").trim()
    console.log(`💬 From ${sender}: ${textMessage}`)

    if (!textMessage.startsWith(PREFIX)) return
    const command = textMessage.slice(1).toLowerCase()

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
