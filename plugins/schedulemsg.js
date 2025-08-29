const fs = require("fs");
const path = require("path");
const schedule = require("node-schedule");

// Ensure a folder to store scheduled messages
const scheduleFile = path.join(__dirname, "../schedules.json");
if (!fs.existsSync(scheduleFile)) fs.writeFileSync(scheduleFile, JSON.stringify([]));

module.exports = {
  name: "schedulemsg",
  command: ["schedulemsg", "schedmsg"],
  description: "Schedule a message at a specific time. Usage: .schedulemsg HH:MM message",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    if (!args[0] || !args[1]) {
      return sock.sendMessage(jid, {
        text: "❌ Usage: .schedulemsg HH:MM Your message here\nExample: .schedulemsg 09:40 Happy Birthday!"
      }, { quoted: m });
    }

    const time = args[0];
    const msgText = args.slice(1).join(" ");

    // Validate time format HH:MM
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!time.match(timeRegex)) {
      return sock.sendMessage(jid, { text: "❌ Invalid time format. Use HH:MM (24-hour)." }, { quoted: m });
    }

    const [hour, minute] = time.split(":").map(Number);
    const now = new Date();
    const scheduleDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);

    // If time has already passed today, schedule for tomorrow
    if (scheduleDate <= now) scheduleDate.setDate(scheduleDate.getDate() + 1);

    // Save schedule to JSON (persistent storage)
    const schedules = JSON.parse(fs.readFileSync(scheduleFile));
    schedules.push({
      jid,
      msgText,
      hour,
      minute
    });
    fs.writeFileSync(scheduleFile, JSON.stringify(schedules, null, 2));

    // Schedule the message
    schedule.scheduleJob(scheduleDate, async () => {
      await sock.sendMessage(jid, { text: msgText });
    });

    await sock.sendMessage(jid, { text: `✅ Message scheduled for ${time}:\n"${msgText}"` }, { quoted: m });
  },
};

// ====================== Load existing schedules on bot startup ======================
const loadSchedules = (sock) => {
  if (!fs.existsSync(scheduleFile)) return;
  const schedules = JSON.parse(fs.readFileSync(scheduleFile));

  schedules.forEach(sch => {
    const now = new Date();
    let scheduleDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), sch.hour, sch.minute, 0);
    if (scheduleDate <= now) scheduleDate.setDate(scheduleDate.getDate() + 1);

    schedule.scheduleJob(scheduleDate, async () => {
      await sock.sendMessage(sch.jid, { text: sch.msgText });
    });
  });
};

module.exports.loadSchedules = loadSchedules;
