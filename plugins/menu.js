const {
  generateWAMessageFromContent,
  proto,
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "menu",
  command: ["menu"],
  execute: async (sock, m) => {
    const jid = m.key.remoteJid;

    // Load plugins automatically
    const pluginsPath = path.join(__dirname);
    const files = fs
      .readdirSync(pluginsPath)
      .filter((file) => file.endsWith(".js"));
    let pluginsList = files.map((f) => f.replace(".js", ""));

    // Prepare button objects
    const buttons = pluginsList.map((p) => ({
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: `📂 ${p}`,
        id: `.plugininfo ${p}`,
      }),
    }));

    // Add footer button
    buttons.push({
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "⚡ Powered by SOURAV V4",
        id: ".about",
      }),
    });

    const caption = `
╭━━━〔 𝗦𝗢𝗨𝗥𝗔𝗩_𝗠𝗗-V6 〕━━━╮
┃ 👑 OWNER   : SOURAV
┃ ⚡ VERSION : 4
┃ 🔑 PREFIX  : .
╰━━━━━━━━━━━━━━━╯

📂 *Select a Plugin Below* 👇
    `;

    // Create real interactive message
    const msg = generateWAMessageFromContent(
      jid,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({
                text: caption,
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: "SOURAV_MD-V6",
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                title: "📌 Menu",
                hasMediaAttachment: false,
              }),
              nativeFlowMessage:
                proto.Message.InteractiveMessage.NativeFlowMessage.create({
                  buttons,
                }),
            }),
          },
        },
      },
      { userJid: jid }
    );

    await sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
  },
};
