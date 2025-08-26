const fs = require('fs');
const path = './warnSettings.json';

module.exports = {
    name: "warnset",
    command: ["warnset"],
    execute: async (sock, m, args) => {
        try {
            const groupJid = m.key.remoteJid;
            const senderId = m.sender;

            // Only admin/owner
            const groupMetadata = await sock.groupMetadata(groupJid);
            const senderAdmin = groupMetadata.participants.find(p => p.id === senderId)?.admin;
            const isOwner = groupMetadata.owner === senderId;

            if(!senderAdmin && !isOwner){
                return await sock.sendMessage(groupJid, { text: "❌ Only admin/owner can set warn system!" }, { quoted: m });
            }

            if(!args[0] || !["on","off"].includes(args[0].toLowerCase())){
                return await sock.sendMessage(groupJid, { text: "⚠️ Usage: `.warnset on/off [limit]`" }, { quoted: m });
            }

            let limit = args[1] ? parseInt(args[1]) : 3; // Default 3 warns
            if(isNaN(limit) || limit < 1) limit = 3;

            let data = {};
            if(fs.existsSync(path)) data = JSON.parse(fs.readFileSync(path));

            data[groupJid] = {
                active: args[0].toLowerCase() === "on" ? true : false,
                limit: limit
            };

            fs.writeFileSync(path, JSON.stringify(data, null, 2));
            await sock.sendMessage(groupJid, { text: `✅ Warn system is now *${args[0].toUpperCase()}* with limit ${limit}` }, { quoted: m });

        } catch(e){
            console.error("WarnSet.js Error:", e);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Something went wrong while setting warn system!" }, { quoted: m });
        }
    }
};
