module.exports = {
    name: "setname",
    command: ["setname"],
    category: "owner",
    desc: "Change your WhatsApp profile name",
    use: ".setname NewName",
    execute: async (conn, m, args) => {
        try {
            const text = args.join(" ");
            if (!text) {
                return m.reply("⚠️ Please provide a new name!\n\nExample: .setname SOURAV_MD");
            }

            // Update WhatsApp profile name (this works in Baileys)
            await conn.query({
                tag: 'iq',
                attrs: {
                    to: '@s.whatsapp.net',
                    type: 'set',
                    xmlns: 'w:profile:picture'
                },
                content: [
                    {
                        tag: 'profile',
                        attrs: { name: text }
                    }
                ]
            });

            await m.reply(`✅ Successfully changed profile name to: *${text}*`);
        } catch (err) {
            console.error("SetName Error:", err);
            await m.reply("❌ Failed to update profile name. Try again.");
        }
    }
};
