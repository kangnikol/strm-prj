import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Routes, Route, useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom'

import Navbar      from './components/Navbar'
import VideoCard   from './components/VideoCard'
import Player      from './components/Player'
import KineticText from './components/KineticText'
import Marquee     from './components/Marquee'
import SectionRow   from './components/SectionRow'
import InfiniteScroll from './components/InfiniteScroll'
import SearchBar       from './components/SearchBar'
import LoginModal      from './components/LoginModal'
import ContinueWatching from './components/ContinueWatching'
import { useTMDB, fetchSingleItem } from './hooks/useTMDB'
import { useSearch }   from './hooks/useSearch'
import { useAuth }     from './hooks/useAuth'
import { useHistory }  from './hooks/useHistory'
import { translations } from './data/translations'
import './index.css'

const SPRING = { type: 'spring', damping: 26, stiffness: 320 }

/* ═══════════════════════════════════════════════════════════════════════
   Hero Section — Asymmetric Swiss layout
   ═══════════════════════════════════════════════════════════════════════ */
function Hero({ featured, onPlay, t }) {
  if (!featured) return null

  return (
    <motion.section
      id="hero"
      className="relative w-full grid grid-cols-12 gap-4 mb-0 overflow-hidden"
      initial={{ opacity: 0, height: 0, minHeight: 0 }}
      animate={{ opacity: 1, height: 'auto', minHeight: 460, transition: { duration: 0.4 } }}
      exit={{ opacity: 0, height: 0, minHeight: 0, transition: { duration: 0.3 } }}
    >
      {/* Dim overlay behind text exclusively on mobile to guarantee readability over full-bleed images */}
      <div className="absolute inset-0 z-[5] bg-ctp-base/30 lg:hidden pointer-events-none" />

      <div className="col-span-12 lg:col-span-7 flex flex-col justify-end p-6 lg:p-10 z-10 relative">
        <motion.div
          className="flex items-center gap-3 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1,  x: 0  }}
          transition={{ ...SPRING, delay: 0.1 }}
        >
          <span className="text-[9px] font-black tracking-[0.4em] uppercase text-ctp-accent">
            {featured.mediaType === 'tv' ? t.series : t.movie}
          </span>
          <span className="w-8 h-px bg-ctp-accent opacity-60" />
          <span className="text-[9px] tracking-widest text-ctp-overlay uppercase">
            {featured.year}
          </span>
        </motion.div>

        <div className="overflow-hidden mb-5" style={{ lineHeight: 0.9 }}>
          <KineticText
            text={featured.title}
            type="word"
            as="h1"
            className="block text-4xl md:text-5xl lg:text-7xl font-black text-ctp-text leading-none tracking-tight"
          />
        </div>

        <motion.p
          className="text-sm text-ctp-subtext0 max-w-sm leading-relaxed mb-7 line-clamp-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1,  y: 0 }}
          transition={{ ...SPRING, delay: 0.4 }}
        >
          {featured.overview}
        </motion.p>

        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1,  y: 0 }}
          transition={{ ...SPRING, delay: 0.5 }}
        >
          <motion.button
            id="hero-watch-btn"
            onClick={() => onPlay(featured)}
            className="group flex items-center gap-2 px-7 py-3 rounded-sm bg-ctp-accent text-ctp-crust text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 hover:gap-4 hover:pr-9 overflow-hidden relative"
            whileTap={{ scale: 0.96 }}
          >
            <span className="relative z-10">{t.watch_now}</span>
            <ArrowRight size={14} strokeWidth={2.5} className="relative z-10 transition-transform group-hover:translate-x-1" />
            <motion.div 
               className="absolute inset-0 bg-ctp-text opacity-0 group-hover:opacity-10 transition-opacity"
            />
          </motion.button>

          <div className="flex items-center gap-2 text-[10px] text-ctp-overlay font-bold uppercase tracking-widest">
            <span className="text-ctp-yellow">★ {featured.rating}</span>
            <span className="text-ctp-surface1">·</span>
            <span>TMDB</span>
          </div>
        </motion.div>
      </div>

      <div className="absolute inset-0 z-0 lg:relative lg:flex lg:col-span-5 items-stretch">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${featured.backdropUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="hidden lg:block absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, var(--strm-bg) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top, var(--strm-bg) 0%, transparent 60%)' }} />
      </div>
    </motion.section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   Home View Component (Categories + Search)
   ═══════════════════════════════════════════════════════════════════════ */
function MainContent({ 
  category, country, t, loading, fetchMore, itemsMap, pagesMap, usingMock,
  searchQuery, setSearchQuery, searchResults, searchLoading, searchHasMore, fetchMoreSearch,
  history, removeHistory, auth
}) {
  const navigate = useNavigate()
  
  const currentCategoryData = itemsMap[category] || { library: [], top: [], trending: [], recent: [], popular: [] }
  const { library: filteredLibrary, top: filteredTop, trending: filteredTrending, recent: filteredRecent, popular: filteredPopular } = currentCategoryData

  const isPersonalLibrary = category === 'favorites' || category === 'watchlist'
  const showHero = !isPersonalLibrary && !searchQuery && filteredLibrary.length > 0
  
  const featured = showHero ? filteredLibrary[0] : null
  const gridItems = showHero ? filteredLibrary.slice(1) : filteredLibrary

  const groupedPersonalItems = useMemo(() => {
    if (!isPersonalLibrary) return {}
    const groups = {}
    gridItems.forEach(item => {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    })
    return groups
  }, [isPersonalLibrary, gridItems])

  const handlePlay = (item) => navigate(`/watch/${item.mediaType}/${item.id}`, { state: { item } })

  return (
    <motion.main
      key="home"
      id="main-content"
      className="flex-1 overflow-y-auto no-scrollbar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {loading && filteredLibrary.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-ctp-overlay py-32">
          <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-ctp-accent" />
          <p className="text-[10px] tracking-widest uppercase font-bold">{t.loading}</p>
        </div>
      ) : (
        <>
          <AnimatePresence initial={false}>
            {showHero && <Hero key="hero" featured={featured} onPlay={handlePlay} t={t} />}
          </AnimatePresence>

          {!isPersonalLibrary && (
            <SearchBar query={searchQuery} setQuery={setSearchQuery} loading={searchLoading} t={t} />
          )}

          {!searchQuery ? (
            <>
              {category === 'all' && (
                <div className="border-y border-ctp-surface py-2.5 my-8 overflow-hidden">
                  <Marquee text={`${t.trending} on strm`} separator=" — " speed={55} />
                </div>
              )}

              <section className="py-10 pb-24 px-10">
                {category === 'all' && (
                  <ContinueWatching
                    history={history}
                    onPlay={handlePlay}
                    onRemove={removeHistory}
                    t={t}
                  />
                )}

                <div className="flex flex-col gap-2 mb-16">
                  <SectionRow title={`Top Rated ${category === 'all' ? 'Titles' : t[category] || category}`} items={filteredTop} onPlay={handlePlay} t={t} />
                  <SectionRow title={`Trending Right Now`} items={filteredTrending} onPlay={handlePlay} t={t} />
                  <SectionRow title={`Recently Added`} items={filteredRecent} onPlay={handlePlay} t={t} />
                  <SectionRow title={`Popular Picks`} items={filteredPopular} onPlay={handlePlay} t={t} />
                </div>

                {!isPersonalLibrary ? (
                  <div>
                    <div className="px-6 flex items-center justify-between mb-8 border-b border-ctp-surface pb-4">
                      <h3 className="text-[10px] font-black tracking-[0.4em] uppercase text-ctp-overlay">Discover</h3>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-ctp-overlay">{filteredLibrary.length} {t.titles}</span>
                    </div>
                    <div className="grid grid-cols-12 gap-x-4 gap-y-10 px-1 md:px-6">
                      {gridItems.map((item, i) => {
                        const isLarge = category === 'all' && i < 2
                        return (
                          <div key={`${item.id}-${i}`} className={isLarge ? "col-span-12 lg:col-span-6" : "col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2"}>
                            <VideoCard item={item} index={i} featured={isLarge} onClick={handlePlay} t={t} />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-16">
                    {Object.keys(groupedPersonalItems).length === 0 && !loading && (
                      <div className="flex flex-col items-center justify-center p-12 text-ctp-overlay">
                        <span className="text-[10px] tracking-widest uppercase font-bold">Looks empty here!</span>
                      </div>
                    )}
                    {Object.entries(groupedPersonalItems).map(([catKey, items]) => (
                      <div key={catKey}>
                        <div className="px-6 flex items-center justify-between mb-8 border-b border-ctp-surface pb-4">
                          <h3 className="text-[10px] font-black tracking-[0.4em] uppercase text-ctp-text">{t[catKey] || catKey}</h3>
                          <span className="text-[10px] font-bold tracking-widest uppercase text-ctp-overlay">{items.length} {t.titles}</span>
                        </div>
                        <div className="grid grid-cols-12 gap-x-4 gap-y-10 px-6">
                          {items.map((item, i) => (
                            <div key={`${item.id}-${i}`} className="col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2">
                              <VideoCard item={item} index={i} featured={false} onClick={handlePlay} t={t} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {!isPersonalLibrary && (
                <InfiniteScroll 
                  onVisible={() => fetchMore(category, country)} 
                  loading={loading} 
                  hasMore={!usingMock && filteredLibrary.length < 100} 
                />
              )}
            </>
          ) : (
            <section className="py-2 pb-24 px-10">
              <div className="px-6 flex items-center justify-between mb-8 border-b border-ctp-surface pb-4">
                <h3 className="text-[10px] font-black tracking-[0.4em] uppercase text-ctp-accent">Results for "{searchQuery}"</h3>
              </div>
              {searchResults.length === 0 && !searchLoading ? (
                <div className="flex flex-col items-center justify-center p-12 text-ctp-overlay">
                  <span className="text-[10px] tracking-widest uppercase font-bold">No results found</span>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-x-4 gap-y-10 px-6">
                  {searchResults.map((item, i) => (
                    <div key={`${item.id}-${i}`} className="col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2">
                      <VideoCard item={item} index={i} featured={false} onClick={handlePlay} t={t} />
                    </div>
                  ))}
                </div>
              )}
              <InfiniteScroll onVisible={fetchMoreSearch} loading={searchLoading} hasMore={searchHasMore} />
            </section>
          )}
        </>
      )}
    </motion.main>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   Watch Page Wrapper (Handles Direct Linking)
   ═══════════════════════════════════════════════════════════════════════ */
function WatchPage({ t, auth, resetCategory, addHistory }) {
  const { mediaType, id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const [item, setItem] = useState(state?.item || null)
  const [loading, setLoading] = useState(!item)

  useEffect(() => {
    if (!item && id && mediaType) {
      setLoading(true)
      fetchSingleItem(id, mediaType)
        .then(data => {
          if (data) setItem(data)
          else navigate('/')
        })
        .finally(() => setLoading(false))
    }
  }, [id, mediaType, item])

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-ctp-overlay bg-ctp-crust">
      <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-ctp-accent" />
      <p className="text-[10px] tracking-widest uppercase font-bold">{t.loading}</p>
    </div>
  )
  if (!item) return null

  return (
    <Player
      key="player"
      item={item}
      onBack={() => navigate(-1)}
      t={t}
      auth={auth}
      resetCategory={resetCategory}
      onHistoryUpdate={(item, elapsed, season, episode) => {
        addHistory(item, { elapsedSeconds: elapsed, season, episode })
      }}
    />
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   App Main Shell
   ═══════════════════════════════════════════════════════════════════════ */
export default function App() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const auth = useAuth()

  // Derive Category from Pathname
  const category = useMemo(() => {
    if (pathname === '/') return 'all'
    if (pathname === '/favorites') return 'favorites'
    if (pathname === '/watchlist') return 'watchlist'
    if (pathname.startsWith('/category/')) return pathname.split('/category/')[1] || 'all'
    return 'all'
  }, [pathname])

  const searchQuery = searchParams.get('q') || ''
  const setSearchQuery = (q) => {
    if (!q) {
      searchParams.delete('q')
      navigate('/')
    } else {
      setSearchParams({ q })
      if (pathname !== '/search') navigate('/search?q=' + q)
    }
  }

  // Settings with Persistence
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('strm-lang')
    if (saved) return saved
    const deviceLang = navigator.language?.slice(0, 2).toLowerCase()
    const supported = ['en', 'id', 'jp', 'kr', 'es']
    return supported.includes(deviceLang) ? deviceLang : 'en'
  })
  const [theme, setTheme] = useState(() => localStorage.getItem('strm-theme') || 'mocha')
  const [showAdult, setShowAdult] = useState(() => localStorage.getItem('strm-adult') === 'true')
  const [country, setCountry] = useState('all')
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  const { itemsMap, pagesMap, loading, fetchMore, resetCategory, usingMock } = useTMDB(auth, showAdult)
  const { history, addOrUpdate: addHistory, removeEntry: removeHistory } = useHistory()
  const { results: searchResults, loading: searchLoading, hasMore: searchHasMore, fetchMoreSearch } = useSearch(searchQuery)
  const t = translations[lang]

  useEffect(() => { localStorage.setItem('strm-lang', lang) }, [lang])
  useEffect(() => {
    localStorage.setItem('strm-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  useEffect(() => {
    localStorage.setItem('strm-adult', showAdult)
    const allCategories = ['all', 'anime', 'kdrama', 'jdrama', 'cdrama', 'movie', 'series']
    allCategories.forEach(cat => resetCategory(cat))
  }, [showAdult])

  useEffect(() => {
    const allCategories = ['all', 'anime', 'kdrama', 'jdrama', 'cdrama', 'movie', 'series']
    allCategories.forEach(cat => resetCategory(cat))
  }, [country])

  useEffect(() => {
    if (category && pagesMap[category] === 0) fetchMore(category, country)
  }, [category, country, pagesMap])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-ctp-base text-ctp-text">
      <Navbar 
        t={t}
        currentLang={lang} setLang={setLang}
        currentTheme={theme} setTheme={setTheme}
        currentCategory={category} setCategory={(val) => navigate(val === 'all' ? '/' : `/category/${val}`)}
        currentCountry={country} setCountry={setCountry}
        showAdult={showAdult} setShowAdult={setShowAdult}
        auth={auth}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={() => { setIsLoginOpen(false); auth.login() }}
      />

      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <Routes location={useLocation()} key={pathname}>
            <Route path="/" element={
              <MainContent 
                category={category} country={country} t={t} loading={loading} fetchMore={fetchMore} itemsMap={itemsMap} pagesMap={pagesMap} usingMock={usingMock}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchResults={searchResults} searchLoading={searchLoading} searchHasMore={searchHasMore} fetchMoreSearch={fetchMoreSearch}
                history={history} removeHistory={removeHistory} auth={auth}
              />
            } />
            <Route path="/category/:cat" element={
              <MainContent 
                category={category} country={country} t={t} loading={loading} fetchMore={fetchMore} itemsMap={itemsMap} pagesMap={pagesMap} usingMock={usingMock}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchResults={searchResults} searchLoading={searchLoading} searchHasMore={searchHasMore} fetchMoreSearch={fetchMoreSearch}
                history={history} removeHistory={removeHistory} auth={auth}
              />
            } />
            <Route path="/search" element={
              <MainContent 
                category={category} country={country} t={t} loading={loading} fetchMore={fetchMore} itemsMap={itemsMap} pagesMap={pagesMap} usingMock={usingMock}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchResults={searchResults} searchLoading={searchLoading} searchHasMore={searchHasMore} fetchMoreSearch={fetchMoreSearch}
                history={history} removeHistory={removeHistory} auth={auth}
              />
            } />
            <Route path="/favorites" element={
              <MainContent 
                category="favorites" country={country} t={t} loading={loading} fetchMore={fetchMore} itemsMap={itemsMap} pagesMap={pagesMap} usingMock={usingMock}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchResults={searchResults} searchLoading={searchLoading} searchHasMore={searchHasMore} fetchMoreSearch={fetchMoreSearch}
                history={history} removeHistory={removeHistory} auth={auth}
              />
            } />
            <Route path="/watchlist" element={
              <MainContent 
                category="watchlist" country={country} t={t} loading={loading} fetchMore={fetchMore} itemsMap={itemsMap} pagesMap={pagesMap} usingMock={usingMock}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchResults={searchResults} searchLoading={searchLoading} searchHasMore={searchHasMore} fetchMoreSearch={fetchMoreSearch}
                history={history} removeHistory={removeHistory} auth={auth}
              />
            } />
            <Route path="/watch/:mediaType/:id" element={<WatchPage t={t} auth={auth} resetCategory={resetCategory} addHistory={addHistory} />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  )
}
