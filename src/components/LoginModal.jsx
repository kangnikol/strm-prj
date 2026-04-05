import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Heart, Bookmark, ShieldCheck } from 'lucide-react'

const SPRING = { type: 'spring', damping: 22, stiffness: 180 }

// TMDB logo SVG inline
function TmdbLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 185.04 133.4" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tmdb-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#90cea1" />
          <stop offset="100%" stopColor="#01b4e4" />
        </linearGradient>
      </defs>
      <rect width="185.04" height="133.4" rx="8" fill="#0d253f" />
      <path
        d="M102.72 35.56h16.24l25.56 62.28 25.44-62.28h16l-34.12 77.44h-14.88L102.72 35.56zm-71.36 0h16.48v77.44H31.36V35.56zm22 0h15.44L93.52 73 79.8 88.64 54 35.56zm0 42.12l13.6 20.08-13.6 15.24V77.68z"
        fill="url(#tmdb-grad)"
      />
    </svg>
  )
}

const features = [
  { icon: Heart, label: 'Save Favorites', desc: 'Bookmark titles you love' },
  { icon: Bookmark, label: 'Watchlist', desc: 'Track what to watch next' },
  { icon: Star, label: 'Ratings', desc: 'Rate and discover more' },
]

export default function LoginModal({ isOpen, onClose, onLogin }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-ctp-crust/80 backdrop-blur-2xl" />

          {/* Modal Card */}
          <motion.div
            className="relative w-full max-w-sm bg-ctp-base border border-ctp-surface rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={SPRING}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-ctp-overlay1 hover:text-ctp-text hover:bg-ctp-surface0 transition-colors z-10"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="bg-ctp-mantle px-8 pt-8 pb-6 text-center">
              <div className="flex justify-center mb-4">
                <TmdbLogo />
              </div>
              <h2 className="text-lg font-black text-ctp-text tracking-tight uppercase mb-1">
                Sign in with TMDB
              </h2>
              <p className="text-[11px] text-ctp-overlay1 tracking-widest uppercase font-bold">
                The Movie Database
              </p>
            </div>

            {/* Features */}
            <div className="px-8 py-5 flex flex-col gap-3">
              {features.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-ctp-surface flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-ctp-accent" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-ctp-text tracking-widest uppercase">{label}</p>
                    <p className="text-[10px] text-ctp-overlay1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="px-8 pb-8">
              <motion.button
                onClick={onLogin}
                className="w-full py-3 rounded-xl bg-ctp-accent text-ctp-crust text-[11px] font-black tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                whileTap={{ scale: 0.97 }}
              >
                Continue to TMDB
              </motion.button>

              <div className="flex items-center justify-center gap-1.5 mt-4">
                <ShieldCheck size={11} className="text-ctp-overlay0" />
                <p className="text-[9px] text-ctp-overlay0 tracking-widest uppercase font-bold">
                  Secure · via themoviedb.org
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
