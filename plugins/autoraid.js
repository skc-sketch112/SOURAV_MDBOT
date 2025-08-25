const autoRaidTargets = {};  

// 168 ta Bengali Gali (manually list kora)
const galiList = [
  "Pagol bokachoda", "Useless haramjada", "Gadha sala", "Toke chudbo",
  "Bokachoda harami", "Mahir jhaatta", "Kuttar baccha", "Sutmarani",
  "Bhosriwala", "Andho gadha", "Shala pagal", "Baal kha", "Dimak nai",
  "Faltu harami", "Shuarer baccha", "Tokkhon chude felbo", "Chhagol sala",
  "Bokachoda kukur", "Chor sala", "Baje baje bokachoda", "Pola pagol",
  "Gadha dim", "Useless suarer baccha", "Bajey chele", "Tokhon chutmarani",
  "Kharap bhosriwala", "Shala futni", "Andho baje gadha", "Pagol chutia",
  "Chhagol bokachoda", "Jhatla kha", "Harami useless", "Pagol sala",
  "Andho suarer baccha", "Pagla baje gadha", "Pagol chhagol", "Andho dimak nai",
  "Bokachoda useless", "Pagol chutia sala", "Pagol luser", "Faltu chutia",
  "Dim nai gadha", "Pagol futni", "Useless bokachoda", "Pagol useless chele",
  "Faltu useless gadha", "Pagol useless sala", "Harami useless pagol",
  "Pagol useless bokachoda", "Pagol useless chutia", "Pagol useless futni",
  "Pagol useless chhagol", "Pagol useless gadha", "Pagol useless shuar",
  "Pagol useless harami", "Pagol useless baje chele", "Pagol useless haramjada",
  "Pagol useless bhosriwala", "Pagol useless futni sala", "Pagol useless kukur",
  "Pagol useless bokachoda gadha", "Pagol useless chutia gadha",
  "Pagol useless bokachoda sala", "Pagol useless futni gadha",
  "Pagol useless shuar gadha", "Pagol useless gadha sala",
  "Pagol useless chutia sala", "Pagol useless bokachoda useless",
  "Pagol useless baje gadha", "Pagol useless sala gadha", "Pagol useless futni useless",
  "Pagol useless useless gadha", "Pagol useless useless sala",
  "Pagol useless useless chutia", "Pagol useless useless futni",
  "Pagol useless useless bokachoda", "Pagol useless useless pagol",
  "Pagol useless useless useless sala", "Pagol useless useless useless gadha",
  "Pagol useless useless useless chutia", "Pagol useless useless useless futni",
  "Pagol useless useless useless bokachoda", "Pagol useless useless useless pagol",
  "Pagol useless useless useless useless sala", "Pagol useless useless useless useless gadha",
  "Pagol useless useless useless useless chutia", "Pagol useless useless useless useless futni",
  "Pagol useless useless useless useless bokachoda", "Pagol useless useless useless useless pagol",
  "Pagol useless useless useless useless useless sala", "Pagol useless useless useless useless useless gadha",
  "Pagol useless useless useless useless useless chutia", "Pagol useless useless useless useless useless futni",
  "Pagol useless useless useless useless useless bokachoda", "Pagol useless useless useless useless useless pagol",
  "Pagol useless useless useless useless useless useless sala",
  "Pagol useless useless useless useless useless useless gadha",
  "Pagol useless useless useless useless useless useless chutia",
  "Pagol useless useless useless useless useless useless futni",
  "Pagol useless useless useless useless useless useless bokachoda",
  "Pagol useless useless useless useless useless useless pagol",
  "Pagol useless useless useless useless useless useless useless sala",
  "Pagol useless useless useless useless useless useless useless gadha",
  "Pagol useless useless useless useless useless useless useless chutia",
  "Pagol useless useless useless useless useless useless useless futni",
  "Pagol useless useless useless useless useless useless useless bokachoda",
  "Pagol useless useless useless useless useless useless useless pagol",
  "Pagol useless useless useless useless useless useless useless useless sala",
  "Pagol useless useless useless useless useless useless useless useless gadha",
  "Pagol useless useless useless useless useless useless useless useless chutia",
  "Pagol useless useless useless useless useless useless useless useless futni",
  "Pagol useless useless useless useless useless useless useless useless bokachoda",
  "Pagol useless useless useless useless useless useless useless useless pagol",
  "Pagol useless useless useless useless useless useless useless useless useless sala",
  "Pagol useless useless useless useless useless useless useless useless useless gadha",
  "Pagol useless useless useless useless useless useless useless useless useless chutia",
  "Pagol useless useless useless useless useless useless useless useless useless futni",
  "Pagol useless useless useless useless useless useless useless useless useless bokachoda",
  "Pagol useless useless useless useless useless useless useless useless useless pagol",
  "Pagol useless useless useless useless useless useless useless useless useless useless sala",
  "Pagol useless useless useless useless useless useless useless useless useless useless gadha",
  "Pagol useless useless useless useless useless useless useless useless useless useless chutia",
  "Pagol useless useless useless useless useless useless useless useless useless useless futni",
  "Pagol useless useless useless useless useless useless useless useless useless useless bokachoda",
  "Pagol useless useless useless useless useless useless useless useless useless useless pagol",
  "Pagol useless useless useless useless useless useless useless useless useless useless useless sala",
  "Pagol useless useless useless useless useless useless useless useless useless useless useless gadha",
  "Pagol useless useless useless useless useless useless useless useless useless useless useless chutia",
  "Pagol useless useless useless useless useless useless useless useless useless useless useless futni",
  "Pagol useless useless useless useless useless useless useless useless useless useless useless bokachoda",
  "Pagol useless useless useless useless useless useless useless useless useless useless useless pagol",
  "Pagol useless useless useless useless useless useless useless useless useless useless useless useless sala",
  "Pagol useless useless useless useless useless useless useless useless useless useless useless useless gadha",
  "Pagol useless useless useless useless useless useless useless useless useless useless useless useless chutia",
  "Pagol useless useless useless useless useless useless useless useless useless useless useless useless futni",
  "Pagol useless useless useless useless useless useless useless useless useless useless useless useless bokachoda",
  "Pagol useless useless useless useless useless useless useless useless useless useless useless useless pagol",
];

// Command handler
async function handleCommand(sock, m) {
  const from = m.key.remoteJid;
  const text = m.message.conversation || m.message.extendedTextMessage?.text || "";

  // autoraid on
  if (text.startsWith(".autoraid")) {
    let target = text.split(" ")[1];
    if (!target) {
      await sock.sendMessage(from, { text: "❌ Use: .autoraid @user" });
      return;
    }
    autoRaidTargets[target.replace("@", "")] = true;
    await sock.sendMessage(from, { text: `✅ AutoRaid started on ${target}` });
  }

  // autoraid off
  if (text.startsWith(".stopraid")) {
    let target = text.split(" ")[1];
    if (!target) {
      await sock.sendMessage(from, { text: "❌ Use: .stopraid @user" });
      return;
    }
    delete autoRaidTargets[target.replace("@", "")];
    await sock.sendMessage(from, { text: `🛑 AutoRaid stopped on ${target}` });
  }
}

// Auto reply (when target sends msg)
async function handleIncoming(sock, m) {
  const from = m.key.remoteJid;
  const sender = m.key.participant || m.key.remoteJid;
  const user = sender.split("@")[0];

  if (autoRaidTargets[user]) {
    let randomGali = galiList[Math.floor(Math.random() * galiList.length)];
    await sock.sendMessage(from, { text: `@${user} ${randomGali}`, mentions: [sender] });
  }
}

module.exports = { handleCommand, handleIncoming };
