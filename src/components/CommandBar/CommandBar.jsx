import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, ArrowUp } from 'lucide-react'
import { EXAMPLES } from '../../engine/commands'

export default function CommandBar({ onCommand, result }) {
  const [text, setText] = useState('')
  const send = (t) => { if (t.trim()) { onCommand(t); setText('') } }
  return (
    <div className="absolute inset-x-0 bottom-2 z-20 mx-auto w-[min(50rem,calc(100%-1rem))] sm:bottom-3">
      <AnimatePresence mode="wait">
        {result && (
          <motion.div key={result.text + (result.did?.join() || '')} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass mb-1.5 rounded-lg px-3 py-2 text-xs" role="status">
            {result.ok ? (
              <>
                <p className="font-display text-base font-semibold">{result.did.join(' · ')}</p>
                {result.expect.map((e) => <p key={e} className="text-mist">{e}</p>)}
                {result.events?.map((t) => <p key={t} className="mt-1 font-semibold text-critical">New event: {t}</p>)}
                {result.unknown?.length > 0 && <p className="mt-1 text-xs text-warning">Skipped: “{result.unknown.join('”, “')}”</p>}
              </>
            ) : <p>I don’t know how to “{result.text}” yet. Try “{EXAMPLES[1]}” or “{EXAMPLES[0]}”.</p>}
          </motion.div>)}
      </AnimatePresence>
      <form onSubmit={(e) => { e.preventDefault(); send(text) }} className="glass flex items-center gap-2 rounded-xl p-1.5 pl-3 shadow-[0_10px_40px_-10px_rgba(106,167,232,.38)] focus-within:border-recovery sm:p-2 sm:pl-4">
        <Sparkles size={18} className="shrink-0 text-recovery" aria-hidden="true" />
        <input value={text} onChange={(e) => setText(e.target.value)} aria-label="Command" placeholder="What should happen in this world?" className="min-w-0 flex-1 bg-transparent py-1.5 font-display text-sm outline-none placeholder:text-mist/70 sm:text-base" />
        <button type="submit" aria-label="Run command" className="rounded-lg bg-white p-2 text-void transition hover:bg-recovery"><ArrowUp size={17} /></button>
      </form>
      <div className="mt-1.5 flex flex-wrap justify-center gap-1 sm:gap-1.5">
        {EXAMPLES.map((e) => <button key={e} title={`Try: ${e}`} onClick={() => send(e)} className="rounded-full border border-line bg-void/75 px-2 py-0.5 text-[10px] text-mist transition hover:border-recovery hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-recovery sm:px-2.5 sm:py-1 sm:text-xs">{e}</button>)}
      </div>
    </div>
  )
}
