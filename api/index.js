import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_BASE = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

app.use(cors());
app.use(express.json());

// Proxy Handler
app.use('/api', async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: 'TMDB API Key missing on server' });
  }

  // Construct URL. req.url already includes everything after /api
  // e.g., if fetch is /api/movie/popular?language=en, req.url is /movie/popular?language=en
  const urlObj = new URL(`${TMDB_BASE}${req.url}`);
  urlObj.searchParams.set('api_key', API_KEY);

  try {
    const upstream = await fetch(urlObj.toString(), {
      method: req.method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // Note: For POST/PUT requests (like favorites), body mapping is required
      ...(req.method !== 'GET' && req.method !== 'HEAD' && { body: JSON.stringify(req.body) })
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Failed to proxy request to TMDB' });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[strm-backend] Proxy running on http://localhost:${PORT}`);
  });
}

// Export for Vercel Serverless
export default app;
