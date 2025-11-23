import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';
import { useLocale } from '../context/LocaleContext.jsx';
import { useNavigate } from 'react-router-dom';
import TaskForm from '../components/TaskForm.jsx';

export default function Home() {
  const { token } = useAuth();
  const { t } = useLocale();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        const res = await api.listTasks(token, {});
        if (alive) setTasks(res.tasks || []);
      } finally {
        if (alive) setLoading(false);
      }
    }
    if (token) load();
    return () => { alive = false; };
  }, [token]);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const todayCount = useMemo(() => {
    const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
    return tasks.filter(x => x.dueDate && new Date(x.dueDate).getFullYear()===y && new Date(x.dueDate).getMonth()===m && new Date(x.dueDate).getDate()===d).length;
  }, [tasks]);

  const expiredCount = useMemo(() => tasks.filter(x => x.dueDate && new Date(x.dueDate) < startOfToday && !x.completed).length, [tasks]);
  const incompleteCount = useMemo(() => tasks.filter(x => !x.completed).length, [tasks]);
  const totalCount = tasks.length;
  const completedCount = useMemo(() => tasks.filter(x => !!x.completed).length, [tasks]);
  const progress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  const recent = useMemo(() => {
    return tasks
      .slice()
      .sort((a,b) => new Date(b.updatedAt||b.createdAt) - new Date(a.updatedAt||a.createdAt))
      .slice(0, 5);
  }, [tasks]);

  function goTo(scope) {
    const url = new URL(window.location.origin);
    url.pathname = '/tasks';
    if (scope) url.search = `?scope=${scope}&view=list`;
    navigate(url.pathname + (url.search || ''));
  }

  async function createFromHome(payload) {
    await api.createTask(token, payload);
    try { window.dispatchEvent(new Event('tasks:changed')); } catch {}
    const res = await api.listTasks(token, {});
    setTasks(res.tasks || []);
  }

  return (
    <div className="page">
      <div className="page-header" />

      <Hero title={t('home') || 'Home'} />

      <div className="home-grid">
        <div className="block">
          {loading ? <div>{t('loading')}</div> : (
            <div className="summary-grid">
              <SummaryCard label={t('header_today')} value={todayCount} icon="📌" />
              <SummaryCard label={t('header_expired')} value={expiredCount} icon="⚠️" />
              <SummaryCard label={t('option_incomplete')} value={incompleteCount} icon="📝" />
            </div>
          )}
          <div className="progress">
            <div className="progress-top">
              <span>{t('progress')}</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{width:`${progress}%`}} /></div>
          </div>
          <div className="chips">
            <button className="chip-link" onClick={()=>goTo('today')}>{t('header_today')}</button>
            <button className="chip-link" onClick={()=>goTo('upcoming')}>{t('header_upcoming')}</button>
            <button className="chip-link warning" onClick={()=>goTo('expired')}>{t('header_expired')}</button>
          </div>
        </div>

        <div className="block">
          <div className="muted" style={{marginBottom:8}}>{t('recent')}</div>
          {recent.length === 0 ? <div className="muted">{t('no_tasks')}</div> : (
            <ul className="list">
              {recent.map(x => (
                <li key={x._id} className="task" style={{padding:'6px 10px'}}>
                  <span className="title">{x.title}</span>
                  {x.category && <span className="category" style={{marginLeft:8}}>{x.category}</span>}
                  {x.dueDate && <span className="meta" style={{marginLeft:8}}>{new Date(x.dueDate).toLocaleDateString()}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="block">
          <div className="home-add-label" style={{marginBottom:8}}>{t('add_new_task')}</div>
          <TaskForm onCreate={createFromHome} />
        </div>
      </div>
    </div>
  );
}

function Hero({ title, subtitle }) {
  return (
    <div className="hero">
      <div className="hero-title">{title}</div>
      {subtitle ? <div className="hero-sub">{subtitle}</div> : null}
    </div>
  );
}

function SummaryCard({ label, value, icon }) {
  return (
    <div className="summary-card">
      <div className="summary-top">
        <span className="muted">{label}</span>
        <span>{icon}</span>
      </div>
      <div className="summary-value">{value}</div>
    </div>
  );
}


