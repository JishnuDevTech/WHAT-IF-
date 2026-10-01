import { clamp } from './calculations'
import { WEATHER, GROWTH } from '../data/initialState'

// Every rule that fires also records a CAUSE -> EFFECT -> CONSEQUENCE chain.
export function applyRules(w, S = 1) {
  const r = { ...w.resources }, causes = []
  const policies = w.policies || {}
  const wx = WEATHER.find((x) => x.id === w.weather).fx
  const pressure = w.population / 1000
  const say = (tag, severity, chain) => severity > 0.12 && causes.push({ tag, severity, chain })

  const dry = Math.max(0, (45 - r.water) / 45)
  say('dry', dry, ['Water is scarce', 'Crops fail and people go thirsty', 'Food and health fall'])
  const d = {
    food: 1.5 - 1.5 * pressure + (wx.food || 0) - 4 * dry + (policies.diet === 'vegetarian' ? 0.55 : 0),
    water: 1.2 - 1.2 * pressure + (wx.water || 0) - Math.max(0, (45 - r.water) / 45) * 1.1,
    energy: 1.2 - 1.2 * pressure + (wx.energy || 0),
    housing: 0.4 - 2.5 * Math.max(0, pressure - 1) + (wx.housing || 0),
  }
  say('crowd', Math.max(0, pressure - 1) * 4, ['The population outgrows its homes', 'Housing and food are stretched', 'Social pressure builds'])
  if (w.weather !== 'clear') say('wx', 0.5, [`${w.weather[0].toUpperCase() + w.weather.slice(1)} hits the world`, 'Water, power and shelter shift', 'Supplies change'])
  for (const k in d) r[k] = clamp(r[k] + d[k] * S)

  const educationTarget = policies.educationTarget ?? (policies.freeEducation ? 100 : w.education)
  const fitnessTarget = policies.fitnessTarget ?? w.fitness
  const education = clamp(w.education + (educationTarget - w.education) * 0.065 * S)
  const fitness = clamp(w.fitness + (fitnessTarget - w.fitness) * (policies.gyms > 50 ? 0.09 : 0.065) * S)
  const hTarget = 0.4 * r.food + 0.4 * r.water + 0.2 * r.housing
  const fitnessHealth = Math.max(0, fitness - 45) * 0.08
  const healthTarget = policies.healthTarget ?? (hTarget + fitnessHealth)
  const health = clamp(w.health + (healthTarget - w.health) * 0.35 * S)
  say('hunger', (40 - Math.min(r.food, r.water)) / 40, ['Food or water runs short', 'People grow weak and sick', 'Deaths rise, work slows'])

  const eTarget = clamp(policies.employmentTarget ?? (0.5 * r.energy + 0.35 * health + 0.15 * education), 0, 100)
  r.employment = clamp(r.employment + (eTarget - r.employment) * 0.2 * S)
  say('power', (40 - r.energy) / 40, ['Energy is low', 'Workplaces slow down', 'Jobs disappear'])
  say('sick', (50 - health) / 50, ['Poor health', 'Fewer people can work', 'Employment falls'])

  const hapTarget = policies.happinessTarget ?? (0.28 * health + 0.18 * r.employment + 0.18 * r.housing + 0.14 * r.food + 0.12 * r.energy + 0.1 * education)
  const happiness = clamp(w.happiness + (hapTarget - w.happiness) * 0.3 * S)
  say('jobless', (35 - r.employment) / 35, ['Unemployment', 'Income and purpose vanish', 'Happiness drops'])
  say('homeless', (35 - r.housing) / 35, ['Housing shortage', 'People crowd together', 'Happiness drops'])

  const environmentalTarget = 76 + (policies.cars === false ? 18 : 0) + (w.weather === 'rain' ? 3 : 0) - (r.energy < 20 ? 8 : 0)
  const environment = clamp(w.environment + (environmentalTarget - w.environment) * 0.08 * S)
  const householdWealth = clamp((w.wealth || 0) / 10000 * 100)
  const businessTarget = clamp(r.employment * 0.4 + education * 0.3 + r.energy * 0.2 + householdWealth * 0.1)
  const businessActivity = clamp(w.businessActivity + (businessTarget - w.businessActivity) * 0.12 * S)
  const schoolTarget = clamp(22 + Math.max(0, educationTarget - education) * 0.7 + (policies.freeEducation ? 24 : 0))
  const gymTarget = clamp(18 + Math.max(0, fitness - 35) * 0.3 + Math.max(0, (policies.gyms || 20) - 20) * 0.45 + (policies.fitnessCulture ? 24 : 0))
  const schoolActivity = clamp(w.schoolActivity + (schoolTarget - w.schoolActivity) * 0.22 * S)
  const gymActivity = clamp(w.gymActivity + (gymTarget - w.gymActivity) * 0.2 * S)

  const mortality = S * (0.0022 + Math.max(0, (40 - health) / 40) * 0.04)
  const g = GROWTH.find((x) => x.id === w.growth)
  const birthRate = S * (0.0015 + Math.max(0, happiness - 50) / 50 * 0.003) * g.births * (r.housing < 30 ? 0.3 : 1) * (r.food < 30 ? 0.3 : 1)
  return { resources: r, health, happiness, education, fitness, environment, businessActivity, schoolActivity, gymActivity, mortality, birthRate, causes }
}
