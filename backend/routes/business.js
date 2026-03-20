const express = require('express');
const router = express.Router();

const BUSINESS_IDEAS = [
  { id: 'pipe-shop', title: 'Agri Pipe & Irrigation Shop', icon: '🔧', investment_min: 200000, investment_max: 500000, monthly_profit_min: 25000, monthly_profit_max: 60000, payback_months: 10, difficulty: 'Easy', suitable_for: ['Any farmer with market access', 'Farmers near irrigation projects'], description: 'Sell drip pipes, sprinklers, PVC pipes, pump sets. Every farmer needs irrigation. High demand, good margins.', market_size: 'Very High', location: 'Any taluk or town', steps: ['Register as sole proprietor (₹1000, 1 day)', 'Get GST registration (free, online)', 'Rent a 200-300 sqft shop near APMC or main road', 'Open account with Jain Irrigation, Finolex or local supplier', 'Start with ₹1-2 lakh stock of most common pipes and fittings', 'Advertise in local market and farms'], schemes: ['PM Mudra Loan (Kishore) — up to ₹5 lakh at low interest', 'PMEGP — 25% subsidy on project cost', 'State SC/ST entrepreneur schemes if applicable'] },
  { id: 'dairy', title: 'Small Dairy Farm', icon: '🐄', investment_min: 300000, investment_max: 800000, monthly_profit_min: 20000, monthly_profit_max: 50000, payback_months: 18, difficulty: 'Medium', suitable_for: ['Farmers with existing land', 'Farmers near cooperative dairy'], description: 'Start with 5-10 HF or Murrah buffalo. Sell milk to KMF/Amul or directly. Stable daily income.', market_size: 'High', location: 'Rural with dairy cooperative nearby', steps: ['Start with 4-5 HF cows or Murrah buffalo', 'Register with KMF/Amul/local co-op for guaranteed purchase', 'Build simple shed (can use existing farm shed)', 'Install milking machine for 10+ animals', 'Get animals vaccinated — government vet does it free', 'Apply for NABARD dairy loan with 25% subsidy'], schemes: ['NABARD Dairy Loan — 25% subsidy', 'KMF/Amul provides technical support free', 'Animal Husbandry Infrastructure Fund'] },
  { id: 'tractor-rental', title: 'Tractor Rental Service', icon: '🚜', investment_min: 500000, investment_max: 900000, monthly_profit_min: 30000, monthly_profit_max: 70000, payback_months: 20, difficulty: 'Easy', suitable_for: ['Farmers who already have tractor', 'Farmers in high-farming area'], description: 'Buy a tractor and rent it out to farmers per hour or acre. Very high demand during sowing and harvest.', market_size: 'Very High', location: 'Any farming area', steps: ['Buy second-hand tractor (Mahindra 475 or Sonalika 60 best value)', 'Register vehicle and get commercial permit', 'List on EM3 Agri or Mahindra Custom Hiring app', 'Fix rates: ₹800-1200/hour for plowing, ₹500-700 for transport', 'Hire one operator if not driving yourself', 'During lean season offer transport service too'], schemes: ['SMAM — 50% subsidy on tractor for SC/ST farmers', 'Mahindra finance at 7% interest', 'Custom Hiring Centre scheme — equipment set at 40% subsidy'] },
  { id: 'cold-storage', title: 'Mini Cold Storage', icon: '❄️', investment_min: 1000000, investment_max: 2500000, monthly_profit_min: 40000, monthly_profit_max: 100000, payback_months: 30, difficulty: 'Hard', suitable_for: ['Farmers near vegetable or fruit growing area', 'Farmers with 1 acre+ land'], description: 'Store onion, potato, tomato, or fruit for farmers. Charge storage fee. Sell when prices are high.', market_size: 'Very High', location: 'Near major vegetable/fruit growing area', steps: ['Get land (own or lease) — need 2000-5000 sqft', 'Apply for AIF loan (3% interest) at your bank', 'Get 35% NHM subsidy for cold chain infrastructure', 'Hire contractor to build insulated chamber and refrigeration', 'Register with FSSAI for food storage license', 'Tie up with FPO or APMC for guaranteed storage bookings'], schemes: ['Agri Infrastructure Fund (AIF) — 3% interest loan up to ₹2 crore', 'NHM subsidy — 35% of project cost', 'PMKSY post-harvest management component'] },
  { id: 'agri-input-shop', title: 'Seed & Fertilizer Shop', icon: '🌱', investment_min: 150000, investment_max: 350000, monthly_profit_min: 20000, monthly_profit_max: 45000, payback_months: 9, difficulty: 'Easy', suitable_for: ['Any farmer with basic literacy', 'Farmers in villages with no existing shop'], description: 'Sell seeds, fertilizers, pesticides. Get license from state agriculture dept. Every village needs one.', market_size: 'Very High', location: 'Village or small town', steps: ['Get Pesticide License from State Agriculture Dept (₹2000, 2 weeks)', 'Get Fertilizer License from Dept of Fertilizers', 'Rent 200 sqft shop near main road or market', 'Tie up with national distributors — Bayer, BASF, Syngenta, UPL', 'Keep stock of top 20 products farmers need', 'Give credit to trusted farmers — earns loyalty'], schemes: ['PM Mudra Loan — up to ₹5 lakh no collateral', 'PMEGP — 25% subsidy on project', 'State entrepreneurship schemes'] },
  { id: 'farm-stay', title: 'Agri Tourism / Farm Stay', icon: '🏡', investment_min: 100000, investment_max: 400000, monthly_profit_min: 15000, monthly_profit_max: 50000, payback_months: 12, difficulty: 'Medium', suitable_for: ['Farmers within 50 km of city', 'Farmers with scenic or unique farm', 'Farmers who grow organic'], description: 'Let city people visit and stay on your farm. Cooking, harvesting experience. Very popular post-COVID.', market_size: 'Growing', location: 'Within 100 km of metro city', steps: ['Clean and beautify 1-2 areas of farm', 'Build 2-3 simple cottages or upgrade existing rooms', 'Register on AirBnB and IndieFarm.in', 'Offer activities: bullock cart, harvesting, cooking class', 'Tie up with local travel agents and city schools', 'Get FSSAI license to serve food'], schemes: ['State Tourism Department — grants for rural tourism', 'NABARD RIDF for rural infrastructure', 'Local MSME support for new enterprises'] }
];

const LOANS = [
  { name: 'PM Mudra Yojana', type: 'Shishu / Kishor / Tarun', max_amount: 1000000, interest: '8-10%', collateral: 'None up to ₹10 lakh', link: 'https://www.mudra.org.in' },
  { name: 'PMEGP', type: 'Manufacturing / Service', max_amount: 2500000, interest: 'Subsidized', collateral: 'None for small projects', link: 'https://kviconline.gov.in/pmegpeportal' },
  { name: 'Stand Up India', type: 'Greenfield enterprises', max_amount: 10000000, interest: 'Base rate + 3%', collateral: 'Project asset', link: 'https://www.standupmitra.in' },
  { name: 'NABARD Rural Business', type: 'Agri allied', max_amount: 5000000, interest: '7-9%', collateral: 'Land / asset', link: 'https://nabard.org' }
];

router.get('/', (req, res) => {
  const { difficulty, max_investment } = req.query;
  let ideas = [...BUSINESS_IDEAS];
  if (difficulty) ideas = ideas.filter(i => i.difficulty.toLowerCase() === difficulty.toLowerCase());
  if (max_investment) ideas = ideas.filter(i => i.investment_min <= parseInt(max_investment));
  ideas.sort((a, b) => a.investment_min - b.investment_min);
  res.json({ success: true, data: ideas });
});

router.get('/:id', (req, res) => {
  const idea = BUSINESS_IDEAS.find(i => i.id === req.params.id);
  if (!idea) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true, data: idea });
});

router.get('/meta/loans', (req, res) => res.json({ success: true, data: LOANS }));

module.exports = router;
