import { applyRules } from './rules'
import { detectEvents } from './events'
import { GROWTH } from '../data/initialState'
import { evolveCitizens, resizeCitizens, summarizeCitizens } from '../data/citizens'
import { maybeCreateCrisis } from './crises'

export const DAY_SCALE = 0.7 // one game day = 70% of a rules step

// Re-detect crises after any change; log only the new ones.
export function withEvents(next, prev, day) {
  const activeEvents = detectEvents(next)
  const fresh = activeEvents.filter((e) => !prev.activeEvents.some((a) => a.id === e.id))
  return { ...next, activeEvents, log: [...fresh.map((e) => ({ ...e, key: `${e.id}${day}${Math.random()}`, day })), ...next.log].slice(0, 30) }
}

// Advance the world by one day.
export function stepWorld(w, day) {
  if (w.ended) return w
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
  const policies = policyTarget != null && population >= policyTarget ? { ...w.policies, populationTarget: null } : w.policies
  const vitalStats = [ru.resources.food, ru.resources.water, ru.resources.energy, ru.resources.housing, ru.resources.employment, ru.health, ru.happiness]
  const criticalCount = vitalStats.filter((value) => value <= 10).length
  const collapseDays = criticalCount >= 5 ? (w.collapseDays || 0) + 1 : 0
  const ended = collapseDays >= 2
  const finalPopulation = ended ? 0 : population
  const finalCitizens = ended ? [] : citizens
  let next = { ...w, ...ru, ...summarizeCitizens(finalCitizens), citizens: finalCitizens, policies, lastCauses: ru.causes, population: finalPopulation,
    births: w.births + births + migrants, deaths: w.deaths + deaths,
    critical: criticalCount >= 2, collapseDays, ended,
    collapsedPopulation: ended ? population : w.collapsedPopulation,
    collapseDay: ended ? day : w.collapseDay,
    history: [...w.history.slice(-80), { day, population: finalPopulation, happiness: Math.round(ru.happiness) }] }
  next = withEvents(next, w, day)

  const strongestCause = [...ru.causes].sort((a, b) => b.severity - a.severity)[0]
  if (strongestCause?.severity > 0.18) {
    const [cause, effect, consequence] = strongestCause.chain
    next.log = [{ id: `cause-${day}-${strongestCause.tag}`, key: `cause-${day}-${strongestCause.tag}`, title: cause, severity: strongestCause.severity > 0.6 ? 'critical' : 'warning', why: `${effect} → ${consequence}`, day }, ...next.log].slice(0, 30)
  }

  const crisis = ended ? null : maybeCreateCrisis(next, day)
  if (crisis) {
    next.pendingEvents = [...(next.pendingEvents || []), crisis]
    next.log = [{ id: crisis.id, key: crisis.id, title: `${crisis.title} detected`, severity: crisis.severity, why: crisis.description, day }, ...next.log].slice(0, 30)
  }
  if (ended) next.log = [{ id: `collapse-${day}`, key: `collapse-${day}`, title: 'Civilization collapsed', severity: 'critical', why: 'Food, water, energy, housing, jobs, health, and happiness could no longer sustain the city.', day }, ...next.log].slice(0, 30)
  return next
}

export function buildReport(before, after, causes, chaos) {
  const chains = [...causes.values()].sort((a, b) => b.severity - a.severity).slice(0, 3).map((c) => c.chain)
  return { chaos, chains, stats: [
    { label: 'Population', from: before.population, to: after.population },
    { label: 'Happiness', from: Math.round(before.happiness), to: Math.round(after.happiness) },
    { label: 'Health', from: Math.round(before.health), to: Math.round(after.health) },
  ] }
}
