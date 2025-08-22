const { command } = require("../command");

command({
  pattern: "status",
  fromMe: true,
  desc: "Shows bot uptime and runtime"
}, async (message) => {
  try {
    // Uptime (since last start)
    let totalSeconds = Math.floor(process.uptime());
    let days = Math.floor(totalSeconds / (3600 * 24));
    let hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;
    let uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    // Runtime (HH:MM:SS)
    let runtimeH = (Math.floor(totalSeconds / 3600)).toString().padStart(2, "0");
    let runtimeM = (Math.floor((totalSeconds % 3600) / 60)).toString().padStart(2, "0");
    let runtimeS = (totalSeconds % 60).toString().padStart(2, "0");
    let runtimeString = `${runtimeH}:${runtimeM}:${runtimeS}`;

    // Reply
    await message.reply(
      `🤖 *${message.client.user.name || "sourav_md"} Status*\n\n` +
      `⏳ *Uptime:* ${uptimeString}\n` +
      `⚡ *Runtime:* ${runtimeString}`
    );
  } catch (err) {
    await message.reply("❌ Error while fetching bot status!");
    console.error(err);
  }
});
