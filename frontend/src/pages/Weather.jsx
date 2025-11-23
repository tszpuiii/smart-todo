import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';
import { useLocale } from '../context/LocaleContext.jsx';

export default function Weather() {
  const { token } = useAuth();
  const { locale, t } = useLocale();
  const lang = locale === 'zh-Hant' ? 'zh-Hant' : 'en';
  const [city, setCity] = useState('Hong Kong');
  const [units, setUnits] = useState('metric');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastQuery, setLastQuery] = useState(null); // { city } or { lat, lon }

  async function loadByCity(c) {
    setLoading(true); setError('');
    try {
      const langParam = locale === 'zh-Hant' ? 'zh_tw' : 'en';
      const res = await fetch(`/api/weather?city=${encodeURIComponent(c)}&units=${units}&lang=${langParam}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        // 若城市查詢失敗，退回香港座標
        const txt = await res.text();
        throw new Error(txt || t('city_lookup_failed'));
      }
      const json = await res.json();
      if (!json?.data) throw new Error(t('empty_response'));
      setData(json.data);
      setLastQuery({ city: c });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function loadByLatLon(lat, lon) {
    setLoading(true); setError('');
    try {
      const langParam = locale === 'zh-Hant' ? 'zh_tw' : 'en';
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}&units=${units}&lang=${langParam}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json.data);
      setLastQuery({ lat, lon });
    } catch (e) { setError(typeof e === 'string' ? e : e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadByCity(city); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 當切換單位時，依照最後一次查詢重新抓資料
  useEffect(() => {
    if (!lastQuery) return;
    if (lastQuery.lat && lastQuery.lon) {
      loadByLatLon(lastQuery.lat, lastQuery.lon);
    } else if (lastQuery.city) {
      loadByCity(lastQuery.city);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units]);

  function fmtTemp(t) { return units === 'metric' ? `${Math.round(t)}°C` : `${Math.round(t)}°F`; }
  function fmtDate(ts) { const d = new Date(ts * 1000); return d.toLocaleDateString(lang, { weekday: 'short', month: 'short', day: '2-digit' }); }
  function iconUrl(code) { return `https://openweathermap.org/img/wn/${code}@2x.png`; }

  const current = data?.current;
  const hourly = data?.hourly?.slice(0, 12) || [];
  const daily = data?.daily?.slice(0, 8) || [];

  async function useGeo() {
    setError('');
    if (!('geolocation' in navigator)) {
      setError(t('geolocation_not_supported'));
      return;
    }
    setLoading(true);
    const onError = async (err) => {
      // Browser定位失敗時，退回以 IP 推估位置（大約城市精度）
      try {
        const r = await fetch('https://ipapi.co/json/');
        if (r.ok) {
          const ip = await r.json();
          if (ip?.latitude && ip?.longitude) {
            await loadByLatLon(ip.latitude, ip.longitude);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // ignore and fall through to error message
      }
      const msg = err?.message || t('geolocation_failed');
      setError(msg);
      setLoading(false);
    };
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        await loadByLatLon(latitude, longitude);
      } catch (e) { setError(typeof e === 'string' ? e : e.message); setLoading(false); }
    }, onError, { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 });
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title"><span className="icon">🌤️</span><h1>{t('weather')}</h1></div>
        <div className="toolbar">
          <form onSubmit={(e)=>{e.preventDefault(); loadByCity(city);}} style={{display:'flex', gap:8, alignItems:'center'}}>
            <input value={city} onChange={(e)=>setCity(e.target.value)} placeholder={t('city_placeholder')} style={{minWidth:220}} />
            <select value={units} onChange={(e)=>setUnits(e.target.value)}>
              <option value="metric">{t('metric_c')}</option>
              <option value="imperial">{t('imperial_f')}</option>
            </select>
            <button className="btn primary" type="submit">{t('search_btn')}</button>
            <button className="btn" type="button" onClick={useGeo} title={t('use_my_location')}>{t('use_my_location')}</button>
          </form>
        </div>
      </div>

      {loading ? <div>{t('loading')}</div> : error ? <div className="error">{String(error)}</div> : (
        data && (
          <div className="stack">
            <div className="card" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
              <div>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  {current?.weather?.[0] && <img alt="icon" src={iconUrl(current.weather[0].icon)} width={64} height={64} />}
                  <div>
                    <div style={{fontSize:36, fontWeight:700}}>{fmtTemp(current?.temp)}</div>
                    <div>{current?.weather?.[0]?.description}</div>
                  </div>
                </div>
                <div style={{marginTop:8, color:'#6b7280'}}>{t('feels_like_label')} {fmtTemp(current?.feels_like)} · {t('wind_label')} {current?.wind_speed} m/s · {t('humidity_label')} {current?.humidity}% · {t('pressure_label')} {current?.pressure} hPa</div>
              </div>
            </div>

            <div className="card">
              <h3>{t('hourly_forecast')}</h3>
              <div style={{display:'grid', gridTemplateColumns:`repeat(${hourly.length}, 1fr)`, gap:8, alignItems:'end'}}>
                {hourly.map((h, i) => (
                  <div key={i} style={{textAlign:'center'}}>
                    <div style={{fontSize:12, color:'#6b7280'}}>{new Date(h.dt*1000).toLocaleTimeString(lang, {hour:'numeric'})}</div>
                    {h.weather?.[0] && <img alt="icon" src={iconUrl(h.weather[0].icon)} width={40} height={40} />}
                    <div style={{fontWeight:600}}>{fmtTemp(h.temp)}</div>
                    <div style={{fontSize:12, color:'#6b7280'}}>{h.weather?.[0]?.main}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3>{t('eight_day_forecast')}</h3>
              <div style={{display:'grid', gap:8}}>
                {daily.map((d, i) => (
                  <div key={i} style={{display:'grid', gridTemplateColumns:'140px 60px 1fr 140px', alignItems:'center', gap:8}}>
                    <div style={{color:'#6b7280'}}>{fmtDate(d.dt)}</div>
                    {d.weather?.[0] && <img alt="icon" src={iconUrl(d.weather[0].icon)} width={40} height={40} />}
                    <div style={{color:'#6b7280'}}>{d.weather?.[0]?.description}</div>
                    <div style={{textAlign:'right'}}>{fmtTemp(d.temp?.max)} / {fmtTemp(d.temp?.min)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}


