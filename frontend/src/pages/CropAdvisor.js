import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = (url, opts) => axios({ url: `/api${url}`, ...opts }).then(r => r.data);
const RISK_COLOR = { low:'#2d6a2d', medium:'#e65100', high:'#c62828' };
const RISK_BG = { low:'#e8f5e9', medium:'#fff3e0', high:'#ffebee' };
const WATER_ICON = { low:'💧', medium:'💧💧', high:'💧💧💧' };

export default function CropAdvisor() {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [form, setForm] = useState({ state:'Karnataka', district:'Raichur', land_acres:2, soil_type:'Black cotton', water_availability:'medium', season:'' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api('/advisor/states').then(r => setStates(r.data));
  }, []);

  useEffect(() => {
    if (form.state) {
      api(`/advisor/districts/${form.state}`).then(r => setDistricts(r.data)).catch(() => setDistricts([]));
    }
  }, [form.state]);

  async function getRecommendations() {
    setLoading(true); setResults(null);
    try { const r = await api('/advisor/recommend', { method:'POST', data:form }); setResults(r.data); if(r.data.length>0) setSelected(r.data[0]); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px' }}>
      <div className="page-header">
        <h1>🤖 AI Crop Advisor</h1>
        <p>Tell us about your land — get the most profitable crop recommendation for your exact situation</p>
      </div>

      {/* Input form */}
      <div className="card" style={{ marginBottom:24 }}>
        <h3 style={{ fontWeight:700, marginBottom:16 }}>Tell us about your farm</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Your State</label>
            <select value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value,district:''}))}>
              <option value="">Select state</option>
              {states.map(s=><option key={s}>{s}</option>)}
              <option value="Other">Other state</option>
            </select>
          </div>
          <div className="form-group">
            <label>Your District</label>
            <select value={form.district} onChange={e=>setForm(f=>({...f,district:e.target.value}))}>
              <option value="">Select district</option>
              {districts.map(d=><option key={d}>{d}</option>)}
              <option value="Other">Other district</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Land you have (acres)</label>
            <input type="number" min="0.5" max="100" step="0.5" value={form.land_acres} onChange={e=>setForm(f=>({...f,land_acres:parseFloat(e.target.value)}))} />
          </div>
          <div className="form-group">
            <label>Soil Type</label>
            <select value={form.soil_type} onChange={e=>setForm(f=>({...f,soil_type:e.target.value}))}>
              {['Black cotton','Red loamy','Sandy loam','Alluvial','Clay','Mixed'].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Water Availability</label>
            <select value={form.water_availability} onChange={e=>setForm(f=>({...f,water_availability:e.target.value}))}>
              <option value="high">High (canal / borewell)</option>
              <option value="medium">Medium (seasonal / limited)</option>
              <option value="low">Low (rainfed only)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Season (optional)</label>
            <select value={form.season} onChange={e=>setForm(f=>({...f,season:e.target.value}))}>
              <option value="">Any season</option>
              <option value="Kharif">Kharif (June-Oct)</option>
              <option value="Rabi">Rabi (Oct-Mar)</option>
            </select>
          </div>
        </div>
        <button className="btn-primary" style={{ fontSize:15, padding:'12px 28px' }} onClick={getRecommendations} disabled={loading}>
          {loading ? '🔍 Analyzing...' : '🤖 Get Recommendations'}
        </button>
      </div>

      {results && (
        <div>
          <h2 style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>Recommendations for your {form.land_acres} acre farm</h2>
          <p style={{ color:'#6b7280', fontSize:13, marginBottom:16 }}>Sorted by profit potential · {form.state} · {form.district || 'All districts'}</p>
          <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap:20 }}>
            {/* List */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {results.map((crop, i) => (
                <div key={crop.crop} className="card" onClick={()=>setSelected(crop)} style={{ cursor:'pointer', border: selected?.crop===crop.crop ? '2px solid #2d6a2d' : '1px solid #e5e7eb', transition:'all 0.15s' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10 }}>
                    <div>
                      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                        {i===0 && <span className="badge badge-green">🏆 Best Choice</span>}
                        <span style={{ background:RISK_BG[crop.risk], color:RISK_COLOR[crop.risk] }} className="badge">Risk: {crop.risk}</span>
                        <span className="tag">{crop.season}</span>
                        <span className="tag">{WATER_ICON[crop.water_need]} water</span>
                      </div>
                      <div style={{ fontWeight:700, fontSize:17 }}>{crop.crop}</div>
                      <div style={{ fontSize:13, color:'#6b7280' }}>{crop.duration_days} days · {crop.soil} soil</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:22, fontWeight:800, color:'#2d6a2d' }}>₹{crop.expected_profit.toLocaleString()}</div>
                      <div style={{ fontSize:11, color:'#9ca3af' }}>expected profit</div>
                      <div style={{ fontSize:12, color:'#6b7280', marginTop:2 }}>Invest: ₹{crop.total_investment.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail */}
            {selected && (
              <div className="card" style={{ position:'sticky', top:76, alignSelf:'flex-start' }}>
                <h3 style={{ fontWeight:700, fontSize:18, marginBottom:4 }}>{selected.crop}</h3>
                <p style={{ fontSize:13, color:'#6b7280', marginBottom:16 }}>{selected.season} · {selected.duration_days} days</p>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                  {[
                    { label:'Investment', val:`₹${selected.total_investment.toLocaleString()}` },
                    { label:'Expected Revenue', val:`₹${selected.total_revenue.toLocaleString()}` },
                    { label:'Expected Profit', val:`₹${selected.expected_profit.toLocaleString()}` },
                    { label:'Yield', val:`${selected.expected_yield_quintal * form.land_acres} qtl` }
                  ].map(s=>(
                    <div key={s.label} style={{ background:'#f9fafb', borderRadius:8, padding:12, textAlign:'center' }}>
                      <div style={{ fontSize:11, color:'#9ca3af', marginBottom:3 }}>{s.label}</div>
                      <div style={{ fontWeight:700, fontSize:16, color:'#2d6a2d' }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background:'#f0fdf4', borderRadius:8, padding:14, marginBottom:12 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'#2d6a2d', marginBottom:6 }}>💡 EXPERT TIP</div>
                  <p style={{ fontSize:13, color:'#374151', lineHeight:1.6 }}>{selected.tips}</p>
                </div>

                <div style={{ display:'flex', gap:16, fontSize:13, color:'#6b7280' }}>
                  <div>Water: {WATER_ICON[selected.water_need]} {selected.water_need}</div>
                  <div>Risk: <span style={{ color:RISK_COLOR[selected.risk], fontWeight:600 }}>{selected.risk}</span></div>
                  <div>Market: ₹{selected.market_price_per_quintal}/qtl</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
