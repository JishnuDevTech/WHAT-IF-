import assert from 'node:assert/strict'
import { after, before, it } from 'node:test'
import { createServer } from 'vite'

let server
let createInitialState
let stepWorld
let interpret
let maybeCreateCrisis
let resolveCrisis
let dayPhase
let daylight

before(async () => {
  server = await createServer({
    configFile: 'vite.config.js',
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true, include: [] },
    appType: 'custom',
  })
  ;[{ createInitialState }, { stepWorld }, { interpret }, { maybeCreateCrisis, resolveCrisis }, { dayPhase, daylight }] = await Promise.all([
    server.ssrLoadModule('/src/data/initialState.js'),
    server.ssrLoadModule('/src/engine/simulation.js'),
    server.ssrLoadModule('/src/engine/commands.js'),
    server.ssrLoadModule('/src/engine/crises.js'),
    server.ssrLoadModule('/src/engine/calculations.js'),
  ])
})

after(async () => {
  await server?.close()
})

const commandWorld = (text, world) => interpret(text).actions[0](world, { abs: 1 }).w

it('tracks 1,000 named citizens and distinct dawn, day, sunset, and night phases', () => {
  const world = createInitialState()
  assert.equal(world.citizens.length, 1000)
  assert.ok(world.citizens.every((citizen) => citizen.name && citizen.ageGroup && citizen.job !== undefined))
  assert.equal(dayPhase(6), 'DAWN')
  assert.equal(dayPhase(13), 'DAY')
  assert.equal(dayPhase(18), 'SUNSET')
  assert.equal(dayPhase(23), 'NIGHT')
  assert.ok(daylight(23) < daylight(12))
})

it('evolves bodybuilder, literacy, housing, and energy policies over days', () => {
  const initial = createInitialState()
  let fitness = commandWorld('Make everyone a bodybuilder', initial)
  let literacy = commandWorld('Make literacy 100%', initial)
  let housing = commandWorld('Give everyone free housing', initial)
  let energy = commandWorld('Give the city unlimited energy', initial)
  const initialFitness = fitness.fitness
  const initialEducation = literacy.education
  const initialHousing = housing.resources.housing
  const initialEnergy = energy.resources.energy

  for (let day = 2; day <= 16; day++) {
    fitness = stepWorld(fitness, day)
    literacy = stepWorld(literacy, day)
    housing = stepWorld(housing, day)
    energy = stepWorld(energy, day)
  }

  assert.ok(fitness.fitness > initialFitness)
  assert.ok(fitness.gymActivity > initial.gymActivity)
  assert.ok(literacy.education > initialEducation)
  assert.ok(literacy.schoolActivity > initial.schoolActivity)
  assert.ok(housing.resources.housing > initialHousing)
  assert.ok(energy.resources.energy >= initialEnergy)
  assert.ok(fitness.citizens.every((citizen) => citizen.foodNeed >= 0 && citizen.socialNeed >= 0 && citizen.energy >= 0))
})

it('connects road investment and water scarcity to visible city systems', () => {
  const initial = createInitialState()
  const roadPlan = commandWorld('Build more roads', initial)
  assert.equal(roadPlan.roadsTarget, 100)

  let improved = roadPlan
  let dry = commandWorld('Remove half the water', initial)
  for (let day = 2; day <= 12; day++) {
    improved = stepWorld(improved, day)
    dry = stepWorld(dry, day)
  }

  assert.ok(improved.roads > initial.roads)
  assert.ok(Number.isFinite(improved.traffic))
  assert.ok(Number.isFinite(improved.emergencyResponse))
  assert.ok(Number.isFinite(improved.budget))
  assert.ok(dry.farmHealth < initial.farmHealth)
  assert.ok(dry.foodPrices > initial.foodPrices)
})

it('generates a crisis with three distinct decisions and logs the selected outcome', () => {
  const initial = createInitialState()
  let world = initial
  for (let day = 2; day <= 6; day++) world = stepWorld(world, day)

  assert.equal(world.pendingEvents.length, 1)
  const crisis = world.pendingEvents[0]
  assert.equal(crisis.options.length, 3)

  const ignored = resolveCrisis(world, crisis.id, 'ignore', 6)
  const helped = resolveCrisis(world, crisis.id, crisis.options[0].id, 6)
  assert.equal(helped.pendingEvents.length, 0)
  assert.notDeepEqual(helped.resources, ignored.resources)
  assert.equal(helped.log[0].day, 6)
})

it('raises Chaos event cadence and ends collapse with a restartable final state', () => {
  const initial = createInitialState()
  assert.ok(maybeCreateCrisis({ ...initial, chaosMode: true }, 4))

  let world = {
    ...initial,
    resources: { food: 1, water: 1, energy: 1, housing: 1, employment: 1 },
    health: 1,
    happiness: 1,
  }
  world = stepWorld(world, 2)
  world = stepWorld(world, 3)
  assert.equal(world.ended, true)
  assert.equal(world.population, 0)
  assert.ok(world.collapsedPopulation > 0)
  assert.equal(world.collapseDay, 3)
})
