module.exports = {
  name: "animation",
  command: [
    "animation", "hack", "blast", "volcano", "earthquake", "tsunami", "rain",
    "storm", "flood", "galaxy", "blackhole", "supernova", "bigbang",
    "wormhole", "cosmicstorm", "starblast", "nebula", "timewarp"
  ],
  description: "Hack, Blast, Weather & Space animations in one plugin",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    // Extract body text
    let body = m.message.conversation || m.message.extendedTextMessage?.text || "";
    let prefix = body.trim().split(" ")[0];
    let cmd = prefix.replace(/^\./, "").toLowerCase();

    // Animation dictionary
    const animations = {
      hack: [
        "💻 Connecting to mainframe...",
        "🔍 Bypassing firewall...",
        "⚡ Injecting payload...",
        "📂 Extracting data...",
        "✅ Hack complete!"
      ],
      blast: [
        "💣 Arming explosives...",
        "🔥 Countdown 3...",
        "🔥 Countdown 2...",
        "🔥 Countdown 1...",
        "💥💥 BOOOOOOM 💥💥"
      ],
      volcano: [
        "🌋 Lava rising...",
        "🔥 Pressure building...",
        "⚡ Earth shaking...",
        "💥 VOLCANO ERUPTION 💥"
      ],
      earthquake: [
        "🌍 Ground trembling...",
        "⚡ Seismic waves detected...",
        "🏚️ Buildings shaking...",
        "☠️ EARTHQUAKE STRIKES ☠️"
      ],
      tsunami: [
        "🌊 Ocean pulling back...",
        "⚡ Energy building...",
        "🌊 GIANT WAVE RISING...",
        "💥 TSUNAMI ENGULFS LAND 💥"
      ],
      rain: [
        "☁️ Clouds gathering...",
        "💧 Droplets forming...",
        "🌧️ Heavy rainfall begins...",
        "⚡ Thunder roaring...",
        "🌈 Rain ends with rainbow 🌈"
      ],
      storm: [
        "🌫️ Winds picking up...",
        "⚡ Thunder rumbling...",
        "🌪️ Storm intensifying...",
        "☠️ MASSIVE STORM ARRIVES ☠️"
      ],
      flood: [
        "💧 Water levels rising...",
        "🏞️ Rivers overflowing...",
        "🌊 FLOODING CITIES...",
        "☠️ FLOOD DISASTER ☠️"
      ],
      galaxy: [
        "✨ Gathering stardust...",
        "🌌 Stars forming...",
        "🌠 Galaxy spiral forming...",
        "⚡ Rotating universe...",
        "🌍 Galaxy complete 🌌"
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
        "🔥🔥 Nuclear fusion raging...",
        "⚡ Core collapsing...",
        "💥 SUPERNOVA EXPLOSION 💥",
        "✨ Elements spread across galaxy ✨"
      ],
      bigbang: [
        "🌑 Universe in silence...",
        "⚡ Energy concentrating...",
        "🔥🔥🔥🔥🔥",
        "💥 BIG BANG 💥",
        "🌌 Universe expanding 🌌"
      ],
      wormhole: [
        "🌌 Space tearing apart...",
        "⚡ Energy spiraling...",
        "🌀 Wormhole opening...",
        "🚀 Entering wormhole...",
        "✨ Teleported across galaxy ✨"
      ],
      cosmicstorm: [
        "🌠 Stars trembling...",
        "⚡ Cosmic energy gathering...",
        "🌌 Dark matter swirling...",
        "💥 COSMIC STORM 💥",
        "☠️ Universe shakes ☠️"
      ],
      starblast: [
        "🌟 Star burning brighter...",
        "🔥 Flames raging...",
        "💥 STAR BLAST 💥",
        "⚡ Solar flares unleashed ⚡"
      ],
      nebula: [
        "☁️ Interstellar gas forming...",
        "✨ Lights glowing...",
        "🌌 Nebula expanding...",
        "🌠 NEBULA CREATED 🌠"
      ],
      timewarp: [
        "⏳ Time bending...",
        "⚡ Past & future colliding...",
        "🌀 Time warp opening...",
        "💥 Timeline distorted 💥",
        "✨ You’re in another era ✨"
      ]
    };

    // If user typed ".animation" → show command list
    if (cmd === "animation") {
      let list = Object.keys(animations).map(c => `.${c}`).join("\n");
      return await sock.sendMessage(jid, { text: `✨ *Available Animations:*\n\n${list}` }, { quoted: m });
    }

    // If invalid animation command
    if (!animations[cmd]) {
      return await sock.sendMessage(jid, { text: "⚠️ Invalid animation command! Type *.animation* for list." }, { quoted: m });
    }

    // Send animation frames
    const frames = animations[cmd];
    let sent = await sock.sendMessage(jid, { text: frames[0] }, { quoted: m });

    for (let i = 1; i < frames.length; i++) {
      await new Promise(r => setTimeout(r, 1500)); // delay between frames
      await sock.sendMessage(jid, { edit: sent.key, text: frames[i] });
    }
  }
};
