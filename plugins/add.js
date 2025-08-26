module.exports = {
    name: "add",
    command: ["add", "invite"],
    execute: async (sock, m, args) => {
        try {
            // 1️⃣ Usage check
            if(!args[0]) return await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Usage: `.add 919xxxxxxxx 919yyyyyyyy`" },
                { quoted: m }
            );

            // 2️⃣ Group metadata fetch
            let groupMetadata = await sock.groupMetadata(m.key.remoteJid);

            // 3️⃣ Bot admin check
            const botAdmin = groupMetadata.participants.find(p => p.id === sock.user.id)?.admin;
            if(!botAdmin) return await sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ Bot must be admin to add members!" },
                { quoted: m }
            );

            // 4️⃣ Map numbers
            const numbers = args.map(n => n.replace(/[^0-9]/g, "") + "@s.whatsapp.net");

            // 5️⃣ Success / failed arrays
            let success = [], failed = [];

            // 6️⃣ Add members
            for(const number of numbers){
                try {
                    // 🔹 Refresh metadata before each add
                    groupMetadata = await sock.groupMetadata(m.key.remoteJid);

                    // Check if already in group
                    const isMember = groupMetadata.participants.some(p => p.id === number);
                    if(isMember){
                        failed.push(`${number.split("@")[0]} (Already in group)`);
                        continue;
                    }

                    // Add member
                    await sock.groupAdd(m.key.remoteJid, [number]);

                    // Verify added
                    const updatedGroup = await sock.groupMetadata(m.key.remoteJid);
                    const nowMember = updatedGroup.participants.some(p => p.id === number);
                    if(nowMember){
                        success.push(number.split("@")[0]);
                    } else {
                        failed.push(`${number.split("@")[0]} (Add failed)`);
                    }

                } catch(e){
                    failed.push(`${number.split("@")[0]} (${e.message.includes("403") ? "Bot not admin / blocked user" : "Failed"})`);
                }
            }

            // 7️⃣ Send final result
            const reply = `✅ Add Result:\n✔️ Added: ${success.join(", ") || "None"}\n❌ Failed: ${failed.join(", ") || "None"}`;
            await sock.sendMessage(m.key.remoteJid, { text: reply }, { quoted: m });

        } catch(e){
            console.error("Add.js Advanced Error:", e);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ Something went wrong while adding members!" },
                { quoted: m }
            );
        }
    }
};
