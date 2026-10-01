import { spot, ROAD_Y } from '../data/layout'

const SKIN = ['#f1c9a5', '#d9a577', '#b57a50', '#8a5a3b', '#f5d6bd']
const HAIR = ['#2b2420', '#5a3a22', '#a8763e', '#161616', '#7a4a2a']
const SHIRT = ['#7a8fb8', '#b87a8f', '#8fb87a', '#b8a07a', '#8a7ab8', '#6aa6a0']

const fraction = (id, salt) => {
  const value = Math.sin((id + 1) * (salt + 17) * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

export function makeAgent(id, built, entry = false, citizen = null) {
  const r = Array.from({ length: 10 }, (_, i) => fraction(id, i)), q = fraction(id, 19)
  if (citizen) {
    r[0] = ((citizen.home % built) + 0.5) / built
    r[3] = ((citizen.workplace % 4) + 0.5) / 4
  }
  const role = citizen?.role || (q < 0.16 ? 'farmer' : q < 0.52 ? 'worker' : q < 0.64 ? 'shop' : q < 0.72 ? 'engineer' : q < 0.86 ? 'student' : 'elder')
  const a = { id, citizenId: citizen?.id ?? id, home: citizen?.home ?? 0, workplace: citizen?.workplace ?? 0, currentLocation: citizen?.currentLocation ?? 'home', activity: citizen?.activity ?? 'resting', r, role, age: citizen?.age ?? 30, health: citizen?.health ?? 70, happiness: citizen?.happiness ?? 65, education: citizen?.education ?? 40, fitness: citizen?.fitness ?? 50, wealth: citizen?.wealth ?? 1000,
    employed: citizen?.employed ?? false, canWork: citizen ? citizen.age >= 19 && citizen.age < 67 : role !== 'student' && role !== 'elder', emp: citizen?.employed ?? false,
    loc: entry ? 'entry' : 'home', state: 'resting', bubble: null, dir: 1, dur: 0, lane: ROAD_Y - 8 + r[5] * 16, built,
    look: citizen?.look || { skin: SKIN[Math.floor(r[6] * 5)], hair: HAIR[Math.floor(r[7] * 5)], shirt: SHIRT[Math.floor(r[8] * 6)] } }
  return { ...a, ...spot(a.loc, a, built) }
}

// Decide where a person wants to be, and why, from the time of day and the state of the world.
function want(a, c) {
  const { h, w, ev } = c, R = w.resources
  const t = (h - a.r[4] * 1.2 + 24) % 24
  const emp = a.canWork && (a.employed ?? a.r[7] < c.share)
  const at = (loc, state, bubble = null) => ({ loc, state, bubble, emp })
  if (t < 6.5 || t >= 21.5) return at('home', 'sleeping', t >= 22 || t < 5 ? 'z' : null)
  if (a.health < 34 || a.r[6] < Math.max(0, (45 - w.health) / 45) * 0.45) return at('hospital', 'seeking care', 'sick')
  if (w.weather === 'storm') return at('home', 'sheltering')
  if (t >= 17) {
    if ((ev.has('food_surplus') || w.happiness > 80) && a.r[8] < 0.6) return at('park', 'celebrating', 'star')
    return a.r[8] < 0.35 ? at('park', 'relaxing') : a.r[8] < 0.6 && t < 20 ? at('shop', 'shopping') : at('home', 'resting')
  }
  if (t < 7.5) return at('home', 'waking up')
  if (a.role === 'student' && t >= 7.5 && t < 15.5) return at('school', 'studying', 'book')
  if ((a.fitness > 74 || w.policies?.fitnessTarget >= 80 || w.policies?.gyms > 40) && ((t >= 6.5 && t < 8.5) || (t >= 16 && t < 20))) {
    return w.policies?.gyms > 40 ? at('gym', 'exercising', 'strong') : at('park', 'exercising', 'strong')
  }
  if (R.water < 45 && a.r[9] < ((45 - R.water) / 45) * 0.8 && t >= 10 && t < 16) return at('lake', 'fetching water', 'water')
  if (w.policies?.workFromHome && emp) return at('home', 'working from home')
  if (emp) {
    if (ev.has('energy_failure') && a.r[8] < 0.4) return at('plant', 'protesting the blackout', 'alert')
    if (t >= 12 && t < 13 && a.r[8] < 0.5) return at('shop', 'lunch break')
    return at('work', 'working')
  }
  if (R.food < 45 && a.r[8] < ((45 - R.food) / 45) * 0.8 && t >= 11 && t < 15) return at('shop', 'looking for food', 'hungry')
  if (ev.has('job_crisis') && a.canWork && a.r[8] < 0.6) return at('square', 'protesting', 'alert')
  if (a.role === 'child') return at('park', 'playing')
  const bubble = a.canWork && R.employment < 55 ? 'jobless' : null
  return [at('park', 'strolling', bubble), at('shop', 'shopping', bubble), at('square', 'chatting', bubble)][Math.floor(t / 2.5 + a.r[3] * 3) % 3]
}

export function planAll(agents, c) {
  return agents.map((a) => {
    const n = want(a, c)
    const moved = n.loc !== a.loc || (n.loc === 'home' && a.built !== c.built)
    if (!moved && n.state === a.state && n.bubble === a.bubble && n.emp === a.emp) return a
    if (!moved) return { ...a, state: n.state, bubble: n.bubble, emp: n.emp }
    const p = spot(n.loc, a, c.built)
    const dist = Math.abs(a.y - ROAD_Y) + Math.abs(p.x - a.x) + Math.abs(ROAD_Y - p.y)
    return { ...a, ...n, ...p, built: c.built, dir: p.x >= a.x ? 1 : -1, dur: Math.max(0.4, (dist / 450) * c.hourReal), key: (a.key || 0) + 1 }
  })
}
