module.exports = {
    name: "create",
    command: ["create", "newgroup"],
    execute: async (sock, m, args) => {
        try {
            // 1️⃣ Check for group name
            if(!args[0]) return await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Usage: `.create Group Name`" },
                { quoted: m }
            );

            const groupName = args.join(" ");

            // 2️⃣ Default empty participants array (bot will be admin automatically)
            const participants = [sock.user.id]; // Bot itself

            // 3️⃣ Create group
            const response = await sock.groupCreate(groupName, participants);

            // 4️⃣ Success reply
            const groupJid = response?.groupMetadata?.id || "Unknown JID";
            await sock.sendMessage(
                m.key.remoteJid,
                { text: `✅ Group created successfully!\nName: ${groupName}\nID: ${groupJid}` },
                { quoted: m }
            );

        } catch(e) {
            console.error("Create.js Advanced Error:", e);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: `❌ Failed to create group!\nError: ${e.message}` },
                { quoted: m }
            );
        }
    }
};
