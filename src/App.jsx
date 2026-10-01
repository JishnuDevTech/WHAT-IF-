import Header from './components/Header/Header'
import WorldView from './components/WorldView/WorldView'
import EventFeed from './components/EventFeed/EventFeed'
import CommandBar from './components/CommandBar/CommandBar'
import ControlPanel from './components/ControlPanel/ControlPanel'
import { useSimulation } from './hooks/useSimulation'

export default function App() {
  const s = useSimulation()
  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden">
      <main className="relative min-h-0 flex-1 p-1.5 sm:p-2">
        <WorldView world={s.world} agents={s.agents} hour={s.time.hour} />
        <Header world={s.world} time={s.time} shown={s.agents.length} running={s.running} />
        <EventFeed log={s.world.log} report={s.report} running={s.running} />
        <CommandBar onCommand={s.command} result={s.cmd} />
      </main>
      <ControlPanel world={s.world} running={s.running} paused={s.paused} fast={s.fast} onResource={s.setResource} onPause={s.togglePause} onFast={s.toggleFast} onAdvance={s.advanceDays} onRun={s.run} onChaos={s.chaos} onReset={s.reset} />
    </div>
  )
}
