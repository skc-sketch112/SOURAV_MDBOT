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
  if (!fs.existsSync(pluginsDir)) {
    fs.mkdirSync(pluginsDir)
    console.log("📂 'plugins' folder created. Add your plugin files inside it!")
  }
  fs.readdirSync(pluginsDir).forEach(file => {
    if (file.endsWith(".js")) {
      try {
        delete require.cache[require.resolve(path.join(pluginsDir, file))] // hot reload
        const cmd = require(path.join(pluginsDir, file))
        if (cmd && cmd.name && typeof cmd.execute === "function") {
          commands.set(cmd.name.toLowerCase(), cmd)
          console.log(`✅ Loaded plugin: ${cmd.name}`)
        } else {
          console.log(`⚠️ Skipped invalid plugin: ${file}`)
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
      console.log("📲 Scan this QR to connect:")
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

  // 📩 Handle messages
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg || msg.key.fromMe) return

    const sender = msg.key.remoteJid
    let textMessage =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      ""
    textMessage = textMessage.trim()

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
