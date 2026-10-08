import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { profile, experience, caseStudies, skills } from '../data'
import { scrollTo } from '../scroll'

const HELP = [
  'whoami          who is this guy',
  'ls projects     list projects',
  'cat experience  release notes, condensed',
  'skills          the stack',
  'open <github|linkedin|resume>',
  'goto <section>  about · experience · systems · stack · work · contact',
  'contact         how to reach me',
  'sudo hire aman  try it',
  'clear',
]

function run(raw) {
  const cmd = raw.trim()
  const [c, ...args] = cmd.split(/\s+/)
  switch (c) {
    case '': return []
    case 'help': return HELP
    case 'whoami': return [`${profile.name} · ${profile.role} @ ${profile.org}`, profile.tagline]
    case 'ls': return caseStudies.map((p) => `${p.title.padEnd(34)} ${p.stack.slice(0, 6).join(', ')}`)
    case 'cat': return experience.flatMap((e) => [`${e.version} ${e.role} @ ${e.company} (${e.period})`, ...e.changes.slice(0, 2).map((x) => `   ${x.type}(${x.scope}): ${x.text.slice(0, 90)}…`)])
    case 'skills': return Object.entries(skills).map(([k, v]) => `${k.padEnd(14)} ${v.join(' · ')}`)
    case 'contact': return [`email     ${profile.email}`, `phone     ${profile.phone}`, `github    ${profile.github}`, `linkedin  ${profile.linkedin}`]
    case 'open': {
      const url = { github: profile.github, linkedin: profile.linkedin, resume: profile.resume }[args[0]]
      if (!url) return ['usage: open <github|linkedin|resume>']
      window.open(url, '_blank', 'noopener')
      return [`opening ${args[0]}…`]
    }
    case 'goto': {
      if (!document.getElementById(args[0] || '')) return ['usage: goto <about|experience|systems|stack|work|contact>']
      scrollTo(`#${args[0]}`)
      return [`→ #${args[0]}`, '__close__']
    }
    case 'sudo':
      if (args.join(' ') === 'hire aman') return ['[sudo] password for recruiter: ********', '✔ permission granted. Opening mail client…', '__hire__']
      return ['nice try.']
    case 'rm': return ['rm: refusing to delete production. been there.']
    case 'exit': return ['__close__']
    default: return [`command not found: ${c}. type 'help'`]
  }
}

export default function Terminal() {
  const [open, setOpen] = useState(false)
  const [lines, setLines] = useState([{ t: 'out', v: "aman-os v3.0.0 · type 'help' to begin" }])
  const [input, setInput] = useState('')
  const [hist, setHist] = useState([])
  const [hi, setHi] = useState(-1)
  const body = useRef(), field = useRef()

  useEffect(() => {
    const key = (e) => {
      const typing = /INPUT|TEXTAREA/.test(e.target.tagName) && !e.target.closest('.term')
      if ((e.key === '`' || e.key === '~') && !typing) { e.preventDefault(); setOpen((o) => !o) }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])
  useEffect(() => { if (open) setTimeout(() => field.current?.focus(), 50) }, [open])
  useEffect(() => { body.current && (body.current.scrollTop = body.current.scrollHeight) }, [lines])

  const submit = (e) => {
    e.preventDefault()
    if (input.trim() === 'clear') { setLines([]); setInput(''); return }
    const out = run(input)
    if (out.includes('__close__')) setTimeout(() => setOpen(false), 400)
    if (out.includes('__hire__')) setTimeout(() => { window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent("Let's work together")}` }, 900)
    setLines((l) => [...l, { t: 'in', v: input }, ...out.filter((x) => !x.startsWith('__')).map((v) => ({ t: 'out', v }))])
    if (input.trim()) setHist((h) => [input, ...h])
    setHi(-1); setInput('')
  }
  const onKey = (e) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); const n = Math.min(hi + 1, hist.length - 1); if (n >= 0) { setHi(n); setInput(hist[n]) } }
    if (e.key === 'ArrowDown') { e.preventDefault(); const n = hi - 1; setHi(n); setInput(n >= 0 ? hist[n] : '') }
  }

  return (
    <>
      <button className="term-fab mono" onClick={() => setOpen(true)} aria-label="Open terminal">
        <span>&gt;_</span><em className="term-fab-hint">press ~</em>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="term-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} data-lenis-prevent>
            <motion.div className="term" initial={{ y: 40, scale: 0.96, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ type: 'spring', damping: 24, stiffness: 260 }} onClick={(e) => e.stopPropagation()}>
              <div className="term-head mono"><span className="tl" /><span className="tl" /><span className="tl" /><b>aman@cdis-iitk: ~</b><button onClick={() => setOpen(false)}>esc</button></div>
              <div className="term-body mono" ref={body} onClick={() => field.current?.focus()}>
                {lines.map((l, i) => <div key={i} className={l.t}>{l.t === 'in' ? <><b>aman@cdis</b>:<i>~</i>$ {l.v}</> : l.v}</div>)}
                <form onSubmit={submit} className="in">
                  <b>aman@cdis</b>:<i>~</i>$&nbsp;
                  <input ref={field} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} spellCheck={false} autoComplete="off" aria-label="Terminal input" />
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
