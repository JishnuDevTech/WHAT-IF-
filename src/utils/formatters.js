export const formatNumber = (n) => new Intl.NumberFormat('en-US').format(Math.round(n))

// Full class strings so Tailwind can see them.
export const statusStyles = {
  stable: { text: 'text-stable', bg: 'bg-stable', glow: 'shadow-[0_0_24px_-6px_rgba(95,179,161,.55)]', label: 'Stable' },
  warning: { text: 'text-warning', bg: 'bg-warning', glow: 'shadow-[0_0_24px_-6px_rgba(224,164,88,.55)]', label: 'Strained' },
  critical: { text: 'text-critical', bg: 'bg-critical', glow: 'shadow-[0_0_24px_-6px_rgba(224,96,94,.6)]', label: 'Critical' },
}
