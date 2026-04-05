import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Play, Star } from 'lucide-react'

const SPRING = { type: 'spring', damping: 26, stiffness: 320 }

const cardVariants = {
  hidden:  { y: 40, opacity: 0 },
  visible: (i) => ({
    y: 0,
    opacity: 1,
    transition: { ...SPRING, delay: i * 0.06 },
  }),
}

const VideoCard = React.memo(({ item, index = 0, featured = false, onClick, t }) => {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-5% 0px' })

  return (
    <motion.article
      ref={ref}
      id={`card-${item.id}`}
      className="group relative flex flex-col gap-2 cursor-pointer"
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      onClick={() => onClick?.(item)}
    >
      <div
        className={`thumb-grid w-full overflow-hidden ${
          featured ? 'aspect-[16/10]' : 'aspect-[2/3]'
        }`}
      >
        <img
          src={featured ? item.backdropUrl : item.posterUrl}
          alt={item.title}
          loading="lazy"
        />

        <div className="thumb-overlay" />

        <div className="play-btn-center">
          <motion.div
            className="w-10 h-10 rounded-full flex items-center justify-center bg-ctp-crust/80 backdrop-blur-sm border border-ctp-accent/50"
            whileHover={{ scale: 1.12, boxShadow: '0 0 24px rgba(137,180,250,0.4)' }}
            whileTap={{ scale: 0.92 }}
          >
            <Play size={16} strokeWidth={1.5} className="text-ctp-accent ml-0.5" fill="currentColor" />
          </motion.div>
        </div>

        <div className="absolute top-2 left-2 z-10">
          <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded bg-ctp-crust/70 backdrop-blur-sm text-ctp-accent border border-ctp-accent/25">
            {t[item.category] || t.movie}
          </span>
        </div>

        <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1">
          <Star size={9} className="text-ctp-yellow" fill="currentColor" />
          <span className="text-[10px] font-semibold text-ctp-text tabular-nums">
            {item.rating}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-0.5 px-0.5">
        <h3 className="text-sm font-semibold leading-tight line-clamp-1 text-ctp-text group-hover:text-ctp-accent transition-colors duration-200 uppercase tracking-tight">
          {item.title}
        </h3>
        <p className="text-[10px] font-bold tracking-widest uppercase text-ctp-overlay tabular-nums">
          {item.year} &middot; {t[item.category] || t.movie}
        </p>
        {featured && item.overview && (
          <p className="text-xs text-ctp-subtext0 line-clamp-2 mt-1 leading-relaxed">
            {item.overview}
          </p>
        )}
      </div>
    </motion.article>
  )
})

export default VideoCard
