module.exports = {
  name: "add",
  command: ["add", "invite"],
  execute: async (sock, m, args) => {
    try {
      // 1️⃣ Usage check
      if (!args[0]) return await sock.sendMessage(
        m.key.remoteJid,
        { text: "⚠️ Usage: `.add 919xxxxxxxx 919yyyyyyyy`" },
        { quoted: m }
      );

      // 2️⃣ Group metadata fetch with retry
      let groupMetadata;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          groupMetadata = await sock.groupMetadata(m.key.remoteJid);
          break;
        } catch (e) {
          if (attempt === 2) throw new Error("Failed to fetch group metadata");
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }

      // 3️⃣ Bot admin check with debugging
      const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net"; // Ensure correct ID format
      console.log(`[Add] Bot ID: ${botId}, Checking admin status...`);
      let botAdmin = groupMetadata.participants.find(p => p.id === botId)?.admin;
      if (!botAdmin) {
        console.log(`[Add] Bot not found as admin in participants:`, groupMetadata.participants.map(p => p.id));
        // Retry metadata fetch if not admin (possible delay)
        await new Promise(resolve => setTimeout(resolve, 2000));
        groupMetadata = await sock.groupMetadata(m.key.remoteJid);
        botAdmin = groupMetadata.participants.find(p => p.id === botId)?.admin;
        if (!botAdmin) {
          return await sock.sendMessage(
            m.key.remoteJid,
            { text: "❌ Bot must be admin to add members! (Check group settings or bot role)" },
            { quoted: m }
          );
        }
      }
      console.log("[Add] Bot confirmed as admin.");

      // 4️⃣ Map numbers
      const numbers = args.map(n => {
        const cleanNumber = n.replace(/[^0-9]/g, "");
        return cleanNumber.length === 10 ? `91${cleanNumber}@s.whatsapp.net` : `${cleanNumber}@s.whatsapp.net`;
      });

      // 5️⃣ Success / failed arrays
      let success = [], failed = [];

      // 6️⃣ Add members
      for (const number of numbers) {
        try {
          // 🔹 Refresh metadata before each add
          groupMetadata = await sock.groupMetadata(m.key.remoteJid);

          // Check if already in group
          const isMember = groupMetadata.participants.some(p => p.id === number);
          if (isMember) {
            failed.push(`${number.split("@")[0]} (Already in group)`);
            continue;
          }

          // Add member
          console.log(`[Add] Attempting to add ${number}...`);
          await sock.groupAdd(m.key.remoteJid, [number]);

          // Verify added
          const updatedGroup = await sock.groupMetadata(m.key.remoteJid);
          const nowMember = updatedGroup.participants.some(p => p.id === number);
          if (nowMember) {
            success.push(number.split("@")[0]);
          } else {
            failed.push(`${number.split("@")[0]} (Add failed)`);
          }

        } catch (e) {
          console.error(`[Add] Error adding ${number}:`, e.message);
          failed.push(`${number.split("@")[0]} (${e.message.includes("403") ? "Bot not admin / blocked user" : "Failed"})`);
        }
      }

      // 7️⃣ Send final result
      const reply = `✅ Add Result:\n✔️ Added: ${success.join(", ") || "None"}\n❌ Failed: ${failed.join(", ") || "None"}`;
      await sock.sendMessage(m.key.remoteJid, { text: reply }, { quoted: m });

    } catch (e) {
      console.error("Add.js Advanced Error:", e);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: `❌ Something went wrong while adding members! Error: ${e.message}` },
        { quoted: m }
      );
    }
  }
};
