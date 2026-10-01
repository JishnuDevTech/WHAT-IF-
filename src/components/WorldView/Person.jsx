import { memo, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

const UNI = { farmer: '#7a9c4a', worker: '#4f86c6', shop: '#c46a6a', engineer: '#d98a3d' }
const BUB = { sick: ['#e0605e', '+'], water: ['#4f9bd9', '~'], hungry: ['#e0a458', '!'], alert: ['#e0605e', '!'], star: ['#e6c35a', '★'], jobless: ['#8d98ab', '?'], z: ['#5a6a8a', 'z'], book: ['#82b9d8', 'a'], strong: ['#8fc98f', '↑'] }

function Figure({ a, moving }) {
  const { skin, hair, shirt } = a.look, kid = a.age < 19 || a.role === 'child', old = a.age > 66 || a.role === 'elder', role = a.emp ? a.role : null
  const build = 1 + Math.max(0, Math.min(0.18, (a.fitness - 50) / 280))
  const torso = 10 + Math.max(0, Math.min(4, (a.fitness - 55) / 8))
  return (
    <g transform={`scale(${a.dir * (kid ? 0.78 : 1) * 1.15 * build},${(kid ? 0.78 : 1) * 1.15})`} style={{ filter: a.state === 'seeking care' ? 'saturate(.25) brightness(.9)' : undefined }}>
      <ellipse cy="0.5" rx="6" ry="2" fill="#000" opacity=".3" />
      <g className={moving ? 'walk' : ''}>
        <rect className={moving ? 'legA' : ''} x="-3.6" y="-9" width="3.2" height="9" rx="1.2" fill="#2c3547" />
        <rect className={moving ? 'legB' : ''} x="0.4" y="-9" width="3.2" height="9" rx="1.2" fill="#2c3547" />
        <rect x={-torso / 2} y="-19" width={torso} height="11" rx="3" fill={role ? UNI[role] : shirt} />
        {a.fitness > 82 && <><circle cx="-6.5" cy="-16" r="2.2" fill={shirt} /><circle cx="6.5" cy="-16" r="2.2" fill={shirt} /></>}
        {role === 'shop' && <rect x="-3.5" y="-16" width="7" height="8" rx="1" fill="#f3efe6" />}
        {role === 'engineer' && <rect x="-1.2" y="-19" width="2.4" height="11" fill="#f2e24b" />}
        <circle cy="-23.5" r="4.3" fill={skin} />
        <path d="M-4.4 -24a4.4 4.4 0 0 1 8.8 0z" fill={old ? '#cfd2d9' : hair} />
        {role === 'farmer' && <><ellipse cy="-26.5" rx="7.2" ry="1.8" fill="#d9b96a" /><path d="M-3.6 -26.5a3.6 3.6 0 0 1 7.2 0z" fill="#d9b96a" /></>}
        {(role === 'worker' || role === 'engineer') && <path d="M-4.8 -25.8a4.8 4.8 0 0 1 9.6 0z" fill={role === 'worker' ? '#f0c14b' : '#f08a3c'} />}
      </g>
    </g>
  )
}

const Person = memo(({ a }) => {
  const [moving, setMoving] = useState(false)
  const anim = useMemo(() => ({ x: [null, null, a.x, a.x], y: [null, a.lane, a.lane, a.y] }), [a.key])
  const b = BUB[a.bubble]
  return (
    <motion.g initial={{ x: a.x, y: a.y }} animate={anim} transition={{ duration: a.dur, times: [0, 0.2, 0.8, 1], ease: 'linear' }}
      onAnimationStart={() => setMoving(true)} onAnimationComplete={() => setMoving(false)}>
      <title>{`${a.role === 'student' ? 'student' : a.emp ? a.role : a.role === 'child' ? 'child' : a.role === 'elder' ? 'elder' : 'resident'} · ${a.state} · age ${a.age} · fitness ${Math.round(a.fitness)} · home ${a.home + 1} · workplace ${a.workplace + 1}`}</title>
      <Figure a={a} moving={moving} />
      {b && <g transform="translate(0,-40)"><circle r="5.5" fill={b[0]} /><text y="3.4" textAnchor="middle" fontSize="9" fontWeight="800" fill="#080b11">{b[1]}</text></g>}
    </motion.g>
  )
})
export default Person
