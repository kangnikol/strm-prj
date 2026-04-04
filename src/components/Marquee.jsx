import { useRef } from 'react'
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion'

/**
 * Marquee
 * Infinite horizontal scrolling strip using Framer Motion.
 *
 * @param {string}   text      - Repeated marquee text
 * @param {number}   speed     - Pixels per second (default 60)
 * @param {string}   separator - Divider between repeats (default ' — ')
 * @param {string}   className - Wrapper classnames
 */
export default function Marquee({
  text      = 'Now Trending',
  speed     = 60,
  separator = ' — ',
  className = '',
}) {
  const x       = useMotionValue(0)
  const trackRef = useRef(null)

  useAnimationFrame((_, delta) => {
    if (!trackRef.current) return
    const trackW = trackRef.current.scrollWidth / 2   // half = one full set
    let newX = x.get() - (speed * delta) / 1000
    if (Math.abs(newX) >= trackW) newX = 0
    x.set(newX)
  })

  // Build repeated content (duplicate for seamless loop)
  const segment = `${text}${separator}`.repeat(8)
  const content = `${segment}${segment}`

  return (
    <div
      className={`overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      <motion.div
        ref={trackRef}
        className="marquee-track"
        style={{ x }}
      >
        <span className="text-[11px] font-bold tracking-[0.35em] uppercase text-ctp-overlay1">
          {content}
        </span>
      </motion.div>
    </div>
  )
}
