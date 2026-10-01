import { motion } from 'framer-motion'
import { HOUSES, SHOPS, OFFICES, PLANT } from '../../data/layout'
import { daylight, clamp } from '../../engine/calculations'

const L = (cx, cy, r, o, k) => <circle key={k} cx={cx} cy={cy} r={r} fill="url(#glow)" style={{ opacity: clamp(o), transition: 'opacity .8s' }} />
// Darkness first, then lights on top so windows glow through the night.
export function DayNight({ hour, r, built, critical }) {
  const l = daylight(hour), night = 1 - l, ok = r.energy > 18 ? 1 : 0.1
  const warm = Math.max(0, 0.22 - Math.abs(l - 0.4) * 0.6)
  return (
    <g pointerEvents="none">
      <defs><radialGradient id="glow"><stop offset="0" stopColor="#ffd890" stopOpacity=".95" /><stop offset="1" stopColor="#ffd890" stopOpacity="0" /></radialGradient></defs>
      <rect x="0" y="0" width="1200" height="700" fill="#050b1c" style={{ opacity: Math.min(0.82, night * 0.64 + (critical ? 0.16 : 0)), transition: 'opacity 2s linear' }} />
      <rect x="0" y="0" width="1200" height="700" fill="#ff9a4d" style={{ opacity: warm, transition: 'opacity .5s linear' }} />
      <g style={{ mixBlendMode: 'screen' }}>
        {HOUSES.slice(0, built).map((h, i) => L(h.x + 22, h.y + 32, 34, night * 0.95 * ok, `h${i}`))}
        {SHOPS.map((s, i) => L(s.x + 35, 150, 52, hour < 21 ? night * 0.9 * ok : 0, `s${i}`))}
        {OFFICES.map((o, i) => L(o.x + 28, 150, 62, night * 0.35 * ok, `o${i}`))}
        {L(PLANT.x + 70, PLANT.y + 30, 90, night * 0.75 * (r.energy / 100), 'p')}
        {[100, 240, 380, 520, 700, 840, 1000, 1120].map((x, i) => L(x, 322, 48, night * 0.9 * ok, `l${i}`))}
        {L(600, 388, 40, night * 0.5 * ok, 'f')}
      </g>
    </g>
  )
}

const full = { x: 10, y: 10, width: 1180, height: 680, rx: 40 }
export function Weather({ weather }) {
  const drops = (n, m) => Array.from({ length: n }, (_, i) => <line key={i} className="drop" x1={(i * m) % 1180 + 10} x2={(i * m) % 1180 + 4} y1="0" y2="16" stroke="#9cc4ee" strokeWidth="1.3" style={{ animationDelay: `${(i % 9) * 0.13}s`, animationDuration: `${0.6 + (i % 5) * 0.1}s` }} />)
  return (
    <g pointerEvents="none">
      {weather === 'rain' && <><rect {...full} fill="#1b2a44" opacity=".22" />{drops(28, 47)}</>}
      {weather === 'heat' && <rect {...full} fill="#e0a458" className="heat" />}
      {weather === 'storm' && <><rect {...full} fill="#05080d" opacity=".4" /><rect {...full} fill="#fff" className="flash" />{drops(32, 61)}</>}
    </g>
  )
}

export function EventMarkers({ events }) {
  return events.map((e) => {
    const col = e.severity === 'recovery' ? '#6aa7e8' : e.severity === 'warning' ? '#e0a458' : '#e0605e', [x, y] = e.where
    return (
      <motion.g key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <circle className="pulse" cx={x} cy={y} r="18" fill="none" stroke={col} strokeWidth="2" />
        <circle cx={x} cy={y} r="11" fill={col} /><text x={x} y={y + 5} textAnchor="middle" fontSize="15" fontWeight="800" fill="#080b11">{e.severity === 'recovery' ? '+' : '!'}</text>
        <text x={x} y={y + 32} textAnchor="middle" fontSize="13" fontWeight="700" fill={col} stroke="#080b11" strokeWidth="3" paintOrder="stroke">{e.title}</text>
      </motion.g>)
  })
}
