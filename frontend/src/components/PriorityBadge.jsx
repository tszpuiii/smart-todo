import { useLocale } from '../context/LocaleContext.jsx';

export default function PriorityBadge({ level = 'medium' }) {
  const { t } = useLocale();
  const key = ['high', 'medium', 'low'].includes(level) ? level : 'medium';
  if (key === 'medium') return null;
  return (
    <span className={`priority-pill priority-${key}`} title={t(`priority_${key}`)}>
      {t(`priority_${key}_short`)}
    </span>
  );
}
