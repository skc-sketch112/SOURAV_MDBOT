module.exports = (sock) => {
  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

    if (text && text.toLowerCase() === "ping") {
      await sock.sendMessage(from, { text: "🏓 Pong!SOURAV_MD V12.3.5 IS ALIVE" }, { quoted: msg });
    }
  });
};
