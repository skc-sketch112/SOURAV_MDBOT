// index.js
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")
const pino = require("pino")
const path = require("path")
const fs = require("fs")

// === 📦 Load Plugins ===
const commands = new Map()
function loadPlugins() {
  commands.clear()
  const pluginsDir = path.join(__dirname, "plugins")
  if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir)

  fs.readdirSync(pluginsDir).forEach(file => {
    if (file.endsWith(".js")) {
      try {
        delete require.cache[require.resolve(path.join(pluginsDir, file))]
        const cmd = require(path.join(pluginsDir, file))
        if (cmd && cmd.name && typeof cmd.execute === "function") {
          commands.set(cmd.name.toLowerCase(), cmd)
          console.log(`✅ Loaded plugin: ${cmd.name}`)
        }
      } catch (err) {
        console.error(`❌ Error loading plugin ${file}:`, err.message)
      }
    }
  })
}
loadPlugins()

// === 🚀 Start Bot ===
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

  // 🔄 Connection handling
  sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
    if (qr) {
      console.log("📲 Scan QR to connect:")
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
      console.log("✅ Connected to WhatsApp!")
    }
  })

  sock.ev.on("creds.update", saveCreds)

  // 📩 Handle messages (stable version)
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return  // ⚡ FIX: only process real chats
    const msg = messages[0]
    if (!msg || msg.key.fromMe) return

    const sender = msg.key.remoteJid

    // normalize text
    let textMessage =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      msg.message?.buttonsResponseMessage?.selectedButtonId ||
      msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
      ""

    textMessage = textMessage.trim()
    if (!textMessage) return

    console.log(`💬 ${sender}: ${textMessage}`)

    const prefix = "."
    if (!textMessage.startsWith(prefix)) return

    const [commandName, ...args] = textMessage.slice(prefix.length).split(" ")
    const command = commands.get(commandName.toLowerCase())

    if (command) {
      try {
        await command.execute(sock, msg, args)
      } catch (err) {
        console.error(`⚠️ Error in ${commandName}:`, err)
        await sock.sendMessage(sender, { text: "❌ Command failed!" })
      }
    }
  })
}

startBot()
