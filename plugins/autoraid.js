module.exports = {
  name: "autoraid",
  command: ["autoraid"],
  description: "Auto raid a specific user (gali per message)",
  category: "fun",

  execute: async (sock, m, args) => {
    const jid = m.key.remoteJid;

    global.autoRaid = global.autoRaid || {};
    const targetUser = args[0]?.replace(/[@\s]/g, "") + "@s.whatsapp.net";

    if (!args[0]) {
      return sock.sendMessage(
        jid,
        { text: `⚡ Usage:\n.autoraid @user → Start auto raid\n.autoraid off → Stop auto raid` },
        { quoted: m }
      );
    }

    if (args[0].toLowerCase() === "off") {
      global.autoRaid[jid] = null;
      return sock.sendMessage(jid, { text: "🛑 AutoRaid Stopped!" }, { quoted: m });
    }

    if (args[0].startsWith("@")) {
      global.autoRaid[jid] = targetUser;
      return sock.sendMessage(
        jid,
        { text: `🔥 AutoRaid started on @${targetUser.split("@")[0]} 🔥`, mentions: [targetUser] },
        { quoted: m }
      );
    }
  }
};

const galiList = [
  "Bokachoda",
  "Toke chudiye felbo",
  "Pagla goru",
  "Lodu",
  "Dim pocha",
  "Chhagol",
  "Gobor matha",
  "Bekar manus",
  "Tor mathay gobor",
  "Fata futani",
  "Nali goru",
  "Olosh pagla",
  "Tor baper juto",
  "Bojha kukur",
  "Kharap lok",
  "Tor matha shunno",
  "Faltu bokachoda",
  "Chor dim",
  "Ladcha",
  "Bojha manus",
  // 👉 এখানে তোমার চাইলে 168/200 টা manually add করতে হবে
];

module.exports.onMessage = async (sock, m) => {
  try {
    const jid = m.key.remoteJid;
    const sender = m.key.participant || jid;

    // যদি এই গ্রুপে AutoRaid টার্গেট সেট করা থাকে
    if (global.autoRaid && global.autoRaid[jid]) {
      const target = global.autoRaid[jid];

      // Command মেসেজ বাদ দিতে হবে (.autoraid যেন নিজে গালি না খায়)
      if (m.message?.conversation?.startsWith(".autoraid")) return;

      // শুধু target ইউজারের মেসেজে গালি যাবে
      if (sender === target) {
        const gali = galiList[Math.floor(Math.random() * galiList.length)];

        await sock.sendMessage(
          jid,
          { text: `@${sender.split("@")[0]} ${gali}`, mentions: [sender] },
          { quoted: m }
        );
      }
    }
  } catch (err) {
    console.error("AutoRaid Error:", err);
  }
};
