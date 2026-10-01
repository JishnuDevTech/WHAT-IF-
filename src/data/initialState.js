import { createCitizens, summarizeCitizens } from './citizens'

export const RESOURCES = [
  { id: 'food', label: 'Food', icon: 'Wheat' }, { id: 'water', label: 'Water', icon: 'Droplets' },
  { id: 'energy', label: 'Energy', icon: 'Zap' }, { id: 'housing', label: 'Housing', icon: 'Home' },
  { id: 'employment', label: 'Jobs', icon: 'Briefcase' },
]
export const WEATHER = [
  { id: 'clear', label: 'Clear', icon: 'Sun', fx: {} },
  { id: 'rain', label: 'Rain', icon: 'CloudRain', fx: { water: 5, energy: -2, food: 1.5 } },
  { id: 'heat', label: 'Heatwave', icon: 'Flame', fx: { water: -6, food: -3 } },
  { id: 'storm', label: 'Storm', icon: 'CloudLightning', fx: { energy: -6, housing: -4, food: -1 } },
]
export const GROWTH = [
  { id: 'stable', label: 'Stable', births: 0.5, migration: 0 },
  { id: 'growing', label: 'Growing', births: 1.2, migration: 0 },
  { id: 'boom', label: 'Boom', births: 2.5, migration: 1 },
]
export const createInitialState = () => {
  const citizens = createCitizens(1000)
  return {
    population: citizens.length, citizens, births: 0, deaths: 0, weather: 'clear', weatherUntil: null, growth: 'stable',
    resources: { food: 70, water: 70, energy: 65, housing: 60, employment: 65 },
    happiness: 72, health: 80, environment: 76, economy: 70, foodPrices: 40, farmHealth: 76,
    constructionDemand: 35, businessActivity: 62, schoolActivity: 30, gymActivity: 24,
    roads: 58, roadsTarget: null, traffic: 24, pollution: 22, emergencyResponse: 78, budget: 7200,
    ...summarizeCitizens(citizens),
    policies: { educationTarget: null, fitnessTarget: null, happinessTarget: null, healthTarget: null, employmentTarget: null, wealthTarget: null, populationTarget: null, freeEducation: false, freeHousing: false, energyUnlimited: false, schoolsClosed: false, fitnessCulture: null, gyms: 20, diet: 'balanced', workFromHome: false, pets: false, cars: true },
    chaosMode: false, critical: false, collapseDays: 0, ended: false, collapsedPopulation: null, collapseDay: null,
    activeEvents: [], pendingEvents: [], log: [], lastCauses: [],
    history: [{ day: 1, population: citizens.length, happiness: 72 }],
  }
}
