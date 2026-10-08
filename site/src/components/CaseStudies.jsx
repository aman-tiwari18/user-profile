import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { caseStudies, categoryAlertDemo } from '../data'

const ease = [0.16, 1, 0.3, 1]
const reveal = { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.9, ease } }

/* Round-robin vs kept-open: which cameras actually get looked at, tick by tick. */
const N = 96
function StreamDemo() {
  const [mode, setMode] = useState('kept')
  const [tick, setTick] = useState(0)
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 120); return () => clearInterval(t) }, [])
  const state = useMemo(() => Array.from({ length: N }, (_, i) => {
    if (mode === 'rr') {
      const cursor = (tick * 0.4) % N
      const d = (i - cursor + N) % N
      return d < 2 ? 'look' : 'off'
    }
    // kept-open: every stream is warm; each camera fires on its own slot
    const slot = (i * 37) % 40
    return tick % 40 === slot ? 'look' : 'warm'
  }), [mode, tick])
  return (
    <div className="demo glass">
      <div className="demo-head mono">
        <span className="kicker">stream scheduler · simulation</span>
        <div className="seg">
          <button className={mode === 'rr' ? 'on' : ''} onClick={() => setMode('rr')}>before: round-robin</button>
          <button className={mode === 'kept' ? 'on' : ''} onClick={() => setMode('kept')}>after: kept-open + slots</button>
        </div>
      </div>
      <div className="cam-grid">{state.map((s, i) => <i key={i} className={s} />)}</div>
      <p className="demo-note muted mono">
        {mode === 'rr'
          ? 'open → grab 2 frames → close → next. ~22 cameras/min per process; each camera revisited every 13–65 min.'
          : 'every stream stays warm; each camera sends a frame in its own slot, so GPU load stays an even trickle.'}
      </p>
      <div className="legend mono"><span><i className="look" /> frame analysed</span><span><i className="warm" /> stream open (warm)</span><span><i className="off" /> stream closed</span></div>
    </div>
  )
}

/* Category alert: last-week daily rate vs 12-week baseline. */
function level(base, week) {
  const inc = ((week - base) / base) * 100
  return { inc, lvl: inc >= 100 ? 'HIGH' : inc >= 30 ? 'MEDIUM' : 'NORMAL' }
}
function AlertDemo() {
  const [hover, setHover] = useState(null)
  const max = Math.max(...categoryAlertDemo.map((c) => c.week))
  return (
    <div className="demo glass">
      <div className="demo-head mono">
        <span className="kicker">category alerts · illustrative data</span>
        <span className="legend"><span><i className="b-base" /> 12-week avg / day</span><span><i className="b-week" /> last week / day</span></span>
      </div>
      <div className="alert-rows">
        {categoryAlertDemo.map((c, i) => {
          const { inc, lvl } = level(c.base, c.week)
          return (
            <div key={c.cat} className={`alert-row ${hover === i ? 'on' : ''}`} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <span className="a-cat">{c.cat}</span>
              <span className="a-bars">
                <motion.i className="b-base" initial={{ width: 0 }} whileInView={{ width: `${(c.base / max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.05 }} />
                <motion.i className="b-week" initial={{ width: 0 }} whileInView={{ width: `${(c.week / max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 + i * 0.05 }} />
              </span>
              <span className={`a-inc mono ${inc > 0 ? 'up' : ''}`}>{inc > 0 ? '↗' : '↘'} {inc.toFixed(0)}%</span>
              <span className={`a-lvl mono l-${lvl}`}>{lvl}</span>
            </div>
          )
        })}
      </div>
      <p className="demo-note muted mono">alert level = last week’s daily rate vs the category’s own 12-week baseline · ≥100% HIGH · ≥30% MEDIUM</p>
    </div>
  )
}

function Study({ s, i }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.article className="study glass frame" {...reveal} style={{ '--acc': s.accent }}>
      <header className="study-head">
        <span className="mono kicker">0{i + 1} · {s.kicker}</span>
        <h3>{s.title}</h3>
        <p className="study-one">{s.oneLiner}</p>
      </header>
      <div className="study-metrics">
        {s.metrics.map((m) => <div key={m.l}><b>{m.v}</b><span>{m.l}</span></div>)}
      </div>
      {s.id === 'cctv' ? <StreamDemo /> : <AlertDemo />}
      <div className="study-body">
        {s.sections.slice(0, open ? undefined : 2).map((sec) => (
          <div key={sec.h} className="study-sec">
            <h4 className="mono">{sec.h}</h4>
            {sec.p && <p>{sec.p}</p>}
            {sec.list && <ul>{sec.list.map((l) => <li key={l}>{l}</li>)}</ul>}
          </div>
        ))}
        <AnimatePresence>
          {open && s.analytics && (
            <motion.div className="study-sec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h4 className="mono">Detection catalogue</h4>
              <div className="tags">{s.analytics.map((a) => <span key={a}>{a}</span>)}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <button className="btn btn--ghost study-more" onClick={() => setOpen(!open)}>{open ? 'Show less ↑' : 'Read the full case study ↓'}</button>
      <div className="tags study-stack">{s.stack.map((t) => <span key={t}>{t}</span>)}</div>
    </motion.article>
  )
}

export default function CaseStudies() {
  return (
    <section className="section" id="work">
      <motion.div className="section-head" {...reveal}>
        <span className="mono kicker">GET /v1/case-studies</span>
        <h2>Two systems, <span className="serif">in depth</span></h2>
        <p className="section-sub">The production work I'm proudest of: what the problem was, what I built, and how it holds up.</p>
      </motion.div>
      <div className="studies">{caseStudies.map((s, i) => <Study key={s.id} s={s} i={i} />)}</div>
    </section>
  )
}
