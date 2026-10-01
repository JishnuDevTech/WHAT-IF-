import { useEffect, useRef, useState } from 'react'
import { createInitialState } from '../data/initialState'
import { resizeCitizens } from '../data/citizens'
import { clamp } from '../engine/calculations'
import { stepWorld, withEvents, buildReport } from '../engine/simulation'
import { applyChaos } from '../engine/events'
import { interpret } from '../engine/commands'
import { makeAgent, planAll } from '../engine/agents'

const NORMAL = 0.05, FAST = 0.33 // game hours per 100ms tick
const builtOf = (h) => Math.max(3, Math.ceil((h / 100) * 12))
const countFor = (pop) => clamp(Math.round(pop * 0.12), 60, 120)

export function useSimulation() {
  const [world, setWorld] = useState(createInitialState)
  const [time, setTime] = useState({ day: 1, hour: 8 })
  const [agents, setAgents] = useState([])
  const [paused, setPaused] = useState(false)
  const [userFast, setUserFast] = useState(false)
  const [running, setRunning] = useState(false)
  const [report, setReport] = useState(null)
  const [cmd, setCmd] = useState(null)
  const R = useRef({ w: world, t: time, a: [], paused: false, userFast: false, fastUntil: 0, run: null, nextId: 0 })
  const s = R.current
  const abs = () => s.t.day + s.t.hour / 24
  const isFast = () => s.userFast || abs() < s.fastUntil

  const replan = () => {
    const w = s.w, built = builtOf(w.resources.housing), n = Math.min(countFor(w.population), w.citizens.length)
    const previous = new Map(s.a.map((agent) => [agent.citizenId, agent]))
    const list = Array.from({ length: n }, (_, index) => {
      const citizen = w.citizens[Math.min(w.citizens.length - 1, Math.floor((index + 0.5) * w.citizens.length / n))]
      const profile = makeAgent(citizen.id, built, false, citizen)
      const old = previous.get(citizen.id)
      return old ? { ...profile, x: old.x, y: old.y, lane: old.lane, loc: old.loc, state: old.state, bubble: old.bubble, dir: old.dir, dur: old.dur, key: old.key, built: old.built } : profile
    })
    s.a = planAll(list, { h: s.t.hour, w, built, hourReal: isFast() ? 0.3 : 2, ev: new Set(w.activeEvents.map((e) => e.id)),
      share: (w.resources.employment / 100) * (w.resources.energy < 40 ? 0.5 + w.resources.energy / 80 : 1) })
    setAgents(s.a)
  }
  const commit = (w) => { s.w = { ...w, citizens: resizeCitizens(w.citizens, w.population) }; setWorld(s.w); replan() }
  const setClock = (t) => { s.t = t; setTime(t) }

  useEffect(() => {
    replan()
    const id = setInterval(() => {
      if (s.paused) return
      const T = s.t, a0 = abs()
      let hour = T.hour + (isFast() ? FAST : NORMAL), day = T.day
      if (hour >= 24) { hour -= 24; day++ }
      setClock({ day, hour })
      if (day !== T.day) {
        const w = stepWorld(s.w, day)
        if (s.run) w.lastCauses.forEach((c) => { const o = s.run.causes.get(c.tag); if (!o || c.severity > o.severity) s.run.causes.set(c.tag, c) })
        commit(w)
      } else if (Math.floor(hour) !== Math.floor(T.hour)) replan()
      if (s.w.weatherUntil && abs() >= s.w.weatherUntil) commit({ ...s.w, weather: 'clear', weatherUntil: null })
      if (s.run && abs() >= s.run.end) { setReport(buildReport(s.run.start, s.w, s.run.causes, s.run.chaos)); s.run = null; setRunning(false) }
    }, 100)
    return () => clearInterval(id)
  }, [])

  const startRun = (n, chaos = null) => {
    s.run = { start: s.w, end: abs() + n, causes: new Map(), chaos }; s.fastUntil = Math.max(s.fastUntil, abs() + n)
    setRunning(true); setReport({ chaos, live: true })
  }
  const run = () => { if (!s.run) startRun(7) }
  const advanceDays = (days) => {
    if (s.run) return
    if (s.paused) { s.paused = false; setPaused(false) }
    s.fastUntil = Math.max(s.fastUntil, abs() + days)
  }
  const chaos = () => { if (s.run) return; const r = applyChaos(s.w, s.t.day); commit(withEvents(r.world, s.w, s.t.day)); startRun(2, r.chaos) }
  const reset = () => { if (s.run) return; s.a = []; s.fastUntil = 0; setClock({ day: 1, hour: 8 }); commit(createInitialState()); setReport(null); setCmd(null) }
  const setResource = (id, v) => commit({ ...s.w, resources: { ...s.w.resources, [id]: clamp(v) } })
  const setField = (k, v) => commit({ ...s.w, [k]: v, ...(k === 'weather' ? { weatherUntil: null } : {}) })
  const togglePause = () => { s.paused = !s.paused; setPaused(s.paused) }
  const toggleFast = () => { s.userFast = !s.userFast; setUserFast(s.userFast); replan() }

  const command = (text) => {
    const { actions, unknown } = interpret(text)
    if (!actions.length) { setCmd({ ok: false, text }); return }
    const before = s.w, did = [], expect = []
    let w = s.w, doChaos = false, doReset = false, fast = 0
    for (const act of actions) {
      const r = act(w, { abs: abs() })
      if (r.special === 'reset') doReset = true
      if (r.special === 'chaos') doChaos = true
      if (r.patch) w = r.patch(w); else if (r.w) w = r.w
      if (r.hour != null) setClock({ day: s.t.day, hour: r.hour })
      if (r.fast) fast = r.fast
      did.push(r.did); if (r.expect && !expect.includes(r.expect)) expect.push(r.expect)
    }
    if (doReset) { reset(); setCmd({ ok: true, text, did, expect, events: [] }); return }
    if (doChaos) { chaos(); setCmd({ ok: true, text, did, expect, events: [] }); return }
    w = withEvents({ ...w, log: [{ id: 'cmd', key: `m${Math.random()}`, day: s.t.day, title: `You: ${text}`, severity: 'chaos', why: did.join('. ') }, ...w.log] }, before, s.t.day)
    if (fast) s.fastUntil = Math.max(s.fastUntil, abs() + fast)
    commit(w)
    setCmd({ ok: true, text, did, expect, unknown, events: w.activeEvents.filter((e) => !before.activeEvents.some((b) => b.id === e.id)).map((e) => e.title) })
  }

  return { world, time, agents, paused, userFast, running, report, cmd, setResource, setField, run, advanceDays, chaos, reset, command, togglePause, toggleFast, fast: isFast() }
}
