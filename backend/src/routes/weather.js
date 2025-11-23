import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const API_KEY = process.env.OPENWEATHER_API_KEY || '';
const BASE_30 = 'https://api.openweathermap.org/data/3.0/onecall';
const BASE_25 = 'https://api.openweathermap.org/data/2.5/onecall';
const CURRENT_25 = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_25 = 'https://api.openweathermap.org/data/2.5/forecast';
const GEO = 'https://api.openweathermap.org/geo/1.0/direct';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Weather API ${res.status}: ${text}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }
  return res.json();
}

async function fetchOneCall({ lat, lon, units, version = '3.0' }) {
  const base = version === '2.5' ? BASE_25 : BASE_30;
  const url = `${base}?lat=${lat}&lon=${lon}&exclude=minutely,alerts&appid=${API_KEY}&units=${units}`;
  return fetchJson(url);
}

async function fetchBasic({ lat, lon, units }) {
  const currUrl = `${CURRENT_25}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
  const foreUrl = `${FORECAST_25}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
  const [curr, fore] = await Promise.all([fetchJson(currUrl), fetchJson(foreUrl)]);

  // Map to onecall-like structure
  const current = {
    temp: curr?.main?.temp,
    feels_like: curr?.main?.feels_like,
    humidity: curr?.main?.humidity,
    pressure: curr?.main?.pressure,
    wind_speed: curr?.wind?.speed,
    weather: curr?.weather || []
  };

  const hourly = (fore?.list || []).slice(0, 12).map(it => ({
    dt: it.dt,
    temp: it?.main?.temp,
    weather: it?.weather || []
  }));

  // Group by day for min/max
  const byDay = new Map();
  for (const it of fore?.list || []) {
    const d = new Date(it.dt * 1000);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const rec = byDay.get(key) || { temps: [], sample: it };
    rec.temps.push(it?.main?.temp);
    byDay.set(key, rec);
  }
  const daily = Array.from(byDay.values()).slice(0, 8).map(({ temps, sample }) => ({
    dt: sample.dt,
    temp: { min: Math.min(...temps), max: Math.max(...temps) },
    weather: sample?.weather || []
  }));

  return { current, hourly, daily };
}

// GET /api/weather?city=London,GB or ?lat=..&lon=..
router.get('/', async (req, res, next) => {
  try {
    if (!API_KEY) return res.status(500).json({ error: 'Missing OPENWEATHER_API_KEY' });
    let { lat, lon, city, units = 'metric' } = req.query;

    if ((!lat || !lon) && city) {
      const q = encodeURIComponent(city);
      const geo = await fetchJson(`${GEO}?q=${q}&limit=1&appid=${API_KEY}`);
      if (!geo?.[0]) return res.status(404).json({ error: 'City not found' });
      lat = geo[0].lat; lon = geo[0].lon;
    }
    if (!lat || !lon) return res.status(400).json({ error: 'lat/lon or city is required' });

    let data;
    try {
      data = await fetchOneCall({ lat, lon, units, version: '3.0' });
    } catch (e) {
      if (e.status === 401 || e.status === 400 || e.status === 404) {
        // 第二層退回 One Call 2.5
        try {
          data = await fetchOneCall({ lat, lon, units, version: '2.5' });
        } catch (e2) {
          // 最後退回免費的 current + forecast 2.5
          data = await fetchBasic({ lat, lon, units });
        }
      } else {
        throw e;
      }
    }
    return res.json({ lat, lon, units, data });
  } catch (err) {
    // Surface upstream status (e.g., 401 Invalid API key) instead of 500
    const status = err.status || 500;
    return res.status(status).json({ error: err.message });
  }
});

export default router;


