import { useState, useEffect } from 'react';
import { useLocale } from '../context/LocaleContext.jsx';
import { inferEnergyFromTitle } from '../utils/inferEnergy.js';

export default function TaskForm({ onCreate, onCancel, initialCategory = '', initialEnergy = 'medium' }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(initialCategory || 'general');
  const [status, setStatus] = useState('todo');
  const [energyLevel, setEnergyLevel] = useState(initialEnergy);
  const [energyTouched, setEnergyTouched] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (!energyTouched) setEnergyLevel(initialEnergy);
  }, [initialEnergy, energyTouched]);

  function handleTitleChange(value) {
    setTitle(value);
    if (energyTouched) return;
    const inferred = inferEnergyFromTitle(value);
    setEnergyLevel(inferred || initialEnergy);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCreate({ title, description, category, status, energyLevel, priority, notes, subtasks, dueDate: dueDate || undefined });
      setTitle(''); setDescription(''); setCategory(initialCategory || 'general'); setStatus('todo');
      setEnergyLevel(initialEnergy); setEnergyTouched(false); setPriority('medium'); setDueDate(''); setNotes(''); setSubtasks([]);
      if (onCancel) onCancel();
    } finally {
      setSubmitting(false);
    }
  }

  const inferred = inferEnergyFromTitle(title);
  const showAutoHint = !energyTouched && title.trim() && inferred;

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>{t('form_title')}
        <input value={title} onChange={(e) => handleTitleChange(e.target.value)} required placeholder={t('form_title_ph')} />
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
      <label>{t('form_energy')}
        <select value={energyLevel} onChange={(e) => { setEnergyTouched(true); setEnergyLevel(e.target.value); }}>
          <option value="low">🟢 {t('energy_low')}</option>
          <option value="medium">🟡 {t('energy_medium')}</option>
          <option value="high">🔴 {t('energy_high')}</option>
        </select>
        {showAutoHint && <span className="muted" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>{t('form_energy_auto_hint')}</span>}
      </label>
      <label>{t('form_priority')}
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="high">🔥 {t('priority_high')}</option>
          <option value="medium">{t('priority_medium')}</option>
          <option value="low">{t('priority_low')}</option>
        </select>
      </label>
      <label>{t('form_due')}
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} min="1000-01-01" max="9999-12-31" />
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
