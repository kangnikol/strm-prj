import { useState, useEffect } from 'react'
import { tmdbFetch, normalise, isReleased } from './useTMDB'

export function useSearch(query) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  // Infinite Scroll States
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Initial Fetch & Debouncing logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setLoading(false)
      setHasMore(false)
      setPage(1)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        setPage(1)
        const res = await tmdbFetch('/search/multi', `&query=${encodeURIComponent(query)}&page=1`)
        const valid = (res.results || [])
          .filter(i => i.media_type === 'movie' || i.media_type === 'tv')
          .map(i => normalise(i))
          .filter(isReleased)
          
        setResults(valid)
        setHasMore(res.page < res.total_pages && res.page < 5) // Limits infinite search scroll to ~5 pages for performance
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
    
    setLoading(true)
    const nextPage = page + 1
    
    try {
      const res = await tmdbFetch('/search/multi', `&query=${encodeURIComponent(query)}&page=${nextPage}`)
      const newItems = (res.results || [])
        .filter(i => i.media_type === 'movie' || i.media_type === 'tv')
        .map(i => normalise(i))
        .filter(isReleased)

      // Filter duplicates just in case
      setResults(prev => {
        const seenIds = new Set(prev.map(i => i.id))
        return [...prev, ...newItems.filter(i => !seenIds.has(i.id))]
      })

      setPage(nextPage)
      setHasMore(res.page < res.total_pages && res.page < 5)
    } catch (err) {
      console.error("[useSearch fetchMore] Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return { results, loading, hasMore, fetchMoreSearch }
}
