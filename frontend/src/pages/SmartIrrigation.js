/**
 * SmartIrrigation.js
 * Page: Smart Irrigation Recommendation
 * Route: /irrigation
 *
 * Fetches available crop/soil options from the backend (/api/irrigation/options)
 * then POSTs form data to /api/irrigation/predict and displays the result.
 */

import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ─── Helper: POST to backend ──────────────────────────────────────────────────
async function postJson(url, body) {
  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

// ─── Sub-component: Result Card ───────────────────────────────────────────────
function ResultCard({ result }) {
  const noRain = result.message === 'No irrigation needed today';

  return (
    <div
      style={{
        marginTop: 24,
        padding: '20px 24px',
        borderRadius: 12,
        border: `2px solid ${noRain ? '#4caf50' : '#1565c0'}`,
        background: noRain ? '#e8f5e9' : '#e3f2fd',
        animation: 'fadeIn 0.35s ease',
      }}
    >
      {/* Icon + headline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <span style={{ fontSize: 40 }}>{noRain ? '🌧️' : '💧'}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: noRain ? '#2d6a2d' : '#1565c0' }}>
            {result.message}
          </div>
          {noRain && (
            <div style={{ fontSize: 13, color: '#4a7c59', marginTop: 2 }}>
              {result.details.reason}
            </div>
          )}
        </div>
      </div>

      {/* Breakdown (only when irrigation is needed) */}
      {!noRain && result.details && (
        <div
          style={{
            background: 'white',
            borderRadius: 8,
            padding: '14px 16px',
            fontSize: 13,
            color: '#374151',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px 16px',
          }}
        >
          <Detail icon="🌾" label="Crop base water"  value={`${result.details.baseCropWater} min`} />
          <Detail icon="🪨" label="Soil factor"      value={`× ${result.details.soilFactor}`} />
          <Detail icon="🌡️" label="Weather factor"   value={`× ${result.details.weatherFactor}`} />
          <Detail icon="🌡️" label="Temperature"      value={`${result.details.temperature}°C`} />
          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e5e7eb', paddingTop: 8, marginTop: 4 }}>
            <span style={{ color: '#6b7280' }}>Formula: </span>
            <code style={{ fontSize: 12, background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>
              {result.details.formula}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <span>{icon}</span>
      <span style={{ color: '#6b7280' }}>{label}:</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function SmartIrrigation() {
  // Options fetched from backend
  const [crops,     setCrops]     = useState([]);
  const [soilTypes, setSoilTypes] = useState([]);
  const [optLoading, setOptLoading] = useState(true);

  // Form state
  const [form, setForm] = useState({
    cropType:       '',
    soilType:       '',
    temperature:    '',
    rainPrediction: 'no',
  });

  // UI state
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState('');
  const [touched,  setTouched]  = useState({});   // track which fields were blurred

  // ── Load dropdown options on mount ──────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/irrigation/options`)
      .then(r => r.json())
      .then(data => {
        setCrops(data.crops || []);
        setSoilTypes(data.soilTypes || []);
      })
      .catch(() => {
        // Fallback to minimal set if network fails
        setCrops([
          { value: 'rice',    label: 'Rice' },
          { value: 'wheat',   label: 'Wheat' },
          { value: 'maize',   label: 'Maize' },
          { value: 'cotton',  label: 'Cotton' },
        ]);
        setSoilTypes([
          { value: 'sandy', label: 'Sandy' },
          { value: 'loamy', label: 'Loamy' },
          { value: 'clay',  label: 'Clay' },
        ]);
      })
      .finally(() => setOptLoading(false));
  }, []);

  // ── Field change handler ─────────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
    setResult(null);
  }

  function handleBlur(e) {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  }

  // ── Client-side validation ───────────────────────────────────────────────────
  function validate() {
    if (!form.cropType)   return 'Please select a crop type.';
    if (!form.soilType)   return 'Please select a soil type.';
    if (form.temperature === '') return 'Please enter the current temperature.';
    const t = Number(form.temperature);
    if (isNaN(t))           return 'Temperature must be a number.';
    if (t < -10 || t > 60) return 'Temperature must be between -10°C and 60°C.';
    return null;
  }

  // ── Submit handler ────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();

    // Mark all fields as touched so validation hints show
    setTouched({ cropType: true, soilType: true, temperature: true });

    const validErr = validate();
    if (validErr) { setError(validErr); return; }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await postJson(`${API_BASE}/irrigation/predict`, {
        cropType:       form.cropType,
        soilType:       form.soilType,
        temperature:    Number(form.temperature),
        rainPrediction: form.rainPrediction,
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '24px 16px' }}>

      {/* Page header */}
      <div className="page-header">
        <h1>💧 Smart Irrigation Recommendation</h1>
        <p>Get an accurate irrigation schedule based on your crop, soil, and current weather conditions.</p>
      </div>

      {/* Info banner */}
      <div
        className="card"
        style={{ background: '#e3f2fd', border: '1px solid #90caf9', marginBottom: 24 }}
      >
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
          💡 Why smart irrigation matters
        </div>
        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>
          Over-irrigation wastes water and causes root rot. Under-irrigation reduces yield.
          This tool uses crop-specific water needs, soil absorption rates, and real-time
          temperature data to recommend the exact minutes to irrigate — saving water up to 30%.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="irrigation-grid">

        {/* ── Form ─────────────────────────────────────────────────────────────── */}
        <div className="card">
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, color: '#2d6a2d' }}>
            🌾 Enter Farm Details
          </h2>

          {optLoading && (
            <div className="loading" style={{ padding: 20 }}>Loading options...</div>
          )}

          {!optLoading && (
            <form onSubmit={handleSubmit} noValidate>

              {/* Crop Type */}
              <div className="form-group">
                <label htmlFor="cropType">Crop Type *</label>
                <select
                  id="cropType"
                  name="cropType"
                  value={form.cropType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={touched.cropType && !form.cropType
                    ? { borderColor: '#c62828' } : {}}
                >
                  <option value="">— Select crop —</option>
                  {crops.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                {touched.cropType && !form.cropType && (
                  <span style={{ color: '#c62828', fontSize: 12 }}>Required</span>
                )}
              </div>

              {/* Soil Type */}
              <div className="form-group">
                <label htmlFor="soilType">Soil Type *</label>
                <select
                  id="soilType"
                  name="soilType"
                  value={form.soilType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={touched.soilType && !form.soilType
                    ? { borderColor: '#c62828' } : {}}
                >
                  <option value="">— Select soil type —</option>
                  {soilTypes.map(s => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                      {s.factor ? ` (factor: ${s.factor})` : ''}
                    </option>
                  ))}
                </select>
                {touched.soilType && !form.soilType && (
                  <span style={{ color: '#c62828', fontSize: 12 }}>Required</span>
                )}
              </div>

              {/* Temperature */}
              <div className="form-group">
                <label htmlFor="temperature">Current Temperature (°C) *</label>
                <input
                  id="temperature"
                  name="temperature"
                  type="number"
                  min="-10"
                  max="60"
                  step="0.1"
                  placeholder="e.g. 32"
                  value={form.temperature}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={touched.temperature && form.temperature === ''
                    ? { borderColor: '#c62828' } : {}}
                />
                {touched.temperature && form.temperature === '' && (
                  <span style={{ color: '#c62828', fontSize: 12 }}>Required</span>
                )}
              </div>

              {/* Rain Prediction Toggle */}
              <div className="form-group">
                <label>Rain Expected Today?</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {['no', 'yes'].map(val => (
                    <label
                      key={val}
                      style={{
                        display:       'flex',
                        alignItems:    'center',
                        gap:           8,
                        cursor:        'pointer',
                        padding:       '10px 20px',
                        borderRadius:  8,
                        border:        `2px solid ${form.rainPrediction === val ? '#2d6a2d' : '#e5e7eb'}`,
                        background:    form.rainPrediction === val ? '#e8f5e9' : 'white',
                        fontWeight:    form.rainPrediction === val ? 600 : 400,
                        color:         form.rainPrediction === val ? '#2d6a2d' : '#374151',
                        fontSize:      14,
                        flex:          1,
                        justifyContent:'center',
                        transition:    'all 0.15s',
                      }}
                    >
                      <input
                        type="radio"
                        name="rainPrediction"
                        value={val}
                        checked={form.rainPrediction === val}
                        onChange={handleChange}
                        style={{ display: 'none' }}
                      />
                      {val === 'yes' ? '🌧️ Yes' : '☀️ No'}
                    </label>
                  ))}
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="error-msg" role="alert">{error}</div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="btn-primary btn-full"
                disabled={loading}
                style={{
                  marginTop:     4,
                  padding:       '12px 0',
                  fontSize:      15,
                  fontWeight:    700,
                  opacity:       loading ? 0.7 : 1,
                  position:      'relative',
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <LoadingSpinner />
                    Calculating...
                  </span>
                ) : '💧 Get Recommendation'}
              </button>
            </form>
          )}
        </div>

        {/* ── Result + Reference Panel ──────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Result */}
          {result ? (
            <ResultCard result={result} />
          ) : (
            <div
              className="card"
              style={{
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                justifyContent: 'center',
                minHeight:      180,
                color:          '#9ca3af',
                gap:            12,
              }}
            >
              <span style={{ fontSize: 48 }}>💧</span>
              <span style={{ fontSize: 14 }}>
                Fill in your farm details and click<br />"Get Recommendation"
              </span>
            </div>
          )}

          {/* Quick reference card */}
          <div className="card" style={{ background: '#f9fafb' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: '#374151' }}>
              📊 Quick Reference
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#e8f5e9' }}>
                  <th style={thStyle}>Condition</th>
                  <th style={thStyle}>Factor</th>
                  <th style={thStyle}>Effect</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Sandy soil',    '× 1.3', '↑ More water'],
                  ['Loamy soil',    '× 1.0', 'Baseline'],
                  ['Clay soil',     '× 0.8', '↓ Less water'],
                  ['Temp > 35°C',   '× 1.3', '↑ More water'],
                  ['Temp 25–35°C',  '× 1.1', '↑ Slightly more'],
                  ['Temp < 25°C',   '× 0.9', '↓ Less water'],
                  ['Rain expected', '—',     'Skip irrigation'],
                ].map(([cond, factor, effect]) => (
                  <tr key={cond} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={tdStyle}>{cond}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#1565c0' }}>{factor}</td>
                    <td style={{ ...tdStyle, color: '#2d6a2d' }}>{effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Responsive grid fix */}
      <style>{`
        @media (max-width: 700px) {
          .irrigation-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ─── Inline table styles ──────────────────────────────────────────────────────
const thStyle = {
  padding:   '7px 10px',
  textAlign: 'left',
  fontWeight: 600,
  color:     '#2d6a2d',
  fontSize:  12,
};
const tdStyle = {
  padding: '6px 10px',
  color:   '#374151',
};

// ─── Tiny SVG spinner ─────────────────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24" fill="none"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
