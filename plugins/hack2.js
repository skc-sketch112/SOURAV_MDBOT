module.exports = {
  name: "hack",
  command: ["hack", "hack1", "hack2", "hack3", "hack4", "hack5", "hack6", "hack7", "hack8", "hack9", "hack10"],
  description: "Fake hacking animations",

  async execute(sock, m, args, { command }) {
    const jid = m.key.remoteJid;

    // animations list
    const animations = {
      hack: [
        "🔍 Initializing hack engine...",
        "🟢 Connecting to server...",
        "📡 Bypassing firewall...",
        "💉 Injecting payload...",
        "🔓 Access Granted!",
        "📂 Extracting files...",
        "📤 Uploading data...",
        "✅ Hack complete!"
      ],
      hack1: [
        "🖥️ Loading terminal...",
        "🔑 Brute-forcing password...",
        "🔓 Password cracked: admin123",
        "🌐 Logging in as root...",
        "📥 Downloading database...",
        "✅ Database cloned successfully!"
      ],
      hack2: [
        "🟢 Connecting to dark web nodes...",
        "📡 Spoofing IP...",
        "📶 VPN secured...",
        "⚙️ Deploying RAT (Remote Access Trojan)...",
        "💻 Full device control granted!",
        "✅ Hack finished!"
      ],
      hack3: [
        "📡 Sniffing network packets...",
        "🔍 Analyzing traffic...",
        "📂 Credentials intercepted!",
        "🔑 Username: root | Password: toor",
        "💾 Saving log files...",
        "✅ Operation successful!"
      ],
      hack4: [
        "🔍 Scanning open ports...",
        "🌐 Port 22 open (SSH)...",
        "⚡ Exploiting vulnerability...",
        "🔓 Root shell access granted!",
        "📝 Adding new admin user...",
        "✅ System compromised!"
      ],
      hack5: [
        "🔒 Encrypting victim’s files...",
        "📂 All documents locked...",
        "💀 Displaying ransomware note...",
        "💰 Pay 1 BTC to unlock!",
        "⚡ Threat simulation finished."
      ],
      hack6: [
        "💻 Injecting SQL payload...",
        "📂 Dumping users table...",
        "👥 Extracted 5000+ emails...",
        "🔑 Extracted 1200+ passwords...",
        "✅ Hack complete!"
      ],
      hack7: [
        "🌐 Connecting to NASA servers...",
        "🚀 Accessing satellite control...",
        "🛰️ Re-routing signal...",
        "🔓 Satellite override complete!",
        "✅ Mission successful!"
      ],
      hack8: [
        "🔍 Loading phishing script...",
        "📩 Sending fake login page...",
        "👥 50+ victims entered credentials...",
        "🔑 Collected passwords stored!",
        "✅ Hack finished!"
      ],
      hack9: [
        "⚙️ Compiling malware...",
        "📤 Uploading to target device...",
        "📱 Android device infected!",
        "🟢 Camera & mic access enabled...",
        "✅ Hack successful!"
      ],
      hack10: [
        "💻 Deploying keylogger...",
        "⌨️ Capturing keystrokes...",
        "🔑 Extracted Facebook login...",
        "📥 Data sent to server...",
        "✅ Hack operation completed!"
      ]
    };

    const frames = animations[command] || animations.hack;

    // send first frame
    let sent = await sock.sendMessage(jid, { text: frames[0] }, { quoted: m });

    // edit each frame with delay
    for (let i = 1; i < frames.length; i++) {
      await new Promise(r => setTimeout(r, 1500));
      await sock.sendMessage(jid, { edit: sent.key, text: frames[i] });
    }
  }
};
