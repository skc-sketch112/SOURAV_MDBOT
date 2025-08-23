module.exports = {
  name: "universe",
  command: ["universe", "galaxy", "blackhole", "supernova", "bigbang", "wormhole", "cosmicstorm", "starblast", "nebula", "timewarp"],
  description: "Realistic universe & cosmic animations",

  async execute(sock, m, args, command) {
    const jid = m.key.remoteJid;

    const animations = {
      galaxy: [
        "✨ Gathering stardust...",
        "🌌 Stars forming...",
        "🌠 Galaxy spiral forming...",
        "⚡ Rotating universe...",
        "🌍🌎🌏 Galaxy complete 🌌"
      ],
      blackhole: [
        "⚫ Massive star collapsing...",
        "⚫ Gravity pulling everything...",
        "🌌 Space bending...",
        "💫 Light disappearing...",
        "☠️ BLACK HOLE ENGULFS ALL ☠️"
      ],
      supernova: [
        "🌟 Massive star heating...",
        "🔥🔥🔥 Nuclear fusion raging...",
        "⚡ Star core collapsing...",
        "💥💥💥 SUPERNOVA EXPLOSION 💥💥💥",
        "✨ New elements spread across universe ✨"
      ],
      bigbang: [
        "🌑 Universe in silence...",
        "⚡ Energy concentrating...",
        "🔥🔥🔥🔥🔥",
        "💥💥💥 BIG BANG 💥💥💥",
        "🌌 Universe expanding infinitely 🌌"
      ],
      wormhole: [
        "🌌 Space tearing apart...",
        "⚡ Energy spiraling...",
        "🌀 Wormhole opening...",
        "🚀 Entering wormhole...",
        "✨ Teleported across the universe ✨"
      ],
      cosmicstorm: [
        "🌠 Stars trembling...",
        "⚡ Cosmic energy gathering...",
        "🌌 Dark matter swirling...",
        "💥 COSMIC STORM RELEASED 💥",
        "☠️ Universe shakes ☠️"
      ],
      starblast: [
        "🌟 Star burning brighter...",
        "🔥 Flames reaching far...",
        "💥 STAR BLAST 💥",
        "⚡ Solar flares unleashed ⚡"
      ],
      nebula: [
        "☁️ Interstellar gas forming...",
        "✨ Glowing lights everywhere...",
        "🌌 Nebula expanding...",
        "🌠 NEBULA CREATED 🌠"
      ],
      timewarp: [
        "⏳ Time is bending...",
        "⚡ Past and future colliding...",
        "🌀 Time warp opening...",
        "💥 Timeline distorted 💥",
        "✨ You’re in another era ✨"
      ]
    };

    // Pick animation
    let style = command.toLowerCase();
    if (!animations[style]) style = "universe";

    const frames = animations[style] || ["🌌 Unknown cosmic animation"];

    // Send animated messages
    let sent = await sock.sendMessage(jid, { text: frames[0] }, { quoted: m });
    for (let i = 1; i < frames.length; i++) {
      await new Promise(r => setTimeout(r, 1500));
      await sock.sendMessage(jid, { edit: sent.key, text: frames[i] });
    }
  }
};
