module.exports = {
    name: "kick",
    command: ["kick", "remove"],
    execute: async (sock, m, args) => {
        try {
            if(!args[0]) return await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Usage: `.kick 919xxxxxxxx 919yyyyyyyy`" },
                { quoted: m }
            );

            const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
            if(!groupMetadata.participants.some(p => p.admin)) return await sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ Bot must be admin to kick members!" },
                { quoted: m }
            );

            const numbers = args.map(n => n.replace(/[^0-9]/g, "") + "@s.whatsapp.net");
            let success = [], failed = [];

            for(const number of numbers){
                try {
                    const isMember = groupMetadata.participants.some(p => p.id === number);
                    if(!isMember){
                        failed.push(`${number.split("@")[0]} (Not in group)`);
                        continue;
                    }

                    await sock.groupParticipantsUpdate(m.key.remoteJid, [number], "remove");
                    success.push(number.split("@")[0]);
                } catch(e){
                    failed.push(`${number.split("@")[0]} (Failed)`);
                }
            }

            const reply = `✅ Kick Result:\n✔️ Removed: ${success.join(", ") || "None"}\n❌ Failed: ${failed.join(", ") || "None"}`;
            await sock.sendMessage(m.key.remoteJid, { text: reply }, { quoted: m });

        } catch(e){
            console.error("Kick.js Advanced Error:", e);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Something went wrong while kicking members!" }, { quoted: m });
        }
    }
};
