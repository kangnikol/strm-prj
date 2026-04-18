import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Star,
  ChevronDown,
  PlayCircle,
  Loader2,
  Heart,
  Bookmark,
  Maximize2,
  User,
} from "lucide-react"

const SPRING = { type: "spring", damping: 26, stiffness: 320 }
const BASE = "/api"

/**
 * Player — Vidking embed with Swiss editorial metadata layout.
 *
 * @param {Object}   props.item    - Normalised TMDB item
 * @param {Function} props.onBack  - Back navigation handler
 * @param {Object}   props.t       - Translation dictionary
 * @param {Object}   props.auth    - Auth state
 * @param {Function} props.resetCategory - Cache invalidation callback
 */
export default function Player({
  item,
  onBack,
  t,
  auth,
  resetCategory,
  onHistoryUpdate,
}) {
  const isTV = item.mediaType === "tv"

  // TV Selector State
  const [seasons, setSeasons] = useState([])
  const [episodes, setEpisodes] = useState([])
  const [activeSeason, setActiveSeason] = useState(item.season || 1)
  const [activeEpisode, setActiveEpisode] = useState(item.episode || 1)
  const [loadingEpisodes, setLoadingEpisodes] = useState(false)
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false)

  // Cast & Crew
  const [cast, setCast] = useState([])
  const [director, setDirector] = useState(null)

  // Auth Account States (Favorite / Watchlist)
  const [accountState, setAccountState] = useState({
    favorite: false,
    watchlist: false,
  })
  const [marking, setMarking] = useState(false)

  // History tracking
  const elapsedRef = useRef(0) // accumulated seconds
  const intervalRef = useRef(null)

  const dropdownRef = useRef(null)
  const iframeRef = useRef(null)

  // Fullscreen handler — needed on mobile because subtitle panel covers video
  const handleFullscreen = () => {
    const iframe = iframeRef.current
    if (!iframe) return
    const req =
      iframe.requestFullscreen ||
      iframe.webkitRequestFullscreen ||
      iframe.mozRequestFullScreen ||
      iframe.msRequestFullscreen
    if (req) req.call(iframe)
  }

  // History: record entry on mount and tick every 30s
  useEffect(() => {
    if (!onHistoryUpdate) return
    const isHistoryEpisode = !isTV || (item.season === activeSeason && item.episode === activeEpisode)
    const startObjSecs = isHistoryEpisode ? (item.elapsedSeconds || 0) : 0
    
    elapsedRef.current = startObjSecs
    const startTime = Date.now() - (startObjSecs * 1000)

    // Initial record
    onHistoryUpdate(item, startObjSecs, activeSeason, activeEpisode)
    // Tick
    intervalRef.current = setInterval(() => {
      const currentElapsed = Math.round((Date.now() - startTime) / 1000)
      elapsedRef.current = currentElapsed
      onHistoryUpdate(item, currentElapsed, activeSeason, activeEpisode)
    }, 30_000)
    return () => {
      clearInterval(intervalRef.current)
      // Final save on unmount
      const finalElapsed = Math.round((Date.now() - startTime) / 1000)
      onHistoryUpdate(item, finalElapsed, activeSeason, activeEpisode)
    }
  }, [item, activeSeason, activeEpisode, isTV, onHistoryUpdate])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSeasonDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch Cast & Crew
  useEffect(() => {
    const type = isTV ? "tv" : "movie"
    fetch(`${BASE}/${type}/${item.id}/credits?language=en-US`)
      .then((r) => r.json())
      .then((data) => {
        setCast((data.cast || []).slice(0, 12))
        const dir = (data.crew || []).find((c) => c.job === "Director")
        if (dir) setDirector(dir.name)
      })
      .catch(console.error)
  }, [item.id, isTV])

  // Fetch Account States if Logged In
  useEffect(() => {
    if (auth?.sessionId) {
      const type = isTV ? "tv" : "movie"
      fetch(
        `${BASE}/${type}/${item.id}/account_states?session_id=${auth.sessionId}`,
      )
        .then((r) => r.json())
        .then((d) =>
          setAccountState({ favorite: d.favorite, watchlist: d.watchlist }),
        )
        .catch(console.error)
    }
  }, [item.id, auth?.sessionId, isTV])

  // Toggle Favorite / Watchlist
  const toggleMark = async (type) => {
    if (!auth?.sessionId || !auth?.account?.id) {
      alert("Please log in to use this feature.")
      return
    }
    setMarking(true)
    const mediaType = isTV ? "tv" : "movie"
    const isAdding = !accountState[type]

    try {
      const res = await fetch(
        `${BASE}/account/${auth.account.id}/${type}?session_id=${auth.sessionId}`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            media_type: mediaType,
            media_id: item.id,
            [type]: isAdding,
          }),
        },
      )
      if (res.ok) {
        setAccountState((prev) => ({ ...prev, [type]: isAdding }))
        if (resetCategory)
          resetCategory(type === "favorite" ? "favorites" : "watchlist")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setMarking(false)
    }
  }

  // Fetch Seasons
  useEffect(() => {
    if (isTV) {
      fetch(`${BASE}/tv/${item.id}?language=en-US`)
        .then((res) => res.json())
        .then((data) => {
          // Default to non-zero seasons (specials are usually season 0)
          const validSeasons = (data.seasons || []).filter(
            (s) => s.season_number > 0,
          )
          setSeasons(validSeasons.length ? validSeasons : data.seasons || [])
          if (validSeasons.length > 0 && !item.season) {
            setActiveSeason(validSeasons[0].season_number)
          }
        })
        .catch((err) => console.error("Failed to fetch seasons", err))
    }
  }, [item.id, isTV, item.season])

  // Fetch Episodes when an activeSeason is selected
  useEffect(() => {
    if (isTV && activeSeason) {
      setLoadingEpisodes(true)
      fetch(`${BASE}/tv/${item.id}/season/${activeSeason}?language=en-US`)
        .then((res) => res.json())
        .then((data) => {
          setEpisodes(data.episodes || [])
        })
        .catch((err) => console.error("Failed to fetch episodes", err))
        .finally(() => setLoadingEpisodes(false))
    }
  }, [item.id, activeSeason, isTV])

  // Vidking embed URL — dynamically maps TV selections
  const isHistoryEpisode = !isTV || (item.season === activeSeason && item.episode === activeEpisode)
  const startSecs = isHistoryEpisode ? (item.elapsedSeconds || 0) : 0
  const timeParam = startSecs > 0 ? `?progress=${startSecs}` : ''
  
  const vidkingUrl = isTV
    ? `https://www.vidking.net/embed/tv/${item.id}/${activeSeason}/${activeEpisode}${timeParam}`
    : `https://www.vidking.net/embed/movie/${item.id}${timeParam}`

  return (
    <motion.div
      id="player-view"
      className="flex flex-col w-full h-full overflow-y-auto md:overflow-hidden no-scrollbar bg-ctp-crust"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ ...SPRING }}
    >
      {/* ── Back Bar ─────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-6 py-3 border-b border-ctp-surface bg-ctp-mantle z-40 relative">
        <motion.button
          id="player-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 text-ctp-overlay hover:text-ctp-text transition-colors duration-150 text-[10px] font-bold tracking-widest uppercase"
          whileTap={{ x: -4 }}
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          <div className="cursor-pointer">{t.back}</div>
        </motion.button>

        <div className="w-px h-4 bg-ctp-surface" />

        <span className="text-[10px] text-ctp-overlay font-bold uppercase tracking-widest px-2 truncate max-w-xl">
          {item.title} {isTV && `- S${activeSeason} E${activeEpisode}`}
        </span>

        {/* Auth Actions */}
        <div className="flex-1" />
        <motion.button
          onClick={() => toggleMark("favorite")}
          disabled={marking}
          className={`p-1.5 rounded transition-colors ${accountState.favorite ? "text-ctp-red" : "text-ctp-overlay1 hover:text-ctp-text"}`}
          whileTap={{ scale: 0.9 }}
        >
          <Heart
            size={14}
            fill={accountState.favorite ? "currentColor" : "none"}
            strokeWidth={2}
          />
        </motion.button>
        <motion.button
          onClick={() => toggleMark("watchlist")}
          disabled={marking}
          className={`p-1.5 rounded transition-colors ${accountState.watchlist ? "text-ctp-accent" : "text-ctp-overlay1 hover:text-ctp-text"}`}
          whileTap={{ scale: 0.9 }}
        >
          <Bookmark
            size={14}
            fill={accountState.watchlist ? "currentColor" : "none"}
            strokeWidth={2}
          />
        </motion.button>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-0 md:flex-1 md:min-h-0 md:overflow-hidden relative">
        {/* Player Iframe — sticky on mobile, flex on desktop */}
        <motion.div
          className="sticky top-0 z-30 w-full aspect-[16/10] md:aspect-auto md:static md:flex-1 bg-ctp-crust relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <iframe
            ref={iframeRef}
            id="vidking-player"
            src={vidkingUrl}
            title={item.title}
            allowFullScreen
            allow="fullscreen; autoplay; encrypted-media"
            className="w-full h-full border-0"
            style={{ background: "#11111b" }}
          />

          {/* Fullscreen button — mobile only, solves subtitle panel overlap issue */}
          <button
            onClick={handleFullscreen}
            title="Fullscreen (recommended before opening subtitles)"
            className="md:hidden absolute bottom-2 right-2 z-40 flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold tracking-widest uppercase border border-white/10 active:scale-95 transition-transform"
          >
            <Maximize2 size={11} strokeWidth={2} />
            <span>Fullscreen</span>
          </button>
        </motion.div>

        {/* ── Metadata Panel ─────────────────────────────────────────── */}
        <motion.aside
          className="w-full md:w-80 flex-shrink-0 bg-ctp-mantle md:bg-ctp-mantle/95 md:backdrop-blur-xl md:border-l md:border-ctp-surface/50 flex flex-col gap-0 md:gap-6 md:overflow-y-auto no-scrollbar md:absolute md:right-0 md:top-0 md:bottom-0 md:z-50 md:transition-transform md:duration-500 md:ease-[cubic-bezier(0.19,1,0.22,1)] md:translate-x-[calc(100%-16px)] md:hover:translate-x-0 group"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {/* Hover indicator desktop */}
          <div className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-ctp-surface0 rounded-r-md overflow-hidden group-hover:bg-ctp-accent group-hover:w-1 transition-all duration-300 z-50">
            <div className="w-full h-full bg-ctp-overlay/20 animate-pulse" />
          </div>
          {/* Mobile Header Section — Hero backdrop only covers this block */}
          <div className="relative overflow-hidden md:contents">
            {/* Backdrop — mobile only */}
            <div className="md:hidden absolute inset-0 z-0 pointer-events-none">
              <img
                src={item.backdropUrl || item.posterUrl}
                alt=""
                className="w-full h-full object-cover object-top"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, var(--strm-bg) 0%, rgba(17,17,27,0.75) 55%, transparent 100%)",
                }}
              />
            </div>

            {/* Header content above backdrop */}
            <div className="relative z-10 p-6 pb-6 flex flex-col gap-6">
              {/* Title */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className="
                  px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded
                  bg-ctp-surface text-ctp-accent
                "
                  >
                    {t[item.category] || t.movie}
                  </span>
                  <span className="text-[10px] text-ctp-overlay font-bold uppercase tracking-widest opacity-60">
                    {item.year}
                  </span>
                </div>

                <h1 className="text-lg font-black text-ctp-text leading-tight uppercase tracking-tight">
                  {item.title}
                </h1>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 pb-2">
                <div className="flex items-center gap-1">
                  <Star
                    size={13}
                    className="text-ctp-yellow"
                    fill="currentColor"
                  />
                  <span className="text-sm font-bold text-ctp-text tabular-nums">
                    {item.rating}
                  </span>
                </div>
                <span className="text-[9px] font-bold tracking-widest uppercase text-ctp-overlay">
                  /&nbsp;10 · TMDB
                </span>
              </div>

              {/* Swiss rule */}
              <hr className="swiss-rule" />

              {/* Overview */}
              {item.overview && (
                <div>
                  <p className="text-[9px] font-black tracking-widest uppercase text-ctp-overlay mb-3">
                    {t.overview}
                  </p>
                  <p className="text-xs leading-relaxed text-ctp-subtext0">
                    {item.overview}
                  </p>
                </div>
              )}

              {/* Cast & Director */}
              {(cast.length > 0 || director) && (
                <>
                  <hr className="swiss-rule" />
                  <div>
                    {director && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[9px] font-black tracking-widest uppercase text-ctp-overlay">
                          {t.director}
                        </span>
                        <span className="text-[10px] font-bold text-ctp-text">
                          {director}
                        </span>
                      </div>
                    )}
                    {cast.length > 0 && (
                      <>
                        <p className="text-[9px] font-black tracking-widest uppercase text-ctp-overlay mb-3">
                          {t.cast}
                        </p>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                          {cast.map((person) => (
                            <div
                              key={person.id}
                              className="flex-shrink-0 w-14 flex flex-col items-center gap-1"
                              title={`${person.name} as ${person.character || "—"}`}
                            >
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-ctp-surface border border-ctp-surface0">
                                {person.profile_path ? (
                                  <img
                                    src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                    alt={person.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-ctp-overlay">
                                    <User size={14} strokeWidth={1.5} />
                                  </div>
                                )}
                              </div>
                              <p className="text-[8px] font-bold text-ctp-subtext0 text-center leading-tight truncate w-full">
                                {person.name?.split(" ")[0]}
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            {/* end header content */}
          </div>
          {/* end mobile header section */}

          {/* Episode Selector and rest — outside backdrop scope, plain bg */}
          <div className="p-6 flex flex-col gap-6">
            {isTV && seasons.length > 0 && (
              <div className="flex flex-col mt-4">
                <hr className="swiss-rule mb-6" />
                <div className="flex items-center justify-between mb-4 relative z-20">
                  <span className="text-[9px] font-black tracking-widest uppercase text-ctp-overlay">
                    Episodes
                  </span>

                  {/* Season Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setSeasonDropdownOpen(!seasonDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded bg-ctp-surface text-[10px] font-bold uppercase tracking-widest hover:bg-ctp-surface0 transition-colors"
                    >
                      Season {activeSeason}
                      <ChevronDown
                        size={10}
                        strokeWidth={2.5}
                        className={`transition-transform duration-200 ${seasonDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {/* Pop-up Options */}
                    <AnimatePresence>
                      {seasonDropdownOpen && (
                        <motion.div
                          className="absolute right-0 bottom-full mb-2 w-36 bg-ctp-mantle/95 backdrop-blur-xl border border-ctp-surface rounded shadow-2xl overflow-hidden max-h-48 overflow-y-auto no-scrollbar"
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        >
                          {seasons.map((s) => {
                            const isActive = activeSeason === s.season_number
                            return (
                              <button
                                key={s.id}
                                onClick={() => {
                                  setActiveSeason(s.season_number)
                                  setActiveEpisode(1)
                                  setSeasonDropdownOpen(false)
                                }}
                                className={`group relative w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 overflow-hidden ${
                                  isActive
                                    ? "text-[var(--strm-crust)]"
                                    : "text-ctp-overlay hover:text-[var(--strm-crust)]"
                                }`}
                              >
                                <div
                                  className={`absolute inset-0 bg-[var(--strm-text)] origin-left transition-transform duration-300 ease-out z-0 ${
                                    isActive
                                      ? "scale-x-100"
                                      : "scale-x-0 group-hover:scale-x-100"
                                  }`}
                                />
                                <span className="relative z-10 transition-colors duration-200">
                                  Season {s.season_number}
                                </span>
                              </button>
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Episode List */}
                <div className="w-full">
                  {loadingEpisodes ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2
                        size={16}
                        className="animate-spin text-ctp-accent"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 relative">
                      {episodes.map((ep) => {
                        const isPlaying = activeEpisode === ep.episode_number
                        const thumbSource = ep.still_path
                          ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                          : item.backdropUrl
                        return (
                          <button
                            key={ep.id}
                            onClick={() => setActiveEpisode(ep.episode_number)}
                            className={`group flex items-center gap-3 p-2 rounded-md transition-all duration-200 ${
                              isPlaying
                                ? "bg-ctp-surface border border-ctp-surface0"
                                : "hover:bg-ctp-surface/40 border border-transparent"
                            }`}
                          >
                            <div className="relative w-20 h-12 flex-shrink-0 rounded overflow-hidden bg-ctp-crust border border-ctp-surface/50">
                              <img
                                src={thumbSource}
                                alt={ep.name}
                                className={`w-full h-full object-cover transition-transform duration-300 ${isPlaying ? "scale-105" : "group-hover:scale-105 opacity-60 group-hover:opacity-100"}`}
                              />
                              {isPlaying && (
                                <div className="absolute inset-0 bg-ctp-mantle/50 backdrop-blur-sm flex items-center justify-center">
                                  <PlayCircle
                                    size={14}
                                    className="text-ctp-accent drop-shadow-lg"
                                    fill="currentColor"
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-start text-left min-w-0 pr-2">
                              <span
                                className={`text-[10px] font-bold truncate max-w-[140px] ${isPlaying ? "text-ctp-text" : "text-ctp-subtext0 group-hover:text-ctp-text"}`}
                              >
                                {ep.episode_number}. {ep.name}
                              </span>
                              <span className="text-[9px] uppercase tracking-widest text-ctp-overlay mt-0.5">
                                {ep.runtime ? `${ep.runtime}m` : "—"}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* end lower section */}
        </motion.aside>
      </div>
    </motion.div>
  )
}
