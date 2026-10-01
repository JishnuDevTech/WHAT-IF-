export const ROAD_Y = 340
export const HOUSES = Array.from({ length: 12 }, (_, i) => ({ x: 84 + (i % 6) * 72, y: i < 6 ? 105 : 172 }))
export const SHOPS = [{ x: 560, w: 70, name: 'Bakery', c: '#b5654f' }, { x: 640, w: 70, name: 'Market', c: '#5f8f6a' }, { x: 720, w: 70, name: 'Café', c: '#6a7fb0' }]
export const OFFICES = [810, 880, 950].map((x) => ({ x, y: 100, w: 56, h: 110 }))
export const FACTORY = { x: 1030, y: 130, w: 100, h: 80 }
export const PLANT = { x: 930, y: 405, w: 140, h: 62 }
export const LAKE = { cx: 985, cy: 592 }
export const SCHOOL = { x: 426, y: 216, w: 102, h: 72 }
export const GYM = { x: 780, y: 438, w: 100, h: 66 }
export const HOSPITAL = { x: 850, y: 520, w: 90, h: 64 }
export const TREES = [[470, 420], [520, 540], [560, 440], [610, 520], [680, 430], [735, 500], [740, 420], [500, 480], [440, 120], [460, 235], [30, 250], [420, 390], [800, 330], [1150, 300]]
const D = { office: OFFICES.map((o) => ({ x: o.x + 28, y: 214 })).concat([{ x: 1080, y: 214 }]) }

// Where a person stands for a given place. Deterministic per person (a.r) so everyone has "their" spot.
export function spot(loc, a, built) {
  const r = a.r
  switch (loc) {
    case 'home': { const h = HOUSES[Math.floor(r[0] * built) % built]; return { x: h.x + 22 + (r[1] - 0.5) * 22, y: h.y + 48 + r[2] * 8 } }
    case 'work':
      if (a.role === 'farmer') return { x: 75 + r[1] * 310, y: 430 + r[2] * 190 }
      if (a.role === 'shop') { const s = SHOPS[Math.floor(r[3] * 3)]; return { x: s.x + 35 + (r[1] - 0.5) * 36, y: 176 + r[2] * 6 } }
      if (a.role === 'engineer') return { x: 945 + r[1] * 110, y: 480 + r[2] * 10 }
      { const d = D.office[Math.floor(r[3] * 4)]; return { x: d.x + (r[1] - 0.5) * 24, y: d.y - 4 + r[2] * 8 } }
    case 'shop': return { x: SHOPS[Math.floor(r[3] * 3)].x + 35 + (r[1] - 0.5) * 40, y: 194 + r[2] * 10 }
    case 'park': return { x: 465 + r[1] * 290, y: 415 + r[2] * 140 }
    case 'square': return { x: 565 + r[1] * 80, y: 358 + r[2] * 16 }
    case 'lake': return { x: 905 + r[1] * 160, y: 522 + r[2] * 12 }
    case 'school': return { x: 438 + r[1] * 78, y: 290 + r[2] * 8 }
    case 'gym': return { x: 790 + r[1] * 78, y: 510 + r[2] * 8 }
    case 'hospital': return { x: 855 + r[1] * 74, y: 590 + r[2] * 8 }
    case 'plant': return { x: 935 + r[1] * 130, y: 482 + r[2] * 12 }
    default: return { x: 20, y: 340 }
  }
}
