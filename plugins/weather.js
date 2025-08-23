module.exports = {
  name: "weather",
  command: ["rain", "storm", "snow", "fire", "hack", "wind", "earthquake", "clouds", "sunrise", "sunset"],
  description: "10+ realistic weather & effect animations",

  async execute(sock, m, args, command) {
    const jid = m.key.remoteJid;

    // Animation sets
    const animations = {
      rain: [
        "🌧️       💧        🌧️",
        "💧   🌧️     💧       💧",
        "   💧 💧 🌧️     💧",
        "🌧️   💧   🌧️   💧",
        "💧💧💧🌧️💧💧💧",
        "🌧️💧🌧️💧🌧️💧",
        "The rain keeps falling... 🌧️"
      ],
      storm: [
        "🌧️       💧        🌧️",
        "💧   🌧️     💧       💧",
        "🌧️  ⚡💧   🌧️   💧",
        "⚡🌧️⚡🌧️⚡🌧️",
        "💧💧💧🌧️💧💧💧",
        "⚡ BOOM!! ⚡",
        "⚡🌩️ The storm rages on... 🌩️⚡"
      ],
      snow: [
        "❄️        ❄️        ❄️",
        "   ❄️   ❄️     ❄️",
        "❄️❄️❄️❄️❄️❄️",
        "☃️ Snow is falling gently... ❄️"
      ],
      fire: [
        "🔥🔥🔥🔥🔥",
        "🔥   🔥   🔥",
        "🔥🔥🔥🔥🔥",
        "The flames burn bright 🔥"
      ],
      hack: [
        "👨‍💻 Initializing hack...",
        "💻 Bypassing firewall...",
        "📡 Accessing system...",
        "🔓 Password cracked!",
        "💀 SYSTEM HACKED 💀"
      ],
      wind: [
        "🌬️      💨",
        "💨   🌬️      💨",
        "💨💨💨 Strong winds blowing 🌬️"
      ],
      earthquake: [
        "🌍🌍🌍",
        "💥 The ground shakes 💥",
        "🌍💢 EARTHQUAKE 🌍💢"
      ],
      clouds: [
        "☁️        ☁️        ☁️",
        "   ☁️   ☁️     ☁️",
        "☁️☁️☁️ Clouds gathering ☁️"
      ],
      sunrise: [
        "🌄 The sun is rising...",
        "🌅 A new day begins 🌅"
      ],
      sunset: [
        "🌇 The sun sets in the horizon...",
        "🌆 Evening falls 🌆"
      ]
    };

    const frames = animations[command];
    if (!frames) {
      return await sock.sendMessage(jid, { text: "⚠️ Unknown weather command!" }, { quoted: m });
    }

    // Send animation
    let sent = await sock.sendMessage(jid, { text: frames[0] }, { quoted: m });
    for (let i = 1; i < frames.length; i++) {
      await new Promise(r => setTimeout(r, 1500)); // 1.5 sec delay
      await sock.sendMessage(jid, { edit: sent.key, text: frames[i] });
    }
  }
};
