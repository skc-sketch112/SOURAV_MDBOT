module.exports = {
    name: "kick",
    command: ["kick", "remove"],
    execute: async (sock, m, args) => {
        try {
            // Must mention at least one member
            const mentions = m.message.extendedTextMessage?.contextInfo?.mentionedJid;
            if(!mentions || mentions.length === 0) {
                return await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "⚠️ Please mention one or more members to kick!" },
                    { quoted: m }
                );
            }

            const metadata = await sock.groupMetadata(m.key.remoteJid);
            const groupAdmins = metadata.participants.filter(p => p.admin).map(p => p.id);

            let kicked = [];
            let failed = [];

            for(const jid of mentions){
                try {
                    if(groupAdmins.includes(jid)){
                        failed.push(`${jid.split("@")[0]} (Admin cannot kick)`);
                        continue;
                    }
                    await sock.groupRemove(m.key.remoteJid, [jid]);
                    kicked.push(jid.split("@")[0]);
                } catch(e){
                    failed.push(`${jid.split("@")[0]} (Failed)`);
                }
            }

            let reply = "⚡ SOURAV_MD Kick Result ⚡\n\n";
            if(kicked.length) reply += `✅ Kicked: ${kicked.join(", ")}\n`;
            if(failed.length) reply += `❌ Failed: ${failed.join(", ")}`;

            await sock.sendMessage(
                m.key.remoteJid,
                { text: reply },
                { quoted: m }
            );

        } catch(e){
            console.error("Kick.js Error:", e);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ Something went wrong while kicking members!" },
                { quoted: m }
            );
        }
    }
};
