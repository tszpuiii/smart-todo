import { useEffect, useMemo, useState } from 'react';

export default function TaskDetails({ task, onSave, onDelete }) {
  const [local, setLocal] = useState(task);
  useEffect(() => setLocal(task), [task]);

  const tags = useMemo(() => Array.isArray(local?.tags) ? local.tags : [], [local]);

  if (!task) return (
    <div className="details-empty">選擇一個任務以進行編輯</div>
  );

  function change(k, v){ setLocal(prev => ({ ...prev, [k]: v })); }
  function addTag(t){ if(!t) return; const set = new Set(tags.concat(t)); change('tags', Array.from(set)); }
  function removeTag(t){ change('tags', tags.filter(x => x !== t)); }

  async function save(){ await onSave(task._id, {
    title: local.title,
    description: local.description,
    category: local.category,
    status: local.status,
    dueDate: local.dueDate,
    notes: local.notes,
    tags: local.tags,
    subtasks: local.subtasks
  }); }

  return (
    <div className="details">
      <div className="field">
        <label>Task</label>
        <input value={local.title || ''} onChange={(e)=>change('title', e.target.value)} />
      </div>
      <div className="field">
        <label>Description</label>
        <input value={local.description || ''} onChange={(e)=>change('description', e.target.value)} />
      </div>
      <div className="grid-2">
        <div className="field">
          <label>List</label>
          <input value={local.category || ''} onChange={(e)=>change('category', e.target.value)} />
        </div>
        <div className="field">
          <label>Status</label>
          <select value={local.status || 'todo'} onChange={(e)=>change('status', e.target.value)}>
            <option value="todo">To Do</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>
      <div className="grid-2">
        <div className="field">
          <label>Due date</label>
          <input
            type="date"
            value={local.dueDate ? new Date(local.dueDate).toISOString().slice(0,10) : ''}
            onChange={(e)=>change('dueDate', e.target.value)}
            min="1000-01-01"
            max="9999-12-31"
          />
        </div>
        <div className="field">
          <label>Tags</label>
          <div className="tags">
            {tags.map(t => (
              <span key={t} className="tag-chip" onClick={()=>removeTag(t)}>{t} ×</span>
            ))}
            <input className="tag-input" placeholder="+ Add Tag" onKeyDown={(e)=>{ if(e.key==='Enter'){ addTag(e.currentTarget.value.trim()); e.currentTarget.value=''; } }} />
          </div>
        </div>
      </div>

      <div className="field">
        <label>Subtasks</label>
        <div className="subtasks">
          {(local.subtasks || []).map((s, i) => (
            <label key={s._id || i} className="subtask-row">
              <input type="checkbox" checked={!!s.completed} onChange={()=>{
                const next = (local.subtasks || []).map((x, idx)=> idx===i ? { ...x, completed: !x.completed } : x);
                change('subtasks', next);
              }} />
              <input className="inline" value={s.title} onChange={(e)=>{
                const next = (local.subtasks || []).map((x, idx)=> idx===i ? { ...x, title: e.target.value } : x);
                change('subtasks', next);
              }} />
            </label>
          ))}
          <button className="btn ghost-btn" onClick={()=>change('subtasks', [...(local.subtasks||[]), { title: 'Subtask', completed: false }])}>+ Add New Subtask</button>
        </div>
      </div>

      <div className="actions">
        <button className="btn danger" onClick={()=>onDelete(task._id)}>Delete Task</button>
        <div className="spacer" />
        <button className="btn primary" onClick={save}>Save changes</button>
      </div>
    </div>
  );
}


