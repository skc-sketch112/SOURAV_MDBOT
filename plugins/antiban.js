// antiban.js
let antiBanEnabled = false; // default OFF

module.exports = {
  name: "antiban",
  command: ["antiban"],
  description: "Toggle Anti-Ban mode (ON/OFF)",
  category: "Security",

  async execute(sock, m, args) {
    try {
      const action = (args[0] || "").toLowerCase();

      if (action === "on") {
        antiBanEnabled = true;
        await sock.sendMessage(m.key.remoteJid, { text: "✅ Anti-Ban mode is now *ON* 🔒" }, { quoted: m });
      } 
      else if (action === "off") {
        antiBanEnabled = false;
        await sock.sendMessage(m.key.remoteJid, { text: "❌ Anti-Ban mode is now *OFF* 🔓" }, { quoted: m });
      } 
      else {
        await sock.sendMessage(m.key.remoteJid, { 
          text: `⚙️ Anti-Ban Status: *${antiBanEnabled ? "ON 🔒" : "OFF 🔓"}*\n\nUsage:\n.antiban on\n.antiban off` 
        }, { quoted: m });
      }

    } catch (err) {
      console.error("❌ Error in antiban.js:", err);
      await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Error while toggling Anti-Ban." }, { quoted: m });
    }
  }
};

// Export function to check status
module.exports.isAntiBan = () => antiBanEnabled;
