import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, BookOpen, Briefcase, Droplets, Flame, HeartPulse, Home, Zap, Wheat } from 'lucide-react'

const tone = { critical: 'border-critical/60 text-critical', warning: 'border-warning/60 text-warning', recovery: 'border-recovery/60 text-recovery', chaos: 'border-white/70 text-white' }
const ICON = { Wheat, Droplets, Zap, Briefcase, Flame, HeartPulse, Home, BookOpen }

export default function EventFeed({ log, report, running, pendingEvents = [], onResolve, critical }) {
  return (
    <aside aria-label="Consequences" className="pointer-events-none absolute right-2 top-[6.25rem] flex max-h-[55%] w-[min(17rem,calc(100%-1rem))] flex-col gap-1.5 overflow-y-auto sm:right-5 sm:top-4 sm:max-h-[55%]">
      {critical && <div className="glass pointer-events-auto flex items-center gap-2 rounded-lg border border-critical/60 px-3 py-2 text-xs font-bold text-critical"><AlertTriangle size={15} /> CIVILIZATION CRITICAL</div>}
      <AnimatePresence initial={false}>
        {pendingEvents.map((event) => {
          const Icon = ICON[event.icon] || AlertTriangle
          return (
            <motion.article key={event.id} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 18 }} className="glass pointer-events-auto rounded-lg border border-critical/45 p-2.5 shadow-lg shadow-black/20">
              <div className="flex items-start gap-2">
                <Icon size={16} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
                <div className="min-w-0"><p className="font-display text-xs font-bold uppercase text-white">{event.title}</p><p className="mt-1 text-[11px] leading-snug text-mist">{event.description}</p></div>
              </div>
              <div className="mt-2 grid gap-1">
                {event.options.map((option) => (
                  <button key={option.id} onClick={() => onResolve?.(event.id, option.id)} className="rounded-md border border-line bg-black/15 px-2 py-1.5 text-left transition hover:border-recovery/60 hover:bg-recovery/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-recovery">
                    <span className="block text-[10px] font-bold uppercase text-white">{option.label}</span>
                    <span className="mt-0.5 block text-[10px] leading-snug text-mist">{option.detail}</span>
                  </button>
                ))}
              </div>
            </motion.article>
          )
        })}
      </AnimatePresence>
      <AnimatePresence>
        {report && (
          <motion.div key={report.live ? 'live' : 'rep'} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="glass pointer-events-auto rounded-lg p-2.5 text-xs">
            {report.chaos && <p className="font-display text-lg font-semibold">Chaos: {report.chaos.title}<span className="block text-xs font-normal text-mist">{report.chaos.why}</span></p>}
            {report.live && <p className="text-xs text-mist">The world is reacting…</p>}
            {report.stats && (
              <>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {report.stats.map((s) => (
                    <div key={s.label}><p className="text-xs text-mist">{s.label}</p>
                      <p className={`font-display text-lg font-semibold ${s.to < s.from ? 'text-critical' : s.to > s.from ? 'text-stable' : ''}`}>{s.from}→{s.to}</p></div>))}
                </div>
                {report.chains.length === 0 && <p className="mt-2 text-xs text-mist">The world held steady. Push one condition to an extreme and run it again.</p>}
                {report.chains.map((c, i) => (
                  <motion.p key={c[0]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.35 }} className="mt-2 border-l-2 border-line pl-2 text-xs leading-snug">
                    <b>{c[0]}</b><br />↓ {c[1]}<br />↓ <span className="text-mist">{c[2]}</span></motion.p>))}
              </>)}
          </motion.div>)}
      </AnimatePresence>
      <div className="hidden space-y-1.5 overflow-hidden sm:block">
        <AnimatePresence initial={false}>
          {log.slice(0, 5).map((e) => (
            <motion.div key={e.key} layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className={`glass rounded-md border-l-2 px-2.5 py-1 text-[11px] ${tone[e.severity]}`}>
              <b>{e.title}</b> <span className="text-mist">day {e.day}</span><p className="text-mist">{e.why}</p>
            </motion.div>))}
        </AnimatePresence>
        {!log.length && !report && !running && <p className="text-right text-xs text-mist">Nothing has happened yet.</p>}
      </div>
    </aside>
  )
}
