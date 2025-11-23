import { useState, useEffect } from 'react';
import { useLocale } from '../context/LocaleContext.jsx';

 

export default function TaskForm({ onCreate, onCancel, initialCategory = '' }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(initialCategory || 'general');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
  }, [initialCategory]);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCreate({ title, description, category, status, notes, subtasks, dueDate: dueDate || undefined });
      setTitle(''); setDescription(''); setCategory('general'); setStatus('todo'); setDueDate(''); setNotes(''); setSubtasks([]);
      if (onCancel) onCancel();
    } finally {
      setSubmitting(false);
    }
  }

  

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>{t('form_title')}
        <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder={t('form_title_ph')} />
      </label>
      <label>{t('form_description')}
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('form_description_ph')} />
      </label>
      <label>{t('form_category')}
        <input value={category} onChange={(e) => setCategory(e.target.value)} />
      </label>
      <label>{t('form_status')}
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todo">To Do</option>
          <option value="doing">Doing</option>
          <option value="done">Done</option>
        </select>
      </label>
      <label>{t('form_due')}
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </label>
      <label>{t('form_notes')}
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('form_notes_ph')} />
      </label>
      {subtasks.length > 0 && (
        <div>
          <div className="muted">{t('subtasks') || 'Subtasks'}</div>
          <ul className="list">
            {subtasks.map((s, i) => (
              <li key={i} className="task"><span className="title">{s.title}</span></li>
            ))}
          </ul>
        </div>
      )}
      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        {onCancel && <button className="btn ghost-btn" type="button" onClick={onCancel}>{t('form_cancel')}</button>}
        <div className="spacer" />
        <button className="btn primary" type="submit" disabled={submitting}>{submitting ? t('form_create_saving') : t('form_create')}</button>
      </div>
    </form>
  );
}


