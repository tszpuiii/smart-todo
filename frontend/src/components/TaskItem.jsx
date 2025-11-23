import { useState } from 'react';
import { useLocale } from '../context/LocaleContext.jsx';

export default function TaskItem({ task, onToggle, onUpdate, onDelete, dnd, isNew }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [category, setCategory] = useState(task.category || 'general');
  const [newSub, setNewSub] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [removing, setRemoving] = useState(false);
  const { t } = useLocale();

  async function save() {
    await onUpdate(task._id, { title, category });
    setEditing(false);
  }

  async function addSubtask() {
    const title = newSub.trim();
    if (!title) return;
    const subtasks = [...(task.subtasks || []), { title, completed: false }];
    await onUpdate(task._id, { subtasks });
    setNewSub('');
  }

  async function toggleSub(id) {
    const subtasks = (task.subtasks || []).map(s => s._id === id ? { ...s, completed: !s.completed } : s);
    await onUpdate(task._id, { subtasks });
  }

  function handleDelete() {
    setRemoving(true);
    setTimeout(() => onDelete(task._id), 280);
  }

  return (
    <li className={`task ${task.completed ? 'done' : ''} ${isNew ? 'new-task' : ''} ${removing ? 'removing' : ''}`}
        draggable={!!dnd}
        onDragStart={dnd ? () => dnd.onDragStart(task._id) : undefined}
        onDragOver={dnd ? (e) => dnd.onDragOver(e) : undefined}
        onDrop={dnd ? () => dnd.onDrop(task._id) : undefined}
    >
      <input type="checkbox" checked={task.completed} onChange={() => onToggle(task._id)} />
      {editing ? (
        <>
          <input className="inline-input" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="inline-input" value={category} onChange={(e) => setCategory(e.target.value)} />
        </>
      ) : (
        <>
          <span className="title">{task.title}</span>
          <span className="category">{task.category || 'general'}</span>
          {task.dueDate && (
            <span className="meta" style={{marginLeft:8}}>
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </>
      )}
      <div className="spacer" />
      <button className="btn ghost-btn small more-btn" onClick={()=>setShowActions(v=>!v)} aria-label="actions">⋯</button>
      {editing ? (
        <>
          <button className="btn ghost-btn" onClick={() => setEditing(false)}>{t('cancel')}</button>
          <button className="btn primary" onClick={save}>{t('save')}</button>
        </>
      ) : (
        showActions && (
          <>
            <button className="btn ghost-btn" onClick={() => setEditing(true)}>{t('edit')}</button>
            <button className="btn danger" onClick={handleDelete}>{t('delete')}</button>
          </>
        )
      )}
      {Array.isArray(task.subtasks) && task.subtasks.length > 0 && (
        <div style={{width:'100%'}}>
          <ul className="list" style={{marginTop:8}}>
            {task.subtasks.map(s => (
              <li key={s._id} className="task" style={{padding:'6px 8px'}}>
                <input type="checkbox" checked={!!s.completed} onChange={() => toggleSub(s._id)} />
                <span className="title" style={{textDecoration: s.completed ? 'line-through':'none'}}>{s.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div style={{display:'flex', gap:6, width:'100%', marginTop:2}}>
        <input className="inline-input" placeholder={t('subtask_placeholder')} value={newSub} onChange={(e)=>setNewSub(e.target.value)} />
        <button className="btn ghost-btn" onClick={addSubtask}>{t('add_subtask')}</button>
      </div>
    </li>
  );
}


