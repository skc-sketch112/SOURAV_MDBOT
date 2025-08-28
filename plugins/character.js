// character.js
module.exports = {
  name: "character",
  command: ["character", "char", "role", "legendarychar"],
  description: "Assigns random human characters with rare legendary events",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    // Check group chat
    if (!jid.endsWith("@g.us")) {
      return sock.sendMessage(jid, { text: "❌ This command only works in groups!" }, { quoted: m });
    }

    try {
      const metadata = await sock.groupMetadata(jid);
      const participants = metadata.participants.map(u => u.id);

      // Normal human characters
      const normalChars = [
        "💎 Gorgeous", "🔥 Bad Boy/Girl", "🎤 Rapper", "🕶 Stylish", "💼 CEO",
        "🎨 Artist", "🎮 Gamer", "🧠 Genius", "💃 Dancer", "🎵 Singer",
        "👑 Royalty", "🕵️ Detective", "📚 Scholar", "🎭 Actor", "🎬 Director",
        "🖋 Poet", "🎧 DJ", "🛡 Protector", "💖 Lover", "🧩 Strategist",
        "🕰 Time Traveler", "🌟 Star", "⚡ Energizer", "💀 Mysterious", "💣 Rebel",
        "🧞 Genie", "⚔ Conqueror", "🧝 Elf", "🪄 Magician", "💫 Dreamer",
        "🎯 Focused", "🏆 Champion", "🕊 Peacekeeper", "🪐 Explorer", "🎲 Gambler",
        "📝 Writer", "🎹 Pianist", "🎸 Guitarist", "🎺 Trumpeter"
      ];

      // Legendary human characters (rare 1-5%)
      const legendaryChars = [
        "🌈 Ultimate Rapper", "💥 Super Genius", "👑 Legendary CEO", 
        "🦸‍♂️ Hero of Legends", "🦹 Villain Supreme", "💫 Timeless Magician",
        "⚡ Lightning Dancer", "🔥 Eternal Rebel"
      ];

      // Shuffle users
      const shuffledUsers = participants.sort(() => 0.5 - Math.random());

      const assignments = shuffledUsers.map(user => {
        const rand = Math.random();
        let charAssigned;
        let specialEvent = "";

        // 5% chance for legendary character
        if (rand <= 0.05) {
          charAssigned = legendaryChars[Math.floor(Math.random() * legendaryChars.length)];
          specialEvent = " 🌟 Rare Legendary Character!";
        } else {
          charAssigned = normalChars[Math.floor(Math.random() * normalChars.length)];
        }

        const name = user.split("@")[0];
        return `@${name} → ${charAssigned}${specialEvent}`;
      });

      // Compose reply
      const replyText = `🎭 *Random Human Character Assignment!*\n\n${assignments.join("\n")}\n\nPowered by SOURAV_,MD`;

      await sock.sendMessage(
        jid,
        { text: replyText, mentions: participants },
        { quoted: m }
      );
    } catch (err) {
      console.error("Character Error:", err);
      await sock.sendMessage(jid, { text: "❌ Failed to assign characters." }, { quoted: m });
    }
  }
};
