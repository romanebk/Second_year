import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null
let tickerCallback: ((time: number) => void) | null = null

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// View Transitions re-run the init functions on every navigation: without this
// cleanup each page-load stacks a new Lenis instance, ticker callback and set
// of ScrollTriggers on top of the previous ones.
export function destroyAnimations() {
  ScrollTrigger.getAll().forEach((st) => st.kill())
  if (tickerCallback) {
    gsap.ticker.remove(tickerCallback)
    tickerCallback = null
  }
  if (lenis) {
    lenis.destroy()
    lenis = null
  }
}

export function initSmoothScroll() {
  if (prefersReducedMotion()) return null

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  })

  lenis.on('scroll', ScrollTrigger.update)

  tickerCallback = (time: number) => {
    lenis?.raf(time * 1000)
  }
  gsap.ticker.add(tickerCallback)

  gsap.ticker.lagSmoothing(0)

  return lenis
}

export function initRevealAnimations() {
  const reveals = document.querySelectorAll('.reveal')

  if (prefersReducedMotion()) {
    gsap.set(reveals, { opacity: 1, y: 0 })
    return
  }

  reveals.forEach((el) => {
    const delay = parseFloat(getComputedStyle(el).getPropertyValue('--reveal-delay')) || 0

    gsap.fromTo(
      el,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    )
  })
}

export function initFloatingElements() {
  if (prefersReducedMotion()) return

  const floats = document.querySelectorAll('.float')

  floats.forEach((el) => {
    const distance = parseFloat(el.getAttribute('data-float-distance') || '10')
    const duration = parseFloat(el.getAttribute('data-float-duration') || '3')
    const delay = parseFloat(el.getAttribute('data-float-delay') || '0')

    gsap.to(el, {
      y: -distance,
      duration,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay,
    })
  })
}

export function initHeroParallax() {
  if (prefersReducedMotion()) return

  const hero = document.querySelector('.hero-parallax')
  if (!hero) return

  gsap.to(hero, {
    y: 40,
    opacity: 0.6,
    scale: 0.98,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
  })
}

export function initAnimations() {
  initRevealAnimations()
  initFloatingElements()
  initHeroParallax()
}
