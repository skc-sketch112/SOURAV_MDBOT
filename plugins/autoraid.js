module.exports = {
  name: "autoraid",
  command: ["autoraid"],
  description: "Auto raid ON/OFF (Bengali gali per message)",
  category: "fun",

  execute: async (sock, m, args) => {
    const jid = m.key.remoteJid;

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

const galiList = [
  "Bokachoda",
  "Toke chudiye felbo",
  "Pagla goru",
  "Lodu",
  "Chor dim",
  "Fata bokachoda",
  "Tor mathay gobor",
  "Ladcha",
  "Faltu manus",
  "Tor baper juto",
  "Nali goru",
  "Bojha bokachoda",
  "Dim pocha",
  "Gadha",
  "Chhagol",
  "Bojha kukur",
  "Olosh pagla",
  "Gobor matha",
  "Fata futani",
  "Bekar bokachoda",
  // 👉 এখানে 168/200 পর্যন্ত manually লিখে দিতে হবে
];

module.exports.onMessage = async (sock, m) => {
  try {
    const jid = m.key.remoteJid;
    const sender = m.key.participant || jid;

    // যদি AutoRaid ON থাকে এবং victim মেসেজ করে
    if (global.autoRaid && global.autoRaid[jid]) {
      // Command মেসেজ বাদ দিতে হবে (.autoraid on/off যেন গালি না খায়)
      if (m.message?.conversation?.startsWith(".autoraid")) return;

      // Random gali pick
      const gali = galiList[Math.floor(Math.random() * galiList.length)];

      // একটাই gali রিপ্লাই হবে victim এর মেসেজে
      await sock.sendMessage(
        jid,
        { text: `@${sender.split("@")[0]} ${gali}`, mentions: [sender] },
        { quoted: m }
      );
    }
  } catch (err) {
    console.error("AutoRaid Error:", err);
  }
};
