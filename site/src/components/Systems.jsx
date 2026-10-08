import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/*
  "Under the hood": interactive architecture diagrams of the two CDIS systems.
  Node positions are in a 1000x420 SVG viewBox; packets travel along each edge.
*/

const SYSTEMS = {
  surveillance: {
    label: 'Exam CCTV',
    blurb: 'How a camera frame becomes an alert on an operator’s screen, then a verified client alert. Three repos: a Python GPU worker, a Node.js backend and a React dashboard.',
    nodes: [
      { id: 'dvr', x: 80, y: 120, title: 'Centre DVRs', sub: 'RTSP / HLS', detail: 'Each exam centre’s DVR is reached through a video relay. Workers request a stream link per camera and read a low-bandwidth substream. HLS centres come in as HLS links.' },
      { id: 'tok', x: 80, y: 320, title: 'Token service', sub: 'one login / server', detail: 'Keeps one relay login per server and hands the token to every stream process, so hundreds of streams on a server don’t each log in.' },
      { id: 'prod', x: 290, y: 220, title: 'Stream producers', sub: '1 process / camera', detail: 'Kept-open substreams spread across a GPU worker fleet built to scale to 1,00,000+ concurrent streams. Each reads every frame to stay warm, decodes only the frames due in its slot, and reconnects with jittered backoff after a 15 s silence.' },
      { id: 'poll', x: 290, y: 60, title: 'Poller + session', sub: 'exam · shift · day', detail: 'Polls the backend for due script assignments and groups them into one session per exam, shift and day. Later scripts merge in, and cameras open 3 min before they’re needed.' },
      { id: 'det', x: 500, y: 220, title: 'Detectors', sub: 'YOLO · RF-DETR · vLLM', detail: 'Separate processes: person ×2, phone ×1, monitor ×2. Each model runs once per frame and each analytic applies its own rule, with 2-hit confirmation, cooldowns and queue backpressure. vLLM classifies camera scenes during setup.' },
      { id: 'db', x: 690, y: 120, title: 'MySQL', sub: 'detections + images', detail: 'Alert rows and images land here, alongside exams, shifts, cameras, schedules, thresholds and per-shift script assignments.' },
      { id: 'api', x: 690, y: 330, title: 'Node.js backend', sub: 'Express · socket.io', detail: 'REST API and auth, Excel schedule uploads, an executions API the workers poll, a fleet registry with heartbeats and work leases, an SMS service and a Prometheus proxy. It reads new detections every 2 s and emits them over socket.io.' },
      { id: 'ui', x: 900, y: 220, title: 'Operator dashboard', sub: 'React · MUI', detail: 'Live detections, review (push to client, skip, remove with undo), cameras, exams, shifts, executions, fleet and GPU monitor pages, and summary reports.' },
      { id: 'client', x: 900, y: 380, title: 'Client + SMS', sub: 'portal · API', detail: 'Pushed alerts reach the client portal and client API. Serious alert types also go out by SMS using per-type templates.' },
    ],
    edges: [['dvr', 'prod'], ['tok', 'prod'], ['poll', 'prod'], ['prod', 'det'], ['det', 'db'], ['db', 'api'], ['api', 'ui'], ['ui', 'api'], ['api', 'client'], ['poll', 'api']],
  },
  grievance: {
    label: 'Grievance Intelligence',
    blurb: 'Search, root-cause analysis and alerts over ~5M consumer complaints, built on FastAPI and Elasticsearch with a React dashboard on top.',
    nodes: [
      { id: 'mysql', x: 80, y: 100, title: 'MySQL', sub: 'complaints 2016–25', detail: 'System of record for complaints plus master data for states, cities, sectors and categories.' },
      { id: 'embed', x: 80, y: 300, title: 'Embedding jobs', sub: '768-d vectors', detail: 'Batch scripts create indices and bulk-insert each complaint with a sentence-embedding vector for cosine kNN.' },
      { id: 'es', x: 300, y: 200, title: 'Elasticsearch', sub: 'BM25 + kNN', detail: 'One index serves field-weighted keyword search, semantic vector search and hybrid search, plus aggregations for state and district spatial analysis.' },
      { id: 'api', x: 520, y: 200, title: 'FastAPI', sub: 'JWT / OAuth2', detail: 'Routers for search, spatial analysis, RCA, category analysis and alerts, feedback and users. Every route is token-protected and credentials are hashed.' },
      { id: 'rca', x: 520, y: 50, title: 'RCA engine', sub: 'BERTopic + cache', detail: 'BERTopic clusters complaints into root-cause themes from stored embeddings. A precomputed cache per ministry and date range is matched to the nearest window and similar topics are merged level by level.' },
      { id: 'llm', x: 520, y: 360, title: 'LLM categories', sub: 'Llama via Ollama', detail: 'Proposes sub-categories for each top-level category from sampled complaints. Prompts and outputs are cleaned into JSON for the explorer.' },
      { id: 'alerts', x: 740, y: 360, title: 'Category alerts', sub: 'week vs 12-week', detail: 'Compares each category’s last-week daily rate with its 12-week baseline and labels it HIGH, MEDIUM or NORMAL.' },
      { id: 'ui', x: 900, y: 200, title: 'React dashboard', sub: 'Redux · Leaflet · D3', detail: 'Category explorer treemap, semantic search with state and district choropleths, alert charts, CSV export and search history.' },
    ],
    edges: [['mysql', 'embed'], ['embed', 'es'], ['mysql', 'es'], ['es', 'api'], ['rca', 'api'], ['api', 'llm'], ['api', 'alerts'], ['api', 'ui'], ['alerts', 'ui']],
  },
}

// Illustrative trace: the shape of a root-cause-analysis request, not production timings.
const TRACE = {
  miss: [
    { name: 'POST /realtimerca', start: 0, dur: 100, kind: 'root' },
    { name: 'rca_cache.nearest(ministry, range) → MISS', start: 1, dur: 4, kind: 'cache' },
    { name: 'es.search(filter) → ids + vectors', start: 6, dur: 22, kind: 'es' },
    { name: 'bertopic.fit_transform(docs, vectors)', start: 29, dur: 58, kind: 'cpu' },
    { name: 'label topics + build levels', start: 88, dur: 8, kind: 'pg' },
    { name: 'cache.store(range)', start: 96, dur: 3, kind: 'cache' },
  ],
  hit: [
    { name: 'POST /realtimerca', start: 0, dur: 12, kind: 'root' },
    { name: 'rca_cache.nearest(ministry, range) → HIT', start: 1, dur: 4, kind: 'cache' },
    { name: 'merge_similar_topics(levels)', start: 5, dur: 6, kind: 'cpu' },
  ],
}

function Diagram({ sys, active, setActive }) {
  const byId = Object.fromEntries(sys.nodes.map((n) => [n.id, n]))
  return (
    <svg className="arch" viewBox="0 0 1000 440" role="img" aria-label={`${sys.label} architecture`}>
      <defs>
        <linearGradient id="edge" x1="0" x2="1"><stop offset="0" stopColor="#ffb000" stopOpacity=".5" /><stop offset="1" stopColor="#ff4b3e" stopOpacity=".5" /></linearGradient>
      </defs>
      {sys.edges.map(([a, b], i) => {
        const A = byId[a], B = byId[b]
        const mx = (A.x + B.x) / 2
        const d = `M${A.x},${A.y} C${mx},${A.y} ${mx},${B.y} ${B.x},${B.y}`
        const hot = active === a || active === b
        return (
          <g key={a + b}>
            <path d={d} fill="none" stroke={hot ? '#ffb000' : 'url(#edge)'} strokeWidth={hot ? 2 : 1.2} strokeDasharray="4 6" className="arch-edge" />
            {[0, 1].map((k) => (
              <circle key={k} r="3.5" fill={i % 3 === 2 ? '#ff4b3e' : '#ffb000'}>
                <animateMotion dur={`${2.2 + (i % 3) * 0.6}s`} begin={`${k * 1.2 + i * 0.2}s`} repeatCount="indefinite" path={d} />
              </circle>
            ))}
          </g>
        )
      })}
      {sys.nodes.map((n) => (
        <g key={n.id} className={`arch-node ${active === n.id ? 'is-active' : ''}`} transform={`translate(${n.x},${n.y})`}
          onMouseEnter={() => setActive(n.id)} onClick={() => setActive(n.id)} tabIndex={0} onFocus={() => setActive(n.id)}>
          <rect x="-74" y="-28" width="148" height="56" rx="12" />
          <text y="-3" textAnchor="middle" className="t1">{n.title}</text>
          <text y="15" textAnchor="middle" className="t2">{n.sub}</text>
        </g>
      ))}
    </svg>
  )
}

function Trace() {
  const [mode, setMode] = useState('miss')
  const spans = TRACE[mode]
  return (
    <div className="glass trace">
      <div className="trace-head">
        <span className="mono kicker">grievance rca · request trace (illustrative)</span>
        <div className="seg mono">
          <button className={mode === 'miss' ? 'on' : ''} onClick={() => setMode('miss')}>cold (cache miss)</button>
          <button className={mode === 'hit' ? 'on' : ''} onClick={() => setMode('hit')}>warm (cache hit)</button>
        </div>
      </div>
      <div className="trace-body mono">
        <AnimatePresence mode="popLayout">
          {spans.map((s, i) => (
            <motion.div key={mode + s.name} className="span-row" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.06 }}>
              <span className="span-name">{s.name}</span>
              <span className="span-track">
                <motion.i className={`k-${s.kind}`} initial={{ width: 0 }} animate={{ width: `${s.dur}%` }} transition={{ delay: 0.15 + i * 0.06, duration: 0.6 }} style={{ left: `${s.start}%` }} />
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <p className="trace-note muted">
        Shows the shape of a root-cause request. On a miss the topic model is fit on the fly; on a hit the nearest precomputed window is reused and similar topics are merged. Bar widths are relative, not production timings.
      </p>
    </div>
  )
}

const reveal = { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }

export default function Systems() {
  const [key, setKey] = useState('surveillance')
  const sys = SYSTEMS[key]
  const [active, setActive] = useState(sys.nodes[0].id)
  const node = sys.nodes.find((n) => n.id === active) || sys.nodes[0]
  const pick = (k) => { setKey(k); setActive(SYSTEMS[k].nodes[0].id) }
  return (
    <section className="section" id="systems">
      <motion.div className="section-head" {...reveal}>
        <span className="mono kicker">GET /v1/systems</span>
        <h2>Under the hood</h2>
        <p className="section-sub">Architecture of the two production systems I work on at CDIS, IIT Kanpur. Hover or tap any component.</p>
      </motion.div>
      <motion.div className="glass systems" {...reveal}>
        <div className="systems-tabs mono">
          {Object.entries(SYSTEMS).map(([k, s]) => (
            <button key={k} className={k === key ? 'on' : ''} onClick={() => pick(k)}>{s.label}</button>
          ))}
          <span className="live"><i className="rec" /> live diagram</span>
        </div>
        <p className="systems-blurb">{sys.blurb}</p>
        <div className="arch-wrap"><Diagram sys={sys} active={active} setActive={setActive} /></div>
        <AnimatePresence mode="wait">
          <motion.div key={key + node.id} className="node-detail" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <span className="mono kicker">{node.sub}</span>
            <h4>{node.title}</h4>
            <p>{node.detail}</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <Trace />
    </section>
  )
}
