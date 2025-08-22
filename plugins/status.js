const os = require("os");

module.exports = {
    name: "status",
    command: ["status", "botstatus"],
    description: "Check if the bot is running with system stats",
    category: "Utility",

    async execute(sock, m, args) {
        try {
            // Uptime (seconds → hh:mm:ss)
            let totalSeconds = process.uptime();
            let hours = Math.floor(totalSeconds / 3600);
            let minutes = Math.floor((totalSeconds % 3600) / 60);
            let seconds = Math.floor(totalSeconds % 60);
            let uptime = `${hours}h ${minutes}m ${seconds}s`;

            // RAM usage
            let memoryUsage = process.memoryUsage().rss / 1024 / 1024; // MB
            let totalMem = os.totalmem() / 1024 / 1024; // MB
            let freeMem = os.freemem() / 1024 / 1024; // MB

            // CPU usage (load avg 1min)
            let cpuLoad = os.loadavg()[0].toFixed(2);

            const statusMsg = `
🤖 *SOURAV_MD Bot Status*

✅ Online & Running
⚡ Uptime: ${uptime}
📡 CPU Load: ${cpuLoad}%
💾 RAM Usage: ${memoryUsage.toFixed(2)} MB
🖥️ Free RAM: ${freeMem.toFixed(2)} MB / ${totalMem.toFixed(2)} MB
`;

            await sock.sendMessage(
                m.key.remoteJid,
                { text: statusMsg },
                { quoted: m }
            );
        } catch (err) {
            console.error("❌ Error in status command:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Error while checking status." },
                { quoted: m }
            );
        }
    }
};
