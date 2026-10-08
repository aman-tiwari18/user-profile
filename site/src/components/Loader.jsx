import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

const CELLS = 160
const TARGET = 100000
const STAGES = ['handshaking RTSP/HLS streams', 'assigning GPU workers', 'loading YOLO + vLLM weights', 'fleet online']

export default function Loader({ onDone }) {
  const [pct, setPct] = useState(0)
  const order = useMemo(() => Array.from({ length: CELLS }, (_, i) => i).sort(() => Math.random() - 0.5), [])
  const lit = useMemo(() => new Set(order.slice(0, Math.floor((pct / 100) * CELLS))), [order, pct])
  const alerts = useMemo(() => new Set(order.filter((_, i) => i % 23 === 0)), [order])

  useEffect(() => {
    const t = setInterval(() => setPct((p) => Math.min(p + 2 + Math.random() * 4, 100)), 40)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    if (pct >= 100) {
      const t = setTimeout(onDone, 450)
      return () => clearTimeout(t)
    }
  }, [pct, onDone])

  const stage = STAGES[Math.min(Math.floor((pct / 100) * STAGES.length), STAGES.length - 1)]
  return (
    <motion.div className="loader" exit={{ opacity: 0, scale: 1.06, filter: 'blur(10px)' }} transition={{ duration: 0.7, ease: [0.7, 0, 0.2, 1] }}>
      <div className="loader-inner">
        <div className="loader-top mono">
          <span><i className="rec" /> fleet-controller</span>
          <span>{Math.floor((pct / 100) * TARGET).toLocaleString('en-IN')} / 1,00,000 streams</span>
        </div>
        <div className="feed-grid">
          {Array.from({ length: CELLS }, (_, i) => (
            <span key={i} className={lit.has(i) ? (alerts.has(i) && pct > 60 ? 'on alert' : 'on') : ''} />
          ))}
        </div>
        <div className="loader-bottom mono">
          <span className="muted">› {stage}{pct < 100 ? '…' : ' ✔'}</span>
          <button onClick={onDone}>skip ⏎</button>
        </div>
      </div>
    </motion.div>
  )
}
