module.exports = {
    name: "add",
    command: ["add", "invite"],
    execute: async (sock, m, args) => {
        try {
            if(!args[0]) return await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Usage: `.add 919xxxxxxxx 919yyyyyyyy`" },
                { quoted: m }
            );

            // Multiple numbers support
            const numbers = args.map(n => n.replace(/[^0-9]/g, "") + "@s.whatsapp.net");

            let success = [];
            let failed = [];

            for(const number of numbers){
                try {
                    const metadata = await sock.groupMetadata(m.key.remoteJid);
                    const isMember = metadata.participants.some(p => p.id === number);
                    if(isMember){
                        failed.push(`${number.split("@")[0]} (Already in group)`);
                        continue;
                    }
                    await sock.groupAdd(m.key.remoteJid, [number]);
                    success.push(number.split("@")[0]);
                } catch(e){
                    failed.push(`${number.split("@")[0]} (Failed)`);
                }
            }

            let reply = "✅ Add Result:\n";
            if(success.length) reply += `✔️ Added: ${success.join(", ")}\n`;
            if(failed.length) reply += `❌ Failed: ${failed.join(", ")}`;

            await sock.sendMessage(
                m.key.remoteJid,
                { text: reply },
                { quoted: m }
            );

        } catch(e){
            console.error("Add.js Error:", e);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ Something went wrong while adding members!" },
                { quoted: m }
            );
        }
    }
};
