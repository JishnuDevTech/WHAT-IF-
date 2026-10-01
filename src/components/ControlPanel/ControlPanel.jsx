import { Wheat, Droplets, Zap, Home, Briefcase, Play, Pause, FastForward, StepForward, RotateCcw, Loader2 } from 'lucide-react'
import Meter from './Meter'
import { RESOURCES } from '../../data/initialState'

const ICON = { Wheat, Droplets, Zap, Home, Briefcase }
const button = 'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border border-line px-2.5 text-xs font-semibold text-mist transition hover:border-mist/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-recovery disabled:cursor-not-allowed disabled:opacity-40'

export default function ControlPanel({ world, running, paused, fast, onResource, onPause, onFast, onAdvance, onRun, onChaos, onReset }) {
  return (
    <footer aria-label="Simulation controls" className="glass z-20 border-x-0 border-b-0 px-3 py-2 sm:px-5 sm:py-2.5">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-x-5 gap-y-2">
        <div className="grid min-w-0 flex-1 grid-cols-5 gap-2 sm:min-w-[27rem] sm:gap-3">
          {RESOURCES.map((r) => <Meter key={r.id} label={r.label} icon={ICON[r.icon]} value={world.resources[r.id]} disabled={running} onChange={(v) => onResource(r.id, v)} />)}
        </div>
        <div className="flex w-full items-center justify-end gap-1.5 sm:w-auto sm:gap-2">
          <button title={paused ? 'Resume time' : 'Pause time'} aria-label={paused ? 'Resume time' : 'Pause time'} onClick={onPause} className={button}>{paused ? <Play size={15} /> : <Pause size={15} />}</button>
          <button title="Advance one day" onClick={() => onAdvance(1)} disabled={running} className={button}><StepForward size={15} />1 DAY</button>
          <button title="Advance seven days" onClick={onRun} disabled={running} className={button}>{running ? <Loader2 size={15} className="animate-spin" /> : <FastForward size={15} />}7 DAYS</button>
          <button title="Fast-forward time" aria-pressed={fast} onClick={onFast} className={`${button} ${fast ? 'border-recovery/70 text-recovery' : ''}`}><FastForward size={15} />FAST</button>
          <button title="Introduce a combination of unexpected changes" onClick={onChaos} disabled={running} className="inline-flex min-h-9 items-center justify-center gap-1 rounded-md border border-warning/60 bg-warning/10 px-3 text-xs font-bold text-warning transition hover:bg-warning/20 disabled:opacity-40"><Zap size={15} fill="currentColor" />CHAOS</button>
          <button title="Reset simulation" aria-label="Reset simulation" onClick={onReset} disabled={running} className={button}><RotateCcw size={15} /></button>
        </div>
      </div>
    </footer>
  )
}
