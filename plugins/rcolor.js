const { createCanvas } = require("canvas");

module.exports = {
  name: "rcolor",
  command: ["rcolor", "randomcolor", "color"],
  category: "fun",
  description: "Get a random color with its hex code + preview",
  use: ".rcolor",

  execute: async (sock, m, args) => {
    const jid = m?.key?.remoteJid;

    const reply = async (text) => {
      if (typeof m?.reply === "function") return m.reply(text);
      return sock.sendMessage(jid, { text }, { quoted: m });
    };

    try {
      const colors = [
        { name: "Red", hex: "#FF0000" },
        { name: "Green", hex: "#00FF00" },
        { name: "Blue", hex: "#0000FF" },
        { name: "Yellow", hex: "#FFFF00" },
        { name: "Cyan", hex: "#00FFFF" },
        { name: "Magenta", hex: "#FF00FF" },
        { name: "Orange", hex: "#FFA500" },
        { name: "Purple", hex: "#800080" },
        { name: "Pink", hex: "#FFC0CB" },
        { name: "Brown", hex: "#A52A2A" },
        { name: "Gray", hex: "#808080" },
        { name: "Black", hex: "#000000" },
        { name: "White", hex: "#FFFFFF" },
        { name: "Lime", hex: "#32CD32" },
        { name: "Teal", hex: "#008080" },
        { name: "Indigo", hex: "#4B0082" },
        { name: "Violet", hex: "#EE82EE" },
        { name: "Gold", hex: "#FFD700" },
        { name: "Silver", hex: "#C0C0C0" },
        { name: "Beige", hex: "#F5F5DC" },
        { name: "Maroon", hex: "#800000" },
        { name: "Olive", hex: "#808000" },
        { name: "Navy", hex: "#000080" },
        { name: "Turquoise", hex: "#40E0D0" },
        { name: "Coral", hex: "#FF7F50" },
        { name: "Salmon", hex: "#FA8072" },
        { name: "Chocolate", hex: "#D2691E" },
        { name: "Khaki", hex: "#F0E68C" },
        { name: "Plum", hex: "#DDA0DD" },
        { name: "Orchid", hex: "#DA70D6" },
        { name: "Crimson", hex: "#DC143C" },
        { name: "Hot Pink", hex: "#FF69B4" },
        { name: "Sky Blue", hex: "#87CEEB" },
        { name: "Royal Blue", hex: "#4169E1" },
        { name: "Sea Green", hex: "#2E8B57" },
        { name: "Forest Green", hex: "#228B22" },
        { name: "Dark Red", hex: "#8B0000" },
        { name: "Dark Blue", hex: "#00008B" },
        { name: "Dark Green", hex: "#006400" },
        { name: "Dark Violet", hex: "#9400D3" },
        { name: "Lavender", hex: "#E6E6FA" },
        { name: "Mint", hex: "#98FF98" },
        { name: "Peach", hex: "#FFE5B4" },
        { name: "Ivory", hex: "#FFFFF0" },
        { name: "Tan", hex: "#D2B48C" },
        { name: "Aquamarine", hex: "#7FFFD4" },
        { name: "Slate Gray", hex: "#708090" },
        { name: "Midnight Blue", hex: "#191970" },
        { name: "Azure", hex: "#F0FFFF" },
        { name: "Honeydew", hex: "#F0FFF0" },
        { name: "Snow", hex: "#FFFAFA" },
        { name: "Linen", hex: "#FAF0E6" },
        { name: "Moccasin", hex: "#FFE4B5" },
        { name: "Light Coral", hex: "#F08080" },
        { name: "Light Salmon", hex: "#FFA07A" },
        { name: "Light Sea Green", hex: "#20B2AA" },
        { name: "Light Steel Blue", hex: "#B0C4DE" },
        { name: "Light Sky Blue", hex: "#87CEFA" },
        { name: "Light Green", hex: "#90EE90" }
      ];

      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      // Create preview image using canvas
      const canvas = createCanvas(300, 300);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = randomColor.hex;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const buffer = canvas.toBuffer();

      // Send image + text
      await sock.sendMessage(jid, {
        image: buffer,
        caption: `🎨 *Random Color Generator*\n\n👉 Name: *${randomColor.name}*\n👉 Hex Code: *${randomColor.hex}*`
      }, { quoted: m });

    } catch (err) {
      console.error("Error in rcolor command:", err);
      await reply("❌ Error while fetching random color.");
    }
  },
};
