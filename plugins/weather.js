// plugins/weather.js
const axios = require("axios");

// ───────────────── Helper: extract command if index doesn't pass it ─────────────────
function getBodyText(m) {
  return (
    m?.message?.conversation ||
    m?.message?.extendedTextMessage?.text ||
    m?.message?.imageMessage?.caption ||
    m?.message?.videoMessage?.caption ||
    ""
  );
}

// ───────────────── Weather code → emoji & label ─────────────────
const WEATHER_CODE = {
  0:  ["☀️", "Clear sky"],
  1:  ["🌤️", "Mainly clear"],
  2:  ["⛅", "Partly cloudy"],
  3:  ["☁️", "Overcast"],
  45: ["🌫️", "Fog"],
  48: ["🌫️", "Depositing rime fog"],
  51: ["🌦️", "Light drizzle"],
  53: ["🌦️", "Moderate drizzle"],
  55: ["🌦️", "Dense drizzle"],
  56: ["🌧️", "Freezing drizzle (light)"],
  57: ["🌧️", "Freezing drizzle (dense)"],
  61: ["🌧️", "Slight rain"],
  63: ["🌧️", "Moderate rain"],
  65: ["🌧️", "Heavy rain"],
  66: ["🌧️", "Freezing rain (light)"],
  67: ["🌧️", "Freezing rain (heavy)"],
  71: ["🌨️", "Slight snow fall"],
  73: ["🌨️", "Moderate snow fall"],
  75: ["🌨️", "Heavy snow fall"],
  77: ["❄️", "Snow grains"],
  80: ["🌦️", "Rain showers (slight)"],
  81: ["🌦️", "Rain showers (moderate)"],
  82: ["🌧️", "Rain showers (violent)"],
  85: ["🌨️", "Snow showers (slight)"],
  86: ["🌨️", "Snow showers (heavy)"],
  95: ["⛈️", "Thunderstorm (slight/moderate)"],
  96: ["⛈️", "Thunderstorm with slight hail"],
  99: ["⛈️", "Thunderstorm with heavy hail"],
};

function fmtTime(iso, tz) {
  // iso is already in local time if we request timezone in API
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz });
  } catch {
    return iso;
  }
}

// ───────────────── Open-Meteo: geocode → current weather / forecast ─────────────────
async function geocodeOpenMeteo(place) {
  const url = "https://geocoding-api.open-meteo.com/v1/search";
  const { data } = await axios.get(url, {
    params: { name: place, count: 1, language: "en", format: "json" },
    timeout: 12000,
  });
  if (!data || !data.results || data.results.length === 0) throw new Error("GEO_NOT_FOUND");
  const r = data.results[0];
  return {
    name: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
    lat: r.latitude,
    lon: r.longitude,
    tz: r.timezone || "auto",
  };
}

async function fetchOpenMeteoCurrent(lat, lon, tz = "auto") {
  const url = "https://api.open-meteo.com/v1/forecast";
  const { data } = await axios.get(url, {
    params: {
      latitude: lat,
      longitude: lon,
      current_weather: true,
      hourly: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weathercode",
      forecast_days: 2,
      timezone: tz,
    },
    timeout: 12000,
  });
  return data;
}

async function fetchOpenMeteoDaily(lat, lon, tz = "auto") {
  const url = "https://api.open-meteo.com/v1/forecast";
  const { data } = await axios.get(url, {
    params: {
      latitude: lat,
      longitude: lon,
      daily: "weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max",
      forecast_days: 3,
      timezone: tz,
    },
    timeout: 12000,
  });
  return data;
}

// ───────────────── Fallback: wttr.in JSON (no key) ─────────────────
async function fetchWttr(city) {
  const { data } = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, { timeout: 12000 });
  return data;
}

// ───────────────── Build messages ─────────────────
function buildCurrentMessage(place, omData) {
  const { current_weather, hourly, timezone } = omData;
  const code = current_weather?.weathercode ?? 0;
  const [emoji, desc] = WEATHER_CODE[code] || ["🌈", "Weather"];
  const temp = Math.round(current_weather?.temperature ?? 0);
  const wind = Math.round(current_weather?.windspeed ?? 0);

  // next 6 hours preview
  let preview = "";
  try {
    const times = hourly.time;
    const temps = hourly.temperature_2m;
    const codes = hourly.weathercode;
    const hums = hourly.relative_humidity_2m;
    const feels = hourly.apparent_temperature;

    // find current index or start
    const idxStart = Math.max(0, times.findIndex(t => new Date(t) >= new Date(current_weather.time)));
    const end = Math.min(times.length, idxStart + 6);
    const slices = [];
    for (let i = idxStart; i < end; i++) {
      const c = WEATHER_CODE[codes[i]] || ["🌈", ""];
      slices.push(
        `${fmtTime(times[i], timezone)} ${c[0]} ${Math.round(temps[i])}°C (feels ${Math.round(feels[i])}°) ${hums[i]}%`
      );
    }
    if (slices.length) {
      preview = `\n\n🕒 *Next hours*\n${slices.join("\n")}`;
    }
  } catch { /* ignore */ }

  return (
`📍 *${place}*
${emoji} *${desc}*
🌡️ Temp: *${temp}°C*  | 💨 Wind: *${wind} km/h*
🧭 Timezone: ${timezone}${preview}`
  );
}

function buildDailyMessage(place, omData) {
  const { daily, timezone } = omData;
  const lines = [];
  for (let i = 0; i < daily.time.length; i++) {
    const date = new Date(daily.time[i]).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" });
    const [emoji, desc] = WEATHER_CODE[daily.weathercode[i]] || ["🌈", "Weather"];
    const min = Math.round(daily.temperature_2m_min[i]);
    const max = Math.round(daily.temperature_2m_max[i]);
    const rain = Math.round(daily.precipitation_sum[i]);
    const wind = Math.round(daily.windspeed_10m_max[i]);
    lines.push(`${date}  ${emoji} ${desc}\n  🌡️ ${min}°C – ${max}°C  💧 ${rain}mm  💨 ${wind} km/h`);
  }
  return `📍 *${place}*\n🗓️ *3-Day Forecast* (${timezone})\n\n${lines.join("\n\n")}`;
}

// ───────────────── Exported plugin ─────────────────
module.exports = {
  name: "weather",
  command: ["weather", "forecast"],
  description: "Weather and forecast that just works. No API key needed.",

  async execute(sock, m, args, command) {
    const jid = m.key.remoteJid;
    // be resilient if your index doesn't pass `command`
    const body = getBodyText(m).trim();
    const invoked = (command || (body.startsWith(".") ? body.slice(1).split(/\s+/)[0].toLowerCase() : "weather"));

    const query = args.join(" ").trim();
    if (!query) {
      const usage =
`🌤️ *Weather Usage*
• .weather <city>  → current + next hours
• .forecast <city> → 3-day forecast

Examples:
.weather Kolkata
.forecast London`;
      return sock.sendMessage(jid, { text: usage }, { quoted: m });
    }

    // Try Open-Meteo first
    try {
      const geo = await geocodeOpenMeteo(query);
      if (invoked === "forecast") {
        const data = await fetchOpenMeteoDaily(geo.lat, geo.lon, geo.tz);
        const msg = buildDailyMessage(geo.name, data);
        return sock.sendMessage(jid, { text: msg }, { quoted: m });
      } else {
        const data = await fetchOpenMeteoCurrent(geo.lat, geo.lon, geo.tz);
        const msg = buildCurrentMessage(geo.name, data);
        return sock.sendMessage(jid, { text: msg }, { quoted: m });
      }
    } catch (e) {
      console.warn("Open-Meteo failed, using wttr.in fallback:", e.message);
    }

    // Fallback to wttr.in (no key)
    try {
      const data = await fetchWttr(query);

      if (!data || !data.current_condition || !data.current_condition[0]) {
        throw new Error("WTTR_NO_DATA");
      }

      if (invoked === "forecast") {
        const area = data?.nearest_area?.[0];
        const place =
          (area?.areaName?.[0]?.value || "") +
          (area?.region?.[0]?.value ? `, ${area.region[0].value}` : "") +
          (area?.country?.[0]?.value ? `, ${area.country[0].value}` : "");
        const days = data.weather.slice(0, 3).map(d => {
          const date = new Date(d.date).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" });
          const max = d.maxtempC, min = d.mintempC;
          const rain = d.hourly.reduce((a, h) => a + Number(h.chanceofrain || 0), 0) / (d.hourly.length || 1);
          return `${date}  🌡️ ${min}°C – ${max}°C  💧 ${Math.round(rain)}%`;
        }).join("\n\n");
        const msg = `📍 *${place || query}*\n🗓️ *3-Day Forecast*\n\n${days}`;
        return sock.sendMessage(jid, { text: msg }, { quoted: m });
      } else {
        const c = data.current_condition[0];
        const temp = c.temp_C;
        const wind = c.windspeedKmph;
        const hum = c.humidity;
        const desc = c.weatherDesc?.[0]?.value || "Weather";
        const emoji = /rain|shower/i.test(desc) ? "🌧️" :
                      /snow|sleet/i.test(desc) ? "🌨️" :
                      /thunder/i.test(desc) ? "⛈️" :
                      /cloud|overcast/i.test(desc) ? "☁️" :
                      /sun|clear/i.test(desc) ? "☀️" : "🌈";

        const area = data?.nearest_area?.[0];
        const place =
          (area?.areaName?.[0]?.value || "") +
          (area?.region?.[0]?.value ? `, ${area.region[0].value}` : "") +
          (area?.country?.[0]?.value ? `, ${area.country[0].value}` : "");

        const msg =
`📍 *${place || query}*
${emoji} *${desc}*
🌡️ Temp: *${temp}°C*  | 💨 Wind: *${wind} km/h*  | 💧 Humidity: *${hum}%*`;
        return sock.sendMessage(jid, { text: msg }, { quoted: m });
      }
    } catch (err) {
      console.error("wttr.in fallback failed:", err.message);
      return sock.sendMessage(jid, { text: "❌ Couldn't fetch weather right now. Try a different city or later." }, { quoted: m });
    }
  },
};
