import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, X, ChevronDown, Globe, Palette, MapPin, Code } from 'lucide-react'

const SPRING = { type: 'spring', damping: 20, stiffness: 100 }

/* ── Logo Animation ──────────────────────────────────────────────────── */
function StrmLogo({ onClick }) {
  return (
    <button
      onClick={onClick}
      id="navbar-logo"
      className="flex-shrink-0 select-none mr-2 align-center justify-center cursor-pointer"
      aria-label="strm home"
    >
      <motion.span
        className="logo-text text-xl"
        style={{ fontWeight: 800, letterSpacing: '-0.04em', fontFamily: "'Inter', sans-serif" }}
        data-text="strm"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.1 }}
      >
        strm
      </motion.span>
    </button>
  )
}

/* ── Dropdown Component ──────────────────────────────────────────────── */
function Dropdown({ icon: Icon, label, options, value, onChange, id }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <motion.button
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-bold tracking-widest uppercase text-ctp-overlay1 hover:text-ctp-text hover:bg-ctp-surface0 transition-colors duration-200"
        whileTap={{ scale: 0.95 }}
      >
        <Icon size={12} strokeWidth={1.5} />
        {label && <span className="hidden lg:inline">{label}</span>}
        <ChevronDown size={10} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ ...SPRING, duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-ctp-mantle/95 backdrop-blur-md border border-ctp-surface rounded shadow-2xl z-50 overflow-hidden"
          >
            <div className="py-1 max-h-64 overflow-y-auto no-scrollbar">
              {options.map((opt) => {
                const isActive = value === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value)
                      setIsOpen(false)
                    }}
                    className={`group relative w-full text-left px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors duration-200 overflow-hidden ${
                      isActive ? 'text-[var(--strm-crust)]' : 'text-ctp-overlay1 hover:text-[var(--strm-crust)]'
                    }`}
                  >
                    <div 
                      className={`absolute inset-0 bg-[var(--strm-text)] origin-left transition-transform duration-300 ease-out z-0 ${
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                    <span className="relative z-10 transition-colors duration-200">{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Navbar ──────────────────────────────────────────────────────────── */
export default function Navbar({ 
  t, 
  currentLang, setLang, 
  currentTheme, setTheme,
  currentCategory, setCategory,
  currentCountry, setCountry 
}) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const categories = [
    { label: t.movie, value: 'movie' },
    { label: t.series, value: 'series' },
    { label: t.anime, value: 'anime' },
    { label: t.kdrama, value: 'kdrama' },
    { label: t.jdrama, value: 'jdrama' },
    { label: t.cdrama, value: 'cdrama' },
  ]

  const countries = [
    { label: 'USA', value: 'us' },
    { label: 'Indonesia', value: 'id' },
    { label: 'Korea', value: 'kr' },
    { label: 'Japan', value: 'jp' },
    { label: 'China', value: 'cn' },
    { label: 'Thailand', value: 'th' },
    { label: 'Vietnam', value: 'vn' },
  ]

  const themes = [
    { label: 'Catppuccin', value: 'mocha' },
    { label: 'Rosé Pine', value: 'rose-pine' },
    { label: 'Dracula', value: 'dracula' },
    { label: 'Nord', value: 'nord' },
  ]

  const languages = [
    { label: 'English', value: 'en' },
    { label: 'Indonesian', value: 'id' },
    { label: 'Japanese', value: 'jp' },
    { label: 'Korean', value: 'kr' },
    { label: 'Spanish', value: 'es' },
  ]

  return (
    <motion.header
      id="navbar"
      className="sticky top-0 z-[100] flex items-center gap-2 px-4 h-14 bg-ctp-mantle border-b border-ctp-surface relative"
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...SPRING, delay: 0.05 }}
    >
      {/* Logo */}
      <StrmLogo onClick={() => setCategory('all')} />

      <div className="w-px h-5 bg-ctp-surface flex-shrink-0 mx-1" />

      {/* Nav links — Categories — Scrollable on mobile */}
      <nav className="flex items-center gap-1 overflow-x-auto overflow-y-hidden no-scrollbar py-2" aria-label="Categories">
        {categories.map(({ label, value }) => {
          const isActive = currentCategory === value;
          return (
            <motion.button
              key={value}
              id={`nav-${value}`}
              onClick={() => setCategory(value)}
              className={`group relative px-3 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase transition-colors duration-200 overflow-hidden ${
                isActive ? 'text-[var(--strm-crust)]' : 'text-ctp-overlay1 hover:text-[var(--strm-crust)]'
              }`}
              whileTap={{ scale: 0.92 }}
            >
              {/* Highlight Background Effect */}
              <div 
                className={`absolute inset-0 bg-[var(--strm-text)] origin-left transition-transform duration-300 ease-out z-0 ${
                  isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
              <span className="relative z-10 transition-colors duration-200">{label}</span>
            </motion.button>
          )
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1 min-w-[20px]" />

      {/* Country Dropdown */}
      <Dropdown 
        id="country-selector"
        icon={MapPin} 
        label={t.country} 
        options={countries} 
        value={currentCountry} 
        onChange={setCountry} 
      />

      {/* Search */}
      <motion.div
        className={`search-field relative flex items-center gap-2 px-3 h-8 transition-all duration-300 hidden md:flex ${
          focused ? 'w-48' : 'w-32'
        }`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING, delay: 0.2 }}
      >
        <Search size={12} strokeWidth={1.5} className={focused ? 'text-ctp-accent' : 'text-ctp-overlay1'} />
        <input
          ref={inputRef}
          id="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={t.search}
          className="flex-1 min-w-0 bg-transparent text-[10px] font-bold tracking-widest uppercase text-ctp-text placeholder:text-ctp-overlay0 focus:outline-none"
        />
      </motion.div>

      {/* Action Selectors (Theme/Lang) */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <Dropdown 
          id="lang-selector"
          icon={Globe} 
          options={languages} 
          value={currentLang} 
          onChange={setLang} 
        />
        
        <Dropdown 
          id="theme-selector"
          icon={Palette} 
          options={themes} 
          value={currentTheme} 
          onChange={setTheme} 
        />

        <div className="w-px h-5 bg-ctp-surface mx-1" />

        <motion.a
          href="https://www.vidking.net"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-bold tracking-widest uppercase text-ctp-overlay1 hover:text-ctp-text hover:bg-ctp-surface0 transition-colors duration-200"
          whileTap={{ scale: 0.95 }}
        >
          <Code size={12} strokeWidth={1.5} />
          <span className="hidden lg:inline">API</span>
        </motion.a>

        {/* <div className="w-px h-5 bg-ctp-surface mx-1" />

        <motion.button
          id="notifications-btn"
          aria-label="Notifications"
          className="relative p-2 rounded text-ctp-overlay1 hover:text-ctp-text hover:bg-ctp-surface transition-colors duration-150"
          whileTap={{ scale: 0.9 }}
        >
          <Bell size={14} strokeWidth={1.5} />
          <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-ctp-accent" />
        </motion.button>

        <button
          id="user-avatar-btn"
          className="w-7 h-7 rounded-full ml-1 text-ctp-crust text-[10px] font-bold flex items-center justify-center transition-all duration-200"
          style={{ background: 'linear-gradient(135deg, var(--strm-accent), var(--strm-secondary))' }}
        >
          U
        </button> */}
      </div>
    </motion.header>
  )
}
