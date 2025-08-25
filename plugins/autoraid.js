module.exports = {
  name: "autoraid",
  command: ["autoraid"],
  description: "Auto raid ON/OFF with Bengali gali",
  category: "fun",

  execute: async (sock, m, args, store) => {
    const jid = m.key.remoteJid;
    const sender = m.key.participant || jid;

    // Global state to keep ON/OFF
    global.autoRaid = global.autoRaid || {};
    const isOn = global.autoRaid[jid] || false;

    if (!args[0]) {
      return sock.sendMessage(jid, { text: `⚡ AutoRaid Status: ${isOn ? "ON" : "OFF"}\n\nUse:\n.autoraid on\n.autoraid off` }, { quoted: m });
    }

    if (args[0].toLowerCase() === "on") {
      global.autoRaid[jid] = true;
      await sock.sendMessage(jid, { text: "🔥 AutoRaid is now *ON* 🔥" }, { quoted: m });
    } else if (args[0].toLowerCase() === "off") {
      global.autoRaid[jid] = false;
      await sock.sendMessage(jid, { text: "🛑 AutoRaid is now *OFF*" }, { quoted: m });
    }
  }
};

// 👇 Message listener to fire gali automatically
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const galiList = [
  "Bokachoda",
  "Tor mathay gobor",
  "Pagla tor matha noshto",
  "Lodu",
  "Kharap chele",
  "Tui ekta futani",
  "Dim pocha",
  "Fata chata",
  "Nali goru",
  "Faltu manus",
  // 👉 এখানে তুমি ম্যানুয়ালি 168 টা পর্যন্ত লিখে দেবে
];

module.exports.onMessage = async (sock, m) => {
  try {
    const jid = m.key.remoteJid;
    const sender = m.key.participant || jid;

    // Check if AutoRaid is ON for this chat
    if (global.autoRaid && global.autoRaid[jid]) {
      // Random gali pick
      const gali = galiList[Math.floor(Math.random() * galiList.length)];

      // Send gali tagging the user
      await sock.sendMessage(jid, { text: `@${sender.split("@")[0]} ${gali}`, mentions: [sender] }, { quoted: m });

      // Add delay (2-3 sec) to avoid WhatsApp ban
      await delay(2500);
    }
  } catch (err) {
    console.error("AutoRaid Error:", err);
  }
};
