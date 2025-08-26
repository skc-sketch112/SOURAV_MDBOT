const fs = require('fs');
const warnPath = './warnData.json';
const settingsPath = './warnSettings.json';

module.exports = {
    name: "warn",
    command: ["warn"],
    execute: async (sock, m, args) => {
        try {
            const groupJid = m.key.remoteJid;
            const senderId = m.sender;

            // Admin/owner only
            const groupMetadata = await sock.groupMetadata(groupJid);
            const senderAdmin = groupMetadata.participants.find(p => p.id === senderId)?.admin;
            const isOwner = groupMetadata.owner === senderId;

            if(!senderAdmin && !isOwner){
                return await sock.sendMessage(groupJid, { text: "❌ Only admin/owner can warn!" }, { quoted: m });
            }

            if(!args[0]) return await sock.sendMessage(groupJid, { text: "⚠️ Usage: `.warn @user`" }, { quoted: m });

            let mention = m.mentionedJid && m.mentionedJid[0];
            if(!mention) return await sock.sendMessage(groupJid, { text: "❌ Mention a user to warn!" }, { quoted: m });

            // Check warn system
            let settings = {};
            if(fs.existsSync(settingsPath)) settings = JSON.parse(fs.readFileSync(settingsPath));
            if(!settings[groupJid] || !settings[groupJid].active) return await sock.sendMessage(groupJid, { text: "❌ Warn system is OFF!" }, { quoted: m });

            const limit = settings[groupJid].limit || 3;

            // Load warn data
            let data = {};
            if(fs.existsSync(warnPath)) data = JSON.parse(fs.readFileSync(warnPath));

            if(!data[groupJid]) data[groupJid] = {};
            if(!data[groupJid][mention]) data[groupJid][mention] = 0;

            // Increment warn
            data[groupJid][mention] += 1;
            fs.writeFileSync(warnPath, JSON.stringify(data, null, 2));

            let warnCount = data[groupJid][mention];
            let text = `⚠️ <@${mention.split("@")[0]}> has been warned!\nTotal warns: ${warnCount}/${limit}`;

            // Auto action if limit reached
            if(warnCount >= limit){
                try{
                    await sock.groupParticipantsUpdate(groupJid, [mention], "remove"); // Kick user
                    text += `\n❌ Limit reached! User has been kicked.`;
                    delete data[groupJid][mention]; // Reset warn after action
                    fs.writeFileSync(warnPath, JSON.stringify(data, null, 2));
                } catch(e){
                    text += `\n⚠️ Could not kick user: ${e.message}`;
                }
            }

            await sock.sendMessage(groupJid, { text: text, mentions: [mention] }, { quoted: m });

        } catch(e){
            console.error("Warn.js Error:", e);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Something went wrong while warning user!" }, { quoted: m });
        }
    }
};
