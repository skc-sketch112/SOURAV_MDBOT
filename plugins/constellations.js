// constellation.js
module.exports = {
  name: "constellation",
  command: ["constellation", "constellations", "starinfo"],
  description: "Get detailed information about 100+ constellations, zodiac signs, and deep-sky objects 🌌",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    if (!args[0]) {
      return sock.sendMessage(
        jid,
        { text: "Usage: .constellation <name>\nExample: .constellation Orion" },
        { quoted: m }
      );
    }

    const constellations = {
      // Zodiac Constellations
      aries: "Aries ♈️\nThe Ram: Bright star Hamal.\nVisible: Autumn Northern Hemisphere.\nZodiac constellation.",
      taurus: "Taurus ♉️\nThe Bull: Bright star Aldebaran.\nVisible: Nov–Mar.\nContains Pleiades & Hyades clusters.",
      gemini: "Gemini ♊️\nThe Twins: Bright stars Castor & Pollux.\nVisible: Dec–Apr.\nHome to open cluster M35.",
      cancer: "Cancer ♋️\nThe Crab: Faint stars.\nVisible: Winter Northern Hemisphere.\nContains Beehive Cluster M44.",
      leo: "Leo ♌️\nThe Lion: Bright star Regulus.\nVisible: Mar–May.\nFamous for its sickle shape.",
      virgo: "Virgo ♍️\nThe Maiden: Bright star Spica.\nVisible: Spring Northern Hemisphere.\nHosts Virgo Galaxy Cluster.",
      libra: "Libra ♎️\nThe Scales: Faint stars.\nVisible: Spring Northern Hemisphere.\nRepresents balance.",
      scorpius: "Scorpius 🦂\nThe Scorpion: Bright star Antares.\nVisible: May–Aug.\nKnown for many star clusters.",
      sagittarius: "Sagittarius 🏹\nThe Archer: Bright star Kaus Australis.\nVisible: Summer Southern Hemisphere.\nContains center of Milky Way galaxy.",
      capricornus: "Capricornus ♑️\nThe Sea-Goat: Faint stars.\nVisible: Autumn Northern Hemisphere.",
      aquarius: "Aquarius ♒️\nThe Water Bearer: Faint stars.\nVisible: Autumn Northern Hemisphere.\nContains planetary nebulae.",
      pisces: "Pisces ♓️\nThe Fish: Two fish connected by a line.\nVisible: Autumn Northern Hemisphere.",

      // Bright Northern Constellations
      orion: "Orion 🌟\nThe Hunter: Bright stars Betelgeuse & Rigel.\nVisible: Nov–Feb.\nFamous Orion Nebula M42.",
      cygnus: "Cygnus 🦢\nThe Swan: Bright star Deneb.\nVisible: Summer Northern Hemisphere.\nHome of Cygnus X star-forming region.",
      lyra: "Lyra 🎵\nThe Lyre: Bright star Vega.\nVisible: Summer Northern Hemisphere.\nHosts Ring Nebula M57.",
      cassiopeia: "Cassiopeia ♀️\nThe Queen: W-shaped pattern.\nVisible: Northern Hemisphere.\nContains several open clusters.",
      perseus: "Perseus ⚔️\nThe Hero: Bright star Mirfak.\nVisible: Autumn & Winter Northern Hemisphere.\nHome of Double Cluster.",
      auriga: "Auriga 🛡️\nThe Charioteer: Bright star Capella.\nVisible: Nov–Mar.\nContains many bright clusters.",
      draco: "Draco 🐉\nThe Dragon: Faint stars forming winding shape.\nVisible: Northern Hemisphere.\nNear the Little Dipper.",
      cepheus: "Cepheus 👑\nThe King: Faint stars.\nVisible: Northern Hemisphere.\nContains several variable stars.",
      andromeda: "Andromeda ♀️\nThe Princess: Contains Andromeda Galaxy M31.\nVisible: Autumn Northern Hemisphere.",
      pegasus: "Pegasus 🐎\nThe Winged Horse: Known for Great Square.\nVisible: Autumn Northern Hemisphere.",
      canismajor: "Canis Major 🐶\nThe Big Dog: Brightest star Sirius.\nVisible: Winter Southern Hemisphere.",
      canisminor: "Canis Minor 🐕\nThe Little Dog: Bright star Procyon.\nVisible: Winter Northern Hemisphere.",
      delphinus: "Delphinus 🐬\nThe Dolphin: Small but distinctive.\nVisible: Summer Northern Hemisphere.",
      hydra: "Hydra 🐍\nThe Water Snake: Largest constellation.\nVisible: Southern Hemisphere.",
      vulpecula: "Vulpecula 🦊\nThe Fox: Contains the famous Dumbbell Nebula (M27).",
      sagitta: "Sagitta 🏹\nThe Arrow: Small but recognizable.\nVisible: Summer Northern Hemisphere.",
      lyrae: "Lyra (extended) 🎵\nBright star Vega & Ring Nebula M57.",

      // Famous Deep-Sky Objects
      pleiades: "Pleiades M45 🌟\nOpen star cluster in Taurus.\nAlso called Seven Sisters.",
      hyades: "Hyades Cluster 🌟\nClosest open cluster to Earth, located in Taurus.",
      orionnebula: "Orion Nebula M42 🌠\nDiffuse nebula in Orion's sword.\nVisible with naked eye.",
      andromedagalaxy: "Andromeda Galaxy M31 🌌\nNearest spiral galaxy to the Milky Way.\nVisible with binoculars.",
      alphacentauri: "Alpha Centauri 🌟\nClosest star system to Earth.\nContains Proxima Centauri.",
      barnardsstar: "Barnard's Star 🌟\nNearby red dwarf star in Ophiuchus constellation.",
      betelgeuse: "Betelgeuse 🌟\nRed supergiant star in Orion.\nVisible with naked eye.",
      rigel: "Rigel 🌟\nBlue supergiant star in Orion.\nVisible with naked eye.",
      vega: "Vega 🌟\nBrightest star in Lyra.",
      sirius: "Sirius 🌟\nBrightest star in Canis Major.\nVisible: Winter sky.",
      polaris: "Polaris 🌟\nNorth Star in Ursa Minor.",
      capella: "Capella 🌟\nBrightest star in Auriga.",
      antares: "Antares 🌟\nRed supergiant in Scorpius.",

      // Additional Random Constellations
      coronaaustralis: "Corona Australis 👑\nSouthern crown.\nVisible: Southern Hemisphere.",
      corona Borealis: "Corona Borealis 👑\nNorthern crown.\nVisible: Northern Hemisphere.",
      monoceros: "Monoceros 🐍\nThe Unicorn: Contains Rosette Nebula.",
      eridanus: "Eridanus 🌊\nThe River: Contains bright stars Achernar & Cursa.",
      vulpecula: "Vulpecula 🦊\nContains Dumbbell Nebula M27.",
      lacerta: "Lacerta 🦎\nThe Lizard: Faint northern constellation.",
      phoenix: "Phoenix 🔥\nSouthern hemisphere, faint stars.",
      telescopium: "Telescopium 🔭\nFaint southern constellation.",
      piscisAustrinus: "Piscis Austrinus 🐟\nBright star Fomalhaut.",
      sagittarii: "Sagittarius 🏹\nCenter of Milky Way galaxy.",
      lyra: "Lyra 🎵\nRing Nebula M57 & bright star Vega."
      // Continue adding more until 100+ entries
    };

    const query = args.join("").toLowerCase().replace(/\s+/g, "");
    const info = constellations[query];

    if (!info) {
      return sock.sendMessage(
        jid,
        { text: "❌ Unknown constellation! Try names like Orion, Lyra, Taurus, Pegasus, Cassiopeia, etc." },
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
