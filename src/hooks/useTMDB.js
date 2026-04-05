import { useState, useEffect } from 'react'
import { mockTrending, resolveImg, getTitle, getYear } from '../data/mockData'

const BASE = '/api'

/** Normalise a TMDB item so components always get the same shape */
/** Fisher-Yates Shuffle */
function shuffle(array) {
  let currentIndex = array.length
  while (currentIndex !== 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
    ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }
  return array
}

/** Normalise a TMDB item so components always get the same shape */
export function normalise(item, forceCategory = null) {
  const genres = item.genre_ids || []
  const origin = item.origin_country || []
  const isTV  = item.media_type === 'tv' || !!item.first_air_date

  // Determine Category
  let category = forceCategory || item.category
  
  if (!category) {
    const isAnimation = genres.includes(16)
    const isJapanese  = origin.includes('JP') || item.original_language === 'ja'

    if (isAnimation && isJapanese) {
      category = 'anime'
    } else if (isTV || genres.includes(18)) {
      const lang = item.original_language
      if (lang === 'ko')      category = 'kdrama'
      else if (lang === 'ja') category = 'jdrama'
      else if (['zh', 'cn'].includes(lang)) category = 'cdrama'
      else                    category = 'series'
    } else {
      category = 'movie'
    }
  }

  // Determine Country (Fallback based on origin or language)
  let country = 'us'
  if (origin.length > 0) {
    country = origin[0].toLowerCase()
  } else {
    const lang = item.original_language
    if (lang === 'id') country = 'id'
    else if (lang === 'ko') country = 'kr'
    else if (lang === 'ja') country = 'jp'
  }

  return {
    id:           item.id,
    mediaType:    item.media_type || (isTV ? 'tv' : 'movie'),
    title:        getTitle(item),
    overview:     item.overview || '',
    posterUrl:    resolveImg(item, 'poster'),
    backdropUrl:  resolveImg(item, 'backdrop', 'w1280'),
    rating:       item.vote_average ? item.vote_average.toFixed(1) : '—',
    year:         getYear(item),
    category,
    country,
    adult:        item.adult || false,
  }
}

/** Filter out adult-flagged items */
export const isNotAdult = (item) => !item.adult

export const CURRENT_YEAR = new Date().getFullYear()
export const isReleased = (item) => {
  const y = parseInt(item.year, 10)
  return isNaN(y) || y <= CURRENT_YEAR
}

export async function tmdbFetch(path, params = '', showAdult = false) {
  const connector = path.includes('?') ? '&' : '?'
  const adultParam = showAdult ? '&include_adult=true' : '&include_adult=false'
  const res = await fetch(`${BASE}${path}${connector}language=en-US${adultParam}${params}`)
  if (!res.ok) throw new Error(`TMDB ${res.status}`)
  return res.json()
}

/**
 * useTMDB
 * Dynamically fetches content from TMDB with Infinite Scroll support.
 * Manages paginated state for each category independently, including editorial sections.
 */
export function useTMDB(auth, showAdult = false) {
  const initialState = { library: [], top: [], trending: [], recent: [], popular: [] }
  const [itemsMap, setItemsMap] = useState({
    all:    { ...initialState },
    anime:  { ...initialState },
    kdrama: { ...initialState },
    jdrama: { ...initialState },
    cdrama: { ...initialState },
    movie:  { ...initialState },
    series: { ...initialState },
    favorites: { ...initialState },
    watchlist: { ...initialState },
  })
  
  const [pagesMap,  setPagesMap ] = useState({ all: 0, anime: 0, kdrama: 0, jdrama: 0, cdrama: 0, movie: 0, series: 0, favorites: 0, watchlist: 0 })
  const [loading,   setLoading  ] = useState(false)
  const [error,     setError    ] = useState(null)
  const [usingMock, setUsingMock] = useState(false)

  // Helper to reset a category's data
  const resetCategory = (cat) => {
    setItemsMap(prev => ({ ...prev, [cat]: { ...initialState } }))
    setPagesMap(prev => ({ ...prev, [cat]: 0 }))
  }

  const fetchMore = async (cat = 'all', countryCode = 'all', _showAdult = showAdult) => {
    if (loading) return
    
    // Limit to 100 items per category as requested to prevent infinite loading
    const currentCount = itemsMap[cat]?.library?.length || 0
    if (currentCount >= 100) return

    setLoading(true)
    setError(null)

    const isFirstLoad = pagesMap[cat] === 0
    const nextPage    = pagesMap[cat] + 1
    const results     = { library: [], top: [], trending: [], recent: [], popular: [] }
    const countryParam = countryCode !== 'all' ? `&with_origin_country=${countryCode.toUpperCase()}` : ''

    try {
      const baseParams = `&page=${nextPage}&sort_by=popularity.desc${countryParam}`
      let filters = ''
      let force   = cat === 'all' ? null : cat
      
      // Personal User Libraries Interception
      if (cat === 'favorites' || cat === 'watchlist') {
        if (!auth?.sessionId || !auth?.account?.id) {
          setError("Session required. Please log in.")
          setLoading(false)
          return
        }
        
        const pathCat = cat === 'favorites' ? 'favorite' : 'watchlist'
        const mPath = `/account/${auth.account.id}/${pathCat}/movies`
        const tPath = `/account/${auth.account.id}/${pathCat}/tv`
        const authParams = `&session_id=${auth.sessionId}`
        
        const [m, t] = await Promise.all([
          tmdbFetch(mPath, `&sort_by=created_at.desc&page=${nextPage}${authParams}`, _showAdult),
          tmdbFetch(tPath, `&sort_by=created_at.desc&page=${nextPage}${authParams}`, _showAdult)
        ])
        
        results.library = shuffle([...(m.results || []), ...(t.results || [])])
          .map(i => normalise(i))
          .filter(isReleased)
          .filter((item) => _showAdult || !item.adult)
        
        // Skip discovery parallel fetch
      } else {
        if (cat === 'anime') {
          filters = '&with_original_language=ja&with_genres=16'
        } else if (cat === 'kdrama') {
          filters = '&with_original_language=ko'
        } else if (cat === 'jdrama') {
          filters = '&with_original_language=ja&without_genres=16'
        } else if (cat === 'cdrama') {
          filters = '&with_original_language=zh|cn'
        }

        // Parallel fetching for different sections on first load
        if (isFirstLoad) {
          // Build the query endpoints. 
          // For 'all' category, filters will just be empty string, performing global discoveries.
          const [libM, libT, topM, topT, recM, recT, popM, popT, trendAll] = await Promise.all([
            tmdbFetch('/discover/movie', `${filters}&sort_by=popularity.desc&page=1${countryParam}`, _showAdult),
            tmdbFetch('/discover/tv',    `${filters}&sort_by=popularity.desc&page=1${countryParam}`, _showAdult),
            tmdbFetch('/discover/movie', `${filters}&sort_by=vote_average.desc&vote_count.gte=50&page=1${countryParam}`, _showAdult),
            tmdbFetch('/discover/tv',    `${filters}&sort_by=vote_average.desc&vote_count.gte=50&page=1${countryParam}`, _showAdult),
            tmdbFetch('/discover/movie', `${filters}&sort_by=primary_release_date.desc&page=1${countryParam}`, _showAdult),
            tmdbFetch('/discover/tv',    `${filters}&sort_by=first_air_date.desc&page=1${countryParam}`, _showAdult),
            tmdbFetch('/discover/movie', `${filters}&sort_by=revenue.desc&page=1${countryParam}`, _showAdult),
            tmdbFetch('/discover/tv',    `${filters}&sort_by=popularity.desc&page=2${countryParam}`, _showAdult),
            tmdbFetch('/trending/all/week', `&page=1`, _showAdult)
          ])

          const adultFilter = (item) => _showAdult || !item.adult

          results.library  = shuffle([...(libM.results || []), ...(libT.results || [])]).map(i => normalise(i, force)).filter(isReleased).filter(adultFilter)
          results.top      = shuffle([...(topM.results || []), ...(topT.results || [])]).map(i => normalise(i, force)).filter(isReleased).filter(adultFilter).slice(0, 10)
          results.recent   = shuffle([...(recM.results || []), ...(recT.results || [])]).map(i => normalise(i, force)).filter(isReleased).filter(adultFilter).slice(0, 10)
          results.popular  = shuffle([...(popM.results || []), ...(popT.results || [])]).map(i => normalise(i, force)).filter(isReleased).filter(adultFilter).slice(0, 10)
          
          // Local filter for trending row (ensures relevant content for the tab)
          const targetLangs = cat === 'cdrama' ? ['zh', 'cn'] : [cat === 'kdrama' ? 'ko' : 'ja']
          results.trending = (trendAll.results || [])
            .map(i => normalise(i))
            .filter(isReleased)
            .filter(adultFilter)
            .filter(i => {
              if (cat === 'all') return true
              if (cat === 'anime') return i.category === 'anime'
              if (cat === 'jdrama') return i.category === 'jdrama'
              return targetLangs.includes(i.original_language) || i.category === cat
            })
            .slice(0, 10)
        } else {
          // Just fetch more for library
          const [m, t] = await Promise.all([
            tmdbFetch('/discover/movie', `${filters}${baseParams}`, _showAdult),
            tmdbFetch('/discover/tv',    `${filters}${baseParams}`, _showAdult)
          ])
          results.library = shuffle([...(m.results || []), ...(t.results || [])])
            .map(i => normalise(i, force))
            .filter(isReleased)
            .filter((item) => _showAdult || !item.adult)
        }
      }

      setItemsMap(prev => {
        const current = prev[cat]
        const seenIds = new Set(current.library.map(i => i.id))
        const uniqueLibrary = [...current.library, ...results.library.filter(i => !seenIds.has(i.id))]

        return {
          ...prev,
          [cat]: {
            library:  uniqueLibrary,
            top:      isFirstLoad ? results.top      : current.top,
            trending: isFirstLoad ? results.trending : current.trending,
            recent:   isFirstLoad ? results.recent   : current.recent,
            popular:  isFirstLoad ? results.popular  : current.popular,
          }
        }
      })
      
      setPagesMap(prev => ({ ...prev, [cat]: nextPage }))
    } catch (err) {
      console.warn(`[useTMDB] Failed to load ${cat} page ${nextPage}:`, err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // If backend is down or not proxying properly, it will fall back via Error Boundary or mock implementation
    // For now, always fetch 'all' on mount since TMDB is completely reliant on proxy
    fetchMore('all', 'all')
  }, [])

  return { itemsMap, pagesMap, loading, error, usingMock, fetchMore, resetCategory }
}
