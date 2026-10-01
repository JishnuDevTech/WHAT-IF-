import { clamp } from './calculations'

const change = (world, patch, extra = {}) => ({
  ...world,
  ...extra,
  resources: Object.fromEntries(Object.entries(world.resources).map(([key, value]) => [key, clamp(value + (patch[key] || 0))])),
})

const CRISES = [
  {
    id: 'food-shortage', title: 'Food shortage', icon: 'Wheat', severity: 'critical',
    description: 'Farm production is falling and food prices are climbing.',
    choices: [
      { id: 'import', label: 'Import food', detail: 'Food stabilizes, but the city spends down its reserves.', resolve: (w) => change(w, { food: 18 }, { foodPrices: clamp(w.foodPrices - 14), economy: clamp(w.economy - 8) }) },
      { id: 'ration', label: 'Ration food', detail: 'Supplies last longer; households feel the restrictions.', resolve: (w) => change(w, { food: 8 }, { foodPrices: clamp(w.foodPrices - 6), happiness: clamp(w.happiness - 6) }) },
      { id: 'ignore', label: 'Do nothing', detail: 'Prices rise and household health begins to slip.', resolve: (w) => change(w, { food: -15, health: -3 }, { foodPrices: clamp(w.foodPrices + 18), happiness: clamp(w.happiness - 9), economy: clamp(w.economy - 5) }) },
    ],
  },
  {
    id: 'water-contamination', title: 'Water contamination', icon: 'Droplets', severity: 'critical',
    description: 'The lake has been contaminated. Farms and homes need clean water.',
    choices: [
      { id: 'filter', label: 'Filter the lake', detail: 'Clean water returns, at the cost of energy and public funds.', resolve: (w) => change(w, { water: 15, energy: -5 }, { economy: clamp(w.economy - 8), health: clamp(w.health + 3) }) },
      { id: 'boil', label: 'Issue boil notices', detail: 'Illness is limited, but daily life slows down.', resolve: (w) => change(w, { water: 2 }, { health: clamp(w.health + 2), happiness: clamp(w.happiness - 4) }) },
      { id: 'ignore', label: 'Do nothing', detail: 'Illness spreads and clean water becomes scarce.', resolve: (w) => change(w, { water: -15, health: -10 }, { happiness: clamp(w.happiness - 6), economy: clamp(w.economy - 4) }) },
    ],
  },
  {
    id: 'power-failure', title: 'Power failure', icon: 'Zap', severity: 'critical',
    description: 'A fault has knocked the power station offline.',
    choices: [
      { id: 'generators', label: 'Start generators', detail: 'Power returns quickly, but fuel raises costs and pollution.', resolve: (w) => change(w, { energy: 17 }, { economy: clamp(w.economy - 9), environment: clamp(w.environment - 6) }) },
      { id: 'ration', label: 'Share power', detail: 'Hospitals stay online while homes and factories take turns.', resolve: (w) => change(w, { energy: 5 }, { health: clamp(w.health + 2), employment: clamp(w.resources.employment - 3) }) },
      { id: 'ignore', label: 'Do nothing', detail: 'Workplaces close and more equipment begins to fail.', resolve: (w) => change(w, { energy: -16, employment: -7 }, { economy: clamp(w.economy - 7), happiness: clamp(w.happiness - 5) }) },
    ],
  },
  {
    id: 'economic-crash', title: 'Economic crash', icon: 'Briefcase', severity: 'critical',
    description: 'Local businesses are losing customers and cutting back.',
    choices: [
      { id: 'stimulus', label: 'Fund public works', detail: 'Hiring improves, paid for by the city reserve.', resolve: (w) => change(w, { employment: 9 }, { economy: clamp(w.economy + 8), businessActivity: clamp(w.businessActivity + 5) }) },
      { id: 'training', label: 'Retrain workers', detail: 'New skills take time, but businesses become more productive.', resolve: (w) => change(w, { employment: 3 }, { education: clamp(w.education + 7), economy: clamp(w.economy + 3) }) },
      { id: 'ignore', label: 'Do nothing', detail: 'Closures spread and household income falls.', resolve: (w) => change(w, { employment: -12 }, { economy: clamp(w.economy - 14), happiness: clamp(w.happiness - 8), businessActivity: clamp(w.businessActivity - 10) }) },
    ],
  },
  {
    id: 'heatwave', title: 'Heatwave', icon: 'Flame', severity: 'warning',
    description: 'Temperatures are soaring. Water use is up and outdoor work is becoming dangerous.',
    choices: [
      { id: 'cooling', label: 'Open cooling centers', detail: 'Residents get relief, while the grid takes extra load.', resolve: (w) => change(w, { energy: -9 }, { health: clamp(w.health + 5), economy: clamp(w.economy - 4) }) },
      { id: 'water-limits', label: 'Limit water use', detail: 'The lake is protected, though farms and households must conserve.', resolve: (w) => change(w, { water: 3, food: -3 }, { environment: clamp(w.environment + 2), happiness: clamp(w.happiness - 3) }) },
      { id: 'ignore', label: 'Do nothing', detail: 'The heat drains the lake and strains public health.', resolve: (w) => change(w, { water: -12, food: -5, health: -7 }, { happiness: clamp(w.happiness - 5) }) },
    ],
  },
  {
    id: 'disease-outbreak', title: 'Disease outbreak', icon: 'HeartPulse', severity: 'critical',
    description: 'Clinics are seeing a fast rise in fever cases.',
    choices: [
      { id: 'clinics', label: 'Open temporary clinics', detail: 'Care reaches more people, funded from the city reserve.', resolve: (w) => change(w, {}, { health: clamp(w.health + 10), economy: clamp(w.economy - 9) }) },
      { id: 'isolation', label: 'Limit large gatherings', detail: 'The outbreak slows, but public life and work are disrupted.', resolve: (w) => change(w, { employment: -3 }, { health: clamp(w.health + 6), happiness: clamp(w.happiness - 7) }) },
      { id: 'ignore', label: 'Do nothing', detail: 'More residents fall ill and workplaces lose staff.', resolve: (w) => change(w, { employment: -8 }, { health: clamp(w.health - 14), happiness: clamp(w.happiness - 8), economy: clamp(w.economy - 6) }) },
    ],
  },
  {
    id: 'housing-shortage', title: 'Housing shortage', icon: 'Home', severity: 'warning',
    description: 'More families are sharing crowded homes as housing demand rises.',
    choices: [
      { id: 'build', label: 'Build homes', detail: 'Housing expands, using energy and city funds.', resolve: (w) => change(w, { housing: 12, energy: -4 }, { economy: clamp(w.economy - 9), constructionDemand: clamp(w.constructionDemand - 18) }) },
      { id: 'shelters', label: 'Open shelters', detail: 'People get immediate shelter, but long-term crowding remains.', resolve: (w) => change(w, { housing: 5 }, { happiness: clamp(w.happiness - 3), health: clamp(w.health + 1) }) },
      { id: 'ignore', label: 'Do nothing', detail: 'Crowding deepens and household wellbeing falls.', resolve: (w) => change(w, { housing: -10 }, { happiness: clamp(w.happiness - 8), health: clamp(w.health - 3) }) },
    ],
  },
  {
    id: 'unemployment-spike', title: 'Unemployment spike', icon: 'Briefcase', severity: 'warning',
    description: 'Several local employers have stopped hiring.',
    choices: [
      { id: 'public-works', label: 'Start public works', detail: 'Jobs return quickly, drawing from the city reserve.', resolve: (w) => change(w, { employment: 11 }, { economy: clamp(w.economy - 8), happiness: clamp(w.happiness + 2) }) },
      { id: 'retraining', label: 'Fund retraining', detail: 'Education rises now; employment recovers more gradually.', resolve: (w) => change(w, { employment: 4 }, { education: clamp(w.education + 6), economy: clamp(w.economy - 4) }) },
      { id: 'ignore', label: 'Do nothing', detail: 'Household income and business activity continue to fall.', resolve: (w) => change(w, { employment: -12 }, { economy: clamp(w.economy - 7), happiness: clamp(w.happiness - 9), businessActivity: clamp(w.businessActivity - 8) }) },
    ],
  },
  {
    id: 'crop-failure', title: 'Crop failure', icon: 'Wheat', severity: 'critical',
    description: 'A dry spell has damaged this season’s harvest.',
    choices: [
      { id: 'imports', label: 'Import crops', detail: 'Food supply recovers while the city pays a premium.', resolve: (w) => change(w, { food: 15 }, { foodPrices: clamp(w.foodPrices - 8), economy: clamp(w.economy - 11) }) },
      { id: 'irrigation', label: 'Reroute water', detail: 'The fields recover, but less water reaches homes.', resolve: (w) => change(w, { food: 8, water: -8 }, { farmHealth: clamp(w.farmHealth + 8) }) },
      { id: 'ignore', label: 'Do nothing', detail: 'Harvests shrink and food prices climb.', resolve: (w) => change(w, { food: -14 }, { foodPrices: clamp(w.foodPrices + 12), happiness: clamp(w.happiness - 5) }) },
    ],
  },
  {
    id: 'factory-accident', title: 'Factory accident', icon: 'Zap', severity: 'warning',
    description: 'A machinery accident has stopped production at the factory.',
    choices: [
      { id: 'repair', label: 'Repair the line', detail: 'Production resumes after a costly repair.', resolve: (w) => change(w, { energy: -3, employment: 2 }, { economy: clamp(w.economy - 7), businessActivity: clamp(w.businessActivity + 2) }) },
      { id: 'relocate', label: 'Move operations', detail: 'The site is safer, but some workers must retrain.', resolve: (w) => change(w, { employment: -3 }, { environment: clamp(w.environment + 5), health: clamp(w.health + 1) }) },
      { id: 'ignore', label: 'Do nothing', detail: 'The damaged factory stays closed and nearby businesses suffer.', resolve: (w) => change(w, { employment: -7 }, { economy: clamp(w.economy - 8), businessActivity: clamp(w.businessActivity - 6) }) },
    ],
  },
  {
    id: 'education-crisis', title: 'Education crisis', icon: 'BookOpen', severity: 'warning',
    description: 'School attendance has fallen and the skilled workforce is shrinking.',
    choices: [
      { id: 'night-school', label: 'Open night schools', detail: 'Education improves while the city covers extra operating costs.', resolve: (w) => change(w, {}, { education: clamp(w.education + 8), schoolActivity: clamp(w.schoolActivity + 12), economy: clamp(w.economy - 6) }) },
      { id: 'scholarships', label: 'Fund scholarships', detail: 'More students return, though benefits arrive gradually.', resolve: (w) => change(w, {}, { education: clamp(w.education + 5), happiness: clamp(w.happiness + 3), economy: clamp(w.economy - 4) }) },
      { id: 'ignore', label: 'Do nothing', detail: 'Skills and business productivity erode over time.', resolve: (w) => change(w, { employment: -3 }, { education: clamp(w.education - 8), businessActivity: clamp(w.businessActivity - 7) }) },
    ],
  },
]

export function maybeCreateCrisis(world, day) {
  const pending = world.pendingEvents || []
  const limit = world.chaosMode ? 2 : 1
  const cadence = world.chaosMode ? 2 : 6
  if (day < 4 || day % cadence !== 0 || pending.length >= limit) return null

  const index = Math.abs(day * 31 + world.population * 7 + Math.round(world.economy * 11)) % CRISES.length
  const crisis = CRISES[index]
  return {
    id: `${crisis.id}-${day}`,
    type: crisis.id,
    title: crisis.title,
    icon: crisis.icon,
    severity: crisis.severity,
    description: crisis.description,
    day,
    options: crisis.choices.map(({ id, label, detail }) => ({ id, label, detail })),
  }
}

export function resolveCrisis(world, eventId, optionId, day) {
  const event = (world.pendingEvents || []).find((pending) => pending.id === eventId)
  if (!event) return world
  const crisis = CRISES.find((entry) => entry.id === event.type)
  const option = crisis?.choices.find((choice) => choice.id === optionId)
  if (!option) return world

  const resolved = option.resolve(world)
  const logEntry = {
    id: `decision-${event.id}`,
    key: `decision-${event.id}-${option.id}`,
    title: `${option.label}: ${event.title}`,
    severity: option.id === 'ignore' ? 'warning' : 'recovery',
    why: option.detail,
    day,
  }
  return {
    ...resolved,
    pendingEvents: world.pendingEvents.filter((pending) => pending.id !== eventId),
    lastCauses: [...(world.lastCauses || []), { tag: event.type, severity: 0.5, chain: [event.title, option.label, option.detail] }],
    log: [logEntry, ...(resolved.log || world.log)].slice(0, 30),
  }
}
