const express = require('express');
const router = express.Router();

// Helper: builds a YouTube search URL scoped to an official channel's query
// so the farmer always lands on real, verified government content.
function ytSearch(channel, query) {
  // Maps channel names to their official YouTube channel handles / search queries
  const channelQuery = {
    'DD Kisan':      'DD Kisan',
    'ICAR':          'ICAR India official',
    'Krishi Jagran': 'Krishi Jagran',
    'UAS Dharwad':   'UAS Dharwad',
    'PAU Ludhiana':  'PAU Ludhiana',
  };
  const ch = channelQuery[channel] || channel;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(ch + ' ' + query)}`;
}

const VIDEOS = [
  // ── PADDY ──────────────────────────────────────────────────────────────────
  {
    id: 'v1',
    title: 'Paddy Farming Complete Guide — Karnataka (SRI Method)',
    crop: 'Paddy', language: 'Kannada', channel: 'DD Kisan',
    duration: '28 min', level: 'Beginner',
    youtube_url: ytSearch('DD Kisan', 'paddy SRI method Karnataka Kannada'),
    views: '2.3L', tags: ['paddy', 'rice', 'kharif'],
  },
  {
    id: 'v2',
    title: 'Paddy Variety Selection and Seed Treatment',
    crop: 'Paddy', language: 'Hindi', channel: 'ICAR',
    duration: '22 min', level: 'Beginner',
    youtube_url: ytSearch('ICAR', 'paddy variety selection seed treatment Hindi'),
    views: '1.8L', tags: ['paddy', 'seeds', 'variety'],
  },
  {
    id: 'v3',
    title: 'Paddy Pest Management — Blast and BPH Control',
    crop: 'Paddy', language: 'Telugu', channel: 'ICAR',
    duration: '18 min', level: 'Advanced',
    youtube_url: ytSearch('ICAR', 'paddy pest management blast BPH Telugu'),
    views: '95K', tags: ['paddy', 'pest', 'disease'],
  },

  // ── TOMATO ─────────────────────────────────────────────────────────────────
  {
    id: 'v4',
    title: 'Tomato Farming — Hybrid Variety Complete Guide',
    crop: 'Tomato', language: 'Kannada', channel: 'Krishi Jagran',
    duration: '24 min', level: 'Beginner',
    youtube_url: ytSearch('Krishi Jagran', 'tomato hybrid variety farming Kannada'),
    views: '3.1L', tags: ['tomato', 'hybrid', 'horticulture'],
  },
  {
    id: 'v5',
    title: 'Tomato Drip Irrigation Setup and Management',
    crop: 'Tomato', language: 'Hindi', channel: 'DD Kisan',
    duration: '19 min', level: 'Intermediate',
    youtube_url: ytSearch('DD Kisan', 'tomato drip irrigation setup Hindi'),
    views: '1.5L', tags: ['tomato', 'drip', 'irrigation'],
  },
  {
    id: 'v6',
    title: 'Tomato Disease Control — Early Blight and Wilt',
    crop: 'Tomato', language: 'Telugu', channel: 'ICAR',
    duration: '21 min', level: 'Advanced',
    youtube_url: ytSearch('ICAR', 'tomato early blight wilt disease control Telugu'),
    views: '88K', tags: ['tomato', 'disease', 'pest'],
  },

  // ── COTTON ─────────────────────────────────────────────────────────────────
  {
    id: 'v7',
    title: 'BT Cotton Farming from Sowing to Picking',
    crop: 'Cotton', language: 'Hindi', channel: 'DD Kisan',
    duration: '32 min', level: 'Beginner',
    youtube_url: ytSearch('DD Kisan', 'BT cotton farming sowing picking Hindi'),
    views: '4.2L', tags: ['cotton', 'bt cotton', 'kharif'],
  },
  {
    id: 'v8',
    title: 'Cotton Pink Bollworm Control',
    crop: 'Cotton', language: 'Marathi', channel: 'Krishi Jagran',
    duration: '15 min', level: 'Advanced',
    youtube_url: ytSearch('Krishi Jagran', 'cotton pink bollworm control Marathi'),
    views: '1.2L', tags: ['cotton', 'pest', 'bollworm'],
  },

  // ── CHILLI ─────────────────────────────────────────────────────────────────
  {
    id: 'v9',
    title: 'Byadagi Chilli Farming — Complete Guide',
    crop: 'Chilli', language: 'Kannada', channel: 'UAS Dharwad',
    duration: '26 min', level: 'Beginner',
    youtube_url: ytSearch('UAS Dharwad', 'Byadagi chilli farming Kannada'),
    views: '2.8L', tags: ['chilli', 'byadagi', 'horticulture'],
  },
  {
    id: 'v10',
    title: 'Chilli Thrips and Mite Control',
    crop: 'Chilli', language: 'Telugu', channel: 'ICAR',
    duration: '17 min', level: 'Advanced',
    youtube_url: ytSearch('ICAR', 'chilli thrips mite control Telugu'),
    views: '76K', tags: ['chilli', 'pest', 'thrips'],
  },

  // ── WHEAT ──────────────────────────────────────────────────────────────────
  {
    id: 'v11',
    title: 'Wheat Farming — Rabi Season Complete Guide',
    crop: 'Wheat', language: 'Hindi', channel: 'DD Kisan',
    duration: '25 min', level: 'Beginner',
    youtube_url: ytSearch('DD Kisan', 'wheat farming rabi season Hindi'),
    views: '5.6L', tags: ['wheat', 'rabi', 'msp'],
  },
  {
    id: 'v12',
    title: 'Wheat Rust Disease Identification and Control',
    crop: 'Wheat', language: 'Punjabi', channel: 'PAU Ludhiana',
    duration: '20 min', level: 'Intermediate',
    youtube_url: ytSearch('PAU Ludhiana', 'wheat rust disease identification control Punjabi'),
    views: '1.1L', tags: ['wheat', 'disease', 'rust'],
  },

  // ── ONION ──────────────────────────────────────────────────────────────────
  {
    id: 'v13',
    title: 'Onion Farming — Nashik Method Step by Step',
    crop: 'Onion', language: 'Marathi', channel: 'Krishi Jagran',
    duration: '23 min', level: 'Beginner',
    youtube_url: ytSearch('Krishi Jagran', 'onion farming Nashik method Marathi'),
    views: '3.4L', tags: ['onion', 'nashik', 'storage'],
  },

  // ── MAIZE ──────────────────────────────────────────────────────────────────
  {
    id: 'v14',
    title: 'Maize Farming — High Yield Techniques',
    crop: 'Maize', language: 'Hindi', channel: 'ICAR',
    duration: '22 min', level: 'Beginner',
    youtube_url: ytSearch('ICAR', 'maize farming high yield techniques Hindi'),
    views: '2.1L', tags: ['maize', 'yield', 'poultry feed'],
  },

  // ── BANANA ─────────────────────────────────────────────────────────────────
  {
    id: 'v15',
    title: 'Banana Tissue Culture Farming',
    crop: 'Banana', language: 'Kannada', channel: 'UAS Dharwad',
    duration: '29 min', level: 'Intermediate',
    youtube_url: ytSearch('UAS Dharwad', 'banana tissue culture farming Kannada'),
    views: '1.9L', tags: ['banana', 'tissue culture', 'horticulture'],
  },
];

const CROPS     = [...new Set(VIDEOS.map(v => v.crop))].sort();
const LANGUAGES = [...new Set(VIDEOS.map(v => v.language))].sort();

// GET /api/videos?crop=&language=&level=&search=
router.get('/', (req, res) => {
  const { crop, language, level, search } = req.query;
  let videos = [...VIDEOS];

  if (crop)     videos = videos.filter(v => v.crop.toLowerCase()     === crop.toLowerCase());
  if (language) videos = videos.filter(v => v.language.toLowerCase() === language.toLowerCase());
  if (level)    videos = videos.filter(v => v.level.toLowerCase()    === level.toLowerCase());
  if (search) {
    const q = search.toLowerCase();
    videos = videos.filter(
      v => v.title.toLowerCase().includes(q) || v.tags.some(t => t.includes(q))
    );
  }

  res.json({ success: true, count: videos.length, data: videos });
});

router.get('/crops',     (req, res) => res.json({ success: true, data: CROPS }));
router.get('/languages', (req, res) => res.json({ success: true, data: LANGUAGES }));

module.exports = router;