import { clamp } from './calculations'

const DEFS = [
  { id: 'water_shortage', title: 'Water shortage', severity: 'critical', where: [985, 560], when: (w) => w.resources.water < 30, why: (w) => `Water is down to ${Math.round(w.resources.water)}. Crops and health are suffering.` },
  { id: 'food_crisis', title: 'Food crisis', severity: 'critical', where: [230, 520], when: (w) => w.resources.food < 30, why: (w) => `Food is at ${Math.round(w.resources.food)}. People are going hungry.` },
  { id: 'energy_failure', title: 'Energy failure', severity: 'critical', where: [1000, 380], when: (w) => w.resources.energy < 25, why: () => 'The grid cannot keep up. Workplaces are dimming and lights fail at night.' },
  { id: 'job_crisis', title: 'Employment crisis', severity: 'warning', where: [900, 80], when: (w) => w.resources.employment < 30, why: () => 'Workplaces cut back. Unemployed residents gather in the square.' },
  { id: 'traffic_jam', title: 'Traffic increasing', severity: 'warning', where: [600, 340], when: (w) => w.traffic > 65, why: (w) => `Traffic is at ${Math.round(w.traffic)}. Pollution is rising and emergency crews are slower.` },
  { id: 'pollution_alert', title: 'Pollution alert', severity: 'warning', where: [600, 300], when: (w) => w.pollution > 65, why: () => 'Haze is settling over busy roads and industrial areas.' },
  { id: 'emergency_delay', title: 'Emergency response delayed', severity: 'critical', where: [620, 330], when: (w) => w.emergencyResponse < 45, why: () => 'Crews are struggling to cross the city in time.' },
  { id: 'housing_pressure', title: 'Housing pressure', severity: 'warning', where: [300, 85], when: (w) => w.resources.housing < 30, why: () => 'Too few homes. Families are doubling up.' },
  { id: 'food_surplus', title: 'Food surplus', severity: 'recovery', where: [230, 520], when: (w) => w.resources.food > 85, why: () => 'Full fields. Health and births should recover.' },
  { id: 'education_milestone', title: 'Education reaches 100%', severity: 'recovery', where: [475, 208], when: (w) => w.education >= 99, why: () => 'Nearly everyone can read. Skilled work and new opportunities are increasing.' },
  { id: 'fitness_boom', title: 'Fitness boom', severity: 'recovery', where: [830, 440], when: (w) => w.fitness >= 75, why: () => 'More residents are active, and community health is improving.' },
  { id: 'jobs_milestone', title: 'Employment hits 90%', severity: 'recovery', where: [900, 80], when: (w) => w.resources.employment >= 90, why: () => 'Workplaces are hiring and household incomes are rising.' },
  { id: 'business_boom', title: 'Businesses are thriving', severity: 'recovery', where: [680, 100], when: (w) => w.businessActivity >= 82, why: () => 'Local businesses are busy and new opportunities are appearing.' },
  { id: 'school_expansion', title: 'New school opened', severity: 'recovery', where: [475, 208], when: (w) => w.policies?.freeEducation && w.schoolActivity >= 70, why: () => 'Free education brought enough students to expand the school.' },
  { id: 'clean_air', title: 'Cleaner air', severity: 'recovery', where: [600, 340], when: (w) => w.environment >= 90, why: () => 'Fewer cars and cleaner systems are bringing the air back to life.' },
  { id: 'new_gym', title: 'New gym opened', severity: 'recovery', where: [830, 440], when: (w) => w.gymActivity >= 78, why: () => 'The fitness movement has made a new neighborhood gym viable.' },
  { id: 'collapse', title: 'Resource collapse', severity: 'critical', where: [600, 300], when: (w) => Object.values(w.resources).filter((v) => v < 25).length >= 3, why: () => 'Three systems have failed at once, and each feeds the others.' },
]
export const detectEvents = (w) => DEFS.filter((d) => d.when(w)).map(({ id, title, severity, where, why }) => ({ id, title, severity, where, why: why(w) }))

const bump = (w, patch, extra = {}) => ({ ...w, ...extra, resources: Object.fromEntries(Object.entries(w.resources).map(([k, v]) => [k, clamp(v + (patch[k] || 0))])) })
export const CHAOS = [
  { title: 'Rain, brains & baby boom', why: 'Fourteen rainy days arrive alongside free education, a literacy drive, and a growing population.', days: 14, run: (w) => bump(w, { energy: 18, food: 8 }, { growth: 'boom', weather: 'rain', policies: { ...w.policies, freeEducation: true, educationTarget: 100 } }) },
  { title: 'Citywide fitness craze', why: 'Gyms open everywhere. Fitness rises, but the new crowd puts pressure on food and housing.', run: (w) => bump(w, { food: -18, housing: -8, employment: 12 }, { policies: { ...w.policies, fitnessTarget: 96, fitnessCulture: 'bodybuilding', gyms: 100 } }) },
  { title: 'Free school, open doors', why: 'Free education and a migration wave arrive together. New skills meet new demand.', run: (w) => bump(w, { housing: -16, energy: 12, employment: 10 }, { growth: 'growing', population: Math.min(5000, w.population + 110), policies: { ...w.policies, freeEducation: true, educationTarget: 100 } }) },
  { title: 'Drought with a jobs boom', why: 'Factories hire while a heatwave drains the lake. More work, less water.', days: 5, run: (w) => bump(w, { water: -38, employment: 16, energy: -8 }, { weather: 'heat', policies: { ...w.policies, employmentTarget: 90 } }) },
  { title: 'Green recovery', why: 'Cars leave the streets as farms recover and household health improves.', run: (w) => bump(w, { food: 22, water: 14, energy: 8 }, { health: clamp(w.health + 8), policies: { ...w.policies, cars: false, happinessTarget: 82 } }) },
]
export function applyChaos(w, day) {
  const c = CHAOS[Math.floor(Math.random() * CHAOS.length)]
  const next = c.run(w)
  if (c.days) next.weatherUntil = day + c.days
  return { world: { ...next, log: [{ id: 'chaos', key: `c${day}${Math.random()}`, day, title: `Chaos: ${c.title}`, severity: 'chaos', why: c.why }, ...w.log].slice(0, 30) }, chaos: c }
}
