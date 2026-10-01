import Header from './components/Header/Header'
import WorldView from './components/WorldView/WorldView'
import EventFeed from './components/EventFeed/EventFeed'
import CommandBar from './components/CommandBar/CommandBar'
import ControlPanel from './components/ControlPanel/ControlPanel'
import { useSimulation } from './hooks/useSimulation'
import { RotateCcw } from 'lucide-react'

export default function App() {
  const s = useSimulation()
  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden">
      <main className="relative min-h-0 flex-1 p-1.5 sm:p-2">
        <WorldView world={s.world} agents={s.agents} hour={s.time.hour} />
        <Header world={s.world} time={s.time} shown={s.agents.length} running={s.running} />
        <EventFeed log={s.world.log} report={s.report} running={s.running} pendingEvents={s.world.pendingEvents} onResolve={s.resolveEvent} critical={s.world.critical} />
        <CommandBar onCommand={s.command} result={s.cmd} />
      </main>
      <ControlPanel world={s.world} running={s.running} paused={s.paused} fast={s.fast} onResource={s.setResource} onPause={s.togglePause} onFast={s.toggleFast} onAdvance={s.advanceDays} onRun={s.run} onChaos={s.chaos} onReset={s.reset} />
      {s.world.ended && (
        <div role="alertdialog" aria-modal="true" aria-labelledby="collapse-title" className="absolute inset-0 z-50 grid place-items-center bg-[#06090d]/90 p-5 backdrop-blur-sm">
          <div className="w-full max-w-md border-y border-critical/50 py-8 text-center">
            <p className="font-mono text-xs tracking-[0.24em] text-critical">CIVILIZATION LOST</p>
            <h2 id="collapse-title" className="mt-3 font-display text-4xl font-extrabold text-white sm:text-5xl">World collapsed</h2>
            <p className="mt-4 text-sm text-mist">Day {s.world.collapseDay} · population {s.world.collapsedPopulation?.toLocaleString()}</p>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-mist">The systems that sustained the city failed together. Every ending leaves a new question.</p>
            <button onClick={s.reset} className="mx-auto mt-7 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-xs font-bold uppercase text-void transition hover:bg-recovery"><RotateCcw size={14} />Start a new world</button>
          </div>
        </div>
      )}
    </div>
  )
}
