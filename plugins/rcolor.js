// No native deps, no canvas. Works on Node 20+ (fetch is built-in).
module.exports = {
  name: "rcolor",
  command: ["rcolor", "randomcolor", "color"],
  category: "fun",
  description: "Get a random (or requested) color with preview image",
  use: ".rcolor | .rcolor red | .rcolor #ff00ff",

  execute: async (sock, m, args) => {
    const jid = m?.key?.remoteJid;

    const reply = async (text) => {
      if (typeof m?.reply === "function") return m.reply(text);
      return sock.sendMessage(jid, { text }, { quoted: m });
    };

    // Big color map (name -> hex)
    const COLORS = [
      { name: "Red", hex: "#FF0000" }, { name: "Green", hex: "#00FF00" },
      { name: "Blue", hex: "#0000FF" }, { name: "Yellow", hex: "#FFFF00" },
      { name: "Cyan", hex: "#00FFFF" }, { name: "Magenta", hex: "#FF00FF" },
      { name: "Orange", hex: "#FFA500" }, { name: "Purple", hex: "#800080" },
      { name: "Pink", hex: "#FFC0CB" }, { name: "Brown", hex: "#A52A2A" },
      { name: "Gray", hex: "#808080" }, { name: "Black", hex: "#000000" },
      { name: "White", hex: "#FFFFFF" }, { name: "Lime", hex: "#32CD32" },
      { name: "Teal", hex: "#008080" }, { name: "Indigo", hex: "#4B0082" },
      { name: "Violet", hex: "#EE82EE" }, { name: "Gold", hex: "#FFD700" },
      { name: "Silver", hex: "#C0C0C0" }, { name: "Beige", hex: "#F5F5DC" },
      { name: "Maroon", hex: "#800000" }, { name: "Olive", hex: "#808000" },
      { name: "Navy", hex: "#000080" }, { name: "Turquoise", hex: "#40E0D0" },
      { name: "Coral", hex: "#FF7F50" }, { name: "Salmon", hex: "#FA8072" },
      { name: "Chocolate", hex: "#D2691E" }, { name: "Khaki", hex: "#F0E68C" },
      { name: "Plum", hex: "#DDA0DD" }, { name: "Orchid", hex: "#DA70D6" },
      { name: "Crimson", hex: "#DC143C" }, { name: "Hot Pink", hex: "#FF69B4" },
      { name: "Sky Blue", hex: "#87CEEB" }, { name: "Royal Blue", hex: "#4169E1" },
      { name: "Sea Green", hex: "#2E8B57" }, { name: "Forest Green", hex: "#228B22" },
      { name: "Dark Red", hex: "#8B0000" }, { name: "Dark Blue", hex: "#00008B" },
      { name: "Dark Green", hex: "#006400" }, { name: "Dark Violet", hex: "#9400D3" },
      { name: "Lavender", hex: "#E6E6FA" }, { name: "Mint", hex: "#98FF98" },
      { name: "Peach", hex: "#FFE5B4" }, { name: "Ivory", hex: "#FFFFF0" },
      { name: "Tan", hex: "#D2B48C" }, { name: "Aquamarine", hex: "#7FFFD4" },
      { name: "Slate Gray", hex: "#708090" }, { name: "Midnight Blue", hex: "#191970" },
      { name: "Azure", hex: "#F0FFFF" }, { name: "Honeydew", hex: "#F0FFF0" },
      { name: "Snow", hex: "#FFFAFA" }, { name: "Linen", hex: "#FAF0E6" },
      { name: "Moccasin", hex: "#FFE4B5" }, { name: "Light Coral", hex: "#F08080" },
      { name: "Light Salmon", hex: "#FFA07A" }, { name: "Light Sea Green", hex: "#20B2AA" },
      { name: "Light Steel Blue", hex: "#B0C4DE" }, { name: "Light Sky Blue", hex: "#87CEFA" },
      { name: "Light Green", hex: "#90EE90" }, { name: "Tomato", hex: "#FF6347" },
      { name: "Firebrick", hex: "#B22222" }, { name: "Sienna", hex: "#A0522D" },
      { name: "Dodger Blue", hex: "#1E90FF" }, { name: "Cornflower Blue", hex: "#6495ED" },
      { name: "Deep Pink", hex: "#FF1493" }, { name: "Deep Sky Blue", hex: "#00BFFF" },
      { name: "Spring Green", hex: "#00FF7F" }, { name: "Chartreuse", hex: "#7FFF00" },
      { name: "Dark Orange", hex: "#FF8C00" }, { name: "Pale Goldenrod", hex: "#EEE8AA" },
      { name: "Light Goldenrod", hex: "#FAFAD2" }, { name: "Gainsboro", hex: "#DCDCDC" },
      { name: "Rosy Brown", hex: "#BC8F8F" }, { name: "Thistle", hex: "#D8BFD8" }
    ];

    const nameToHex = new Map(COLORS.map(c => [c.name.toLowerCase(), c.hex]));

    // parse requested color if provided
    const pickColor = (argsArr) => {
      if (argsArr.length === 0) {
        return COLORS[Math.floor(Math.random() * COLORS.length)];
      }
      const q = argsArr.join(" ").trim().toLowerCase();
      // hex like #ff00ff or ff00ff
      const hexMatch = q.match(/^#?([0-9a-f]{6}|[0-9a-f]{3})$/i);
      if (hexMatch) {
        let hex = hexMatch[1];
        if (hex.length === 3) hex = hex.split("").map(x => x + x).join("");
        return { name: `Custom`, hex: `#${hex.toUpperCase()}` };
      }
      if (nameToHex.has(q)) {
        return { name: capitalize(q), hex: nameToHex.get(q) };
      }
      // fuzzy: find first name containing the query
      const hit = COLORS.find(c => c.name.toLowerCase().includes(q));
      return hit || COLORS[Math.floor(Math.random() * COLORS.length)];
    };

    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    try {
      const chosen = pickColor(args || []);
      const hexNoHash = chosen.hex.replace("#", "");

      // Use a lightweight color image service (no API, returns solid PNG)
      // Example: https://singlecolorimage.com/get/FF0000/300x300
      const imgUrl = `https://singlecolorimage.com/get/${hexNoHash}/300x300`;

      // Fetch image with Node 20's built-in fetch
      const res = await fetch(imgUrl);
      if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`);
      const arr = await res.arrayBuffer();
      const buffer = Buffer.from(arr);

      await sock.sendMessage(
        jid,
        {
          image: buffer,
          caption:
            `🎨 *Random Color*\n` +
            `👉 Name: *${chosen.name}*\n` +
            `👉 Hex: *${chosen.hex}*\n\n` +
            `Tip: You can request a color:\n• *.rcolor red*\n• *.rcolor #ff69b4*`
        },
        { quoted: m }
      );
    } catch (err) {
      console.error("rcolor error:", err);
      await reply("❌ Couldn't generate color preview. Try again or use plain text: *.rcolor red*");
    }
  }
};
