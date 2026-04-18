import { useState, useEffect } from 'react'
import { tmdbFetch, normalise, isReleased } from './useTMDB'

/** Detect IMDB ID pattern: tt followed by digits */
const IMDB_RE = /^tt\d+$/i
/** Detect standalone 4-digit year (1900–2099) */
const YEAR_RE = /^\d{4}$/

/**
 * useSearch — Enhanced multi-search hook.
 *
 * Supports:
 *  - Standard title search (default)
 *  - IMDB ID lookup  (e.g. "tt1375666")
 *  - Year discover   (e.g. "2024")
 *  - Cast / Director search — when multi-search returns a person,
 *    we fetch their combined credits so users find content by actor or director name.
 */
export function useSearch(query) {
  const [results, setResults] = useState([])
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(false)

  // Infinite Scroll States
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [searchType, setSearchType] = useState('multi') // 'multi' | 'imdb' | 'year'

  // Initial Fetch & Debouncing logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setSimilar([])
      setLoading(false)
      setHasMore(false)
      setPage(1)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        setPage(1)
        const trimmed = query.trim()
        let valid = []

        // ─── IMDB ID ──────────────────────────────────────────────
        if (IMDB_RE.test(trimmed)) {
          setSearchType('imdb')
          const res = await tmdbFetch(`/find/${trimmed}`, `&external_source=imdb_id`)
          const all = [
            ...(res.movie_results || []).map(i => ({ ...i, media_type: 'movie' })),
            ...(res.tv_results   || []).map(i => ({ ...i, media_type: 'tv' })),
          ]
          valid = all.map(i => normalise(i)).filter(isReleased)
          setHasMore(false) // IMDB find has no pagination

        // ─── Year Discover ────────────────────────────────────────
        } else if (YEAR_RE.test(trimmed)) {
          const year = parseInt(trimmed, 10)
          if (year >= 1900 && year <= 2099) {
            setSearchType('year')
            const [movies, tvs] = await Promise.all([
              tmdbFetch('/discover/movie', `&primary_release_year=${year}&sort_by=popularity.desc&page=1`),
              tmdbFetch('/discover/tv',    `&first_air_date_year=${year}&sort_by=popularity.desc&page=1`),
            ])
            const movieItems = (movies.results || []).map(i => normalise({ ...i, media_type: 'movie' }))
            const tvItems    = (tvs.results    || []).map(i => normalise({ ...i, media_type: 'tv' }))
            // Interleave movies and TV
            valid = [...movieItems, ...tvItems].filter(isReleased)
            setHasMore(valid.length >= 10)
          } else {
            // Fallback to multi search if year out-of-range
            setSearchType('multi')
            const res = await tmdbFetch('/search/multi', `&query=${encodeURIComponent(trimmed)}&page=1`)
            valid = (res.results || [])
              .filter(i => i.media_type === 'movie' || i.media_type === 'tv')
              .map(i => normalise(i))
              .filter(isReleased)
            setHasMore(res.page < res.total_pages && res.page < 5)
          }

        // ─── Multi Search + Person + Company Enrichment ─────────────
        } else {
          setSearchType('multi')
          const [res, companyRes] = await Promise.all([
            tmdbFetch('/search/multi', `&query=${encodeURIComponent(trimmed)}&page=1`),
            tmdbFetch('/search/company', `&query=${encodeURIComponent(trimmed)}&page=1`),
          ])
          const allResults = res.results || []

          // Standard movie/tv results
          const movieTvItems = allResults
            .filter(i => i.media_type === 'movie' || i.media_type === 'tv')
            .map(i => normalise(i))
            .filter(isReleased)

          // Person results — fetch their combined credits (cast + director)
          const personResults = allResults.filter(i => i.media_type === 'person')
          let personCredits = []

          if (personResults.length > 0) {
            const topPersons = personResults.slice(0, 2)
            const creditFetches = topPersons.map(p =>
              tmdbFetch(`/person/${p.id}/combined_credits`)
                .catch(() => ({ cast: [], crew: [] }))
            )
            const creditResults = await Promise.all(creditFetches)

            for (const credits of creditResults) {
              const castItems = (credits.cast || [])
                .filter(i => i.media_type === 'movie' || i.media_type === 'tv')
              const directorItems = (credits.crew || [])
                .filter(c => c.job === 'Director' && (c.media_type === 'movie' || c.media_type === 'tv'))
              const combined = [...castItems, ...directorItems]
                .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
                .slice(0, 20)
                .map(i => normalise(i))
                .filter(isReleased)
              personCredits.push(...combined)
            }
          }

          // Company/Studio results — fetch catalog for top match
          const companies = companyRes.results || []
          let companyItems = []

          if (companies.length > 0) {
            const topCompany = companies[0]
            try {
              const [cMovies, cTv] = await Promise.all([
                tmdbFetch('/discover/movie', `&with_companies=${topCompany.id}&sort_by=popularity.desc&page=1`),
                tmdbFetch('/discover/tv',    `&with_companies=${topCompany.id}&sort_by=popularity.desc&page=1`),
              ])
              const cMovieItems = (cMovies.results || []).map(i => normalise({ ...i, media_type: 'movie' }))
              const cTvItems    = (cTv.results    || []).map(i => normalise({ ...i, media_type: 'tv' }))
              companyItems = [...cMovieItems, ...cTvItems]
                .filter(isReleased)
                .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            } catch {
              // ignore company fetch errors
            }
          }

          // Determine primary match type for ordering
          const isPrimaryPersonSearch = personResults.length > 0 &&
            personResults[0].popularity > (allResults.find(i => i.media_type !== 'person')?.popularity || 0)
          const isPrimaryCompanySearch = companies.length > 0 &&
            movieTvItems.length <= 3 && personCredits.length === 0

          let ordered
          if (isPrimaryCompanySearch) {
            ordered = [...companyItems, ...movieTvItems, ...personCredits]
          } else if (isPrimaryPersonSearch) {
            ordered = [...personCredits, ...movieTvItems, ...companyItems]
          } else {
            ordered = [...movieTvItems, ...personCredits, ...companyItems]
          }

          const seenIds = new Set()
          valid = ordered.filter(item => {
            if (seenIds.has(item.id)) return false
            seenIds.add(item.id)
            return true
          })

          setHasMore(res.page < res.total_pages && res.page < 5)
        }

        setResults(valid)

        // ─── Fetch Similar from top result ────────────────────────
        if (valid.length > 0) {
          const top = valid[0]
          const simType = top.mediaType === 'tv' ? 'tv' : 'movie'
          try {
            const simRes = await tmdbFetch(`/${simType}/${top.id}/similar`, '&page=1')
            const simItems = (simRes.results || [])
              .map(i => normalise({ ...i, media_type: simType }))
              .filter(isReleased)
            // Exclude items already in results
            const resultIds = new Set(valid.map(i => i.id))
            setSimilar(simItems.filter(i => !resultIds.has(i.id)).slice(0, 12))
          } catch {
            setSimilar([])
          }
        } else {
          // No results — try recommendations from trending as fallback
          try {
            const trendRes = await tmdbFetch('/trending/all/week', '&page=1')
            const trendItems = (trendRes.results || [])
              .map(i => normalise(i))
              .filter(isReleased)
              .slice(0, 12)
            setSimilar(trendItems)
          } catch {
            setSimilar([])
          }
        }
      } catch (err) {
        console.error("[useSearch] Error:", err)
      } finally {
        setLoading(false)
      }
    }, 400) // 400ms debounce

    return () => clearTimeout(timer)
  }, [query])

  // Fetch More functionality for infinite scroll of search results
  const fetchMoreSearch = async () => {
    if (!query.trim() || loading || !hasMore) return
    if (searchType === 'imdb') return // No pagination for IMDB find

    setLoading(true)
    const nextPage = page + 1
    const trimmed = query.trim()

    try {
      let newItems = []

      if (searchType === 'year') {
        const year = parseInt(trimmed, 10)
        const [movies, tvs] = await Promise.all([
          tmdbFetch('/discover/movie', `&primary_release_year=${year}&sort_by=popularity.desc&page=${nextPage}`),
          tmdbFetch('/discover/tv',    `&first_air_date_year=${year}&sort_by=popularity.desc&page=${nextPage}`),
        ])
        const movieItems = (movies.results || []).map(i => normalise({ ...i, media_type: 'movie' }))
        const tvItems    = (tvs.results    || []).map(i => normalise({ ...i, media_type: 'tv' }))
        newItems = [...movieItems, ...tvItems].filter(isReleased)
        setHasMore(newItems.length >= 10 && nextPage < 5)
      } else {
        const res = await tmdbFetch('/search/multi', `&query=${encodeURIComponent(trimmed)}&page=${nextPage}`)
        newItems = (res.results || [])
          .filter(i => i.media_type === 'movie' || i.media_type === 'tv')
          .map(i => normalise(i))
          .filter(isReleased)
        setHasMore(res.page < res.total_pages && res.page < 5)
      }

      // Filter duplicates
      setResults(prev => {
        const seenIds = new Set(prev.map(i => i.id))
        return [...prev, ...newItems.filter(i => !seenIds.has(i.id))]
      })

      setPage(nextPage)
    } catch (err) {
      console.error("[useSearch fetchMore] Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return { results, similar, loading, hasMore, fetchMoreSearch }
}
