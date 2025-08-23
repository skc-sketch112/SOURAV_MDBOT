module.exports = {
  name: "hack",
  command: ["hack", "hacking"],
  description: "Fake hacking animation display",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    // 🟢 Frames of animation
    const frames = [
      "🔍 Initializing hack engine...",
      "🟢 Connecting to server...",
      "📡 Bypassing firewall...",
      "💉 Injecting payload...",
      "🔓 Access Granted!",
      "📂 Extracting files...",
      "📤 Uploading data...",
      "✅ Hack complete!"
    ];

    let sent = await sock.sendMessage(jid, { text: frames[0] }, { quoted: m });

    // ⏳ Loop and update message with animation
    for (let i = 1; i < frames.length; i++) {
      await new Promise(r => setTimeout(r, 1500)); // delay 1.5s each
      await sock.sendMessage(
        jid,
        { edit: sent.key, text: frames[i] }
      );
    }
  }
};
