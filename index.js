const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")
const pino = require("pino")
const path = require("path")
const fs = require("fs")

// 🔹 Prefix for commands
const PREFIX = "."

function loadPlugins() {
    const plugins = {}
    const dir = path.join(__dirname, "plugins")
    if (!fs.existsSync(dir)) fs.mkdirSync(dir)

    const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"))
    for (const file of files) {
        delete require.cache[require.resolve(path.join(dir, file))]
        const plugin = require(path.join(dir, file))
        if (plugin.command && plugin.handler) {
            plugins[plugin.command] = plugin.handler
            console.log(`✅ Loaded plugin: ${plugin.command}`)
        }
    }
    return plugins
}

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

    let plugins = loadPlugins()

    sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
        if (qr) {
            console.log("📲 Scan this QR:")
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

        let text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption ||
            ""

        text = text.trim()
        console.log(`💬 Message from ${sender}: "${text}"`)

        // ✅ Only respond if starts with prefix
        if (!text.startsWith(PREFIX)) return

        const command = text.slice(PREFIX.length).toLowerCase()

        if (plugins[command]) {
            console.log(`⚡ Running plugin: ${command}`)
            try {
                await plugins[command](sock, sender, msg)
            } catch (e) {
                console.error("❌ Plugin error:", e)
            }
        } else {
            console.log("⚠️ No plugin found for:", command)
        }
    })
}

startBot()
