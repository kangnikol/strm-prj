import { useState, useCallback } from 'react'

const HISTORY_KEY = 'strm-history'
const MAX_HISTORY = 20

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []
  } catch {
    return []
  }
}

function saveHistory(list) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
}

export function useHistory() {
  const [history, setHistory] = useState(loadHistory)

  /** Add/update a play entry. Call when player opens. */
  const addOrUpdate = useCallback((item, extra = {}) => {
    setHistory(prev => {
      const filtered = prev.filter(h => !(h.id === item.id && h.season === extra.season && h.episode === extra.episode))
      const entry = {
        id:            item.id,
        title:         item.title,
        posterUrl:     item.posterUrl,
        backdropUrl:   item.backdropUrl,
        category:      item.category,
        mediaType:     item.mediaType,
        elapsedSeconds: extra.elapsedSeconds ?? 0,
        watchedAt:     Date.now(),
        season:        extra.season  ?? null,
        episode:       extra.episode ?? null,
      }
      const updated = [entry, ...filtered].slice(0, MAX_HISTORY)
      saveHistory(updated)
      return updated
    })
  }, [])

  /** Update elapsed seconds for an existing entry. */
  const updateProgress = useCallback((id, elapsedSeconds, season, episode) => {
    setHistory(prev => {
      const updated = prev.map(h =>
        h.id === id && h.season === (season ?? null) && h.episode === (episode ?? null)
          ? { ...h, elapsedSeconds, watchedAt: Date.now() }
          : h
      )
      saveHistory(updated)
      return updated
    })
  }, [])

  /** Remove a single entry. */
  const removeEntry = useCallback((id, season, episode) => {
    setHistory(prev => {
      const updated = prev.filter(
        h => !(h.id === id && h.season === (season ?? null) && h.episode === (episode ?? null))
      )
      saveHistory(updated)
      return updated
    })
  }, [])

  /** Wipe entire history. */
  const clearHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY)
    setHistory([])
  }, [])

  return { history, addOrUpdate, updateProgress, removeEntry, clearHistory }
}
