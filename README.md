<div align="center">
  <img src="https://raw.githubusercontent.com/catppuccin/catppuccin/main/assets/palette/macchiato.png" width="100%" alt="Catppuccin Palette" />
  
  <br />
  <br />

  <h1>🎬 STRM.</h1>
  <p>
    <b>A minimalist, Swiss-Editorial web client for Movies, Anime, and TV Series.</b>
  </p>
  <p>
    Powered by React, Tailwind CSS, Framer Motion, and the TMDB API.
  </p>

  <br />
</div>

## ✦ Overview

**STRM** (pronounced *stream*) was built to rethink the modern media browsing experience. Moving away from standard, cluttered, and generic gradients, it utilizes an uncompromising **"Swiss Editorial"** design philosophy—characterized by sharp lines, precise asymmetric grid structures, massive tracking typography, and minimalist borders.

Beyond its looks, STRM securely integrates the real **TMDB v3 API** alongside seamless localized playback mechanisms to serve as a complete, high-speed streaming dashboard.

## ✦ Core Features

- **Swiss-Style Design System:** A rigorous layout consisting of solid mono-lines, stark contrasts, horizontal sliding galleries, and kinetic typographic reveals, driven entirely by `Tailwind CSS`.
- **Native TMDB Authentication:** Log in natively through TMDB's OAuth-style session infrastructure. No backend required.
- **Personalized User Libraries:** Automatically fetches and syncs your authentic TMDB `Favorites` and `Watchlist` straight to your personalized Grid View.
- **Integrated Video Player:** Watch full movies, TV series, or anime episodes directly within the app without annoying popups. Includes smart auto-selection and infinite scrolling episodes interface.
- **Smart Region Caching:** Instantly filter trending shows and movies originated exclusively from Japan, Korea, China, or global pools.
- **Theme & I18n Engine:** Ships with robust global themes spanning beautiful `Catppuccin Mocha` aesthetic color palettes out of the box, offering 5+ localized languages natively.
- **Fluid Micro-Interactions:** Snappy, delightful, physics-based `<motion />` animations crafted via `Framer Motion`. 

## ✦ Tech Stack

* **Framework:** React 18, Vite
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion
* **Icons:** Lucide React
* **Data Sources:** TMDB v3 API, VidKing endpoints

## ✦ Getting Started

### 1. Prerequisites
You will need Node.js `v18+` installed on your machine. You will also need to generate a free [TMDB API Key](https://developer.themoviedb.org/docs/getting-started).

### 2. Installation
Clone the repository, navigate into the directory, and install dependencies:

```bash
git clone https://github.com/yourusername/strm-prj.git
cd strm-prj
npm install
```

### 3. Environment Variables
Create a root `.env` file containing your TMDB version 3 token:
```env
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

### 4. Run Locally
Boot up the Vite dev server safely. The application will map to port `5173`.
```bash
npm run dev
```

## ✦ File Structure Highlights

- `/src/components` — Houses the pure UI components like `<Player />`, `<Hero />`, and `<VideoCard />` utilizing framer variants.
- `/src/hooks` — Crucial logic isolation such as `useTMDB.js` (for infinite-scrolling queries and cache pooling) and `useAuth.js` (bridging standard request-session tokens securely).
- `/src/App.jsx` — The root assembly, governing structural page transitions, caching, and the root navigation layouts.

---

<div align="center">
  <p><sub>Built with code and passion.</sub></p>
</div>
