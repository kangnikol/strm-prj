import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Home,
  TrendingUp,
  Rss,
  BookOpen,
  Film,
  Tv,
  Music,
  Clapperboard,
} from 'lucide-react'

const PRIMARY = [
  { id: 'home',          label: 'Home',    icon: Home        },
  { id: 'trending',      label: 'Trend',   icon: TrendingUp  },
  { id: 'subscriptions', label: 'Feed',    icon: Rss         },
  { id: 'library',       label: 'Library', icon: BookOpen    },
]

const CATEGORIES = [
  { id: 'films',  label: 'Films',  icon: Film        },
  { id: 'series', label: 'Series', icon: Tv          },
  { id: 'docs',   label: 'Docs',   icon: Clapperboard },
  { id: 'music',  label: 'Music',  icon: Music       },
]

export default function Sidebar({ activeNav, onNavChange }) {
  const [activeId, setActiveId] = useState(activeNav || 'home')

  function handleClick(id) {
    setActiveId(id)
    onNavChange?.(id)
  }

  return (
    <aside
      id="sidebar"
      className="flex flex-col items-center flex-shrink-0 bg-ctp-mantle border-r border-ctp-surface0 h-full"
      style={{ width: 64 }}
    >
      {/* ── Primary Icons ─────────────────────────────────────── */}
      <nav className="flex flex-col items-center gap-1 pt-3 w-full" aria-label="Main navigation">
        {PRIMARY.map(({ id, label, icon: Icon }) => {
          const isActive = activeId === id
          return (
            <motion.button
              key={id}
              id={`nav-${id}`}
              onClick={() => handleClick(id)}
              className={`sidebar-icon-btn ${isActive ? 'active' : ''}`}
              whileHover={{ backgroundColor: 'rgba(137,180,250,0.06)' }}
              whileTap={{ scale: 0.9 }}
              title={label}
            >
              <Icon
                size={18}
                strokeWidth={1.5}
                className={`transition-colors duration-200 ${
                  isActive ? 'text-ctp-blue' : 'text-ctp-overlay1'
                }`}
              />
              <span className={`sidebar-vert-label ${isActive ? '!text-ctp-blue' : ''}`}>
                {label}
              </span>
            </motion.button>
          )
        })}
      </nav>

      {/* ── Thin Rule ─────────────────────────────────────────── */}
      <div className="sidebar-divider mt-3 mb-3" />

      {/* ── Category Icons ────────────────────────────────────── */}
      <nav className="flex flex-col items-center gap-1 w-full" aria-label="Categories">
        {CATEGORIES.map(({ id, label, icon: Icon }) => {
          const isActive = activeId === id
          return (
            <motion.button
              key={id}
              id={`cat-nav-${id}`}
              onClick={() => handleClick(id)}
              className={`sidebar-icon-btn ${isActive ? 'active' : ''}`}
              whileHover={{ backgroundColor: 'rgba(137,180,250,0.06)' }}
              whileTap={{ scale: 0.9 }}
              title={label}
            >
              <Icon
                size={16}
                strokeWidth={1.5}
                className={`transition-colors duration-200 ${
                  isActive ? 'text-ctp-blue' : 'text-ctp-overlay1'
                }`}
              />
              <span className={`sidebar-vert-label ${isActive ? '!text-ctp-blue' : ''}`}>
                {label}
              </span>
            </motion.button>
          )
        })}
      </nav>

      {/* ── Bottom Push ───────────────────────────────────────── */}
      <div className="mt-auto pb-4">
        <div
          className="w-4 h-4 rounded-full"
          style={{ background: 'linear-gradient(135deg, #89b4fa, #cba6f7)' }}
          title="strm"
        />
      </div>
    </aside>
  )
}
