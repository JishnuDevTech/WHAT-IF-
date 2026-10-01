export const clamp = (v, min = 0, max = 100) => Math.min(max, Math.max(min, v))
export const getStatus = (v) => (v < 25 ? 'critical' : v < 45 ? 'warning' : 'stable')
export const statusColor = { stable: '#5fb3a1', warning: '#e0a458', critical: '#e0605e' }
// 0 = deep night, 1 = full day. Dawn ~5-8h, dusk ~17-21h.
export const daylight = (h) => clamp(0.5 + 0.8 * Math.sin(((h - 7) / 24) * 2 * Math.PI), 0, 1)
