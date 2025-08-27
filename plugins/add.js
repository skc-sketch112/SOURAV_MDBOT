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
          console.log(`[Add] Metadata fetched (Attempt ${attempt + 1})`);
          break;
        } catch (e) {
          console.error(`[Add] Metadata fetch error (Attempt ${attempt + 1}):`, e.message);
          if (attempt === 2) throw new Error("Failed to fetch group metadata");
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }

      // 3️⃣ Bot admin check with debugging
      const botId = sock.user.id; // Use full ID as provided by Baileys
      console.log(`[Add] Bot ID: ${botId}, Checking admin status...`);
      let botAdmin = groupMetadata.participants.find(p => p.id === botId)?.admin;
      if (!botAdmin) {
        console.log(`[Add] Bot not admin, participants:`, groupMetadata.participants.map(p => ({ id: p.id, admin: p.admin })));
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

      // 4️⃣ Map numbers with validation
      const numbers = args.map(n => {
        const cleanNumber = n.replace(/[^0-9]/g, "");
        const fullNumber = cleanNumber.length === 10 ? `91${cleanNumber}@s.whatsapp.net` : `${cleanNumber}@s.whatsapp.net`;
        console.log(`[Add] Processed number: ${n} -> ${fullNumber}`);
        return fullNumber;
      });

      // 5️⃣ Success / failed arrays
      let success = [], failed = [];

      // 6️⃣ Add members with delay and detailed error handling
      for (const [index, number] of numbers.entries()) {
        try {
          // Refresh metadata
          groupMetadata = await sock.groupMetadata(m.key.remoteJid);
          const isMember = groupMetadata.participants.some(p => p.id === number);
          if (isMember) {
            failed.push(`${number.split("@")[0]} (Already in group)`);
            console.log(`[Add] ${number} already in group`);
            continue;
          }

          // Add with delay to avoid rate limiting
          console.log(`[Add] Attempting to add ${number} (Attempt ${index + 1}/${numbers.length})`);
          await new Promise(resolve => setTimeout(resolve, 2000 * (index + 1))); // 2s delay per attempt
          await sock.groupAdd(m.key.remoteJid, [number]);

          // Verify addition
          const updatedGroup = await sock.groupMetadata(m.key.remoteJid);
          const nowMember = updatedGroup.participants.some(p => p.id === number);
          if (nowMember) {
            success.push(number.split("@")[0]);
            console.log(`[Add] Successfully added ${number}`);
          } else {
            failed.push(`${number.split("@")[0]} (Add failed)`);
            console.log(`[Add] Failed to verify ${number} addition`);
          }

        } catch (e) {
          console.error(`[Add] Error adding ${number}:`, e.message, e.stack);
          failed.push(`${number.split("@")[0]} (${e.message.includes("403") ? "Bot not admin / blocked user" : e.message})`);
        }
      }

      // 7️⃣ Send final result
      const reply = `✅ Add Result:\n✔️ Added: ${success.join(", ") || "None"}\n❌ Failed: ${failed.join(", ") || "None"}`;
      await sock.sendMessage(m.key.remoteJid, { text: reply }, { quoted: m });

    } catch (e) {
      console.error("Add.js Advanced Error:", e.message, e.stack);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: `❌ Something went wrong while adding members! Error: ${e.message}` },
        { quoted: m }
      );
    }
  }
};
