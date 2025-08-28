// luckyLeaderboard.js
const fs = require("fs");
const path = require("path");

const dbFile = path.join(__dirname, "../database/luckDB.json");

// Ensure database file exists
if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, JSON.stringify({}));
}

module.exports = {
  name: "luck",
  command: ["luck", "lucky", "fortune", "luckleaderboard"],
  description: "Check your luck and track it daily with leaderboard",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const userId = m.sender;

    // Load database
    let db = JSON.parse(fs.readFileSync(dbFile));

    // Determine target user (mentioned or self)
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const targetUser = mentioned[0] || userId;

    // Generate random luck value (0-100)
    const luckValue = Math.floor(Math.random() * 101);

    // Luck meter
    const filled = Math.round((luckValue / 100) * 10);
    const empty = 10 - filled;
    const luckBar = "🍀".repeat(filled) + "⬜".repeat(empty);

    // Luck description
    let description = "";
    if (luckValue >= 90) description = "🌟 Extremely Lucky!";
    else if (luckValue >= 70) description = "😎 Lucky!";
    else if (luckValue >= 50) description = "🙂 Average luck.";
    else if (luckValue >= 30) description = "😐 Slightly unlucky.";
    else description = "💀 Very unlucky!";

    // Rare legendary luck (1% chance)
    const rareChance = Math.random();
    let points = 1; // default points
    if (rareChance <= 0.01) {
      description = "🌈 Legendary Luck! Jackpot vibes!";
      points = 5; // bonus points for rare event
    }

    // Initialize user data if not exists
    if (!db[targetUser]) db[targetUser] = { totalLuck: 0, points: 0, lastCheck: null };

    // Update daily points
    const today = new Date().toLocaleDateString();
    if (db[targetUser].lastCheck !== today) {
      db[targetUser].points += points;
      db[targetUser].totalLuck += luckValue;
      db[targetUser].lastCheck = today;
    }

    // Save database
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));

    // Leaderboard (Top 5)
    const leaderboard = Object.entries(db)
      .map(([id, data]) => ({ id, points: data.points }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 5)
      .map((u, i) => `${i + 1}. @${u.id.split("@")[0]} - ${u.points} pts`)
      .join("\n");

    // Compose reply
    const name = targetUser.split("@")[0];
    const replyText = `
🎲 *Daily Luck Check!* - Powered by SOURAV_,MD

User: @${name}
Luck: ${luckValue}%
Luck Meter: ${luckBar}
Status: ${description}

🏆 *Weekly Leaderboard:*
${leaderboard || "No entries yet!"}
`;

    // Send message with tagging
    await sock.sendMessage(
      jid,
      { text: replyText, mentions: [targetUser, ...Object.keys(db).slice(0, 5)] },
      { quoted: m }
    );
  }
};
