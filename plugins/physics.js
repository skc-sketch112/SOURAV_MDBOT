const math = require("mathjs");

module.exports = {
    name: "physics",
    command: ["physics", "formula", "phys"],
    description: "Physics formula calculator (unlimited)",
    async execute(sock, m, args) {
        if (!args[0]) {
            return sock.sendMessage(m.key.remoteJid, {
                text: `⚡ Example:\n.physics list\n.physics gravity m1=5 m2=10 r=2\n.physics find kinetic`
            }, { quoted: m });
        }

        // 📚 Formula Bank
        const formulas = {
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
                desc: "Energy in Capacitor",
                vars: ["C", "V"],
                expr: "0.5 * C * V^2",
                unit: "J"
            },
            relativityE: {
                desc: "Einstein’s Mass-Energy Equivalence",
                vars: ["m", "c"],
                expr: "m * c^2",
                unit: "J"
            },
            deBroglie: {
                desc: "de Broglie Wavelength",
                vars: ["h", "p"],
                expr: "h / p",
                unit: "m"
            }
        };

        const key = args[0];

        // Show list of formulas
        if (key === "list") {
            return sock.sendMessage(m.key.remoteJid, {
                text: "📚 Available Formulas:\n" +
                      Object.keys(formulas).map(f => `- ${f}`).join("\n")
            }, { quoted: m });
        }

        // Show details of formula
        if (key === "find") {
            const formulaName = args[1];
            if (!formulas[formulaName]) {
                return sock.sendMessage(m.key.remoteJid, { text: "❌ Formula not found." }, { quoted: m });
            }
            const f = formulas[formulaName];
            return sock.sendMessage(m.key.remoteJid, {
                text: `📖 Formula: ${formulaName}\nℹ️ ${f.desc}\n🔑 Variables: ${f.vars.join(", ")}\n📐 Unit: ${f.unit}`
            }, { quoted: m });
        }

        // Solve formula
        if (!formulas[key]) {
            return sock.sendMessage(m.key.remoteJid, { text: "❌ Formula not found." }, { quoted: m });
        }

        const f = formulas[key];
        const vars = {};
        args.slice(1).forEach(pair => {
            const [k, v] = pair.split("=");
            if (k && v) vars[k] = parseFloat(v);
        });

        const missing = f.vars.filter(v => !(v in vars));
        if (missing.length) {
            return sock.sendMessage(m.key.remoteJid, {
                text: `⚠️ Missing variables: ${missing.join(", ")}`
            }, { quoted: m });
        }

        try {
            const result = math.evaluate(f.expr, vars);
            await sock.sendMessage(m.key.remoteJid, {
                text: `✅ Result for ${key}\nInput: ${JSON.stringify(vars)}\nOutput: ${result} ${f.unit}`
            }, { quoted: m });
        } catch (err) {
            await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Error calculating. Check input values." }, { quoted: m });
        }
    }
};
