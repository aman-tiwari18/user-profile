import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { profile, stats, experience, skills, sphereWords } from '../data'
import { scrollTo, gsap, ScrollTrigger } from '../scroll'

const SkillSphere = lazy(() => import('../three/SkillSphere'))
const Globe = lazy(() => import('../three/Globe'))

const ease = [0.16, 1, 0.3, 1]
const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.9, ease },
}

function useInView(ref, margin = '200px') {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { rootMargin: margin })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [ref, margin])
  return seen
}

/* ---------------- Nav ---------------- */
const NAV = [['about', 'About'], ['experience', 'Experience'], ['systems', 'Systems'], ['stack', 'Stack'], ['work', 'Work'], ['contact', 'Contact']]

function RecClock() {
  const [t, setT] = useState('')
  useEffect(() => {
    const f = () => setT(new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }))
    f(); const id = setInterval(f, 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="rec-clock mono"><i className="rec" /> REC {t} IST</span>
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  const go = (id) => { setOpen(false); scrollTo(`#${id}`) }
  return (
    <header className={`nav ${scrolled ? 'nav--solid' : ''}`}>
      <button className="logo" onClick={() => scrollTo(0)} aria-label="Back to top">
        <span className="logo-mark">AT</span><span className="logo-text">aman<b>.tiwari</b></span>
      </button>
      <RecClock />
      <nav className={open ? 'open' : ''}>
        {NAV.map(([id, label], i) => (
          <button key={id} onClick={() => go(id)}>{label}</button>
        ))}
        <a className="btn btn--ghost" href={profile.resume} target="_blank" rel="noreferrer">Resume ↗</a>
      </nav>
      <button className={`burger ${open ? 'x' : ''}`} onClick={() => setOpen(!open)} aria-label="Menu"><i /><i /></button>
    </header>
  )
}

/* ---------------- Hero ---------------- */
function Typer({ words }) {
  const [i, setI] = useState(0)
  const [txt, setTxt] = useState('')
  const [del, setDel] = useState(false)
  useEffect(() => {
    const w = words[i % words.length]
    const t = setTimeout(() => {
      if (!del && txt === w) return setDel(true)
      if (del && txt === '') { setDel(false); return setI(i + 1) }
      setTxt(del ? w.slice(0, txt.length - 1) : w.slice(0, txt.length + 1))
    }, !del && txt === w ? 1600 : del ? 35 : 70)
    return () => clearTimeout(t)
  }, [txt, del, i, words])
  return <span className="typer">{txt}<i>|</i></span>
}

// A simulated stream of a working day: deploys, CI, API traffic, reviews, alerts and detections.
const OPS = [
  ['deploy', 'grievance-api v3.4.1 → prod', 'ok'],
  ['ci', 'pharmacy-api · 248 tests passed', 'ok'],
  ['http', 'GET /analytics/distribution 200 · cache HIT', 'ok'],
  ['pr', '#128 merged: RBAC guard on /orders', 'ok'],
  ['alert', 'complaints rising · telecom · UP', 'hot'],
  ['vision', 'CAM-04213 mobile_phone 0.94 → SMS', 'hot'],
  ['docker', 'build surveillance-worker:sha-7f3c', 'ok'],
  ['http', 'POST /v1/jobs/cancel 202 · shift B', 'ok'],
  ['metrics', 'gpu-node-07 util 82% · healthy', 'ok'],
  ['es', 'reindex complaints_2025 · 0 errors', 'ok'],
  ['vision', 'CAM-11872 camera_obstructed 0.97', 'hot'],
  ['ci', 'web-dashboard · lint + build ✔', 'ok'],
]

function OpsConsole() {
  const [log, setLog] = useState([])
  useEffect(() => {
    let i = Math.floor(Math.random() * OPS.length)
    const tick = () => {
      const [kind, text, level] = OPS[i++ % OPS.length]
      const d = new Date()
      setLog((l) => [{ id: d.getTime() + Math.random(), ts: d.toTimeString().slice(0, 8), kind, text, level }, ...l].slice(0, 6))
    }
    tick(); tick()
    const t = setInterval(tick, 1600)
    return () => clearInterval(t)
  }, [])
  return (
    <motion.aside className="hud glass mono" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4, duration: 0.9, ease }}>
      <div className="hud-head"><span><i className="rec" /> ops-console</span><span className="muted">simulated</span></div>
      <div className="hud-stats">
        <div><b>2+ yrs</b><span>in production</span></div>
        <div><b>3 teams</b><span>health · govt</span></div>
        <div><b>1L+</b><span>stream scale</span></div>
      </div>
      <ul className="hud-log">
        <AnimatePresence initial={false}>
          {log.map((e) => (
            <motion.li key={e.id} layout initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <span className="muted">{e.ts}</span> <span className={`kind ${e.level}`}>{e.kind.padEnd(7)}</span> <span>{e.text}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.aside>
  )
}

export function Hero() {
  const words = (text, delay = 0, cls = '') => text.split(' ').map((w, i) => (
    <span key={i} className={`w ${cls}`}><motion.span initial={{ y: '115%' }} animate={{ y: 0 }} transition={{ delay: delay + i * 0.06, duration: 0.9, ease }}>{w}</motion.span></span>
  ))
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <motion.div className="hello" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}>
          <span className="hello-name">Aman Tiwari</span>
          <span className="hello-sep" />
          <span className="mono hello-role"><span className="dot" /> Software Engineer · CDIS, IIT Kanpur</span>
        </motion.div>
        <h1 className="headline">
          {words('I', 0.2)}
          {words('design,', 0.26, 'hl hl-teal')}
          {words('build and', 0.34)}
          {words('ship', 0.46, 'hl hl-violet')}
          {words('software that', 0.52)}
          {words('scales.', 0.64, 'hl hl-teal')}
        </h1>
        <motion.p className="hero-tag" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.8, ease }}>
          Software Engineer at CDIS, IIT Kanpur, with 2+ years across healthcare SaaS and government-scale platforms. I build REST APIs, data and search layers, real-time AI pipelines and the React interfaces on top of them, then automate, ship and monitor them in production.
        </motion.p>
        <motion.p className="hero-role mono" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
          <span className="muted">$ currently →</span> <Typer words={profile.roles} />
        </motion.p>
        <motion.div className="hero-cta" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.8, ease }}>
          <button className="btn btn--primary" onClick={() => scrollTo('#systems')}>See how it's built →</button>
          <a className="btn btn--ghost" href={profile.resume} target="_blank" rel="noreferrer">Résumé ↗</a>
          <div className="socials">
            <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub">GH</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">IN</a>
            <a href={`mailto:${profile.email}`} aria-label="Email">@</a>
          </div>
        </motion.div>
      </div>
      <OpsConsole />
      <div className="scroll-hint mono"><span>scroll</span><i /></div>
    </section>
  )
}

/* ---------------- About ---------------- */
function Counter({ value, prefix = '', suffix = '' }) {
  const ref = useRef()
  useEffect(() => {
    const obj = { v: 0 }
    const st = ScrollTrigger.create({
      trigger: ref.current, start: 'top 90%', once: true,
      onEnter: () => gsap.to(obj, { v: value, duration: 2, ease: 'power3.out', onUpdate: () => { if (ref.current) ref.current.textContent = prefix + Math.round(obj.v).toLocaleString('en-IN') + suffix } }),
    })
    return () => st.kill()
  }, [value, prefix, suffix])
  return <span ref={ref}>{prefix}0{suffix}</span>
}

const LIFECYCLE = [
  { stage: 'design', time: 'schemas · APIs', points: ['REST API & data-model design', 'RBAC, JWT & auth policies', 'Stream & fleet architecture'] },
  { stage: 'build', time: 'Python · Node · React', points: ['FastAPI & Express services', 'Elasticsearch, MySQL, Redis', 'YOLO / vLLM pipelines, React dashboards'] },
  { stage: 'test', time: 'correctness first', points: ['Alert-sample reviews per detector', 'Concurrency & multiprocess pipelines', 'Load tests on real camera fleets'] },
  { stage: 'ship', time: 'Docker · Actions', points: ['CI/CD: Docker images to GHCR', 'pm2 & containerised services', 'GPU worker fleet rollout'] },
  { stage: 'observe', time: 'always on', points: ['Prometheus GPU & system metrics', 'Heartbeats, leases, auto-reconnect', 'SMS & trend alerting'] },
]

function Lifecycle() {
  return (
    <motion.div className="glass lifecycle frame" {...reveal}>
      <div className="lc-head mono">
        <span><span className="ok-dot">✔</span> workflow: <b>software-engineer.yml</b></span>
        <span className="muted">on: [every feature] · 5 jobs · passing</span>
      </div>
      <div className="lc-jobs">
        {LIFECYCLE.map((j, i) => (
          <motion.div key={j.stage} className="lc-job" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 + i * 0.12, duration: 0.6, ease }}>
            <div className="lc-title mono"><span className="lc-check">✔</span> {j.stage}<span className="muted">{j.time}</span></div>
            <ul>{j.points.map((p) => <li key={p}>{p}</li>)}</ul>
            {i < LIFECYCLE.length - 1 && <span className="lc-link" />}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export function About() {
  return (
    <section className="section" id="about">
      <motion.div className="section-head" {...reveal}><span className="mono kicker">GET /v1/about</span><h2>Engineering systems that <span className="serif">see</span>, <span className="serif">scale</span> and <span className="serif">explain</span>.</h2></motion.div>
      <div className="about-grid">
        <motion.div className="glass about-copy frame" {...reveal}>
          <p>
            I'm <b>Aman Tiwari</b>, a Software Engineer at the <b>Center for Developing Intelligent Systems, IIT Kanpur</b>. I like the whole life of a feature: shaping the data model and API, writing the
            service, wiring the UI, putting it behind CI/CD, and watching it in production. Right now that means an exam-surveillance platform running YOLO, RF-DETR and vLLM over hundreds of live camera streams per GPU, and a grievance-intelligence platform that searches ~5M complaints by meaning.
          </p>
          <p>
            Before that I shipped healthcare and pharmacy systems at <b>Cappsule</b> and <b>Linsible</b>, working on Node.js APIs, RBAC, Redis caching, search and CI/CD.
            I care about fast APIs, clean data models and dashboards people actually use.
          </p>
        </motion.div>
        <div className="stats">
          {stats.map((s, i) => (
            <motion.div key={s.label} className="glass stat" {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }}>
              <strong><Counter {...s} /></strong>
              <span>{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
      <Lifecycle />
    </section>
  )
}

/* ---------------- Experience: commit history ---------------- */
function TiltCard({ children, className = '', max = 8 }) {
  const ref = useRef()
  const x = useMotionValue(0.5), y = useMotionValue(0.5)
  const rx = useSpring(useTransform(y, [0, 1], [max, -max]), { stiffness: 200, damping: 20 })
  const ry = useSpring(useTransform(x, [0, 1], [-max, max]), { stiffness: 200, damping: 20 })
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - r.left) / r.width); y.set((e.clientY - r.top) / r.height)
    ref.current.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
    ref.current.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
  }
  const reset = () => { x.set(0.5); y.set(0.5) }
  return (
    <motion.div ref={ref} className={`tilt ${className}`} style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }} onMouseMove={onMove} onMouseLeave={reset}>
      {children}
    </motion.div>
  )
}

const TYPE_LABEL = { feat: 'feat', perf: 'perf', infra: 'infra', ml: 'ml', security: 'sec' }

export function Experience() {
  const line = useRef()
  useEffect(() => {
    const t = gsap.fromTo(line.current, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: line.current.parentElement, start: 'top 70%', end: 'bottom 70%', scrub: true } })
    return () => t.scrollTrigger?.kill()
  }, [])
  return (
    <section className="section" id="experience">
      <motion.div className="section-head" {...reveal}>
        <span className="mono kicker">GET /v1/experience · CHANGELOG.md</span>
        <h2>Release notes <span className="serif">of a career</span></h2>
        <p className="section-sub">Every role shipped a major version. Latest first.</p>
      </motion.div>
      <div className="timeline">
        <div className="timeline-rail"><i ref={line} /></div>
        {experience.map((job, i) => (
          <motion.article key={job.version} className="release" {...reveal} transition={{ ...reveal.transition, delay: i * 0.05 }}>
            <div className={`release-node ${job.current ? 'is-live' : ''}`} />
            <TiltCard className="glass release-card frame" max={3}>
              <header className="release-head">
                <span className="ver mono">{job.version}</span>
                <span className="codename mono">“{job.codename}”</span>
                {job.current && <span className="latest mono"><i className="rec" /> latest · in production</span>}
                <span className="muted mono when">{job.period} · {job.location}</span>
              </header>
              <h3>{job.role} <span className="at">— {job.company}</span></h3>
              <p className="release-sum">{job.summary}</p>
              {job.changes.length > 0 && (
                <ul className="changes">
                  {job.changes.map((c) => (
                    <li key={c.text}>
                      <span className={`ctype mono t-${c.type}`}>{TYPE_LABEL[c.type]}<em>({c.scope})</em></span>
                      <span>{c.text}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="tags">{job.tags.map((t) => <span key={t}>{t}</span>)}</div>
            </TiltCard>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

/* ---------------- Stack ---------------- */
export function Stack() {
  const box = useRef()
  const seen = useInView(box)
  return (
    <section className="section" id="stack">
      <motion.div className="section-head" {...reveal}><span className="mono kicker">GET /v1/stack</span><h2>The toolbox, <span className="serif">in orbit</span></h2></motion.div>
      <div className="stack-grid">
        <div className="sphere" ref={box}>
          {seen && <Suspense fallback={<div className="sphere-fallback mono">loading 3D…</div>}><SkillSphere words={sphereWords} /></Suspense>}
          <span className="sphere-hint mono">drag your cursor · hover a skill</span>
        </div>
        <div className="skill-list">
          {Object.entries(skills).map(([group, items], i) => (
            <motion.div key={group} className="skill-row" {...reveal} transition={{ ...reveal.transition, delay: i * 0.05 }}>
              <span className="mono kicker">{group}</span>
              <div className="tags">{items.map((s) => <span key={s}>{s}</span>)}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Contact ---------------- */
export function Contact() {
  const box = useRef()
  const seen = useInView(box)
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* clipboard blocked */ }
  }
  const send = (e) => {
    e.preventDefault()
    if (!form.message.trim()) { setStatus({ code: 422, text: 'Unprocessable Entity · message is required' }); return }
    setStatus({ code: 201, text: 'Created · opening your mail client' })
    const subject = encodeURIComponent(`Hello from ${form.name || 'your portfolio'}`)
    const bodyText = encodeURIComponent(`${form.message}\n\n— ${form.name}${form.email ? ` (${form.email})` : ''}`)
    setTimeout(() => { window.location.href = `mailto:${profile.email}?subject=${subject}&body=${bodyText}` }, 600)
  }
  const payload = JSON.stringify({ name: form.name || null, email: form.email || null, message: form.message || null, to: 'aman' }, null, 2)
  return (
    <section className="section" id="contact">
      <motion.div className="section-head" {...reveal}>
        <span className="mono kicker">POST /v1/contact</span>
        <h2>Got a system that needs to <span className="serif">scale?</span></h2>
        <p className="section-sub">Open to backend, full-stack and AI-systems roles. I usually reply within a day.</p>
      </motion.div>
      <div className="contact-grid">
        <motion.form className="glass contact-form frame" onSubmit={send} {...reveal}>
          <div className="req-line mono"><span className="verb">POST</span> /v1/contact <span className="muted">HTTP/1.1</span></div>
          <div className="row2">
            <label>name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label>
            <label>email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" /></label>
          </div>
          <label>message<textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="What are you building?" /></label>
          <pre className="payload mono" aria-label="Request body preview">{payload}</pre>
          <div className="send-row">
            <button className="btn btn--primary" type="submit">Send request →</button>
            {status && <span className={`status mono ${status.code < 300 ? 'ok' : 'err'}`}>{status.code} {status.text}</span>}
          </div>
          <div className="contact-links mono">
            <button type="button" onClick={copy}>{copied ? '✔ copied to clipboard' : `✉ ${profile.email}`}</button>
            <a href={`tel:${profile.phone}`}>☏ {profile.phone}</a>
            <a href={profile.github} target="_blank" rel="noreferrer">github/aman-tiwari18 ↗</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">linkedin/amantiwari18 ↗</a>
          </div>
        </motion.form>
        <div className="globe" ref={box}>
          {seen && <Suspense fallback={null}><Globe /></Suspense>}
          <span className="globe-tag mono"><span className="dot" /> {profile.location} · IST (UTC+5:30)</span>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="footer mono">
      <span>© {new Date().getFullYear()} Aman Tiwari · built with React Three Fiber, GSAP & Lenis</span>
      <button onClick={() => scrollTo(0)}>↑ back to top</button>
    </footer>
  )
}
