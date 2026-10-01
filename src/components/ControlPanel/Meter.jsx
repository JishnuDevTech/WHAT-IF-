import { getStatus, statusColor } from '../../engine/calculations'

// A segmented game-style gauge: drag, click, or use the arrow keys.
export default function Meter({ label, icon: Icon, value, onChange, disabled }) {
  const set = (e) => { const b = e.currentTarget.getBoundingClientRect(); onChange(Math.round(((e.clientX - b.left) / b.width) * 20) * 5) }
  const col = statusColor[getStatus(value)]
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center justify-between text-xs"><span className="flex items-center gap-1 text-mist"><Icon size={13} aria-hidden="true" />{label}</span><b className="font-display text-sm" style={{ color: col }}>{Math.round(value)}</b></div>
      <div role="slider" tabIndex={disabled ? -1 : 0} aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)} aria-disabled={disabled}
        onPointerDown={(e) => { if (disabled) return; e.currentTarget.setPointerCapture(e.pointerId); set(e) }}
        onPointerMove={(e) => e.buttons && !disabled && set(e)}
        onKeyDown={(e) => { const d = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[e.key]; if (d && !disabled) { e.preventDefault(); onChange(value + d) } }}
        className={`flex h-7 touch-none select-none gap-[2px] rounded-md bg-black/30 p-[3px] outline-none focus-visible:ring-2 focus-visible:ring-recovery ${disabled ? 'opacity-60' : 'cursor-pointer'}`}>
        {Array.from({ length: 20 }, (_, i) => <span key={i} className="flex-1 rounded-[2px] transition-colors duration-500" style={{ background: i < value / 5 ? col : '#1e2735' }} />)}
      </div>
    </div>
  )
}
