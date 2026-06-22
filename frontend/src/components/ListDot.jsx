export default function ListDot({ colorKey = 'cyan' }) {
  return <span className={`dot ${colorKey}`} aria-hidden="true" />;
}
