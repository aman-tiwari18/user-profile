import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Shared, mutable scroll state read every frame by the WebGL scene (no React re-renders).
export const scrollState = { progress: 0, velocity: 0 }

let lenis
export function initScroll() {
  if (lenis) return lenis
  lenis = new Lenis({ duration: 1.2, smoothWheel: true })
  lenis.on('scroll', (e) => {
    scrollState.progress = e.progress || 0
    scrollState.velocity = e.velocity || 0
    ScrollTrigger.update()
  })
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function scrollTo(target) {
  if (lenis) lenis.scrollTo(target, { offset: -40, duration: 1.6 })
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' })
  else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
}

export { gsap, ScrollTrigger }
