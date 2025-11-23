import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';
import { useLocale } from '../context/LocaleContext.jsx';

export default function Sidebar({ open = true, onToggle, onOpenSettings }) {
  const loc = useLocation();
  const active = (path) => (loc.pathname === path ? 'active' : '');
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState([]);
  const { t } = useLocale();

  async function load() {
    let mounted = true;
    try {
      if (!token) return;
      const res = await api.listTasks(token, {});
      if (mounted) setTasks(res.tasks || []);
      const lr = await api.listLists(token);
      if (mounted) setLists(lr.lists || []);
    } catch {
      if (mounted) { setTasks([]); setLists([]); }
    }
  }

  useEffect(() => {
    let alive = true;
    load();
    function onChanged(){ if (alive) load(); }
    window.addEventListener('tasks:changed', onChanged);
    return () => { alive = false; window.removeEventListener('tasks:changed', onChanged); };
  }, [token]);

  const todayCount = useMemo(() => {
    const t = new Date();
    const y = t.getFullYear(), m = t.getMonth(), d = t.getDate();
    return tasks.filter(x =>
      !x.completed &&
      x.dueDate &&
      new Date(x.dueDate).getFullYear()===y &&
      new Date(x.dueDate).getMonth()===m &&
      new Date(x.dueDate).getDate()===d
    ).length;
  }, [tasks]);

  const upcomingCount = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return tasks.filter(x => !x.completed && (!x.dueDate || new Date(x.dueDate) >= startOfToday)).length;
  }, [tasks]);

  const expiredCount = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return tasks.filter(x => x.dueDate && new Date(x.dueDate) < startOfToday && !x.completed).length;
  }, [tasks]);

  const categoryCounts = useMemo(() => {
    const taskMap = new Map();
    const displayNameByKey = new Map();
    for (const t of tasks) {
      const raw = t.category || 'general';
      const key = raw.toLowerCase();
      // 保留所有出現過的分類名稱（包含已完成），確保側欄不會消失
      if (!displayNameByKey.has(key)) displayNameByKey.set(key, raw);
      // 計數僅統計未完成項目
      if (!t.completed) {
        taskMap.set(key, (taskMap.get(key) || 0) + 1);
      }
    }
    const allKeys = new Map();
    for (const l of lists) {
      const key = (l.name || '').toLowerCase();
      if (!key) continue;
      allKeys.set(key, l.name);
      if (!displayNameByKey.has(key)) displayNameByKey.set(key, l.name);
    }
    for (const [key, name] of displayNameByKey.entries()) {
      if (!allKeys.has(key)) allKeys.set(key, name);
    }
    const rows = Array.from(allKeys.entries()).map(([key, name]) => [name, taskMap.get(key) || 0]);
    rows.sort((a,b) => String(a[0]).localeCompare(String(b[0])));
    return rows; // [ [displayName, count], ... ]
  }, [tasks, lists]);
  function setQuery(next) {
    const url = new URL(window.location.href);
    Object.entries(next).forEach(([k,v]) => {
      if (v === undefined || v === null || v === '') url.searchParams.delete(k);
      else url.searchParams.set(k, v);
    });
    const qs = url.searchParams.toString();
    const path = '/tasks';
    navigate(qs ? `${path}?${qs}` : path);
  }

  // determine active item based on current query
  const qs = new URLSearchParams(loc.search);
  const currentScope = qs.get('scope') || '';
  const currentView = qs.get('view') || 'list';
  const isActive = (target) => {
    // target can have scope/view keys to match
    const scopeOk = typeof target.scope === 'undefined' || target.scope === currentScope;
    const viewOk = typeof target.view === 'undefined' || target.view === currentView;
    return scopeOk && viewOk;
  };

  const currentCategory = (qs.get('category') || '').toLowerCase();

  return (
    <aside className={`sidebar ${open ? '' : 'collapsed'}`}>
      <div className="sidebar-title">
        <div className="title">{t('menu')}</div>
        <button className="btn ghost-btn" aria-label="menu" onClick={onToggle}>≡</button>
      </div>

      {/* search removed per request */}

      <div className="group">
        <div className="group-title">{t('tasks_group')}</div>
        <div className={`row ${loc.pathname === '/' ? 'active' : ''}`} role="button" onClick={()=>navigate('/')}>
          <span className="icon">🏠</span>
          <span className="label">{t('home')}</span>
        </div>
        <div className={`row ${isActive({ scope: 'upcoming', view: 'list' }) ? 'active' : ''}`} role="button" onClick={()=>setQuery({ scope: 'upcoming', view: 'list', category: '' })}>
          <span className="icon">»</span>
          <span className="label">{t('header_upcoming')}</span>
          <span className="count-pill">{upcomingCount || 0}</span>
        </div>
        <div className={`row ${isActive({ scope: 'today', view: 'list' }) ? 'active' : ''}`} role="button" onClick={()=>setQuery({ scope: 'today', view: 'list', category: '' })}>
          <span className="icon">☰</span>
          <span className="label">{t('header_today')}</span>
          <span className="count-pill">{todayCount || 0}</span>
        </div>
        <div className={`row ${isActive({ scope: 'expired', view: 'list' }) ? 'active' : ''}`} role="button" onClick={()=>setQuery({ scope: 'expired', view: 'list', category: '' })}>
          <span className="icon">⚠️</span>
          <span className="label">{t('header_expired')}</span>
          <span className="count-pill">{expiredCount || 0}</span>
        </div>
        <div className={`row ${isActive({ view: 'calendar' }) ? 'active' : ''}`} role="button" onClick={()=>setQuery({ view: 'calendar', category: '' })}>
          <span className="icon">📅</span>
          <span className="label">{t('header_calendar')}</span>
        </div>
        <div className={`row ${isActive({ view: 'board' }) ? 'active' : ''}`} role="button" onClick={()=>setQuery({ view: 'board', category: '' })}>
          <span className="icon">🧱</span>
          <span className="label">{t('header_board')}</span>
        </div>
      </div>

      <div className="group">
        <div className="group-title">{t('lists_group')}</div>
        {categoryCounts.length === 0 ? (
          <div className="muted" style={{fontSize:12, margin:'6px 0'}}>{t('no_lists_yet')}</div>
        ) : categoryCounts.map(([cat, count], idx) => {
          const isCatActive = currentCategory === String(cat).toLowerCase() && currentView === 'list';
          return (
            <div key={cat} className={`row ${isCatActive ? 'active' : ''}`} role="button" onClick={()=>setQuery({ category: cat, view: 'list', scope: '' })}>
              <span className={`dot ${['red','cyan','yellow','teal','purple'][idx % 5]}`} />
              <span className="label">{cat}</span>
              <span className="count-pill">{count || 0}</span>
            </div>
          );
        })}
        <button className="btn ghost-btn" onClick={async ()=>{ const raw = prompt('New list name'); const name = raw?.trim(); if(name && token){ try { await api.createList(token, name); const lr = await api.listLists(token); setLists(lr.lists||[]); setQuery({ category: name, view: 'list', scope: '' }); } catch(e){ alert(e?.message || 'Failed to create list'); } } }} style={{marginTop:8}}>{t('add_new_list')}</button>
      </div>

      <div className="group">
        <div className="group-title">{t('apps_group')}</div>
        <div className={`row ${loc.pathname === '/weather' ? 'active' : ''}`} role="button" onClick={()=>navigate('/weather')}>
          <span className="icon">🌤️</span>
          <span className="label">{t('weather')}</span>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="row" style={{cursor:'default'}}>
          <span className="icon">👋</span>
          <span className="label">Hi, {user?.name || 'User'}</span>
        </div>
        <div className={`row ${loc.pathname === '/settings' ? 'active' : ''}`} role="button" onClick={()=>navigate('/settings')}>
          <span className="icon">⚙️</span>
          <span className="label">{t('settings_nav')}</span>
        </div>
        <div className="row" role="button" onClick={logout}>
          <span className="icon">↩︎</span>
          <span className="label">{t('sign_out')}</span>
        </div>
      </div>
    </aside>
  );
}


