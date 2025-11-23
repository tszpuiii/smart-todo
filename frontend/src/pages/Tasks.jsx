import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';
import TaskForm from '../components/TaskForm.jsx';
import TaskItem from '../components/TaskItem.jsx';
import CommandPalette from '../components/CommandPalette.jsx';
import TaskRow from '../components/TaskRow.jsx';
import TaskDetails from '../components/TaskDetails.jsx';
import Calendar from '../components/Calendar.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function Tasks() {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [completedFilter, setCompletedFilter] = useState('all');
  const [view, setView] = useState('list'); // default to list like screenshot
  const [draggedId, setDraggedId] = useState(null);
  const [selectedId, setSelectedId] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarSelected, setCalendarSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentListId, setCurrentListId] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState('');
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  const [newlyCreatedId, setNewlyCreatedId] = useState('');
  const [removingId, setRemovingId] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLocale();

  async function reload() {
    setLoading(true); setError('');
    try {
      const filters = {};
      if (categoryFilter) filters.category = categoryFilter;
      if (completedFilter !== 'all') filters.completed = completedFilter === 'true';
      const res = await api.listTasks(token, filters);
      setTasks(res.tasks);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, completedFilter]);

  // 查詢參數操作（用於移除 category）
  function updateQuery(next) {
    const url = new URL(window.location.href);
    Object.entries(next).forEach(([k,v]) => {
      if (v === undefined || v === null || v === '') url.searchParams.delete(k);
      else url.searchParams.set(k, v);
    });
    const qs = url.searchParams.toString();
    navigate(qs ? `/?${qs}` : '/');
  }

  // read query params from sidebar actions: q, scope, category, view
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    const scope = params.get('scope') || '';
    const cat = params.get('category') || '';
    const v = params.get('view') || '';
    if (cat) setCategoryFilter(cat); else setCategoryFilter('');
    if (v) setView(v);
    // scope handled in filteredTasks below; search handled too
    setSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const [search, setSearch] = useState('');

  // 動態頁首標題與 emoji
  const header = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const scope = params.get('scope') || '';
    if (view === 'calendar') return { emoji: '📅', title: t('header_calendar') };
    if (view === 'board') return { emoji: '🧱', title: t('header_board') };
    if (scope === 'today') return { emoji: '📌', title: t('header_today') };
    if (scope === 'upcoming') return { emoji: '⏭️', title: t('header_upcoming') };
    if (scope === 'expired') return { emoji: '⚠️', title: t('header_expired') };
    if (categoryFilter) return { emoji: '🗂️', title: categoryFilter };
    return { emoji: '📝', title: t('header_tasks') };
  }, [location.search, view, categoryFilter, t]);

  // 取得目前選中的 List ID 以便刪除
  useEffect(() => {
    async function loadListId() {
      if (!token || !categoryFilter) { setCurrentListId(''); return; }
      try {
        const res = await api.listLists(token);
        const nameLc = String(categoryFilter).toLowerCase();
        const found = (res.lists || []).find(l => (l.name || '').toLowerCase() === nameLc);
        setCurrentListId(found?._id || '');
      } catch {
        setCurrentListId('');
      }
    }
    loadListId();
  }, [token, categoryFilter]);

  async function handleCreate(payload) {
    // Apply sensible defaults based on current filters so the new item is visible immediately
    const params = new URLSearchParams(location.search);
    const scope = params.get('scope') || '';
    const enhanced = { ...payload };
    if (!enhanced.title) enhanced.title = t('new_page');
    if (categoryFilter && !enhanced.category) enhanced.category = categoryFilter;
    if (scope === 'today' && !enhanced.dueDate) {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      enhanced.dueDate = `${yyyy}-${mm}-${dd}`;
    }
    const res = await api.createTask(token, enhanced);
    await reload();
    if (res?.task?._id) setSelectedId(res.task._id);
    if (res?.task?._id) setNewlyCreatedId(res.task._id);
    try { window.dispatchEvent(new Event('tasks:changed')); } catch {}
  }

  async function handleUpdate(id, payload) {
    await api.updateTask(token, id, payload);
    await reload();
    try { window.dispatchEvent(new Event('tasks:changed')); } catch {}
    if (detailsOpen) setDetailsOpen(false);
  }

  async function handleToggle(id) {
    await api.toggleTask(token, id);
    await reload();
    try { window.dispatchEvent(new Event('tasks:changed')); } catch {}
  }

  async function handleDelete(id) {
    setRemovingId(id);
    setTimeout(async () => {
      await api.deleteTask(token, id);
      await reload();
      setRemovingId('');
      try { window.dispatchEvent(new Event('tasks:changed')); } catch {}
    }, 280);
  }

  // DnD helpers
  function onDragStart(id) { setDraggedId(id); }
  function onDragOver(e) { e.preventDefault(); }
  async function onDrop(targetId) {
    if (!draggedId || draggedId === targetId) return;
    const ids = tasks.map(t => t._id);
    const from = ids.indexOf(draggedId);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) return;
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    await api.reorderTasks(token, ids);
    setDraggedId(null);
    await reload();
  }

  const categories = useMemo(() => {
    const set = new Set(tasks.map(t => t.category || 'general'));
    return Array.from(set);
  }, [tasks]);

  const groupedByStatus = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isExpired = (t) => t.dueDate && new Date(t.dueDate) < startOfToday && !t.completed;
    return {
      // 不顯示逾期未完成於 todo/doing，只顯示於 expired 區
      todo: tasks.filter(t => (t.status || 'todo') === 'todo' && !isExpired(t)),
      doing: tasks.filter(t => t.status === 'doing' && !isExpired(t)),
      done: tasks.filter(t => t.status === 'done')
    };
  }, [tasks]);

  const expiredTasks = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return tasks.filter(t => t.dueDate && new Date(t.dueDate) < startOfToday && !t.completed);
  }, [tasks]);

  const selectedTask = useMemo(() => tasks.find(t => t._id === selectedId) || tasks[0], [tasks, selectedId]);
  useEffect(() => { if (!selectedId && tasks[0]) setSelectedId(tasks[0]._id); }, [tasks, selectedId]);

  // Apply client-side filter for search/scope
  const filteredTasks = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const scope = params.get('scope') || '';
    const q = search.toLowerCase();
    let list = tasks;
    if (q) list = list.filter(t => `${t.title} ${t.description}`.toLowerCase().includes(q));
    if (scope === 'today') {
      const today = new Date();
      const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
      list = list.filter(t => t.dueDate && new Date(t.dueDate).getFullYear()===y && new Date(t.dueDate).getMonth()===m && new Date(t.dueDate).getDate()===d);
    } else if (scope === 'upcoming') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      // Show ALL tasks (completed or not) that are scheduled for today/future, or without due date
      list = list.filter(t => (!t.dueDate || new Date(t.dueDate) >= startOfToday));
      // Sort by due date (undefined at the end) and keep completed after incomplete if same date
      list = list.slice().sort((a,b) => {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        if (da !== db) return da - db;
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const oa = typeof a.order === 'number' ? a.order : 0;
        const ob = typeof b.order === 'number' ? b.order : 0;
        return oa - ob;
      });
    } else if (scope === 'expired') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      // Show overdue, not completed
      list = list.filter(t => t.dueDate && new Date(t.dueDate) < startOfToday && !t.completed);
      list = list.slice().sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
    }
    if (view === 'calendar' && calendarSelected) {
      const y = calendarSelected.getFullYear(), m = calendarSelected.getMonth(), d = calendarSelected.getDate();
      list = list.filter(t => t.dueDate && new Date(t.dueDate).getFullYear()===y && new Date(t.dueDate).getMonth()===m && new Date(t.dueDate).getDate()===d);
    }
    return list;
  }, [tasks, location.search, search, view, calendarSelected]);

  const detailsVisible = detailsOpen && filteredTasks.length > 0;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title"><span className="icon">{header.emoji}</span><h1>{header.title}</h1></div>
        <div className="toolbar">
          <div className="chip">
            {t('header_category')}
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">{t('option_all')}</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="chip">
            {t('header_status')}
            <select value={completedFilter} onChange={(e) => setCompletedFilter(e.target.value)}>
              <option value="all">{t('option_all')}</option>
              <option value="false">{t('option_incomplete')}</option>
              <option value="true">{t('option_complete')}</option>
            </select>
          </div>
          {categoryFilter && (
            <button
              className="btn danger"
              onClick={async () => {
                const hasList = !!currentListId;
                setConfirmMsg(hasList
                  ? `Delete list "${categoryFilter}" and ALL tasks under it? This cannot be undone.`
                  : `Delete ALL tasks under category "${categoryFilter}"? This cannot be undone.`);
                setConfirmAction(() => async () => {
                  try {
                    if (hasList) {
                      await api.deleteList(token, currentListId, true);
                    } else {
                      await api.deleteTasksByCategory(token, categoryFilter);
                    }
                    setCategoryFilter('');
                    updateQuery({ category: '' });
                    try { window.dispatchEvent(new Event('tasks:changed')); } catch {}
                  } catch (err) {
                    alert(err?.message || 'Failed to delete list');
                  } finally {
                    setConfirmOpen(false);
                  }
                });
                setConfirmOpen(true);
              }}
            >
              {t('delete_list')}
            </button>
          )}
        </div>
      </div>

      <div className="block">
        {loading ? (
          <div>{t('loading')}</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : view === 'list' ? (
          <div className={`workspace ${detailsVisible ? '' : 'one-col'}`}>
            <div className="pane list-pane">
              <div className="list-header">
                <button className="btn ghost-btn" onClick={() => setShowForm(true)}>{t('add_new_task')}</button>
              </div>
              {showForm && (
                <div style={{margin:'8px 0 12px'}}>
                  <TaskForm initialCategory={categoryFilter || ''} onCreate={async (p)=>{ await handleCreate(p); setShowForm(false); }} onCancel={()=>setShowForm(false)} />
                </div>
              )}
              {(() => {
                const scopeParam = new URLSearchParams(location.search).get('scope') || '';
                const now = new Date();
                const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const expiredList = filteredTasks.filter(x => x.dueDate && new Date(x.dueDate) < startOfToday && !x.completed);
                const activeList = filteredTasks.filter(x => !(x.dueDate && new Date(x.dueDate) < startOfToday && !x.completed));
                const showExpiredSection = scopeParam === '' && expiredList.length > 0;
                if (scopeParam === 'expired') {
                  // 在「已逾期」頁，直接渲染逾期清單
                  return (
                    <div className="rows expired">
                      {filteredTasks.map(row => (
                        <TaskRow key={row._id} task={row} selected={row._id===selectedId} onSelect={setSelectedId} onToggle={handleToggle} onOpenDetails={(id)=>{ setSelectedId(id); setDetailsOpen(true); }} />
                      ))}
                      {filteredTasks.length === 0 && <div className="muted">{t('no_tasks')}</div>}
                    </div>
                  );
                }
                return (
                  <>
                    <div className="rows">
                      {activeList.map(row => (
                        <TaskRow key={row._id} task={row} selected={row._id===selectedId} onSelect={setSelectedId} onToggle={handleToggle} onOpenDetails={(id)=>{ setSelectedId(id); setDetailsOpen(true); }} isNew={newlyCreatedId===row._id} isRemoving={removingId===row._id} />
                      ))}
                      {activeList.length === 0 && !showExpiredSection && <div className="muted">{t('no_tasks')}</div>}
                    </div>
                    {showExpiredSection && (
                      <>
                        <div className="board-heading expired">{t('header_expired')}</div>
                        <div className="rows expired">
                          {expiredList.map(row => (
                            <TaskRow key={row._id} task={row} selected={row._id===selectedId} onSelect={setSelectedId} onToggle={handleToggle} onOpenDetails={(id)=>{ setSelectedId(id); setDetailsOpen(true); }} />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
            {detailsVisible && (
              <div className="drawer open">
                <div className="pane details-pane">
                  <TaskDetails task={selectedTask} onSave={handleUpdate} onDelete={handleDelete} />
                </div>
              </div>
            )}
          </div>
        ) : view === 'table' ? (
          <table className="table">
            <thead>
              <tr>
                <th>{t('option_complete')}</th>
                <th>{t('title')}</th>
                <th>{t('header_category')}</th>
                <th>{t('header_status')}</th>
                <th>{t('due')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr><td colSpan={6}>{t('no_tasks')}</td></tr>
              ) : tasks.map((t) => (
                <tr key={t._id}>
                  <td><input type="checkbox" checked={t.completed} onChange={() => handleToggle(t._id)} /></td>
                  <td>{t.title}</td>
                  <td>{t.category || 'general'}</td>
                  <td>{t.status || 'todo'}</td>
                  <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ''}</td>
                  <td style={{textAlign:'right'}}>
                    <button className="btn ghost-btn" onClick={() => handleUpdate(t._id, { completed: !t.completed })}>{t.completed ? t('undo') : t('complete')}</button>
                    <button className="btn danger" onClick={() => handleDelete(t._id)}>{t('delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : view === 'calendar' ? (
          <div className="workspace">
            <div className="pane list-pane" style={{gridColumn:'1 / -1'}}>
              <Calendar
                tasks={tasks}
                monthDate={calendarMonth}
                onMonthChange={setCalendarMonth}
                selectedDate={calendarSelected}
                onSelectDate={setCalendarSelected}
              />
            </div>
            <div className="pane details-pane" style={{gridColumn:'1 / -1'}}>
              <div className="list-header" style={{display:'flex', alignItems:'center', gap:8}}>
                <div style={{fontWeight:600}}>{t('select_date')}：{calendarSelected ? `${calendarSelected.getFullYear()}-${String(calendarSelected.getMonth()+1).padStart(2,'0')}-${String(calendarSelected.getDate()).padStart(2,'0')}` : t('not_selected')}</div>
                <div className="spacer" />
                {calendarSelected && <button className="btn ghost-btn" onClick={() => setShowForm(true)}>{t('add_new_task')}</button>}
              </div>
              {showForm && calendarSelected && (
                <div style={{margin:'8px 0 12px'}}>
                  <TaskForm onCreate={async (p)=>{ await handleCreate({ ...p, dueDate: p.dueDate || `${calendarSelected.getFullYear()}-${String(calendarSelected.getMonth()+1).padStart(2,'0')}-${String(calendarSelected.getDate()).padStart(2,'0')}` }); setShowForm(false); }} onCancel={()=>setShowForm(false)} />
                </div>
              )}
              <div className="rows">
                {filteredTasks.map(t => (
                  <TaskRow key={t._id} task={t} selected={t._id===selectedId} onSelect={setSelectedId} onToggle={handleToggle} onOpenDetails={(id)=>{ setSelectedId(id); setDetailsOpen(true); }} />
                ))}
                {filteredTasks.length === 0 && <div className="muted">{t('no_tasks_for_day')}</div>}
              </div>
            </div>
          </div>
        ) : (
          <>
          <div className="board">
            {['todo','doing','done'].map((col) => (
              <div key={col} className={`column ${col}`}
                   onDragOver={(e) => e.preventDefault()}
                   onDrop={async () => {
                     if (!draggedId) return;
                     await handleUpdate(draggedId, { status: col });
                     setDraggedId(null);
                   }}
              >
                <div className="column-title">
                  {col === 'todo' ? t('todo') : col === 'doing' ? t('doing') : t('done')}
                  <span style={{marginLeft:8}} className="badge">{groupedByStatus[col].length}</span>
                </div>
                <ul className="list">
                  {groupedByStatus[col].map((t) => (
                    <TaskItem key={t._id} task={t} isNew={newlyCreatedId===t._id}
                      onToggle={handleToggle}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                      dnd={{ onDragStart, onDragOver, onDrop }}
                    />
                  ))}
                </ul>
                <button className="btn ghost-btn" onClick={() => handleCreate({ title: t('new_page'), status: col })}>{t('add_new_task')}</button>
              </div>
            ))}
          </div>
          {expiredTasks.length > 0 && (
            <>
              <div className="board-heading">{t('header_expired')}</div>
              <div className="board one-col">
                <div className={`column expired`}>
                  <div className="column-title">{t('header_expired')} <span style={{marginLeft:8}} className="badge">{expiredTasks.length}</span></div>
                  <ul className="list">
                    {expiredTasks.map((t) => (
                      <TaskItem key={t._id} task={t}
                        onToggle={handleToggle}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                        dnd={{ onDragStart, onDragOver, onDrop }}
                      />
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
          </>
        )}
      </div>
      <CommandPalette onCreate={handleCreate} />
      <ConfirmDialog
        open={confirmOpen}
        message={confirmMsg}
        onConfirm={confirmAction}
        onCancel={()=>setConfirmOpen(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}


