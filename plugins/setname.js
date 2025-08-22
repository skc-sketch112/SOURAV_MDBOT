const { cmd } = require('../command');  // adjust path if your project uses a different handler

cmd({
    pattern: "setname",
    desc: "Change your WhatsApp profile name",
    category: "owner",
    use: ".setname YourNewName",
    filename: __filename
}, async (conn, mek, m, { text }) => {
    try {
        if (!text) return m.reply("⚠️ Please provide a name!\n\nExample: .setname SOURAV_MD");

        // Change name
        await conn.updateProfileName(text);

        await m.reply(`✅ Successfully updated your profile name to: *${text}*`);
    } catch (e) {
        console.error(e);
        await m.reply("❌ Error: Unable to set profile name. Make sure your bot number has this permission.");
    }
});
