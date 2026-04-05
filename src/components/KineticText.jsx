import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

/* ─── Shared Variants ───────────────────────────────────────────────── */

const SPRING = { type: 'spring', damping: 26, stiffness: 320 }

const charVariants = {
  hidden:  { y: '100%', opacity: 0 },
  visible: (i) => ({
    y: 0,
    opacity: 1,
    transition: { ...SPRING, delay: i * 0.04 },
  }),
}

const clipVariants = {
  hidden:  { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
  visible: {
    clipPath: 'inset(0 0% 0 0)',
    opacity: 1,
    transition: { ...SPRING, duration: 0.7 },
  },
}

const slideVariants = {
  hidden:  { y: 48, opacity: 0 },
  visible: (i) => ({
    y: 0,
    opacity: 1,
    transition: { ...SPRING, delay: i * 0.07 },
  }),
}

/* ─── KineticText ───────────────────────────────────────────────────── */

/**
 * KineticText
 *
 * @param {string}   text        - The text to animate
 * @param {'stagger'|'clip'|'slide'|'word'} type - Animation style
 * @param {string}   [as]        - HTML tag to render (default: 'span')
 * @param {string}   [className] - Tailwind classes
 * @param {number}   [delay]     - Base delay in seconds (for 'clip')
 * @param {boolean}  [once]      - Animate only once (default: true)
 */
export default function KineticText({
  text,
  type     = 'stagger',
  as       = 'span',
  className = '',
  delay     = 0,
  once      = true,
}) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once, margin: '-10% 0px' })

  /* ── Character stagger ──────────────────────────────────────── */
  if (type === 'stagger') {
    const chars = text.split('')
    return (
      <span
        ref={ref}
        className={`inline-flex flex-wrap overflow-hidden ${className}`}
        aria-label={text}
      >
        {chars.map((char, i) => (
          <motion.span
            key={i}
            custom={i}
            variants={charVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="inline-block"
            style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
          >
            {char}
          </motion.span>
        ))}
      </span>
    )
  }

  /* ── Word slide (word-by-word stagger) ──────────────────────── */
  if (type === 'word') {
    const words = text.split(' ')
    const Tag   = motion[as] || motion.span
    return (
      <Tag
        ref={ref}
        className={`inline-flex flex-wrap gap-x-[0.28em] overflow-hidden ${className}`}
        aria-label={text}
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            custom={i}
            variants={slideVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="inline-block"
          >
            {word}
          </motion.span>
        ))}
      </Tag>
    )
  }

  /* ── Clip reveal ────────────────────────────────────────────── */
  if (type === 'clip') {
    const Tag = motion[as] || motion.div
    return (
      <Tag
        ref={ref}
        className={`inline-block ${className}`}
        variants={clipVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        transition={{ ...SPRING, delay }}
      >
        {text}
      </Tag>
    )
  }

  /* ── Slide up (single block) ────────────────────────────────── */
  const Tag = motion[as] || motion.div
  return (
    <Tag
      ref={ref}
      className={`inline-block ${className}`}
      variants={slideVariants}
      custom={0}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {text}
    </Tag>
  )
}
