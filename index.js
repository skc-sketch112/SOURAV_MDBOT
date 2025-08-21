const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const path = require("path");

// ✅ Load plugins into a Map
const commands = new Map();

fs.readdirSync(path.join(__dirname, "plugins")).forEach(file => {
    if (file.endsWith(".js")) {
        try {
            const plugin = require(`./plugins/${file}`);
            if (plugin.name && plugin.command && plugin.execute) {
                plugin.command.forEach(cmd => {
                    commands.set(cmd.toLowerCase(), plugin);
                });
                console.log(`✅ Loaded plugin: ${plugin.name} [${plugin.command.join(", ")}]`);
            } else {
                console.log(`⚠️ Skipped ${file}: missing name/command/execute`);
            }
        } catch (err) {
            console.error(`❌ Failed to load plugin ${file}:`, err);
        }
    }
});

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
    });

    // ✅ QR code handler with link
    sock.ev.on("connection.update", (update) => {
        const { connection, qr } = update;
        if (qr) {
            console.log(
                "📲 Scan this QR to connect:\n" +
                `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`
            );
        }
        if (connection === "close") {
            const reason = update.lastDisconnect?.error?.output?.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                console.log("❌ Logged out. Delete auth folder and reconnect.");
            } else {
                console.log("⚠️ Connection closed. Reconnecting...");
                startBot();
            }
        } else if (connection === "open") {
            console.log("✅ Bot connected!");
        }
    });

    sock.ev.on("creds.update", saveCreds);

    // ✅ Message handler
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;

        let body =
            m.message.conversation ||
            m.message.extendedTextMessage?.text ||
            "";

        if (!body.startsWith(".")) return; // prefix = "."

        let [cmd, ...args] = body.slice(1).trim().split(/\s+/);
        cmd = cmd.toLowerCase();

        // ✅ Direct command lookup
        const plugin = commands.get(cmd);

        if (plugin) {
            try {
                await plugin.execute(sock, m, args);
                console.log(`⚡ Executed: ${cmd}`);
            } catch (err) {
                console.error(`❌ Error in ${cmd}:`, err);
                await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Error while executing command." });
            }
        } else {
            console.log(`⚠️ Unknown command: ${cmd}`);
        }
    });
}

startBot();
