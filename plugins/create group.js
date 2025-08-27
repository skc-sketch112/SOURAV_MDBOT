module.exports = {
  name: "create",
  command: ["create", "newgroup"],
  description: "Create a WhatsApp group instantly with members.",

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    try {
      if (args.length < 2) {
        return sock.sendMessage(jid, {
          text: "❌ Usage: .create <group name> <@member1> <@member2> ..."
        }, { quoted: msg });
      }

      const groupName = args[0];
      const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];

      if (mentions.length === 0) {
        return sock.sendMessage(jid, { text: "⚠️ Please mention at least one user to add." }, { quoted: msg });
      }

      // Create group
      const group = await sock.groupCreate(groupName, mentions);

      await sock.sendMessage(jid, {
        text: `✅ Group *${groupName}* created successfully!\n\n🔗 Group ID: ${group.gid}`
      }, { quoted: msg });

    } catch (err) {
      console.error("Group create error:", err);
      await sock.sendMessage(jid, {
        text: "❌ Failed to create group. Check bot permissions."
      }, { quoted: msg });
    }
  }
};
