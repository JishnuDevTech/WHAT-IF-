import { HOUSES, SHOPS, OFFICES, FACTORY, PLANT, LAKE, TREES, SCHOOL, GYM, HOSPITAL } from '../../data/layout'
import { clamp } from '../../engine/calculations'

const T = { transition: 'fill 1.2s, opacity 1.2s' }
export default function Town({ r, built, hour, cars, health, schoolActivity, gymActivity, businessActivity }) {
  const hue = 35 + (r.food / 100) * 70
  const act = clamp(r.employment / 100) * (0.2 + 0.4 * r.energy / 100 + 0.4 * businessActivity / 100)
  const working = hour >= 7.5 && hour < 17
  const schoolOpen = hour >= 7 && hour < 16
  const gymOpen = hour >= 6 && hour < 22
  return (
    <g>
      <rect x="10" y="10" width="1180" height="680" rx="40" fill="#2c4636" stroke="#1d2838" />
      <rect x="450" y="395" width="320" height="180" rx="20" fill="#35563f" /><ellipse cx="610" cy="480" rx="40" ry="20" fill="#4a86a8" />
      <rect x="540" y="354" width="120" height="48" rx="8" fill="#5b6070" /><circle cx="600" cy="388" r="12" fill="#7bb4d4" /><circle cx="600" cy="388" r="5" fill="#cfe8f5" />
      {[[288, 226, 100], [588, 186, 140], [868, 214, 112], [1068, 214, 112]].map(([x, y, h], i) => <rect key={i} x={x} y={y} width="24" height={h} fill="#434a58" />)}
      <rect x="40" y="326" width="1120" height="28" fill="#434a58" /><line x1="40" x2="1160" y1="340" y2="340" stroke="#6b7385" strokeDasharray="16 12" />
      {[100, 240, 380, 520, 700, 840, 1000, 1120].map((x) => <rect key={x} x={x} y="320" width="3" height="14" fill="#202632" />)}
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x="60" y={410 + i * 28} width="340" height="20" rx="4" style={{ fill: r.water < 40 ? '#746449' : `hsl(${hue} ${24 + r.water * 0.2 + r.food * 0.12}% ${20 + r.food * 0.1}%)`, transition: 'fill 1.2s' }} />)}
      <ellipse cx={LAKE.cx} cy={LAKE.cy} rx="140" ry="58" fill="#233a2e" /><ellipse cx={LAKE.cx} cy={LAKE.cy} rx={40 + r.water * 0.95} ry={14 + r.water * 0.42} fill="#3f86b4" style={T} />
      {r.water < 30 && <path d="M900 585l24 8 12-12 26 14M1010 600l20-8 24 6" stroke="#8a7656" fill="none" strokeWidth="2.5" />}
      {HOUSES.map((h, i) => { const on = i < built; return (
        <g key={i} style={{ ...T, opacity: on ? 1 : 0.28 }}>
          <rect x={h.x} y={h.y + 12} width="44" height="30" rx="2" fill={on ? '#dccaa4' : 'none'} stroke="#8d8062" strokeDasharray={on ? '' : '3 3'} />
          {on && <><polygon points={`${h.x - 4},${h.y + 14} ${h.x + 22},${h.y - 2} ${h.x + 48},${h.y + 14}`} fill="#a4584b" /><rect x={h.x + 18} y={h.y + 28} width="9" height="14" fill="#6b4a38" /><rect x={h.x + 5} y={h.y + 21} width="8" height="8" fill="#9fc3d6" /><rect x={h.x + 31} y={h.y + 21} width="8" height="8" fill="#9fc3d6" /></>}
        </g>) })}
      <g opacity={0.55 + schoolActivity / 220}>
        <rect x={SCHOOL.x} y={SCHOOL.y + 15} width={SCHOOL.w} height={SCHOOL.h - 15} rx="4" fill="#d8d3b9" stroke="#8f947e" />
        <polygon points={`${SCHOOL.x - 5},${SCHOOL.y + 17} ${SCHOOL.x + SCHOOL.w / 2},${SCHOOL.y - 2} ${SCHOOL.x + SCHOOL.w + 5},${SCHOOL.y + 17}`} fill="#a55b4b" />
        <rect x={SCHOOL.x + 42} y={SCHOOL.y + 44} width="18" height="28" fill="#725443" />
        {[0, 1, 2].map((i) => <rect key={i} x={SCHOOL.x + 10 + i * 28} y={SCHOOL.y + 25} width="16" height="14" fill={schoolOpen && schoolActivity > 40 ? '#ffe3a0' : '#9fc3d6'} style={T} />)}
        <text x={SCHOOL.x + SCHOOL.w / 2} y={SCHOOL.y - 8} textAnchor="middle" fontSize="10" fill="#d7e0eb" fontFamily="Manrope">School</text>
      </g>
      {SHOPS.map((s) => (
        <g key={s.name}><rect x={s.x} y="124" width={s.w} height="60" rx="3" fill="#d9ccb4" /><rect x={s.x - 3} y="118" width={s.w + 6} height="14" rx="3" fill={s.c} />
          <rect x={s.x + 8} y="146" width="22" height="22" fill="#a9cfe0" /><rect x={s.x + 40} y="150" width="16" height="34" fill="#6b4a38" /><text x={s.x + s.w / 2} y="113" textAnchor="middle" fontSize="10" fill="#cfd8e6" fontFamily="Manrope">{s.name}</text></g>))}
      {OFFICES.map((o, i) => (
        <g key={i}><rect x={o.x} y={o.y} width={o.w} height={o.h} rx="3" fill="#5c6a82" />
          {Array.from({ length: 12 }, (_, k) => <rect key={k} x={o.x + 8 + (k % 3) * 15} y={o.y + 10 + Math.floor(k / 3) * 24} width="10" height="14" fill="#bfeee2" style={{ ...T, opacity: working && (i * 12 + k) / 36 < act ? 0.95 : 0.18 }} />)}</g>))}
      {gymActivity > 38 && <g opacity={0.35 + gymActivity / 150}>
        <rect x={GYM.x} y={GYM.y + 12} width={GYM.w} height={GYM.h - 12} rx="4" fill="#77939a" stroke="#b2c0bd" />
        <polygon points={`${GYM.x - 4},${GYM.y + 14} ${GYM.x + 18},${GYM.y - 1} ${GYM.x + GYM.w + 4},${GYM.y + 14}`} fill="#354b58" />
        {[0, 1, 2].map((i) => <rect key={i} x={GYM.x + 12 + i * 27} y={GYM.y + 26} width="18" height="20" fill={gymOpen && gymActivity > 45 ? '#ffd789' : '#91c5cf'} style={T} />)}
        <text x={GYM.x + GYM.w / 2} y={GYM.y - 6} textAnchor="middle" fontSize="10" fill="#d7e0eb" fontFamily="Manrope">Gym</text>
      </g>}
      <g opacity={0.7 + health / 330}>
        <rect x={HOSPITAL.x} y={HOSPITAL.y + 12} width={HOSPITAL.w} height={HOSPITAL.h - 12} rx="4" fill="#d8ddd8" stroke="#a3b3b1" />
        <rect x={HOSPITAL.x + 38} y={HOSPITAL.y - 2} width="14" height="20" fill="#d8ddd8" />
        <rect x={HOSPITAL.x + 42} y={HOSPITAL.y + 1} width="6" height="14" fill="#c45b56" />
        <rect x={HOSPITAL.x + 38} y={HOSPITAL.y + 5} width="14" height="6" fill="#c45b56" />
        <text x={HOSPITAL.x + HOSPITAL.w / 2} y={HOSPITAL.y + HOSPITAL.h + 11} textAnchor="middle" fontSize="10" fill="#d7e0eb" fontFamily="Manrope">Hospital</text>
      </g>
      <rect x={FACTORY.x} y={FACTORY.y} width={FACTORY.w} height={FACTORY.h} rx="3" fill="#6b6460" /><rect x={FACTORY.x + 70} y="95" width="14" height="40" fill="#524c49" />
      {working && act > 0.3 && <circle className="smoke" cx={FACTORY.x + 77} cy="92" r="7" fill="#c0c6d2" />}
      <rect x={PLANT.x} y={PLANT.y} width={PLANT.w} height={PLANT.h} rx="4" fill="#5a6577" /><rect x={PLANT.x + 14} y={PLANT.y - 28} width="22" height="30" fill="#7c879a" /><rect x={PLANT.x + 100} y={PLANT.y - 22} width="22" height="24" fill="#7c879a" />
      <circle cx={PLANT.x + 70} cy={PLANT.y + 30} r="9" fill="#f0b45a" className={r.energy < 25 ? 'flicker' : ''} style={{ ...T, opacity: 0.2 + r.energy / 125 }} />
      {TREES.map(([x, y], i) => <g key={i}><rect x={x - 2} y={y} width="4" height="12" fill="#5a4030" /><circle cx={x} cy={y - 4} r="15" fill="#2f6b45" /><circle cx={x + 6} cy={y - 10} r="10" fill="#3a8052" /></g>)}
      {cars && [330, 700, 1080].map((x, i) => <g key={i} transform={`translate(${(x + hour * 22) % 1140 + 30},${i === 1 ? 348 : 330})`} opacity={r.environment < 45 ? 0.4 : 0.9}><rect x="-12" y="-7" width="24" height="9" rx="3" fill={['#c67856', '#6c91b9', '#d7b562'][i]} /><circle cx="-7" cy="3" r="3" fill="#171d26" /><circle cx="7" cy="3" r="3" fill="#171d26" /></g>)}
      {[['Homes', 84, 90], ['Shops', 560, 100], ['Work', 810, 86], ['Fields', 62, 402], ['Park', 456, 390], ['Power', 934, 372], ['Lake', 910, 538]].map(([t, x, y]) => <text key={t} x={x} y={y} fontSize="11" fill="#8fa1b8" fontFamily="Manrope">{t}</text>)}
    </g>
  )
}
