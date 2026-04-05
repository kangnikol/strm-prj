import React, { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Clock } from 'lucide-react'

const SPRING = { type: 'spring', damping: 20, stiffness: 120 }

/** Format elapsed seconds to "Xh Ym" or "Xm" */
function formatElapsed(secs) {
  if (!secs || secs < 60) return null
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if (h > 0) return `${h}h ${m}m watched`
  return `${m}m watched`
}

/** Estimate progress 0-1. Movies ~120min, TV episodes ~45min */
function estimateProgress(entry) {
  const maxSecs = entry.mediaType === 'tv' ? 45 * 60 : 120 * 60
  return Math.min(entry.elapsedSeconds / maxSecs, 1)
}

function HistoryCard({ entry, onClick, onRemove }) {
  const progress = estimateProgress(entry)
  const elapsed  = formatElapsed(entry.elapsedSeconds)
  const timeAgo  = (() => {
    const diff = Date.now() - entry.watchedAt
    const m = Math.floor(diff / 60000)
    const h = Math.floor(m / 60)
    const d = Math.floor(h / 24)
    if (d > 0)  return `${d}d ago`
    if (h > 0)  return `${h}h ago`
    if (m > 0)  return `${m}m ago`
    return 'Just now'
  })()

  return (
    <motion.div
      className="relative flex-shrink-0 w-[calc(50vw-24px)] md:w-[220px] group cursor-pointer"
      whileHover={{ y: -2 }}
      transition={SPRING}
    >
      {/* Remove button */}
      <button
        onClick={e => { e.stopPropagation(); onRemove(entry.id, entry.season, entry.episode) }}
        className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-ctp-crust/80 backdrop-blur-md flex items-center justify-center text-ctp-overlay hover:text-ctp-red hover:bg-ctp-crust transition-colors opacity-0 group-hover:opacity-100"
      >
        <X size={10} strokeWidth={2.5} />
      </button>

      <div
        className="thumb-grid aspect-video rounded overflow-hidden"
        onClick={() => onClick(entry)}
      >
        <img
          src={entry.backdropUrl || entry.posterUrl}
          alt={entry.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="thumb-overlay" />

        {/* Progress bar */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-ctp-surface/60">
            <div
              className="h-full bg-ctp-accent transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}

        {/* Time ago badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-ctp-crust/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-bold text-ctp-overlay tracking-widest uppercase">
          <Clock size={8} />
          {timeAgo}
        </div>
      </div>

      <div className="mt-2 px-0.5">
        <p className="text-[11px] font-black text-ctp-text truncate uppercase tracking-tight leading-tight">
          {entry.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {entry.season && (
            <span className="text-[9px] font-bold text-ctp-accent uppercase tracking-widest">
              S{entry.season} E{entry.episode}
            </span>
          )}
          {elapsed && (
            <span className="text-[9px] text-ctp-overlay uppercase tracking-widest">{elapsed}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function ContinueWatching({ history, onPlay, onRemove, t }) {
  const scrollRef = useRef(null)

  if (!history || history.length === 0) return null

  const handleScroll = (dir) => {
    if (scrollRef.current) {
      const amount = window.innerWidth > 768 ? 220 * 2 : window.innerWidth * 0.8
      scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
    }
  }

  return (
    <motion.section
      className="mb-10 last:mb-0 relative group"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING}
    >
      <div className="flex items-center gap-4 mb-4 px-4 md:px-6">
        <h3 className="text-lg font-black text-ctp-text tracking-tight uppercase">
          Continue Watching
        </h3>
        <div className="h-px flex-1 bg-ctp-surface opacity-50" />
      </div>

      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-full flex items-center justify-center bg-gradient-to-r from-ctp-base to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-ctp-crust/80 backdrop-blur-md flex items-center justify-center text-ctp-text border border-ctp-surface0 hover:bg-ctp-surface0 hover:text-ctp-accent transition-colors">
            <ChevronLeft size={20} />
          </div>
        </button>

        <div
          ref={scrollRef}
          className="flex flex-nowrap gap-4 overflow-x-auto no-scrollbar scroll-smooth px-4 md:px-6"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {history.map((entry, i) => (
            <div key={`${entry.id}-${entry.season}-${entry.episode}-${i}`} style={{ scrollSnapAlign: 'start' }}>
              <HistoryCard
                entry={entry}
                onClick={onPlay}
                onRemove={onRemove}
              />
            </div>
          ))}
          <div className="flex-shrink-0 w-2" />
        </div>

        {/* Right arrow */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-full flex items-center justify-center bg-gradient-to-l from-ctp-base to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-ctp-crust/80 backdrop-blur-md flex items-center justify-center text-ctp-text border border-ctp-surface0 hover:bg-ctp-surface0 hover:text-ctp-accent transition-colors">
            <ChevronRight size={20} />
          </div>
        </button>
      </div>
    </motion.section>
  )
}
