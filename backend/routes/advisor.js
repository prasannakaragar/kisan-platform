const express = require('express');
const router = express.Router();

const CROP_DATA = {
  'Karnataka': {
    'Bangalore Rural': [
      { crop: 'Tomato', season: 'Kharif + Rabi', soil: 'Red loamy', investment_per_acre: 35000, expected_yield_quintal: 120, market_price_per_quintal: 1000, profit_per_acre: 85000, risk: 'medium', water_need: 'medium', duration_days: 90, tips: 'Use hybrid varieties like Arka Rakshak. Drip irrigation reduces cost by 30%.' },
      { crop: 'Beans', season: 'Rabi', soil: 'Sandy loam', investment_per_acre: 18000, expected_yield_quintal: 35, market_price_per_quintal: 2500, profit_per_acre: 69500, risk: 'low', water_need: 'low', duration_days: 60, tips: 'Export quality beans fetch premium. Grow near Bangalore for easy market access.' },
      { crop: 'Marigold', season: 'Year round', soil: 'Any', investment_per_acre: 15000, expected_yield_quintal: 80, market_price_per_quintal: 2000, profit_per_acre: 145000, risk: 'low', water_need: 'low', duration_days: 75, tips: 'Flower market in Bangalore is huge. Contract farming possible with mandis.' }
    ],
    'Raichur': [
      { crop: 'Paddy', season: 'Kharif', soil: 'Black cotton', investment_per_acre: 22000, expected_yield_quintal: 25, market_price_per_quintal: 2100, profit_per_acre: 30500, risk: 'low', water_need: 'high', duration_days: 120, tips: 'MSP guaranteed. Canal irrigation available in Raichur. Sow BPT 5204 variety.' },
      { crop: 'Cotton', season: 'Kharif', soil: 'Black cotton', investment_per_acre: 28000, expected_yield_quintal: 8, market_price_per_quintal: 6000, profit_per_acre: 20000, risk: 'medium', water_need: 'medium', duration_days: 150, tips: 'Use BT cotton for bollworm resistance. APMC at Raichur gives fair price.' },
      { crop: 'Sunflower', season: 'Rabi', soil: 'Black loam', investment_per_acre: 12000, expected_yield_quintal: 10, market_price_per_quintal: 5500, profit_per_acre: 43000, risk: 'low', water_need: 'low', duration_days: 90, tips: 'Low water crop, ideal for Raichur dry zone. MSP support available.' }
    ],
    'Dharwad': [
      { crop: 'Maize', season: 'Kharif', soil: 'Red loam', investment_per_acre: 14000, expected_yield_quintal: 30, market_price_per_quintal: 2000, profit_per_acre: 46000, risk: 'low', water_need: 'medium', duration_days: 90, tips: 'Dharwad UAS has good Maize research support. Poultry feed market is huge.' },
      { crop: 'Chilli', season: 'Rabi', soil: 'Sandy loam', investment_per_acre: 30000, expected_yield_quintal: 15, market_price_per_quintal: 10000, profit_per_acre: 120000, risk: 'high', water_need: 'medium', duration_days: 120, tips: 'High profit but needs pest management. Byadagi variety is famous and fetches premium.' },
      { crop: 'Soybean', season: 'Kharif', soil: 'Black cotton', investment_per_acre: 10000, expected_yield_quintal: 12, market_price_per_quintal: 4200, profit_per_acre: 40400, risk: 'low', water_need: 'low', duration_days: 95, tips: 'Good market at Hubli APMC. MSP support. Low input crop.' }
    ]
  },
  'Maharashtra': {
    'Nashik': [
      { crop: 'Onion', season: 'Rabi', soil: 'Sandy loam', investment_per_acre: 25000, expected_yield_quintal: 80, market_price_per_quintal: 1200, profit_per_acre: 71000, risk: 'medium', water_need: 'medium', duration_days: 110, tips: 'Nashik is India\'s onion capital. Lasalgaon APMC gives best prices. Store in cold room.' },
      { crop: 'Grapes', season: 'Year round', soil: 'Well-drained loam', investment_per_acre: 150000, expected_yield_quintal: 100, market_price_per_quintal: 4000, profit_per_acre: 250000, risk: 'high', water_need: 'medium', duration_days: 365, tips: 'High investment but very high profit. Export market available. Drip irrigation essential.' },
      { crop: 'Tomato', season: 'Kharif', soil: 'Red loam', investment_per_acre: 30000, expected_yield_quintal: 100, market_price_per_quintal: 800, profit_per_acre: 50000, risk: 'medium', water_need: 'medium', duration_days: 90, tips: 'Close to Pune and Mumbai markets. Price can be volatile — sell in groups for better rate.' }
    ]
  },
  'Punjab': {
    'Ludhiana': [
      { crop: 'Wheat', season: 'Rabi', soil: 'Alluvial', investment_per_acre: 16000, expected_yield_quintal: 20, market_price_per_quintal: 2200, profit_per_acre: 28000, risk: 'low', water_need: 'medium', duration_days: 120, tips: 'MSP guaranteed. HD 3086 variety gives best yield. Sow by November 15.' },
      { crop: 'Maize', season: 'Kharif', soil: 'Sandy loam', investment_per_acre: 14000, expected_yield_quintal: 28, market_price_per_quintal: 2000, profit_per_acre: 42000, risk: 'low', water_need: 'medium', duration_days: 90, tips: 'Paddy to Maize switch gets ₹7000/acre state incentive. Saves groundwater.' }
    ]
  },
  'Andhra Pradesh': {
    'Guntur': [
      { crop: 'Chilli', season: 'Kharif + Rabi', soil: 'Sandy loam', investment_per_acre: 35000, expected_yield_quintal: 20, market_price_per_quintal: 10000, profit_per_acre: 165000, risk: 'high', water_need: 'medium', duration_days: 150, tips: 'Guntur is chilli capital of India. Mirchi Yard gives best price. Dry chilli stores well.' },
      { crop: 'Groundnut', season: 'Kharif', soil: 'Sandy loam', investment_per_acre: 18000, expected_yield_quintal: 15, market_price_per_quintal: 5200, profit_per_acre: 60000, risk: 'low', water_need: 'low', duration_days: 110, tips: 'Oil mills in Kurnool give direct farm gate price. Variety TAG 24 performs best.' }
    ]
  }
};

const DEFAULT_CROPS = [
  { crop: 'Paddy (Rice)', season: 'Kharif', soil: 'Any', investment_per_acre: 22000, expected_yield_quintal: 22, market_price_per_quintal: 2100, profit_per_acre: 24200, risk: 'low', water_need: 'high', duration_days: 120, tips: 'MSP guaranteed. Safest crop. Government procurement available.' },
  { crop: 'Wheat', season: 'Rabi', soil: 'Any', investment_per_acre: 16000, expected_yield_quintal: 18, market_price_per_quintal: 2200, profit_per_acre: 23600, risk: 'low', water_need: 'medium', duration_days: 120, tips: 'MSP guaranteed. Widely supported crop. Stable income.' },
  { crop: 'Soybean', season: 'Kharif', soil: 'Black', investment_per_acre: 10000, expected_yield_quintal: 10, market_price_per_quintal: 4200, profit_per_acre: 32000, risk: 'low', water_need: 'low', duration_days: 95, tips: 'Low input, decent return. Fixes nitrogen — good for soil health.' },
  { crop: 'Maize', season: 'Kharif', soil: 'Any', investment_per_acre: 14000, expected_yield_quintal: 25, market_price_per_quintal: 2000, profit_per_acre: 36000, risk: 'low', water_need: 'medium', duration_days: 90, tips: 'Huge poultry feed demand. Easy to grow. Multiple harvests possible.' }
];

router.post('/recommend', (req, res) => {
  const { state, district, land_acres, soil_type, water_availability, season } = req.body;
  let recommendations = [];

  if (state && CROP_DATA[state] && district && CROP_DATA[state][district]) {
    recommendations = CROP_DATA[state][district];
  } else if (state && CROP_DATA[state]) {
    const firstDistrict = Object.values(CROP_DATA[state])[0];
    recommendations = firstDistrict;
  } else {
    recommendations = DEFAULT_CROPS;
  }

  if (water_availability === 'low') {
    recommendations = recommendations.filter(c => c.water_need !== 'high');
  }
  if (season) {
    recommendations = recommendations.filter(c => c.season.toLowerCase().includes(season.toLowerCase()) || c.season === 'Year round');
  }

  const result = recommendations.map(c => ({
    ...c,
    total_investment: Math.round(c.investment_per_acre * (land_acres || 1)),
    expected_profit: Math.round(c.profit_per_acre * (land_acres || 1)),
    total_revenue: Math.round(c.expected_yield_quintal * c.market_price_per_quintal * (land_acres || 1))
  })).sort((a, b) => b.profit_per_acre - a.profit_per_acre);

  res.json({ success: true, state, district, data: result.length > 0 ? result : DEFAULT_CROPS });
});

router.get('/states', (req, res) => res.json({ success: true, data: Object.keys(CROP_DATA) }));
router.get('/districts/:state', (req, res) => {
  const districts = CROP_DATA[req.params.state] ? Object.keys(CROP_DATA[req.params.state]) : [];
  res.json({ success: true, data: districts });
});

module.exports = router;
