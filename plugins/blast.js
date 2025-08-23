module.exports = {
  name: "blast",
  command: [
    "blast", "bucketblast", "grenade", "nuclear", "meteor", "fireblast",
    "bombdrop", "volcano", "earthblast", "stormblast", "shockwave"
  ],
  description: "Collection of powerful blast animations",

  async execute(sock, m, args, command) {
    const jid = m.key.remoteJid;

    // ⛈️ Different blast animations
    const animations = {
      bucketblast: [
        "🪣 Preparing bucket...",
        "🪣💣 Filling with explosives...",
        "⚠️ Igniting fuse...",
        "🔥🔥🔥🔥🔥",
        "💥💥💥💥💥",
        "☠️ BUCKET BLAST ACTIVATED ☠️"
      ],
      grenade: [
        "🧨 Pulling grenade pin...",
        "💣 Throwing grenade...",
        "💥💥💥💥💥",
        "☠️ GRENADE EXPLOSION ☠️"
      ],
      nuclear: [
        "⚠️ Nuclear missile launched...",
        "🚀 Traveling across the sky...",
        "☢️ Nuclear warhead armed...",
        "🔥🔥🔥🔥🔥",
        "💥🌍💥 EARTH SHAKES",
        "☠️ NUCLEAR BLAST ☠️"
      ],
      meteor: [
        "☄️ A meteor is approaching...",
        "🔥 Entering atmosphere...",
        "⚡ Heating up...",
        "💥 BOOM BOOM 💥",
        "🌍 IMPACT!!! 🌍"
      ],
      fireblast: [
        "🔥🔥🔥 Gathering fire...",
        "🔥🔥🔥🔥🔥🔥🔥",
        "💥 FIRE BLAST 💥",
        "☠️ Everything burned ☠️"
      ],
      bombdrop: [
        "✈️ Aircraft overhead...",
        "🎯 Target locked...",
        "💣 Bombs away...",
        "💥💥💥 Massive explosion 💥💥💥"
      ],
      volcano: [
        "🌋 Volcano is rumbling...",
        "🌋🌋 Lava rising...",
        "🔥🔥🔥🔥🔥",
        "💥 VOLCANIC ERUPTION 💥",
        "☠️ Lava everywhere ☠️"
      ],
      earthblast: [
        "🌍 Earth is shaking...",
        "💢 Cracks forming...",
        "💥 EARTH BLAST 💥",
        "🌋 Lands destroyed 🌋"
      ],
      stormblast: [
        "🌩️ Dark clouds gathering...",
        "⚡ Lightning strikes...",
        "🌪️ Storm intensifies...",
        "💥 STORM BLAST 💥"
      ],
      shockwave: [
        "💨 Energy gathering...",
        "⚡ Vibrations increasing...",
        "💥 SHOCKWAVE RELEASED 💥",
        "☠️ Everything obliterated ☠️"
      ]
    };

    // 🎯 Match the command
    let style = command.toLowerCase();
    if (!animations[style]) style = "blast";

    const frames = animations[style] || ["💥 Unknown blast"];

    // 🚀 Play animation with edits
    let sent = await sock.sendMessage(jid, { text: frames[0] }, { quoted: m });
    for (let i = 1; i < frames.length; i++) {
      await new Promise(r => setTimeout(r, 1500));
      await sock.sendMessage(jid, { edit: sent.key, text: frames[i] });
    }
  }
};
