import { clamp } from './calculations'

const NAMES = { food: 'Food', water: 'Water', energy: 'Energy', housing: 'Housing', employment: 'Jobs' }
const RES = { food: /\b(food|crops?|harvest|grain)\b/, water: /\bwater\b/, energy: /\b(energy|power|electricity)\b/, housing: /\b(housing|homes|houses)\b/, employment: /\b(jobs?|employment|work)\b/ }
const DOWN_FX = { food: 'Hunger sends people to shops and fields, and health will slip.', water: 'People queue at the lake, crops suffer, and health will start to fall.', energy: 'Workplaces dim, jobs fall, and the town may go dark at night.', housing: 'Homes fill up and mood drops.', employment: 'Uniforms disappear as people lose work, and unemployed residents drift to the square.' }
const UP_FX = { food: 'Fields recover and births should rise.', water: 'The lake refills and health improves.', energy: 'Workplaces light up and productivity recovers.', housing: 'New homes appear and crowding eases.', employment: 'More people head to work in uniform.' }
const NUM = { a: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, ten: 10 }
const days = (s, def = null) => { const m = s.match(/(\d+|a|one|two|three|four|five|six|seven|ten)\s*(day|week)s?/); return m ? (NUM[m[1]] || +m[1]) * (m[2] === 'week' ? 7 : 1) : def }
const resOf = (s) => Object.keys(RES).find((k) => RES[k].test(s))
const setRes = (k, v, fx) => (w) => { const from = Math.round(w.resources[k]), to = Math.round(clamp(v(w.resources[k]))); return { w: { ...w, resources: { ...w.resources, [k]: to } }, did: `${NAMES[k]} ${from} → ${to}`, expect: to < from ? DOWN_FX[k] : UP_FX[k], ...fx } }
const wx = (id, text, expect) => (s) => (w, c) => { const d = days(s); return { w: { ...w, weather: id, weatherUntil: d ? c.abs + d : null }, did: `${text}${d ? ` for ${d} day${d > 1 ? 's' : ''}` : ''}`, expect } }
const hurt = (did, expect, patch) => (w) => ({ w: patch(w), did, expect })
const setPolicy = (key, value, did, expect, patch = {}) => (w) => ({
  w: { ...w, ...patch, policies: { ...w.policies, ...patch.policies, [key]: value } }, did, expect,
})
const cityPatch = (patch, did, expect) => (w) => ({ w: { ...w, ...patch }, did, expect })
const TIME = { night: 23, midnight: 0.5, morning: 8, dawn: 6, sunrise: 6, noon: 12, midday: 12, afternoon: 15, evening: 18, dusk: 19, sunset: 19, daytime: 10, day: 10 }

const parsers = [
  (s) => /\b(build|improve|expand) (more )?roads?\b/.test(s) && cityPatch({ roadsTarget: 100 }, 'Road network expansion begins', 'Traffic and emergency response will improve as roads are built.'),
  (s) => /\b(increase|boost|restore) (the )?(electricity|power)\b/.test(s) && setRes('energy', (v) => v + 25, {}),
  (s) => /\b(improve|fund|boost) (emergency|fire|ambulance) services?\b/.test(s) && cityPatch({ emergencyServices: 18, budget: 6500 }, 'Emergency services receive funding', 'Response times improve, but the city budget takes the hit.'),
  (s) => /\b(remove|reduce) traffic\b/.test(s) && cityPatch({ roads: clamp(100), traffic: clamp(8) }, 'Traffic reduction plan begins', 'Cleaner roads improve travel and emergency response.'),
  (s) => /\b(unlimited energy|infinite energy)\b/.test(s) && setPolicy('energyUnlimited', true, 'Unlimited energy policy begins', 'The power station ramps up over the coming days.'),
  (s) => /\bfree housing|housing for everyone\b/.test(s) && setPolicy('freeHousing', true, 'Free housing program begins', 'New homes are built over time; energy use and construction costs rise.'),
  (s) => /\b(make everyone rich|everyone rich|give everyone .*money)\b/.test(s) && setPolicy('wealthTarget', 10000, 'A citywide wealth program begins', 'Household wealth rises gradually, boosting shops and business activity.'),
  (s) => /\b(close|shut|close down) (all |every )?schools?\b/.test(s) && setPolicy('schoolsClosed', true, 'Schools close across the city', 'Attendance stops and education will decline until schools reopen.'),
  (s) => /\b(reopen|open) (all |every )?schools?\b/.test(s) && setPolicy('schoolsClosed', false, 'Schools reopen', 'Students return and education begins recovering.'),
  (s) => /\b(bodybuilder|bodybuilding|fitness culture)\b/.test(s) && setPolicy('fitnessTarget', 100, 'Bodybuilding culture begins', 'Exercise programs spread through the city; fitness will rise over the coming days.', { policies: { fitnessCulture: 'bodybuilding', gyms: 100 } }),
  (s) => { const m = s.match(/\b(literacy|education)\b.*?\b(\d{1,3})\s*(%|percent)?/); return m && setPolicy('educationTarget', Math.min(100, +m[2]), `Education target set to ${Math.min(100, +m[2])}%`, 'Schools become busier first; the workforce changes as education improves.') },
  (s) => /\b(free education|education for everyone)\b/.test(s) && setPolicy('freeEducation', true, 'Free education introduced', 'More citizens attend school, and education rises over time.', { educationTarget: 100 }),
  (s) => /\b(extremely happy|everyone happy|happiness to 100)\b/.test(s) && setPolicy('happinessTarget', 100, 'A happiness initiative begins', 'Mood improves gradually as the policy reaches citizens.'),
  (s) => /\b(everyone healthy|make everyone healthy|health to 100)\b/.test(s) && setPolicy('healthTarget', 100, 'A public health initiative begins', 'Health improves over time as care reaches residents.'),
  (s) => /\b(vegetarian|vegetarianism)\b/.test(s) && setPolicy('diet', 'vegetarian', 'The city adopts a vegetarian diet', 'Food demand shifts toward crops and local farms.'),
  (s) => /\b(work from home|work remotely|remote work)\b/.test(s) && setPolicy('workFromHome', true, 'Remote work becomes the norm', 'Commutes fall and neighborhood activity shifts toward homes.'),
  (s) => /\b(build|open|add)\s+gyms?\b|\bgyms everywhere\b/.test(s) && setPolicy('gyms', 100, 'New gyms begin opening', 'Exercise becomes easier to access; fitness will rise gradually.'),
  (s) => /\b(give|add) everyone a pet|\bpets for everyone\b/.test(s) && setPolicy('pets', true, 'Pets arrive across the city', 'Homes and parks become more active.'),
  (s) => /\b(remove|ban|no) (all )?cars\b/.test(s) && setPolicy('cars', false, 'Cars leave the streets', 'Road traffic falls and the air begins to clear.'),
  (s) => { const m = s.match(/\b(?:give|grant) everyone\s+(\d[\d,]*)\s*(?:rupees?|₹)\b/); return m && setPolicy('wealthTarget', +m[1].replaceAll(',', ''), `A ${m[1]} rupee grant is introduced`, 'Household wealth rises as the grant reaches residents.') },
  (s) => /\b(double|twice) (?:the )?population\b|\bpopulation (?:doubles|boom)\b/.test(s) && ((w) => ({
    w: { ...w, growth: 'boom', policies: { ...w.policies, populationTarget: Math.min(5000, w.population * 2) } },
    did: 'A population boom begins', expect: 'New residents arrive over the coming days, increasing demand for homes and services.',
  })),
  (s) => /\b(reset|restart|start over)\b/.test(s) && (() => ({ special: 'reset', did: 'World reset', expect: 'Everyone returns to the starting town.' })),
  (s) => /\b(chaos|surprise me)\b/.test(s) && (() => ({ special: 'chaos', did: 'Chaos unleashed', expect: 'Something unpredictable is about to happen.' })),
  (s) => /\b(skip|fast.?forward|speed up|wait)\b/.test(s) && days(s, 2) && (() => ({ fast: days(s, 2), did: `Time moves faster for ${days(s, 2)} days`, expect: 'Watch the consequences unfold.' })),
  (s) => { const m = s.match(/\b(night|midnight|morning|dawn|sunrise|noon|midday|afternoon|evening|dusk|sunset|daytime|day)\b/); return m && /\b(make it|set|turn|go to|skip to|bring)\b|^(night|morning|noon|evening)$/.test(s) && !/\bfor\b/.test(s) && (() => ({ hour: TIME[m[1]], did: `Time set to ${m[1]}`, expect: m[1] === 'night' || m[1] === 'midnight' ? 'People head home, workplaces go quiet and the windows light up.' : 'The town wakes up and gets busy.' })) },
  (s) => /\b(clear (the )?(sky|skies|weather)|sunny|sunshine|(stop|end) (the )?(rain|storm|heat ?wave|drought))\b/.test(s) && wx('clear', 'Weather cleared', 'Skies open up and outdoor life resumes.')(s),
  (s) => /\b(drought|water (shortage|crisis))\b/.test(s) && hurt('Drought: water drops to 15', 'People queue at the lake and health will start to fall.', (w) => ({ ...w, weather: 'heat', weatherUntil: null, resources: { ...w.resources, water: Math.min(w.resources.water, 15) } })),
  (s) => /\b(storm|thunder|hurricane)\b/.test(s) && wx('storm', 'Storm', 'Winds damage homes and the grid. Everyone shelters indoors.')(s),
  (s) => /\b(heat ?wave|scorching)\b|\bstart a heat\b/.test(s) && wx('heat', 'Heatwave', 'Heat drains the lake and parches the fields.')(s),
  (s) => /\brain/.test(s) && wx('rain', 'Rain', 'The lake refills and crops grow, but solar power weakens.')(s),
  (s) => /\b(energy|power) (shortage|crisis|failure|outage|cut)|blackout/.test(s) && setRes('energy', (v) => Math.min(v, 15), {}),
  (s) => /\b(famine|food (shortage|crisis))\b/.test(s) && setRes('food', (v) => Math.min(v, 15), {}),
  (s) => /\bhousing (shortage|crisis)\b/.test(s) && setRes('housing', (v) => Math.min(v, 15), {}),
  (s) => /\b(recession|layoffs?|economic (crash|shock|crisis)|unemployment)\b/.test(s) && setRes('employment', (v) => Math.min(v, 20), {}),
  (s) => /\b(epidemic|outbreak|plague|pandemic|disease)\b/.test(s) && hurt('Outbreak: health drops', 'People fall sick and stay home. Workplaces lose staff.', (w) => ({ ...w, health: clamp(w.health - 35) })),
  (s) => /\b(food surplus|bumper harvest)\b/.test(s) && setRes('food', () => 95, {}),
  (s) => /\b(everyone|all).*\bjobs?\b|\bjobs? for (everyone|all)\b|full employment/.test(s) && ((w) => ({
    w: { ...w, resources: { ...w.resources, employment: 100 }, policies: { ...w.policies, employmentTarget: 100 } },
    did: 'Jobs open across the city', expect: 'Hiring accelerates and workplaces grow busier.',
  })),
  (s) => /\b(close|seal).*(border)|stop (immigration|migration)/.test(s) && hurt('Borders closed', 'Newcomers stop arriving.', (w) => ({ ...w, growth: 'stable' })),
  (s) => /\b(baby boom|population boom)\b/.test(s) && hurt('Population boom', 'Births and newcomers rise while homes fill up.', (w) => ({ ...w, growth: 'boom' })),
  (s) => { const m = s.match(/\b(add|bring|welcome|invite|let in)\s*(\d+)?\s*(more )?(people|immigrants|newcomers|settlers)|migration wave/); return m && (() => { const n = +(m[2] || 100); return { w: null, did: `${n} newcomers arrive`, expect: 'They walk in from the edge of town, and housing feels the pressure.', patch: (w) => ({ ...w, population: Math.min(1500, w.population + n), resources: { ...w.resources, housing: clamp(w.resources.housing - n / 12) } }) } }) },
  (s) => { // resource changes: "remove half the water", "increase food by 20 percent", "set energy to 30"
    const k = resOf(s); if (!k) return null
    const set = s.match(/\b(?:to|at)\s+(\d+)/), max = /\b(max|maximi[sz]e|abundant|plentiful|high)\b/.test(s), low = /\b(scarce|low|empty|none)\b/.test(s)
    if (/\b(set|make)\b/.test(s) && set) return setRes(k, () => +set[1], {})
    const down = /\b(remove|reduce|decrease|cut|lower|drain|halve|drop|deplete|take away|less|shrink)\b/.test(s), up = /\b(increase|raise|boost|add|double|improve|give|more|restore|refill|fill)\b/.test(s)
    if (!down && !up) return max ? setRes(k, () => 90, {}) : low ? setRes(k, () => 15, {}) : null
    const pct = s.match(/(\d+)\s*(%|percent)/), pts = s.match(/by (\d+)/)
    const frac = /\bhalf\b/.test(s) ? 0.5 : /\bthird\b/.test(s) ? 0.33 : /\bquarter\b/.test(s) ? 0.25 : /\b(all|everything)\b/.test(s) ? 1 : /\bdouble\b/.test(s) ? 1 : pct ? +pct[1] / 100 : null
    const sign = down ? -1 : 1
    return setRes(k, (v) => (frac != null ? v * (1 + sign * frac) : pts ? v + sign * +pts[1] : v + sign * 25), {})
  },
]

export const EXAMPLES = ['Make everyone a bodybuilder', 'Make literacy 100%', 'Give everyone a job', 'Make it rain for 10 days', 'Remove half the water', 'Double the population']

// Turn a sentence into a list of actions. Each action(w, ctx) -> { w, did, expect, hour?, fast?, special? }
export function interpret(text) {
  const clauses = text.toLowerCase().replace(/[.!?]+$/g, '').split(/\s*(?:,|;|\bthen\b|\band\b)\s*/).filter(Boolean)
  const actions = [], unknown = []
  for (const c of clauses) {
    let hit = null
    for (const p of parsers) { const r = p(c); if (r) { hit = r; break } }
    hit ? actions.push(hit) : unknown.push(c)
  }
  return { actions, unknown }
}
