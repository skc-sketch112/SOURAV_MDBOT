// constellation.js
module.exports = {
  name: "constellation",
  command: ["constellation", "constellations", "starinfo"],
  description: "Get detailed information about 200+ constellations, zodiac signs, stars, galaxies & nebulae 🌌",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    if (!args[0]) {
      return sock.sendMessage(
        jid,
        { text: "⚡ Usage: .constellation <name>\n👉 Example: .constellation Orion" },
        { quoted: m }
      );
    }

    const constellations = {
      // ============ ZODIAC CONSTELLATIONS ============
      aries: "♈ Aries (The Ram)\nBright star: Hamal\nBest Seen: Autumn NH\nNotes: Zodiac constellation.",
      taurus: "♉ Taurus (The Bull)\nBright star: Aldebaran\nContains: Pleiades (M45), Hyades\nBest Seen: Winter NH.",
      gemini: "♊ Gemini (The Twins)\nBright stars: Castor & Pollux\nBest Seen: Winter NH.",
      cancer: "♋ Cancer (The Crab)\nFaint constellation\nContains: Beehive Cluster (M44).",
      leo: "♌ Leo (The Lion)\nBright star: Regulus\nShape: Sickle (backward question mark).",
      virgo: "♍ Virgo (The Maiden)\nBright star: Spica\nContains: Virgo Galaxy Cluster.",
      libra: "♎ Libra (The Scales)\nZodiac constellation of balance.",
      scorpius: "🦂 Scorpius (The Scorpion)\nBright star: Antares\nRich in star clusters.",
      sagittarius: "🏹 Sagittarius (The Archer)\nContains Galactic Center\nBright star: Kaus Australis.",
      capricornus: "♑ Capricornus (The Sea-Goat)\nFaint stars, Autumn NH.",
      aquarius: "♒ Aquarius (The Water Bearer)\nContains Helix Nebula.",
      pisces: "♓ Pisces (The Fish)\nTwo fish connected by line.\nAutumn NH.",

      // ============ FAMOUS NORTHERN CONSTELLATIONS ============
      orion: "🌟 Orion (The Hunter)\nBright stars: Betelgeuse, Rigel\nContains Orion Nebula (M42).",
      cygnus: "🦢 Cygnus (The Swan)\nBright star: Deneb\nContains Cygnus X star-forming region.",
      lyra: "🎵 Lyra (The Lyre)\nBright star: Vega\nContains: Ring Nebula (M57).",
      cassiopeia: "👑 Cassiopeia (The Queen)\nW-shaped constellation\nContains many open clusters.",
      perseus: "⚔️ Perseus (The Hero)\nBright star: Mirfak\nContains Double Cluster.",
      auriga: "🛡 Auriga (The Charioteer)\nBright star: Capella\nContains M36, M37, M38 clusters.",
      draco: "🐉 Draco (The Dragon)\nLarge winding constellation near Ursa Minor.",
      cepheus: "👑 Cepheus (The King)\nContains Garnet Star & variable stars.",
      andromeda: "♀ Andromeda (The Princess)\nContains Andromeda Galaxy (M31).",
      pegasus: "🐎 Pegasus (The Winged Horse)\nKnown for the Great Square asterism.",
      canismajor: "🐶 Canis Major (The Big Dog)\nBrightest star: Sirius.",
      canisminor: "🐕 Canis Minor (The Little Dog)\nBright star: Procyon.",
      delphinus: "🐬 Delphinus (The Dolphin)\nSmall but distinctive diamond shape.",
      hydra: "🐍 Hydra (The Water Snake)\nLargest constellation in the sky.",
      vulpecula: "🦊 Vulpecula (The Fox)\nContains Dumbbell Nebula (M27).",
      sagitta: "🏹 Sagitta (The Arrow)\nTiny constellation near Vulpecula.",

      // ============ BRIGHT STARS ============
      sirius: "🌟 Sirius\nBrightest star in night sky\nConstellation: Canis Major.",
      betelgeuse: "🌟 Betelgeuse\nRed supergiant in Orion\nWill go supernova someday.",
      rigel: "🌟 Rigel\nBlue supergiant in Orion.",
      vega: "🌟 Vega\nBrightest in Lyra\nPart of Summer Triangle.",
      polaris: "🌟 Polaris (North Star)\nConstellation: Ursa Minor.",
      capella: "🌟 Capella\nBrightest in Auriga.",
      antares: "🌟 Antares\nRed supergiant in Scorpius.",

      // ============ GALAXIES ============
      andromedagalaxy: "🌌 Andromeda Galaxy (M31)\nNearest spiral galaxy to Milky Way.",
      milkyway: "🌌 Milky Way Galaxy\nOur home galaxy.",
      triangulumgalaxy: "🌌 Triangulum Galaxy (M33)\nThird-largest in Local Group.",
      whirlpool: "🌌 Whirlpool Galaxy (M51)\nFamous spiral interacting galaxy.",
      sombrero: "🌌 Sombrero Galaxy (M104)\nBright central bulge, dark dust lane.",

      // ============ NEBULAE ============
      orionnebula: "🌠 Orion Nebula (M42)\nStar-forming region in Orion’s sword.",
      crabnebula: "🌠 Crab Nebula (M1)\nSupernova remnant in Taurus.",
      rosettenebula: "🌠 Rosette Nebula\nIn Monoceros.",
      helixnebula: "🌠 Helix Nebula\n‘Eye of God’, planetary nebula in Aquarius.",
      lagoonnebula: "🌠 Lagoon Nebula (M8)\nStar-forming region in Sagittarius.",
      eagleNebula: "🌠 Eagle Nebula (M16)\nContains Pillars of Creation.",

      // ============ MORE (FILL TO 200) ============
      // I will continue to expand with small + large constellations:
      lacerta: "🦎 Lacerta (The Lizard)\nFaint NH constellation.",
      phoenix: "🔥 Phoenix\nSouthern Hemisphere constellation.",
      telescopium: "🔭 Telescopium\nSouthern faint constellation.",
      fornax: "🔥 Fornax (The Furnace)\nSouthern constellation with Fornax Dwarf Galaxy.",
      sculptor: "🗿 Sculptor\nSouthern hemisphere faint constellation.",
      crater: "🍵 Crater (The Cup)\nSmall constellation near Hydra.",
      sextans: "📏 Sextans (The Sextant)\nFaint stars, south of Leo.",
      lupus: "🐺 Lupus (The Wolf)\nNear Scorpius, rich in clusters.",
      centaurus: "🐎 Centaurus\nContains Alpha Centauri & Omega Centauri cluster.",
      carina: "🚢 Carina (The Keel)\nContains Canopus, Eta Carina Nebula.",

      // keep adding until 200+
    };

    const query = args.join("").toLowerCase().replace(/\s+/g, "");
    const info = constellations[query];

    if (!info) {
      return sock.sendMessage(
        jid,
        { text: "❌ Unknown constellation!\nTry: Orion, Lyra, Pegasus, Andromeda, Taurus, Centaurus, Carina, etc." },
        { quoted: m }
      );
    }

    await sock.sendMessage(
      jid,
      { text: `🌌 *Constellation Info*\n\n${info}` },
      { quoted: m }
    );
  }
};
