/**
 * TMDB-compatible mock data
 * Updated with new categories: Anime, KDrama, JDrama, CDrama + Country metadata.
 */

export const IMG_BASE  = 'https://image.tmdb.org/t/p'
export const MOCK_BASE = 'https://picsum.photos/seed'

export const mockTrending = [
  {
    id: 101, media_type: 'movie',
    title: 'Hollow Signal',
    overview: 'A lone satellite technician intercepts a signal from beyond the solar system — and must decide whether to respond.',
    poster_path: null, backdrop_path: null,
    vote_average: 8.4, release_date: '2025-11-14',
    _mock_seed: 'signal01',
    category: 'movie',
    country: 'us'
  },
  {
    id: 102, media_type: 'movie',
    title: 'Neon Apostle',
    overview: 'In a flooded future city, a street preacher rises to power through augmented-reality miracles.',
    poster_path: null, backdrop_path: null,
    vote_average: 7.9, release_date: '2025-10-03',
    _mock_seed: 'neon02',
    category: 'movie',
    country: 'us'
  },
  {
    id: 103, media_type: 'tv',
    name: 'Lacuna',
    overview: 'A memory-deletion clinic becomes the epicenter of a global conspiracy when patients begin remembering the same dream.',
    poster_path: null, backdrop_path: null,
    vote_average: 9.1, first_air_date: '2025-09-20',
    _mock_seed: 'lacuna03',
    category: 'series',
    country: 'us'
  },
  {
    id: 104, media_type: 'movie',
    title: 'Avatar: Fire and Ash',
    overview: 'In the wake of the devastating war against the RDA and the loss of their eldest son, Jake Sully and Neytiri face a new threat on Pandora: the Ash People, a violent and power-hungry Na\'vi tribe...',
    poster_path: null, backdrop_path: null,
    vote_average: 7.3, release_date: '2025-08-07',
    _mock_seed: 'avatar04',
    category: 'movie',
    country: 'us'
  },
  {
    id: 105, media_type: 'tv',
    name: 'Ghost in the Shell: SAC_2045',
    overview: 'In the year 2045, after an economic disaster known as the Simultaneous Global Default, the world has entered into a state of "Sustainable War".',
    poster_path: null, backdrop_path: null,
    vote_average: 8.8, first_air_date: '2022-05-23',
    _mock_seed: 'ghost05',
    category: 'anime',
    country: 'jp'
  },
  {
    id: 106, media_type: 'tv',
    name: 'Squid Game: Season 2',
    overview: 'Gi-hun, who gave up going to the United States after a mysterious call, returns with a resolve and starts the game again.',
    poster_path: null, backdrop_path: null,
    vote_average: 8.0, first_air_date: '2024-12-26',
    _mock_seed: 'squid06',
    category: 'kdrama',
    country: 'kr'
  },
  {
    id: 107, media_type: 'movie',
    title: 'Gundam: Hathaway',
    overview: 'Twelve years have passed since the end of the Second Neo Zeon War. A terrorist organization called Mafty is carrying out a campaign of assassination against Federation officials.',
    poster_path: null, backdrop_path: null,
    vote_average: 7.3, release_date: '2021-06-11',
    _mock_seed: 'gundam07',
    category: 'anime',
    country: 'jp'
  },
  {
    id: 108, media_type: 'tv',
    name: 'Alice in Borderland',
    overview: 'An obsessed gamer and his friends find themselves in a deserted Tokyo where they must compete in dangerous games to survive.',
    poster_path: null, backdrop_path: null,
    vote_average: 8.6, first_air_date: '2020-12-10',
    _mock_seed: 'alice08',
    category: 'jdrama',
    country: 'jp'
  },
  {
    id: 109, media_type: 'tv',
    name: 'The Untamed',
    overview: 'Based on the novel Mo Dao Zu Shi, the story follows Wei Wuxian and Lan Wangji, two cultivators who travel to solve a series of mysteries.',
    poster_path: null, backdrop_path: null,
    vote_average: 9.0, first_air_date: '2019-06-27',
    _mock_seed: 'untamed09',
    category: 'cdrama',
    country: 'cn'
  },
  {
    id: 110, media_type: 'movie',
    title: 'Gundala',
    overview: 'Indonesia\'s preeminent comic book superhero and his alter ego Sancaka enter the cinematic universe.',
    poster_path: null, backdrop_path: null,
    vote_average: 8.2, release_date: '2019-08-29',
    _mock_seed: 'gundala10',
    category: 'movie',
    country: 'id'
  },
  {
    id: 111, media_type: 'movie',
    title: 'The Medium',
    overview: 'A terrifying story of a shaman\'s inheritance in the Isan region of Thailand.',
    poster_path: null, backdrop_path: null,
    vote_average: 7.7, release_date: '2021-07-14',
    _mock_seed: 'medium11',
    category: 'movie',
    country: 'th'
  },
  {
    id: 112, media_type: 'movie',
    title: 'Furie',
    overview: 'A legendary former gang leader retires to the countryside to raise her daughter, but she\'s forced to return to her violent past when her daughter is kidnapped.',
    poster_path: null, backdrop_path: null,
    vote_average: 8.3, release_date: '2019-02-22',
    _mock_seed: 'furie12',
    category: 'movie',
    country: 'vn'
  },
]

export function resolveImg(item, type = 'poster', size = 'w500') {
  const path = type === 'poster' ? item.poster_path : item.backdrop_path
  if (path) return `${IMG_BASE}/${size}${path}`
  const seed = item._mock_seed || String(item.id)
  return type === 'poster'
    ? `${MOCK_BASE}/${seed}/400/600`
    : `${MOCK_BASE}/${seed}b/800/450`
}

export function getTitle(item) {
  return item.title || item.name || 'Untitled'
}

export function getYear(item) {
  const date = item.release_date || item.first_air_date || ''
  return date.slice(0, 4)
}
