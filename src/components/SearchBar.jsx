import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2 } from 'lucide-react'

const SPRING = { type: 'spring', damping: 26, stiffness: 320 }

export default function SearchBar({ query, setQuery, loading, t }) {
  const inputRef = useRef(null)

  return (
    <motion.div 
      id="search-bar-container"
      className="w-full px-6 md:px-10 py-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING}
    >
      <div className="relative flex items-center bg-ctp-surface0/50 hover:bg-ctp-surface0 transition-colors border-b border-ctp-surface1 p-4 shadow-sm group">
        <Search 
          size={24} 
          strokeWidth={1.5} 
          className={`mr-4 transition-colors ${query ? 'text-ctp-accent' : 'text-ctp-overlay1 group-hover:text-ctp-text'}`} 
        />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.search || "Search movies, series, anime..."}
          className="flex-1 bg-transparent text-ctp-text text-lg md:text-xl placeholder:text-ctp-overlay0 placeholder:text-sm placeholder:font-bold placeholder:uppercase placeholder:tracking-widest focus:outline-none"
        />

        {loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="ml-4"
          >
            <Loader2 size={20} className="animate-spin text-ctp-accent" />
          </motion.div>
        )}
        
        {query && !loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="ml-4 px-2 py-1 bg-ctp-surface1 rounded text-[10px] font-bold tracking-widest text-ctp-overlay2"
          >
            RESULTS
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
