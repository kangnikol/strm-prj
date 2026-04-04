import React from 'react'
import { motion } from 'framer-motion'
import VideoCard from './VideoCard'
import KineticText from './KineticText'

/**
 * SectionRow
 * A minimalist horizontal-scrolling row for featured content.
 * 
 * @param {string}   title   - Row title
 * @param {Array}    items   - List of normalized items (up to 10)
 * @param {Function} onPlay  - Click handler
 * @param {Object}   t       - Translation dictionary
 */
export default function SectionRow({ title, items, onPlay, t }) {
  if (!items || items.length === 0) return null

  // Restrict to max 10 items as requested
  const displayItems = items.slice(0, 10)

  return (
    <section className="mb-12 last:mb-0">
      <div className="flex items-center gap-4 mb-6 px-6">
        <KineticText 
          text={title} 
          type="clip" 
          as="h3" 
          className="text-lg font-black text-ctp-text tracking-tight uppercase" 
        />
        <div className="h-px flex-1 bg-ctp-surface opacity-50" />
      </div>

      <div className="relative group">
        <div 
          className="flex flex-nowrap gap-4 overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {displayItems.map((item, i) => (
            <div 
              key={`${item.id}-${i}`} 
              className="flex-shrink-0 min-w-[180px] w-[180px] md:w-[220px] md:min-w-[220px]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <VideoCard 
                item={item} 
                index={i} 
                onClick={onPlay} 
                t={t} 
              />
            </div>
          ))}
          
          {/* Spacer for end of scroll */}
          <div className="flex-shrink-0 w-6 h-full" />
        </div>
      </div>
    </section>
  )
}
