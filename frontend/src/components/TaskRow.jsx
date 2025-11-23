import { useLocale } from '../context/LocaleContext.jsx';

export default function TaskRow({ task, selected, onSelect, onToggle, onOpenDetails, isNew, isRemoving }) {
  const { t } = useLocale();
  return (
    <div className={`task-row ${selected ? 'selected' : ''} ${isNew ? 'new-row' : ''} ${task.completed ? 'done' : ''} ${isRemoving ? 'removing' : ''}`} onClick={() => onSelect(task._id)}>
      <input type="checkbox" checked={task.completed} onChange={(e)=>{e.stopPropagation(); onToggle(task._id);}} />
      <div className="row-main">
        <div className="row-title">{task.title}</div>
        <div className="row-meta">
          {task.dueDate && <span className="meta">{new Date(task.dueDate).toLocaleDateString()}</span>}
          {Array.isArray(task.subtasks) && task.subtasks.length > 0 && <span className="meta">{task.subtasks.length} {t('subtasks')}</span>}
          {task.category && <span className="tag-pill">{task.category}</span>}
        </div>
      </div>
      <button className="chevron-btn" onClick={(e)=>{e.stopPropagation(); onOpenDetails?.(task._id);}} aria-label="open details">›</button>
    </div>
  );
}


