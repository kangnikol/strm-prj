import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
const SectionRow = React.memo(({ title, items, onPlay, t }) => {
  const scrollRef = useRef(null)
  
  if (!items || items.length === 0) return null

  // Restrict to max 10 items as requested
  const displayItems = items.slice(0, 10)

  // Fluid responsive scroll handler
  const handleScroll = (dir) => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 220 * 2 : window.innerWidth * 0.8
      scrollRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section className="mb-12 last:mb-0 relative group">
      <div className="flex items-center gap-4 mb-6 px-4 md:px-6">
        <KineticText 
          text={title} 
          type="clip" 
          as="h3" 
          className="text-lg font-black text-ctp-text tracking-tight uppercase" 
        />
        <div className="h-px flex-1 bg-ctp-surface opacity-50" />
      </div>

      <div className="relative">
        <button 
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-full flex items-center justify-center bg-gradient-to-r from-ctp-base to-transparent cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
        >
          <div className="w-8 h-8 rounded-full bg-ctp-crust/80 backdrop-blur-md flex items-center justify-center text-ctp-text border border-ctp-surface0 hover:bg-ctp-surface0 hover:text-ctp-accent transition-colors">
            <ChevronLeft size={20} />
          </div>
        </button>

        <div 
          ref={scrollRef}
          className="flex flex-nowrap gap-4 overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth px-4 md:px-6"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {displayItems.map((item, i) => (
            <div 
              key={`${item.id}-${i}`} 
              className="flex-shrink-0 w-[calc(50vw-24px)] md:w-[220px] md:min-w-[220px]"
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
          <div className="flex-shrink-0 w-2 h-full" />
        </div>

        <button 
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-full flex items-center justify-center bg-gradient-to-l from-ctp-base to-transparent cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
        >
          <div className="w-8 h-8 rounded-full bg-ctp-crust/80 backdrop-blur-md flex items-center justify-center text-ctp-text border border-ctp-surface0 hover:bg-ctp-surface0 hover:text-ctp-accent transition-colors">
            <ChevronRight size={20} />
          </div>
        </button>
      </div>
    </section>
  )
})

export default SectionRow
