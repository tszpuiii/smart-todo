export default function CategoryBadge({ name, colorKey = 'cyan' }) {
  if (!name) return null;
  const key = colorKey || 'cyan';
  return (
    <span className={`tag-pill list-pill list-pill-${key}`}>
      {name}
    </span>
  );
}
