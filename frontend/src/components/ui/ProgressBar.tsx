interface ProgressBarProps {
  value: number;
  label?: string;
  showPercent?: boolean;
  size?: 'sm' | 'md';
  color?: string;
}

export function ProgressBar({ value, label, showPercent = true, size = 'md', color = 'bg-primary-600' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const height = size === 'sm' ? 'h-2' : 'h-3';

  return (
    <div>
      {(label || showPercent) && (
        <div className="flex justify-between mb-1.5">
          {label && <span className="text-sm text-slate-600">{label}</span>}
          {showPercent && <span className="text-sm font-medium text-slate-900">{clamped}%</span>}
        </div>
      )}
      <div className={`w-full ${height} bg-slate-200 rounded-full overflow-hidden`}>
        <div
          className={`${height} ${color} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
