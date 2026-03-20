const express = require('express');
const router = express.Router();

const VIDEOS = [
  // Paddy
  { id: 'v1', title: 'Paddy Farming Complete Guide — Karnataka', crop: 'Paddy', language: 'Kannada', channel: 'DD Chandana', duration: '28 min', level: 'Beginner', youtube_id: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', views: '2.3L', tags: ['paddy', 'rice', 'kharif'] },
  { id: 'v2', title: 'Paddy Variety Selection and Seed Treatment', crop: 'Paddy', language: 'Hindi', channel: 'ICAR', duration: '22 min', level: 'Beginner', youtube_id: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', views: '1.8L', tags: ['paddy', 'seeds', 'variety'] },
  { id: 'v3', title: 'Paddy Pest Management — Blast and BPH', crop: 'Paddy', language: 'Telugu', channel: 'ICAR', duration: '18 min', level: 'Advanced', youtube_id: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', views: '95K', tags: ['paddy', 'pest', 'disease'] },
  // Tomato
  { id: 'v4', title: 'Tomato Farming — Hybrid Variety Complete Guide', crop: 'Tomato', language: 'Kannada', channel: 'Krishi Jagran', duration: '24 min', level: 'Beginner', youtube_id: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', views: '3.1L', tags: ['tomato', 'hybrid', 'horticulture'] },
  { id: 'v5', title: 'Tomato Drip Irrigation Setup', crop: 'Tomato', language: 'Hindi', channel: 'DD Kisan', duration: '19 min', level: 'Intermediate', youtube_id: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', views: '1.5L', tags: ['tomato', 'drip', 'irrigation'] },
  { id: 'v6', title: 'Tomato Disease Control — Early Blight and Wilt', crop: 'Tomato', language: 'Telugu', channel: 'ICAR', duration: '21 min', level: 'Advanced', youtube_id: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', views: '88K', tags: ['tomato', 'disease', 'pest'] },
  // Cotton
  { id: 'v7', title: 'BT Cotton Farming from Sowing to Picking', crop: 'Cotton', language: 'Hindi', channel: 'DD Kisan', duration: '32 min', level: 'Beginner', youtube_id: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', views: '4.2L', tags: ['cotton', 'bt cotton', 'kharif'] },
  { id: 'v8', title: 'Cotton Pink Bollworm Control', crop: 'Cotton', language: 'Marathi', channel: 'Krishi Jagran', duration: '15 min', level: 'Advanced', youtube_id: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', views: '1.2L', tags: ['cotton', 'pest', 'bollworm'] },
  // Chilli
  { id: 'v9', title: 'Byadagi Chilli Farming — Complete Guide', crop: 'Chilli', language: 'Kannada', channel: 'UAS Dharwad', duration: '26 min', level: 'Beginner', youtube_id: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', views: '2.8L', tags: ['chilli', 'byadagi', 'horticulture'] },
  { id: 'v10', title: 'Chilli Thrips and Mite Control', crop: 'Chilli', language: 'Telugu', channel: 'ICAR', duration: '17 min', level: 'Advanced', youtube_id: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', views: '76K', tags: ['chilli', 'pest', 'thrips'] },
  // Wheat
  { id: 'v11', title: 'Wheat Farming — Rabi Season Complete Guide', crop: 'Wheat', language: 'Hindi', channel: 'DD Kisan', duration: '25 min', level: 'Beginner', youtube_id: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', views: '5.6L', tags: ['wheat', 'rabi', 'msP'] },
  { id: 'v12', title: 'Wheat Rust Disease Identification and Control', crop: 'Wheat', language: 'Punjabi', channel: 'PAU Ludhiana', duration: '20 min', level: 'Intermediate', youtube_id: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', views: '1.1L', tags: ['wheat', 'disease', 'rust'] },
  // Onion
  { id: 'v13', title: 'Onion Farming Nashik Method', crop: 'Onion', language: 'Marathi', channel: 'Krishi Jagran', duration: '23 min', level: 'Beginner', youtube_id: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', views: '3.4L', tags: ['onion', 'nashik', 'storage'] },
  // Maize
  { id: 'v14', title: 'Maize Farming — High Yield Techniques', crop: 'Maize', language: 'Hindi', channel: 'ICAR', duration: '22 min', level: 'Beginner', youtube_id: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', views: '2.1L', tags: ['maize', 'yield', 'poultry feed'] },
  // Banana
  { id: 'v15', title: 'Banana Tissue Culture Farming', crop: 'Banana', language: 'Kannada', channel: 'UAS Dharwad', duration: '29 min', level: 'Intermediate', youtube_id: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', views: '1.9L', tags: ['banana', 'tissue culture', 'horticulture'] }
];

const CROPS = [...new Set(VIDEOS.map(v => v.crop))].sort();
const LANGUAGES = [...new Set(VIDEOS.map(v => v.language))].sort();

router.get('/', (req, res) => {
  const { crop, language, level, search } = req.query;
  let videos = [...VIDEOS];
  if (crop) videos = videos.filter(v => v.crop.toLowerCase() === crop.toLowerCase());
  if (language) videos = videos.filter(v => v.language.toLowerCase() === language.toLowerCase());
  if (level) videos = videos.filter(v => v.level.toLowerCase() === level.toLowerCase());
  if (search) {
    const q = search.toLowerCase();
    videos = videos.filter(v => v.title.toLowerCase().includes(q) || v.tags.some(t => t.includes(q)));
  }
  res.json({ success: true, count: videos.length, data: videos });
});

router.get('/crops', (req, res) => res.json({ success: true, data: CROPS }));
router.get('/languages', (req, res) => res.json({ success: true, data: LANGUAGES }));

module.exports = router;
