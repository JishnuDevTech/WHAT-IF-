import { applyRules } from './rules'
import { detectEvents } from './events'
import { GROWTH } from '../data/initialState'
import { evolveCitizens, resizeCitizens, summarizeCitizens } from '../data/citizens'

export const DAY_SCALE = 0.7 // one game day = 70% of a rules step

// Re-detect crises after any change; log only the new ones.
export function withEvents(next, prev, day) {
  const activeEvents = detectEvents(next)
  const fresh = activeEvents.filter((e) => !prev.activeEvents.some((a) => a.id === e.id))
  return { ...next, activeEvents, log: [...fresh.map((e) => ({ ...e, key: `${e.id}${day}${Math.random()}`, day })), ...next.log].slice(0, 30) }
}

// Advance the world by one day.
export function stepWorld(w, day) {
  const ru = applyRules(w, DAY_SCALE)
  const g = GROWTH.find((x) => x.id === w.growth)
  const pop = w.population
  const deaths = Math.min(pop - 1, Math.round(pop * ru.mortality))
  const births = Math.max(0, Math.min(5000 - pop, Math.round(pop * ru.birthRate)))
  const policyTarget = w.policies?.populationTarget
  const naturalMigrants = g.migration && ru.happiness > 50 && ru.resources.housing > 35 ? Math.round(pop * 0.012 * DAY_SCALE) : 0
  const policyMigrants = policyTarget > pop ? Math.ceil((policyTarget - pop) * 0.05 * DAY_SCALE) : 0
  const migrants = Math.max(naturalMigrants, policyMigrants)
  const population = Math.min(5000, pop - deaths + births + migrants)
  const citizens = evolveCitizens(resizeCitizens(w.citizens, population), w, ru, day)
  const policies = population >= policyTarget ? { ...w.policies, populationTarget: null } : w.policies
  const next = { ...w, ...ru, ...summarizeCitizens(citizens), citizens, policies, lastCauses: ru.causes, population,
    births: w.births + births + migrants, deaths: w.deaths + deaths,
    history: [...w.history.slice(-80), { day, population, happiness: Math.round(ru.happiness) }] }
  return withEvents(next, w, day)
}

export function buildReport(before, after, causes, chaos) {
  const chains = [...causes.values()].sort((a, b) => b.severity - a.severity).slice(0, 3).map((c) => c.chain)
  return { chaos, chains, stats: [
    { label: 'Population', from: before.population, to: after.population },
    { label: 'Happiness', from: Math.round(before.happiness), to: Math.round(after.happiness) },
    { label: 'Health', from: Math.round(before.health), to: Math.round(after.health) },
  ] }
}
