import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = (url, opts) => axios({ url: `/api${url}`, ...opts }).then(r => r.data);
const RISK_COLOR = { Low:'#2d6a2d', Medium:'#e65100', High:'#c62828' };
const RISK_BG    = { Low:'#e8f5e9', Medium:'#fff3e0', High:'#ffebee' };

export default function FearCrusher() {
  // Location state
  const [allStates, setAllStates]         = useState([]);
  const [districtMap, setDistrictMap]     = useState({});
  const [location, setLocation]           = useState({ state:'Karnataka', district:'Raichur' });
  const [locationData, setLocationData]   = useState(null);
  const [locLoading, setLocLoading]       = useState(false);

  // Recommended crops from location engine
  const [recommended, setRecommended]     = useState([]);
  const [recLoading, setRecLoading]       = useState(false);

  // Selected crop detail (same as before)
  const [selectedCrop, setSelectedCrop]   = useState('');
  const [data, setData]                   = useState(null);
  const [loading, setLoading]             = useState(false);
  const [tab, setTab]                     = useState('overview');
  const [calcAcres, setCalcAcres]         = useState(2);

  // Load states + districts on mount
  useEffect(() => {
    api('/fear/states').then(r => {
      setAllStates(r.data || []);
      setDistrictMap(r.districts || {});
    });
    // Auto-load recommendations for default location
    fetchRecommendations('Karnataka', 'Raichur');
  }, []);

  async function fetchRecommendations(state, district) {
    setRecLoading(true);
    setRecommended([]);
    setData(null);
    setSelectedCrop('');
    try {
      // Fetch location soil + climate info
      const locRes = await api(`/fear/location-data?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`);
      setLocationData(locRes);

      // Fetch ranked crop recommendations
      const recRes = await api(`/fear/recommend?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`);
      setRecommended(recRes.recommended_crops || []);

      // Auto-select top crop
      if (recRes.recommended_crops?.length > 0) {
        const top = recRes.recommended_crops[0];
        setSelectedCrop(top.crop);
        setData(top);
      }
    } catch(e) { console.error(e); }
    finally { setRecLoading(false); }
  }

  function handleStateChange(newState) {
    const districts = districtMap[newState] || [];
    const firstDistrict = districts[0] || '';
    const newLoc = { state: newState, district: firstDistrict };
    setLocation(newLoc);
  }

  function handleDistrictChange(district) {
    setLocation(l => ({ ...l, district }));
  }

  function handleGo() {
    fetchRecommendations(location.state, location.district);
  }

  // Try to get browser GPS location
  function detectLocation() {
    setLocLoading(true);
    if (!navigator.geolocation) { alert('Location not supported in this browser'); setLocLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Reverse geocode using free nominatim API
          const { latitude, longitude } = pos.coords;
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const addr = res.data?.address;
          const state    = addr?.state    || 'Karnataka';
          const district = addr?.county || addr?.state_district || addr?.city || '';
          setLocation({ state, district });
          fetchRecommendations(state, district);
        } catch(e) { console.error(e); }
        finally { setLocLoading(false); }
      },
      () => { alert('Could not detect location. Please select manually.'); setLocLoading(false); }
    );
  }

  function selectCrop(cropData) {
    setSelectedCrop(cropData.crop);
    setData(cropData);
    setTab('overview');
  }

  const districts = districtMap[location.state] || [];
  const minProfit = data ? Math.round((data.profit_calculator.yield_range[0] * data.profit_calculator.price_range[0] - data.profit_calculator.investment_range[0]) * calcAcres) : 0;
  const maxProfit = data ? Math.round((data.profit_calculator.yield_range[1] * data.profit_calculator.price_range[1] - data.profit_calculator.investment_range[0]) * calcAcres) : 0;

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px' }}>
      <div className="page-header">
        <h1>💪 Fear Crusher</h1>
        <p>Tell us your location — we'll recommend the best crops for your soil and climate</p>
      </div>

      {/* ── LOCATION INPUT (new) ── */}
      <div className="card" style={{ marginBottom:24, background:'#e8f5e9', border:'1px solid #a5d6a7' }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>📍 Your Farm Location</div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end' }}>
          <div style={{ flex:1, minWidth:160 }}>
            <label style={{ fontSize:12, color:'#6b7280', marginBottom:4, display:'block' }}>State</label>
            <select value={location.state} onChange={e => handleStateChange(e.target.value)}>
              {allStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ flex:1, minWidth:160 }}>
            <label style={{ fontSize:12, color:'#6b7280', marginBottom:4, display:'block' }}>District</label>
            <select value={location.district} onChange={e => handleDistrictChange(e.target.value)}>
              <option value="">Select district</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={handleGo} disabled={recLoading} style={{ minWidth:100 }}>
            {recLoading ? 'Analyzing...' : 'Get Crops →'}
          </button>
          <button onClick={detectLocation} disabled={locLoading}
            style={{ background:'white', border:'1.5px solid #2d6a2d', color:'#2d6a2d', borderRadius:8, padding:'10px 14px', fontWeight:500, cursor:'pointer', minWidth:120 }}>
            {locLoading ? '...' : '📡 Auto Detect'}
          </button>
        </div>

        {/* Soil + Climate info chips */}
        {locationData?.has_data && (
          <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
            {locationData.soil && (
              <span style={{ background:'white', border:'1px solid #c8e6c9', borderRadius:20, padding:'3px 10px', fontSize:12, color:'#2d6a2d' }}>
                🌱 Soil: {locationData.soil.soil} (pH {locationData.soil.ph})
              </span>
            )}
            {locationData.climate && (
              <span style={{ background:'white', border:'1px solid #c8e6c9', borderRadius:20, padding:'3px 10px', fontSize:12, color:'#1565c0' }}>
                🌤️ {locationData.climate.climate} · {locationData.climate.rainfall_mm}mm rain · {locationData.climate.temp_max}°C max
              </span>
            )}
          </div>
        )}
        {locationData && !locationData.has_data && (
          <div style={{ marginTop:10, fontSize:12, color:'#e65100' }}>
            ⚠️ No soil/climate data for this district — showing general recommendations
          </div>
        )}
      </div>

      {recLoading && <div className="loading">🌾 Analyzing soil, climate and market data...</div>}

      {/* ── RECOMMENDED CROPS (replaces old crop selector) ── */}
      {recommended.length > 0 && (
        <div className="card" style={{ marginBottom:24 }}>
          <div style={{ fontWeight:700, marginBottom:4 }}>
            🏆 Best crops for {location.district || location.state} — ranked by suitability + profit
          </div>
          <div style={{ fontSize:12, color:'#6b7280', marginBottom:14 }}>
            Based on your soil type, local climate and current market prices
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
            {recommended.map((rec, i) => (
              <button key={rec.crop} onClick={() => selectCrop(rec)}
                style={{
                  background: selectedCrop === rec.crop ? '#2d6a2d' : 'white',
                  color:      selectedCrop === rec.crop ? 'white' : '#374151',
                  border: '1.5px solid',
                  borderColor: selectedCrop === rec.crop ? '#2d6a2d' : '#e5e7eb',
                  padding: '8px 14px', borderRadius:8, cursor:'pointer',
                  display:'flex', alignItems:'center', gap:6, fontSize:13,
                }}>
                {i === 0 && <span style={{ fontSize:14 }}>🥇</span>}
                {i === 1 && <span style={{ fontSize:14 }}>🥈</span>}
                {i === 2 && <span style={{ fontSize:14 }}>🥉</span>}
                {i > 2 && <span style={{ fontSize:11, opacity:0.6 }}>#{i+1}</span>}
                {rec.crop}
                <span style={{ fontSize:10, opacity:0.7 }}>({rec.suitability_score}%)</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <div className="loading">Loading crop data...</div>}

      {!recLoading && recommended.length === 0 && !data && (
        <div className="empty-state">
          <div className="icon">💪</div>
          <h3>Select your location above</h3>
          <p>We'll recommend the best crops based on your soil and climate</p>
        </div>
      )}

      {/* ── EXISTING DETAIL UI (unchanged) ── */}
      {data && (
        <div>
          {/* Hero stats — same as before */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:24 }}>
            <div className="stat-box" style={{ borderLeft:'4px solid #2d6a2d' }}>
              <div className="num" style={{ fontSize:36 }}>{data.district_success_rate}%</div>
              <div className="lbl">farmers succeeded in your district</div>
            </div>
            <div className="stat-box" style={{ borderLeft:'4px solid #1565c0' }}>
              <div className="num" style={{ fontSize:24 }}>₹{(data.state_avg_profit/1000).toFixed(0)}K</div>
              <div className="lbl">estimated profit per acre</div>
            </div>
            <div className="stat-box" style={{ borderLeft:`4px solid ${RISK_COLOR[data.risk_level]}` }}>
              <div className="num" style={{ fontSize:24, color:RISK_COLOR[data.risk_level] }}>{data.risk_level}</div>
              <div className="lbl">risk level</div>
            </div>
            <div className="stat-box" style={{ borderLeft:'4px solid #9c27b0' }}>
              <div className="num" style={{ fontSize:24 }}>{100 - data.risk_score}%</div>
              <div className="lbl">chance of making profit</div>
            </div>
          </div>

          {/* Why this crop is good here */}
          {data.reasons?.length > 0 && (
            <div className="card" style={{ background:'#e8f5e9', border:'1px solid #a5d6a7', marginBottom:20 }}>
              <div style={{ fontWeight:700, marginBottom:8 }}>✅ Why {data.crop} suits {location.district || location.state}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {data.reasons.map((r, i) => (
                  <span key={i} style={{ background:'white', border:'1px solid #c8e6c9', borderRadius:20, padding:'4px 12px', fontSize:13, color:'#2d6a2d' }}>✓ {r}</span>
                ))}
              </div>
              {data.season && (
                <div style={{ marginTop:10, fontSize:13, color:'#6b7280' }}>
                  📅 Best season: <strong>{data.season}</strong> · Duration: {data.duration_days} days ·
                  {data.msp > 0 && <span style={{ color:'#2d6a2d', fontWeight:600 }}> MSP: ₹{data.msp.toLocaleString()}/qtl</span>}
                  {data.market_price > 0 && data.msp !== data.market_price &&
                    <span> · Current market: ₹{data.market_price.toLocaleString()}/qtl</span>}
                </div>
              )}
            </div>
          )}

          {/* Risk meter — same as before */}
          <div className="card" style={{ marginBottom:20 }}>
            <div style={{ fontWeight:700, marginBottom:10 }}>📊 Risk Meter for {data.crop}</div>
            <div style={{ background:'#f3f4f6', borderRadius:20, height:16, overflow:'hidden', marginBottom:6 }}>
              <div style={{ width:`${data.risk_score}%`, background:`linear-gradient(90deg, #4caf50, ${data.risk_score>60?'#f44336':data.risk_score>40?'#ff9800':'#4caf50'})`, height:'100%', borderRadius:20, transition:'width 0.5s' }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#9ca3af' }}>
              <span>Low Risk</span><span>Medium Risk</span><span>High Risk</span>
            </div>
          </div>

          {/* Tabs — same as before */}
          <div style={{ display:'flex', gap:4, background:'#f3f4f6', borderRadius:10, padding:4, marginBottom:20, flexWrap:'wrap' }}>
            {[['overview','📊 Overview'],['stories','🙋 Success Stories'],['guide','📅 Week-by-Week Guide'],['calculator','🧮 Profit Calculator']].map(([id,label]) => (
              <button key={id} onClick={() => setTab(id)}
                style={{ background:tab===id?'white':'none', border:'none', borderRadius:8, padding:'8px 14px', fontWeight:tab===id?600:400, color:tab===id?'#2d6a2d':'#6b7280', boxShadow:tab===id?'0 1px 3px rgba(0,0,0,0.1)':'none', fontSize:13, cursor:'pointer' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {tab === 'overview' && (
            <div className="card">
              <h3 style={{ fontWeight:700, marginBottom:12 }}>Why {data.crop} is a good choice for you</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:12 }}>
                {[
                  { icon:'✅', text:`${data.district_success_rate}% of farmers who tried it in your area made profit` },
                  { icon:'💰', text:`Estimated profit ₹${(data.state_avg_profit/1000).toFixed(0)}K per acre at current prices` },
                  { icon:'📅', text:`Season: ${data.season} — takes about ${data.duration_days} days` },
                  { icon:'🛡️', text:`PMFBY crop insurance available — pay just 1.5-2% premium, full crop covered` },
                  { icon:'📞', text:`Your local Krishi Vigyan Kendra (KVK) gives free technical support` },
                  data.msp > 0
                    ? { icon:'🏛️', text:`Government MSP of ₹${data.msp.toLocaleString()}/qtl — guaranteed minimum price` }
                    : { icon:'🤝', text:`FPOs and companies offer contract farming — guaranteed price before sowing` },
                ].map((item, i) => (
                  <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'10px 12px', background:'#f9fafb', borderRadius:8 }}>
                    <span style={{ fontSize:18 }}>{item.icon}</span>
                    <span style={{ fontSize:13, color:'#374151', lineHeight:1.6 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stories tab — same as before */}
          {tab === 'stories' && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {data.stories.map((story, i) => (
                <div key={i} className="card">
                  <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:10 }}>
                    <div style={{ width:44, height:44, borderRadius:'50%', background:'#e8f5e9', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#2d6a2d', fontSize:18, flexShrink:0 }}>
                      {story.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight:700 }}>{story.name}</div>
                      <div style={{ fontSize:12, color:'#6b7280' }}>📍 {story.district} · {story.acres} acres · {story.year}</div>
                    </div>
                    <div style={{ marginLeft:'auto', textAlign:'right' }}>
                      <div style={{ fontWeight:700, color:'#2d6a2d', fontSize:18 }}>{story.profit}</div>
                      <div style={{ fontSize:11, color:'#9ca3af' }}>profit earned</div>
                    </div>
                  </div>
                  <blockquote style={{ borderLeft:'3px solid #4caf50', paddingLeft:12, margin:0, fontStyle:'italic', color:'#374151', fontSize:14, lineHeight:1.7 }}>
                    "{story.quote}"
                  </blockquote>
                </div>
              ))}
            </div>
          )}

          {/* Guide tab — same as before */}
          {tab === 'guide' && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {data.weekly_guide.map((step, i) => (
                <div key={i} className="card" style={{ display:'flex', gap:16 }}>
                  <div style={{ minWidth:80, textAlign:'center' }}>
                    <div style={{ background:'#e8f5e9', color:'#2d6a2d', borderRadius:8, padding:'6px 10px', fontWeight:700, fontSize:13 }}>Week {step.week}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight:700, marginBottom:4 }}>{step.task}</div>
                    <p style={{ fontSize:13, color:'#374151', lineHeight:1.6 }}>{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Calculator tab — same as before */}
          {tab === 'calculator' && (
            <div className="card">
              <h3 style={{ fontWeight:700, marginBottom:16 }}>Calculate your potential profit</h3>
              <div className="form-group" style={{ maxWidth:300 }}>
                <label>Your land size (acres)</label>
                <input type="number" min="0.5" max="50" step="0.5" value={calcAcres} onChange={e => setCalcAcres(parseFloat(e.target.value))} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12, marginTop:16 }}>
                {[
                  { label:'Minimum Expected Profit', val:`₹${Math.max(0,minProfit).toLocaleString()}`, color:'#6b7280', desc:'If prices are low' },
                  { label:'Maximum Expected Profit', val:`₹${maxProfit.toLocaleString()}`,            color:'#2d6a2d', desc:'If prices are good' },
                  { label:'Investment Required',     val:`₹${(data.profit_calculator.investment_range[0]*calcAcres).toLocaleString()} – ₹${(data.profit_calculator.investment_range[1]*calcAcres).toLocaleString()}`, color:'#e65100', desc:'Approx cost' },
                ].map(s => (
                  <div key={s.label} style={{ background:'#f9fafb', borderRadius:10, padding:16, textAlign:'center' }}>
                    <div style={{ fontSize:11, color:'#9ca3af', marginBottom:6 }}>{s.label}</div>
                    <div style={{ fontWeight:800, fontSize:18, color:s.color }}>{s.val}</div>
                    <div style={{ fontSize:11, color:'#9ca3af', marginTop:4 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:16, padding:14, background:'#fff3e0', borderRadius:8, fontSize:13, color:'#374151' }}>
                💡 Tip: Take PMFBY crop insurance before sowing. Even if prices crash, you are protected. Premium is just 1.5-2%.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}