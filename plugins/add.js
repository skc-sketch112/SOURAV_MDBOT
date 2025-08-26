module.exports = {
    name: "add",
    command: ["add", "invite"],
    execute: async (sock, m, args) => {
        try {
            // Check if numbers are provided
            if(!args[0]) return await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Usage: `.add 919xxxxxxxx 919yyyyyyyy`" },
                { quoted: m }
            );

            const groupMetadata = await sock.groupMetadata(m.key.remoteJid);

            // Check if bot is admin
            const botAdmin = groupMetadata.participants.find(p => p.id === sock.user.id)?.admin;
            if(!botAdmin) return await sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ Bot must be admin to add members!" },
                { quoted: m }
            );

            const numbers = args.map(n => n.replace(/[^0-9]/g, "") + "@s.whatsapp.net");
            let success = [], failed = [];

            for(const number of numbers){
                try {
                    // Skip if already in group
                    const isMember = groupMetadata.participants.some(p => p.id === number);
                    if(isMember){
                        failed.push(`${number.split("@")[0]} (Already in group)`);
                        continue;
                    }

                    // Add member
                    await sock.groupAdd(m.key.remoteJid, [number]);

                    // Verify if added successfully
                    const updatedGroup = await sock.groupMetadata(m.key.remoteJid);
                    const nowMember = updatedGroup.participants.some(p => p.id === number);
                    if(nowMember){
                        success.push(number.split("@")[0]);
                    } else {
                        failed.push(`${number.split("@")[0]} (Add failed)`);
                    }

                } catch(e){
                    // Proper error handling
                    failed.push(`${number.split("@")[0]} (${e.message.includes("403") ? "Bot not admin" : "Add failed"})`);
                }
            }

            // Reply with final result
            const reply = `✅ Add Result:\n✔️ Added: ${success.join(", ") || "None"}\n❌ Failed: ${failed.join(", ") || "None"}`;
            await sock.sendMessage(m.key.remoteJid, { text: reply }, { quoted: m });

        } catch(e){
            console.error("Add.js Advanced Error:", e);
            await sock.sendMessage(m.key.remoteJid, { text: "❌ Something went wrong while adding members!" }, { quoted: m });
        }
    }
};
