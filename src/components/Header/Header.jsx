import { Sun, Moon } from 'lucide-react'
import AnimatedNumber from '../shared/AnimatedNumber'
import { daylight } from '../../engine/calculations'

export default function Header({ world, time, shown, running }) {
  const hh = String(Math.floor(time.hour)).padStart(2, '0'), mm = String(Math.floor((time.hour % 1) * 60)).padStart(2, '0')
  const isDay = daylight(time.hour) > 0.5
  return (
    <header className="pointer-events-none absolute left-3 top-3 z-20 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-2 sm:left-5 sm:top-4 sm:gap-3">
      <h1 className="font-display text-3xl font-extrabold leading-none sm:text-4xl">WHAT IF<span className="text-recovery">?</span></h1>
      <div className="glass flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs sm:gap-3 sm:px-3">
        {isDay ? <Sun size={15} className="text-warning" aria-label="Daytime" /> : <Moon size={15} className="text-recovery" aria-label="Nighttime" />}
        <span className="font-semibold">DAY {String(time.day).padStart(2, '0')}</span>
        <span className="font-mono text-sm text-white">{hh}:{mm}</span>
        <span className="h-3 w-px bg-line" aria-hidden="true" />
        <span><b className="font-display text-sm"><AnimatedNumber value={world.population} /></b> <span className="text-mist">citizens</span></span>
        <span className="hidden border-l border-line pl-2 text-[10px] text-mist md:inline">FIT {Math.round(world.fitness)} · EDU {Math.round(world.education)}</span>
        {running && <span className="text-recovery">evolving</span>}
      </div>
    </header>
  )
}
