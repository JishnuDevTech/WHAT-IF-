import { clamp } from '../engine/calculations'

const fraction = (id, salt) => {
  const value = Math.sin((id + 1) * (salt + 17) * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

export function createCitizen(id) {
  const age = Math.round(6 + fraction(id, 1) * 76)
  const role = age < 19 ? 'student' : age > 66 ? 'elder' : fraction(id, 2) < 0.1 ? 'farmer' : fraction(id, 3) < 0.13 ? 'shop' : fraction(id, 4) < 0.1 ? 'engineer' : 'worker'
  return {
    id,
    age,
    role,
    health: Math.round(56 + fraction(id, 5) * 39),
    happiness: Math.round(42 + fraction(id, 6) * 48),
    education: Math.round(Math.min(90, 18 + age * 0.58 + fraction(id, 7) * 28)),
    fitness: Math.round(28 + fraction(id, 8) * 58),
    wealth: Math.round(350 + fraction(id, 9) * 9200),
    employed: age >= 19 && age < 67 && fraction(id, 10) < 0.68,
    home: Math.floor(fraction(id, 11) * 12),
    workplace: Math.floor(fraction(id, 12) * 8),
    currentLocation: 'home',
    activity: 'resting',
    seed: fraction(id, 13),
    look: {
      skin: ['#f1c9a5', '#d9a577', '#b57a50', '#8a5a3b', '#f5d6bd'][Math.floor(fraction(id, 14) * 5)],
      hair: ['#2b2420', '#5a3a22', '#a8763e', '#161616', '#7a4a2a'][Math.floor(fraction(id, 15) * 5)],
      shirt: ['#7a8fb8', '#b87a8f', '#8fb87a', '#b8a07a', '#8a7ab8', '#6aa6a0'][Math.floor(fraction(id, 16) * 6)],
    },
  }
}

export const createCitizens = (count) => Array.from({ length: count }, (_, id) => createCitizen(id))

export function resizeCitizens(citizens = [], count) {
  const size = Math.max(0, Math.min(5000, Math.round(count)))
  if (citizens.length >= size) return citizens.slice(0, size)
  const next = [...citizens]
  for (let id = next.length; id < size; id++) next.push(createCitizen(id))
  return next
}

export function summarizeCitizens(citizens) {
  if (!citizens.length) return { education: 0, fitness: 0, wealth: 0 }
  return ['education', 'fitness', 'wealth'].reduce((summary, key) => {
    summary[key] = Math.round(citizens.reduce((total, citizen) => total + citizen[key], 0) / citizens.length)
    return summary
  }, {})
}

const approach = (current, target, rate, limit = 100) => clamp(current + (target - current) * rate, 0, limit)

export function evolveCitizens(citizens, world, metrics, day) {
  const policies = world.policies || {}
  const educationTarget = policies.educationTarget ?? (policies.freeEducation ? 100 : world.education)
  const fitnessTarget = policies.fitnessTarget ?? world.fitness
  const healthTarget = policies.healthTarget ?? metrics.health
  const happinessTarget = policies.happinessTarget ?? metrics.happiness
  const wealthTarget = policies.wealthTarget
  const employment = metrics.resources.employment

  return citizens.map((citizen) => {
    const eligible = citizen.age >= 19 && citizen.age < 67
    const hiringSignal = ((citizen.id * 37 + day * 19) % 101) / 100
    let employed = citizen.employed
    if (eligible && !employed && hiringSignal < employment / 145) employed = true
    else if (employed && hiringSignal > employment / 100 + 0.28) employed = false

    const educationRate = policies.freeEducation || policies.educationTarget != null ? 0.035 : citizen.role === 'student' ? 0.012 : 0.003
    const fitnessRate = policies.fitnessTarget != null || policies.gyms > 50 ? 0.045 : 0.012
    const income = employed ? 12 + citizen.education * 0.08 : -2
    const wealth = wealthTarget == null
      ? clamp(citizen.wealth + income + (metrics.businessActivity - 50) * 0.12, 0, 100000)
      : approach(citizen.wealth, wealthTarget, 0.035, 100000)

    const health = approach(citizen.health, healthTarget, 0.055)
    const fitness = approach(citizen.fitness, fitnessTarget, fitnessRate)
    const education = approach(citizen.education, educationTarget, educationRate)
    let currentLocation = 'home', activity = 'resting'
    if (health < 34) { currentLocation = 'hospital'; activity = 'seeking care' }
    else if (citizen.age < 19) { currentLocation = 'school'; activity = 'studying' }
    else if (policies.workFromHome && employed) activity = 'working from home'
    else if (fitness > 78 && policies.gyms > 40) { currentLocation = 'gym'; activity = 'exercising' }
    else if (employed) { currentLocation = 'work'; activity = 'working' }
    else if (eligible && employment < 40) { currentLocation = 'square'; activity = 'looking for work' }
    else if (citizen.seed < 0.5) { currentLocation = 'shop'; activity = 'shopping' }
    else { currentLocation = 'park'; activity = 'socializing' }

    return {
      ...citizen,
      employed,
      education,
      fitness,
      health,
      happiness: approach(citizen.happiness, happinessTarget, 0.06),
      wealth,
      currentLocation,
      activity,
    }
  })
}
