export default function ProgressRing({ progress, color, size = 54, strokeWidth = 5 }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(Math.max(progress, 0), 100) / 100) * circ;
  const cx = size / 2;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cx} r={r} fill="none"
        stroke="currentColor" strokeWidth={strokeWidth}
        className="text-white/10 dark:text-white/10" />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circ} ${circ}`}
        strokeDashoffset={offset}
        strokeLinecap="round" className="ring-animate" />
    </svg>
  );
}
