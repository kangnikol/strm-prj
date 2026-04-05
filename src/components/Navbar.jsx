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

/* ── Nav Dropdown (Drama group) ─────────────────────────────────────── */
function NavDropdown({ label, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)
  const isDramaActive = options.some(o => o.value === value)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center gap-1 px-3 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase transition-colors duration-200 overflow-hidden ${
          isDramaActive ? 'text-[var(--strm-crust)]' : 'text-ctp-overlay1 hover:text-[var(--strm-crust)]'
        }`}
        whileTap={{ scale: 0.92 }}
      >
        <div className={`absolute inset-0 bg-[var(--strm-text)] origin-left transition-transform duration-300 ease-out z-0 ${
          isDramaActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`} />
        <span className="relative z-10">{label}</span>
        <ChevronDown size={9} className={`relative z-10 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="absolute left-0 top-full mt-1.5 w-40 bg-ctp-mantle/95 backdrop-blur-md border border-ctp-surface shadow-2xl z-50 overflow-hidden"
          >
            {options.map(opt => {
              const isActive = value === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setIsOpen(false) }}
                  className={`group relative w-full text-left px-4 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors duration-200 overflow-hidden ${
                    isActive ? 'text-[var(--strm-crust)]' : 'text-ctp-overlay1 hover:text-[var(--strm-crust)]'
                  }`}
                >
                  <div className={`absolute inset-0 bg-[var(--strm-text)] origin-left transition-transform duration-300 ease-out z-0 ${
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`} />
                  <span className="relative z-10">{opt.label}</span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Dropdown Component ──────────────────────────────────────────────── */
function Dropdown({ icon: Icon, avatar, label, options, value, onChange, id, forceLabel = false }) {
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
        className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-bold tracking-widest uppercase text-ctp-overlay1 hover:text-ctp-text hover:bg-ctp-surface0 transition-colors duration-200"
        whileTap={{ scale: 0.95 }}
      >
        {Icon && <Icon size={12} strokeWidth={1.5} />}
        {avatar && (
          <div className="w-5 h-5 rounded-full text-ctp-crust text-[10px] font-bold flex items-center justify-center transition-all duration-200 bg-ctp-accent" style={{ background: 'linear-gradient(135deg, var(--strm-accent), var(--strm-secondary))' }}>
            {avatar}
          </div>
        )}
        {label && <span className={forceLabel ? "inline" : "hidden lg:inline"}>{label}</span>}
        <ChevronDown size={10} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ ...SPRING, duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-ctp-mantle/95 backdrop-blur-md border border-ctp-surface shadow-2xl z-50 overflow-hidden"
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
  currentCountry, setCountry,
  auth,
  clearActiveItem,
  onOpenLogin
}) {
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
    { label: 'AMOLED', value: 'amoled' },
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
      <StrmLogo onClick={() => { setCategory('all'); if(clearActiveItem) clearActiveItem(); }} />

      <div className="w-px h-5 bg-ctp-surface flex-shrink-0 mx-1" />

      {/* Mobile Category Dropdown */}
      <div className="md:hidden">
        <Dropdown 
          id="category-selector-mobile"
          label={categories.find(c => c.value === currentCategory)?.label || t.discover || 'Category'}
          options={categories}
          value={currentCategory}
          onChange={(val) => {
            setCategory(val);
            if (clearActiveItem) clearActiveItem();
          }}
          forceLabel={true}
        />
      </div>

      {/* Desktop Category Links */}
      <nav className="hidden md:flex items-center gap-1 py-2" aria-label="Categories">
        {/* Standalone categories: all, movie, series, anime */}
        {categories.filter(c => !['kdrama','jdrama','cdrama'].includes(c.value)).map(({ label, value }) => {
          const isActive = currentCategory === value;
          return (
            <motion.button
              key={value}
              id={`nav-${value}`}
              onClick={() => { setCategory(value); if(clearActiveItem) clearActiveItem(); }}
              className={`group relative px-3 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase transition-colors duration-200 overflow-hidden ${
                isActive ? 'text-[var(--strm-crust)]' : 'text-ctp-overlay1 hover:text-[var(--strm-crust)]'
              }`}
              whileTap={{ scale: 0.92 }}
            >
              <div 
                className={`absolute inset-0 bg-[var(--strm-text)] origin-left transition-transform duration-300 ease-out z-0 ${
                  isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
              <span className="relative z-10 transition-colors duration-200">{label}</span>
            </motion.button>
          )
        })}

        {/* Drama dropdown: kdrama, jdrama, cdrama */}
        <NavDropdown
          label={t.drama || 'Drama'}
          options={[
            { label: t.kdrama, value: 'kdrama' },
            { label: t.jdrama, value: 'jdrama' },
            { label: t.cdrama, value: 'cdrama' },
          ]}
          value={currentCategory}
          onChange={(val) => { setCategory(val); if(clearActiveItem) clearActiveItem(); }}
        />
      </nav>

      {/* Spacer */}
      <div className="flex-1 min-w-[20px]" />

      {/* Country Dropdown — desktop only */}
      <div className="hidden md:block">
        <Dropdown 
          id="country-selector"
          icon={MapPin} 
          label={t.country} 
          options={countries} 
          value={currentCountry} 
          onChange={setCountry} 
        />
      </div>

      {/* Action Selectors — Lang hidden on mobile (follows device), Theme always visible */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <div className="hidden md:flex">
          <Dropdown 
            id="lang-selector"
            icon={Globe} 
            options={languages} 
            value={currentLang} 
            onChange={setLang} 
          />
        </div>
        
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
          className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-bold tracking-widest uppercase text-ctp-overlay1 hover:text-ctp-text hover:bg-ctp-surface0 transition-colors duration-200"
          whileTap={{ scale: 0.95 }}
        >
          <Code size={12} strokeWidth={1.5} />
          <span className="hidden lg:inline">API</span>
        </motion.a>

        <div className="w-px h-5 bg-ctp-surface mx-1" />
      </div>

      {/* User Auth — always visible */}
      <div className="flex items-center flex-shrink-0">
        {auth?.loading ? (
          <div className="w-8 h-8 rounded-full bg-ctp-surface animate-pulse z-100" />
        ) : auth?.account ? (
          <Dropdown 
            id="user-dropdown"
            avatar={auth.account.username ? auth.account.username.charAt(0).toUpperCase() : 'U'}
            options={[
              { label: 'Favorites', value: 'favorites' },
              { label: 'Watchlist', value: 'watchlist' },
              { label: 'Vidking API', value: 'api' },
              { label: 'Log Out', value: 'logout' }
            ]}
            value={currentCategory}
            onChange={(val) => {
              if (val === 'logout') {
                auth.logout()
              } else if (val === 'api') {
                window.open('https://www.vidking.net', '_blank', 'noopener,noreferrer')
              } else {
                setCategory(val);
                if (clearActiveItem) clearActiveItem();
              }
            }}
          />
        ) : (
          null
        )}
      </div>
    </motion.header>
  )
}
