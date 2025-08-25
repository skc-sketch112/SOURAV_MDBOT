// plugins/tagall.js
/**
 * Powerful Tag-All (SOURAV_MD)
 * - Batches mentions to avoid flood / rate limits
 * - Optional custom message: .tagall <your text>
 * - Admin-only by default (toggle ADMIN_ONLY to false if you want everyone to use)
 * - Skips duplicates, supports huge groups
 */

const ADMIN_ONLY = true;             // set false to allow anyone
const BATCH_SIZE = 20;               // how many users per message
const BATCH_DELAY_MS = 1500;         // delay between batches (tune if needed)
const TITLE = "🔔 SOURAV_MD – Tag All";

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function isUserAdmin(sock, jid, userJid) {
  try {
    const meta = await sock.groupMetadata(jid);
    const p = meta?.participants || [];
    const me = p.find(x => x.id === userJid);
    return !!(me && (me.admin === "admin" || me.admin === "superadmin"));
  } catch {
    return false;
  }
}

module.exports = {
  name: "tagall",
  command: ["tagall", "all", "mentionall"],
  category: "group",
  description: "Mention everyone in the group safely (batched).",
  use: ".tagall [optional message]",

  execute: async (sock, m, args) => {
    const jid = m?.key?.remoteJid;
    const fromMe = m?.key?.fromMe;
    const sender = (m?.key?.participant || m?.key?.remoteJid || "").split(":")[0];

    const reply = (text) =>
      sock.sendMessage(jid, { text }, { quoted: m });

    try {
      // Must be a group
      if (!jid || !jid.endsWith("@g.us")) {
        return reply("❌ This command works only in groups.");
      }

      // Admin check (optional)
      if (ADMIN_ONLY && !fromMe) {
        const admin = await isUserAdmin(sock, jid, sender);
        if (!admin) return reply("⛔ Only group admins can use .tagall");
      }

      // Fetch group info
      const meta = await sock.groupMetadata(jid);
      const subject = meta?.subject || "Group";
      let participants = (meta?.participants || []).map(p => p.id);

      // Basic safety: remove duplicates & ensure valid @ numbers
      participants = [...new Set(participants)].filter(x => x && x.includes("@s.whatsapp.net"));

      if (!participants.length) {
        return reply("⚠️ Couldn’t read participant list.");
      }

      // Optional message
      const custom = args.length ? args.join(" ") : "";
      const header = `${TITLE}\n👥 *${subject}*\n${custom ? `\n🗣️ ${custom}\n` : ""}`;

      // Inform start
      await reply(`⚙️ Preparing mentions (${participants.length} members)…\n• Batch: ${BATCH_SIZE}\n• Delay: ${BATCH_DELAY_MS}ms`);

      // Batch send
      const batches = chunk(participants, BATCH_SIZE);

      // Show typing during operation
      await sock.sendPresenceUpdate("composing", jid).catch(() => {});

      for (let i = 0; i < batches.length; i++) {
        const group = batches[i];

        // Create a neat list of @handles for the chunk
        const body =
          group.map((id, idx) => `${i * BATCH_SIZE + idx + 1}. @${id.split("@")[0]}`).join("\n");

        const text = `${header}\n${body}`;

        await sock.sendMessage(
          jid,
          {
            text,
            mentions: group, // new API
            contextInfo: { mentionedJid: group } // compatibility
          },
          { quoted: m }
        );

        // Delay before next batch (skip delay after last)
        if (i !== batches.length - 1) {
          await new Promise(res => setTimeout(res, BATCH_DELAY_MS));
        }
      }

      await sock.sendMessage(
        jid,
        { text: `✅ Done! Mentioned ${participants.length} members.\n— Powered by *SOURAV_MD*` },
        { quoted: m }
      );
    } catch (err) {
      console.error("tagall.js error:", err);
      return reply("❌ TagAll failed. (Check group admin rights & try again)");
    }
  },
};
