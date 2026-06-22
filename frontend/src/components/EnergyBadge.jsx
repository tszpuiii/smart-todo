import { useLocale } from '../context/LocaleContext.jsx';

const EMOJI = { low: '🟢', medium: '🟡', high: '🔴' };

export default function EnergyBadge({ level = 'medium' }) {
  const { t } = useLocale();
  const key = level in EMOJI ? level : 'medium';
  return (
    <span className={`energy-pill energy-${key}`} title={t(`energy_${key}`)}>
      {EMOJI[key]} {t(`energy_${key}_short`)}
    </span>
  );
}
