// plugins/autoreact.js
module.exports = {
  name: "autoreact",
  description: "Auto reacts instantly to every message",
  command: ["autoreact"],
  async execute(sock, msg, args) {
    try {
      if (!global.autoReact) global.autoReact = false;

      if (args[0] === "on") {
        global.autoReact = true;
        await sock.sendMessage(msg.key.remoteJid, { text: "✅ AutoReact enabled. Every message will now get a reaction instantly!" }, { quoted: msg });
      } else if (args[0] === "off") {
        global.autoReact = false;
        await sock.sendMessage(msg.key.remoteJid, { text: "❌ AutoReact disabled." }, { quoted: msg });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: "⚡ Usage: .autoreact on / off" }, { quoted: msg });
      }
    } catch (e) {
      console.error("Error in autoreact command:", e);
    }
  }
};

// 🔥 Listener: put this in your main index.js after socket is created
function setupAutoReact(sock) {
  sock.ev.on("messages.upsert", async (m) => {
    try {
      if (!global.autoReact) return;

      const msg = m.messages[0];
      if (!msg.message || msg.key.fromMe) return; // ignore own msgs

      // Pick random emoji for fun (you can fix one if you want)
      const emojis = ["🔥", "😂", "❤️", "👍", "🤯", "👑", "💀", "🥳", "✨", "😎"];
      const reaction = emojis[Math.floor(Math.random() * emojis.length)];

      await sock.sendMessage(msg.key.remoteJid, {
        react: { text: reaction, key: msg.key }
      });
    } catch (err) {
      console.error("AutoReact error:", err);
    }
  });
}

module.exports.setupAutoReact = setupAutoReact;
