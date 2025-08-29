const math = require("mathjs");

module.exports = {
  name: "formula",
  alias: ["physics", "phys"],
  desc: "Physics formula calculator (Unlimited)",
  category: "education",

  async exec(client, m, { text, prefix, command }) {
    if (!text) {
      return m.reply(`⚡ Example:
${prefix + command} list
${prefix + command} gravity m1=5 m2=10 r=2
${prefix + command} find kinetic`);
    }

    // 📚 UNLIMITED FORMULA BANK
    const formulas = {
      // --- Mechanics ---
      gravity: {
        desc: "Newton's law of gravitation",
        vars: ["m1", "m2", "r"],
        expr: "6.674e-11 * m1 * m2 / (r^2)",
        unit: "N"
      },
      force: {
        desc: "Newton's 2nd law",
        vars: ["m", "a"],
        expr: "m * a",
        unit: "N"
      },
      momentum: {
        desc: "Momentum",
        vars: ["m", "v"],
        expr: "m * v",
        unit: "kg·m/s"
      },
      kinetic: {
        desc: "Kinetic Energy",
        vars: ["m", "v"],
        expr: "0.5 * m * v^2",
        unit: "J"
      },
      potential: {
        desc: "Potential Energy",
        vars: ["m", "g", "h"],
        expr: "m * g * h",
        unit: "J"
      },
      work: {
        desc: "Work Done",
        vars: ["F", "d"],
        expr: "F * d",
        unit: "J"
      },
      power: {
        desc: "Power",
        vars: ["W", "t"],
        expr: "W / t",
        unit: "W"
      },
      pressure: {
        desc: "Pressure",
        vars: ["F", "A"],
        expr: "F / A",
        unit: "Pa"
      },
      density: {
        desc: "Density",
        vars: ["m", "V"],
        expr: "m / V",
        unit: "kg/m³"
      },

      // --- Waves & Oscillations ---
      wave: {
        desc: "Wave Speed",
        vars: ["f", "λ"],
        expr: "f * λ",
        unit: "m/s"
      },
      frequency: {
        desc: "Frequency",
        vars: ["T"],
        expr: "1 / T",
        unit: "Hz"
      },
      period: {
        desc: "Time Period",
        vars: ["f"],
        expr: "1 / f",
        unit: "s"
      },

      // --- Thermodynamics ---
      heat: {
        desc: "Heat Transfer",
        vars: ["m", "c", "ΔT"],
        expr: "m * c * ΔT",
        unit: "J"
      },
      idealGas: {
        desc: "Ideal Gas Law",
        vars: ["n", "R", "T", "V"],
        expr: "(n * R * T) / V",
        unit: "Pa"
      },

      // --- Electricity & Magnetism ---
      ohm: {
        desc: "Ohm’s Law",
        vars: ["V", "R"],
        expr: "V / R",
        unit: "A"
      },
      coulomb: {
        desc: "Coulomb’s Law",
        vars: ["q1", "q2", "r"],
        expr: "(9e9 * q1 * q2) / (r^2)",
        unit: "N"
      },
      capacitance: {
        desc: "Capacitance",
        vars: ["Q", "V"],
        expr: "Q / V",
        unit: "F"
      },
      energyCap: {
        desc: "Energy Stored in Capacitor",
        vars: ["C", "V"],
        expr: "0.5 * C * V^2",
        unit: "J"
      },
      emf: {
        desc: "Faraday’s Law (EMF)",
        vars: ["N", "ΔΦ", "Δt"],
        expr: "-N * (ΔΦ / Δt)",
        unit: "V"
      },

      // --- Relativity ---
      relativityE: {
        desc: "Einstein’s Mass-Energy Equivalence",
        vars: ["m", "c"],
        expr: "m * c^2",
        unit: "J"
      },

      // --- Modern Physics ---
      deBroglie: {
        desc: "de Broglie Wavelength",
        vars: ["h", "p"],
        expr: "h / p",
        unit: "m"
      }
    };

    const args = text.split(" ");

    // --- List all formulas
    if (args[0] === "list") {
      return m.reply(
        "📚 Available Formulas:\n" +
        Object.keys(formulas).map(f => `- ${f}`).join("\n")
      );
    }

    // --- Find info
    if (args[0] === "find") {
      const key = args[1];
      if (!formulas[key]) return m.reply("❌ Formula not found.");
      const f = formulas[key];
      return m.reply(
        `📖 Formula: ${key}\nℹ️ ${f.desc}\n🔑 Variables: ${f.vars.join(", ")}\n📐 Unit: ${f.unit}`
      );
    }

    // --- Solve a formula
    const key = args[0];
    if (!formulas[key]) return m.reply("❌ Formula not found.");

    const vars = {};
    args.slice(1).forEach(pair => {
      const [k, v] = pair.split("=");
      if (k && v) vars[k] = parseFloat(v);
    });

    const f = formulas[key];
    const missing = f.vars.filter(v => !(v in vars));
    if (missing.length) {
      return m.reply(`⚠️ Missing variables: ${missing.join(", ")}`);
    }

    try {
      const result = math.evaluate(f.expr, vars);
      m.reply(
        `✅ Result for ${key}\n` +
        `Input: ${JSON.stringify(vars)}\n` +
        `Output: ${result} ${f.unit}`
      );
    } catch (err) {
      m.reply("⚠️ Error calculating. Check input values.");
    }
  }
};
