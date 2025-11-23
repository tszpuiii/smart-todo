import { useTheme } from '../context/ThemeContext.jsx';
import { useLocale } from '../context/LocaleContext.jsx';
import { useEffect, useState } from 'react';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();
  // Accent theme (blue/teal/purple)
  const accents = ['blue','teal','purple'];
  const [accent, setAccent] = useState(() => {
    try {
      return localStorage.getItem('accent') || document.documentElement.getAttribute('data-accent') || 'blue';
    } catch {
      return document.documentElement.getAttribute('data-accent') || 'blue';
    }
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent);
    try { localStorage.setItem('accent', accent); } catch {}
  }, [accent]);
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <span className="icon">⚙️</span>
          <h1>{t('settings')}</h1>
        </div>
        <div />
      </div>

      <div className="block">
        <div className="setting-row" style={{padding:'6px 0'}}>
          <div>{t('theme')}</div>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <button className={`btn ${theme==='light'?'primary':''}`} onClick={()=>setTheme('light')}>{t('day')}</button>
            <button className={`btn ${theme==='dark'?'primary':''}`} onClick={()=>setTheme('dark')}>{t('night')}</button>
          </div>
        </div>
      </div>

      <div className="block" style={{marginTop:8}}>
        <div className="setting-row" style={{padding:'6px 0'}}>
          <div>{t('language')}</div>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <button className={`btn ${locale==='en'?'primary':''}`} onClick={()=>setLocale('en')}>{t('english')}</button>
            <button className={`btn ${locale==='zh-Hant'?'primary':''}`} onClick={()=>setLocale('zh-Hant')}>{t('traditional_chinese')}</button>
          </div>
        </div>
      </div>

      <div className="block" style={{marginTop:8}}>
        <div className="setting-row" style={{padding:'6px 0'}}>
          <div>{t('accent') || 'Accent'}</div>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            {accents.map(a => (
              <button key={a} className={`btn ${accent===a?'primary':''}`} onClick={()=>setAccent(a)}>
                {t(a)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Removed duplicate Palette section */}
    </div>
  );
}


