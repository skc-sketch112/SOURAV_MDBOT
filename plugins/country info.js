const fetch = require("node-fetch");

module.exports = {
    name: "countryinfo",
    command: ["country", "countryinfo", "nation"],
    description: "Get detailed information about any country",

    execute: async (sock, m, args) => {
        try {
            if (!args[0]) {
                await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ Please provide a country name.\n👉 Example: .country India" },
                    { quoted: m }
                );
                return;
            }

            const query = args.join(" ");
            const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fullText=true`;

            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch country info");
            const data = await res.json();

            if (!data || !data[0]) {
                await sock.sendMessage(
                    m.key.remoteJid,
                    { text: `⚠️ No information found for *${query}*.` },
                    { quoted: m }
                );
                return;
            }

            const country = data[0];

            // 📝 Extract details
            const name = country.name?.common || "N/A";
            const official = country.name?.official || "N/A";
            const capital = country.capital ? country.capital.join(", ") : "N/A";
            const region = country.region || "N/A";
            const subregion = country.subregion || "N/A";
            const population = country.population?.toLocaleString() || "N/A";
            const area = country.area ? `${country.area.toLocaleString()} km²` : "N/A";
            const languages = country.languages ? Object.values(country.languages).join(", ") : "N/A";
            const currency = country.currencies
                ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol})`).join(", ")
                : "N/A";
            const timezone = country.timezones ? country.timezones.join(", ") : "N/A";
            const flag = country.flags?.png || country.flags?.svg;

            // 📝 Build message
            let msg = `🌍 *COUNTRY INFORMATION*\n\n`;
            msg += `🏳️ *Name*: ${name}\n`;
            msg += `📜 *Official*: ${official}\n`;
            msg += `🏛️ *Capital*: ${capital}\n`;
            msg += `🌎 *Region*: ${region}\n`;
            msg += `🗺️ *Subregion*: ${subregion}\n`;
            msg += `👫 *Population*: ${population}\n`;
            msg += `📐 *Area*: ${area}\n`;
            msg += `🗣️ *Languages*: ${languages}\n`;
            msg += `💰 *Currency*: ${currency}\n`;
            msg += `⏰ *Timezone*: ${timezone}\n`;

            // ✅ Send with flag if available
            if (flag) {
                await sock.sendMessage(
                    m.key.remoteJid,
                    {
                        image: { url: flag },
                        caption: msg
                    },
                    { quoted: m }
                );
            } else {
                await sock.sendMessage(m.key.remoteJid, { text: msg }, { quoted: m });
            }

        } catch (err) {
            console.error("❌ Country info error:", err);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "⚠️ Failed to fetch country info, please try again later." },
                { quoted: m }
            );
        }
    }
};
