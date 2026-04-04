import { useState, useEffect } from 'react'

const BASE = '/api'

export function useAuth() {
  const [sessionId, setSessionId] = useState(localStorage.getItem('tmdb_session_id'))
  const [account, setAccount] = useState(JSON.parse(localStorage.getItem('tmdb_account')) || null)
  const [loading, setLoading] = useState(true)

  // Validate session and fetch account data
  useEffect(() => {
    const initAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const requestToken = urlParams.get('request_token')
        const approved = urlParams.get('approved')

        let currentSession = sessionId

        // 1. If returning from TMDB approval, create session
        if (requestToken && approved === 'true') {
          const res = await fetch(`${BASE}/authentication/session/new`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request_token: requestToken })
          })

          if (res.ok) {
            const data = await res.json()
            if (data.success) {
              currentSession = data.session_id
              setSessionId(currentSession)
              localStorage.setItem('tmdb_session_id', currentSession)
              
              // Clean up the URL
              window.history.replaceState({}, document.title, window.location.pathname)
            }
          }
        }

        // 2. If we have a session, fetch Account details
        if (currentSession && !account) {
          const accRes = await fetch(`${BASE}/account?session_id=${currentSession}`)
          if (accRes.ok) {
            const accData = await accRes.json()
            setAccount(accData)
            localStorage.setItem('tmdb_account', JSON.stringify(accData))
          } else {
            // Invalid session
            logout()
          }
        }
      } catch (err) {
        console.error('Auth initialization failed:', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, []) // run once on mount

  const login = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/authentication/token/new`)
      const data = await res.json()
      if (data.success) {
        const token = data.request_token
        const redirectUrl = encodeURIComponent(window.location.origin + window.location.pathname)
        window.location.href = `https://www.themoviedb.org/authenticate/${token}?redirect_to=${redirectUrl}`
      }
    } catch (err) {
      console.error('Login failed:', err)
      setLoading(false)
    }
  }

  const logout = () => {
    setSessionId(null)
    setAccount(null)
    localStorage.removeItem('tmdb_session_id')
    localStorage.removeItem('tmdb_account')
    
    // Optional: Delete session on TMDB server
    // fetch(`${BASE}/authentication/session?api_key=${KEY}`, { method: 'DELETE', body: JSON.stringify({ session_id: sessionId }) })
  }

  return { sessionId, account, loading, login, logout }
}
