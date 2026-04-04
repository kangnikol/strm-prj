import React, { useEffect, useRef } from 'react'

/**
 * InfiniteScroll
 * A minimalist sentinel component that triggers onVisible when scrolled into view.
 */
export default function InfiniteScroll({ onVisible, loading, hasMore = true }) {
  const sentinelRef = useRef(null)

  useEffect(() => {
    if (!hasMore || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onVisible()
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    )

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current)
    }

    return () => observer.disconnect()
  }, [onVisible, loading, hasMore])

  return (
    <div ref={sentinelRef} className="w-full py-12 flex justify-center items-center">
      {loading && (
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-8 h-8 rounded-full border-t-2 border-ctp-blue animate-spin" />
          <span className="text-xs font-bold tracking-widest uppercase opacity-40">Loading More</span>
        </div>
      )}
      {!hasMore && !loading && (
        <span className="text-xs font-bold tracking-widest uppercase opacity-20">End of Library</span>
      )}
    </div>
  )
}
