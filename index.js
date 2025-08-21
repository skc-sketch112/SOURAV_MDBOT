const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")
const pino = require("pino")
const path = require("path")
const fs = require("fs")

const PREFIX = "." // 👈 prefix for commands

// 🔌 Plugin loader
function loadPlugins(sock) {
    const dir = path.join(__dirname, "plugins")
    if (!fs.existsSync(dir)) fs.mkdirSync(dir)

    const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"))
    const plugins = {}

    for (let file of files) {
        try {
            const plugin = require(path.join(dir, file))
            if (typeof plugin === "function") {
                plugins[file] = plugin
                console.log(`✅ Plugin loaded: ${file}`)
            }
        } catch (e) {
            console.error(`❌ Failed to load plugin ${file}:`, e)
        }
    }

    // 🔁 Watch for file changes and reload automatically
    fs.watch(dir, (event, filename) => {
        if (filename && filename.endsWith(".js")) {
            delete require.cache[require.resolve(path.join(dir, filename))]
            try {
                const plugin = require(path.join(dir, filename))
                if (typeof plugin === "function") {
                    plugins[filename] = plugin
                    console.log(`♻️ Plugin reloaded: ${filename}`)
                }
            } catch (e) {
                console.error(`❌ Failed to reload plugin ${filename}:`, e)
            }
        }
    })

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

    let plugins = loadPlugins(sock)

    // 📡 Connection updates
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

    // 📩 Message handling
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return

        const sender = msg.key.remoteJid

        // Normalize text
        let textMessage =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption ||
            ""

        textMessage = textMessage.trim()
        console.log(`💬 Message from ${sender}: ${textMessage}`)

        // ✅ Command check
        if (!textMessage.startsWith(PREFIX)) return
        const args = textMessage.slice(PREFIX.length).trim().split(/ +/)
        const command = args.shift().toLowerCase()

        // Run matching plugin
        for (let file in plugins) {
            try {
                await plugins[file](sock, msg, command, args, sender)
            } catch (e) {
                console.error(`❌ Error in plugin ${file}:`, e)
            }
        }
    })
}

startBot()
