module.exports = {
    name: "setname",
    command: ["setname"],
    category: "owner",
    desc: "Change your WhatsApp profile name",
    use: ".setname YourNewName",
    execute: async (conn, m, args) => {
        try {
            const text = args.join(" ");
            if (!text) {
                return m.reply("⚠️ Please provide a name!\n\nExample: .setname SOURAV_MD");
            }

            // Change profile name
            await conn.updateProfileName(text);

            await m.reply(`✅ Successfully updated profile name to: *${text}*`);
        } catch (err) {
            console.error(err);
            await m.reply("❌ Error: Unable to update name. Make sure bot has permission.");
        }
    }
};
