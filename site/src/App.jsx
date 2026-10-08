import { useEffect, useState, lazy, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import Loader from './components/Loader'
import { Nav, Hero, About, Experience, Stack, Contact, Footer } from './components/Sections'
import CaseStudies from './components/CaseStudies'
import Systems from './components/Systems'
import Terminal from './components/Terminal'
import { initScroll, ScrollTrigger } from './scroll'

const Scene = lazy(() => import('./three/Scene'))

function Cursor() {
  useEffect(() => {
    const el = document.querySelector('.cursor-glow')
    const move = (e) => el && (el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`)
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])
  return <div className="cursor-glow" />
}

export default function App() {
  const [loading, setLoading] = useState(true)
  useEffect(() => { initScroll() }, [])
  useEffect(() => {
    document.documentElement.style.overflow = loading ? 'hidden' : ''
    if (!loading) setTimeout(() => ScrollTrigger.refresh(), 100)
  }, [loading])

  return (
    <>
      <Suspense fallback={null}><Scene /></Suspense>
      <div className="vignette" />
      <div className="grain" />
      <Cursor />
      <AnimatePresence>{loading && <Loader key="loader" onDone={() => setLoading(false)} />}</AnimatePresence>
      {!loading && (
        <>
          <Nav />
          <main>
            <Hero />
            <About />
            <Experience />
            <Systems />
            <Stack />
            <CaseStudies />
            <Contact />
          </main>
          <Footer />
          <Terminal />
        </>
      )}
    </>
  )
}
