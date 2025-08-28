// planet.js
module.exports = {
  name: "planet",
  command: ["planet", "planetinfo", "celestial"],
  description: "Get detailed info about planets, moons, dwarf planets, asteroids, and comets",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    if (!args[0]) {
      return sock.sendMessage(
        jid,
        { text: "Usage: .planet <name>\nExample: .planet Mars\nSupports planets, moons, dwarf planets, asteroids, and comets." },
        { quoted: m }
      );
    }

    const bodies = {
      // Planets
      mercury: "Mercury 🌑\nDistance from Sun: 57.9 million km\nDiameter: 4,879 km\nFun fact: Fastest orbiting planet, year = 88 Earth days.",
      venus: "Venus 🌕\nDistance from Sun: 108.2 million km\nDiameter: 12,104 km\nFun fact: Hottest planet due to greenhouse effect.",
      earth: "Earth 🌍\nDistance from Sun: 149.6 million km\nDiameter: 12,742 km\nFun fact: Only planet known to support life.",
      mars: "Mars ♂️\nDistance from Sun: 227.9 million km\nDiameter: 6,779 km\nFun fact: Red color due to iron oxide surface.",
      jupiter: "Jupiter ♃\nDistance from Sun: 778.5 million km\nDiameter: 139,820 km\nFun fact: Largest planet with the Great Red Spot storm.",
      saturn: "Saturn ♄\nDistance from Sun: 1.43 billion km\nDiameter: 116,460 km\nFun fact: Known for its stunning ring system.",
      uranus: "Uranus ♅\nDistance from Sun: 2.87 billion km\nDiameter: 50,724 km\nFun fact: Rotates on its side, unique among planets.",
      neptune: "Neptune ♆\nDistance from Sun: 4.5 billion km\nDiameter: 49,244 km\nFun fact: Supersonic winds, deep blue color.",

      // Dwarf Planets
      pluto: "Pluto ❄️\nDistance from Sun: 5.9 billion km\nDiameter: 2,377 km\nFun fact: Dwarf planet with 5 known moons.",
      ceres: "Ceres 🪐\nDistance from Sun: 414 million km\nDiameter: 940 km\nFun fact: Largest object in asteroid belt.",
      makemake: "Makemake ❄️\nDistance from Sun: 6.85 billion km\nDiameter: 1,430 km\nFun fact: Dwarf planet in the Kuiper belt.",
      haumea: "Haumea 🪐\nDistance from Sun: 6.45 billion km\nDiameter: 1,632 km\nFun fact: Rapid rotation makes it elongated.",
      eris: "Eris ❄️\nDistance from Sun: 10.1 billion km\nDiameter: 2,326 km\nFun fact: Dwarf planet, slightly smaller than Pluto.",

      // Earth's Moon
      moon: "Moon 🌕\nDistance from Earth: 384,400 km\nDiameter: 3,474 km\nFun fact: Earth's only natural satellite.",

      // Mars Moons
      phobos: "Phobos ♂️\nMars' moon\nDiameter: 22 km\nFun fact: Orbits Mars very quickly, 7.7 hours per orbit.",
      deimos: "Deimos ♂️\nMars' moon\nDiameter: 12 km\nFun fact: Slowly moving away from Mars, irregular shape.",

      // Jupiter Moons
      io: "Io 🌋\nJupiter's moon\nDiameter: 3,643 km\nFun fact: Most volcanically active body in the solar system.",
      europa: "Europa ❄️\nJupiter's moon\nDiameter: 3,121 km\nFun fact: Surface ice may hide a liquid ocean underneath.",
      ganymede: "Ganymede 🌌\nJupiter's moon\nDiameter: 5,268 km\nFun fact: Largest moon in the solar system, bigger than Mercury.",
      callisto: "Callisto 🪐\nJupiter's moon\nDiameter: 4,821 km\nFun fact: Heavily cratered and ancient surface.",

      // Saturn Moons
      titan: "Titan 🛸\nSaturn's moon\nDiameter: 5,151 km\nFun fact: Thick nitrogen-rich atmosphere, lakes of methane.",
      enceladus: "Enceladus ❄️\nSaturn's moon\nDiameter: 504 km\nFun fact: Water ice geysers from south pole.",

      // Uranus Moons
      miranda: "Miranda 🪐\nUranus' moon\nDiameter: 471 km\nFun fact: Extreme cliffs and varied terrain.",

      // Neptune Moons
      triton: "Triton 🌌\nNeptune's moon\nDiameter: 2,710 km\nFun fact: Retrograde orbit, icy geysers present.",

      // Pluto Moons
      charon: "Charon ❄️\nPluto's moon\nDiameter: 1,212 km\nFun fact: Almost half Pluto's size, tidally locked.",

      // Famous Asteroids
      vesta: "Vesta 🪨\nAsteroid\nDiameter: 525 km\nFun fact: Second-largest in asteroid belt.",
      pallas: "Pallas 🪨\nAsteroid\nDiameter: 512 km\nFun fact: One of the first asteroids discovered.",
      hygiea: "Hygiea 🪨\nAsteroid\nDiameter: 434 km\nFun fact: Largest C-type asteroid.",

      // Famous Comets
      halley: "Halley's Comet ☄️\nOrbital period: 76 years\nFun fact: Last seen in 1986, next in 2061.",
      hale_bopp: "Hale-Bopp ☄️\nOrbital period: 2,533 years\nFun fact: Very bright comet visible in 1997.",
      swift_tuttle: "Swift-Tuttle ☄️\nOrbital period: 133 years\nFun fact: Parent of Perseid meteor shower.",

      // Fun extras (minor planets and moons)
      sedna: "Sedna ❄️\nDwarf planet\nDistance from Sun: 86 billion km\nFun fact: One of the most distant known solar system objects.",
      makemake_2: "Makemake II ❄️\nMoon of Makemake\nDiameter: 160 km\nFun fact: Very small moon in Kuiper belt.",
      dysnomia: "Dysnomia ❄️\nMoon of Eris\nDiameter: 700 km\nFun fact: Tiny moon of distant dwarf planet Eris."
      // You can continue adding moons, comets, minor planets up to 100+ here
    };

    const name = args[0].toLowerCase();
    const info = bodies[name];

    if (!info) {
      return sock.sendMessage(
        jid,
        { text: "❌ Unknown celestial body! Try planets, moons, dwarf planets, asteroids, or comets.\nExamples: Mars, Moon, Titan, Pluto, Halley" },
        { quoted: m }
      );
    }

    await sock.sendMessage(jid, { text: info }, { quoted: m });
  }
};
