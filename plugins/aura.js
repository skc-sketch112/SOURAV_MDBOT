// aura.js
module.exports = {
  name: "aura",
  command: ["aura", "checkaura", "myaura", "showaura"],
  description: "Check your aura with stats, fun levels, rare events. Powered by SOURAV_,MD",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    // Pick mentioned user or sender
    const targetUser = mentioned[0] || m.sender || "unknown@user";
    const name = targetUser.split("@")[0];

    // Random aura generation
    const maxAura = 999;
    const auraValue = Math.floor(Math.random() * 2000); // allow fun over-max values
    const auraPercentage = Math.min((auraValue / maxAura) * 100, 100);

    // Aura meter bar (10 blocks)
    const filledBlocks = Math.round((auraPercentage / 100) * 10);
    const emptyBlocks = 10 - filledBlocks;
    const auraBar = "🟩".repeat(filledBlocks) + "⬜".repeat(emptyBlocks);

    // Aura levels
    const levels = [
      { limit: 20, label: "🔴 Very Weak" },
      { limit: 40, label: "🟠 Weak" },
      { limit: 60, label: "🟡 Normal" },
      { limit: 80, label: "🟢 Strong" },
      { limit: 100, label: "💎 Very Strong" }
    ];
    let auraLevel = levels.find(l => auraPercentage <= l.limit)?.label || "💥 Legendary";

    // Rare random aura event (1% chance)
    let rareEvent = "";
    if (Math.random() <= 0.01) {
      auraLevel = "🌈 Ultimate Rainbow Aura";
      rareEvent = "\n🎉 Rare Event: You got a rainbow aura!";
    }

    // Fun aura descriptions
    const descriptions = [
      "🔥 Full of energy!",
      "💫 Sparkling aura detected.",
      "🌈 Vibrant and colorful!",
      "💀 Dark vibes surrounding you.",
      "✨ Magical aura present.",
      "⚡ Electrifying aura!",
      "💖 Love-filled aura.",
      "😎 Chill and calm aura.",
      "🌟 Shining like a star!",
      "🌀 Mysterious vibes around you."
    ];
    const randomDesc = descriptions[Math.floor(Math.random() * descriptions.length)];

    // Compose reply
    const replyText = `
🌟 *Aura Check!* - Powered by SOURAV_,MD

User: @${name}
Aura: ${auraValue}/${maxAura} (${Math.floor(auraPercentage)}%)
Level: ${auraLevel}
Aura Meter: ${auraBar}
Status: ${randomDesc}${rareEvent}
`;

    // Send message tagging the user
    await sock.sendMessage(
      jid,
      { text: replyText, mentions: [targetUser] },
      { quoted: m }
    );
  }
};
