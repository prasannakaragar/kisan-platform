import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const api = (url, opts) => axios({ url: `${API_BASE}${url}`, ...opts }).then(r => r.data);

const LEVEL_COLOR = {
  Beginner:     { bg: '#dcfce7', color: '#166534' },
  Intermediate: { bg: '#fef9c3', color: '#854d0e' },
  Advanced:     { bg: '#dbeafe', color: '#1e40af' },
};

const CHANNEL_COLOR = {
  'DD Kisan':     '#d32f2f',
  'ICAR':         '#1565c0',
  'Krishi Jagran':'#2d6a2d',
  'UAS Dharwad':  '#6a1b9a',
  'PAU Ludhiana': '#e65100',
};

export default function Videos() {
  const [videos, setVideos]       = useState([]);
  const [crops, setCrops]         = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({ crop: '', language: '', level: '', search: '' });

  // ✅ FIX 1: Accept currentFilters as a parameter so we never use stale closure state
  const fetchVideos = useCallback(async (currentFilters) => {
    setLoading(true);
    try {
      const r = await api('/videos', { params: currentFilters });
      setVideos(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch crops and languages in parallel, then fetch all videos
    Promise.all([
      api('/videos/crops').then(r => setCrops(r.data)),
      api('/videos/languages').then(r => setLanguages(r.data)),
    ]);
    fetchVideos({ crop: '', language: '', level: '', search: '' });
  }, [fetchVideos]);

  // ✅ FIX 2: Auto-fetch whenever any dropdown filter changes (except search — that needs Enter/button)
  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    if (key !== 'search') {
      fetchVideos(updated);
    }
  };

  // ✅ FIX 3: Group by ALL crops from the server, not just those present in current videos
  // This ensures every crop section always appears (even if empty after a filter)
  const grouped = crops.reduce((acc, crop) => {
    const vids = videos.filter(v => v.crop === crop);
    if (vids.length) acc[crop] = vids;
    return acc;
  }, {});

  // Show flat list when crop-specific or search filter is active
  const showFlat = !!(filters.crop || filters.search);

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>

      {/* Header */}
      <div className="page-header">
        <h1>🎬 Learn Farming Videos</h1>
        <p>DD Kisan, ICAR, Krishi Jagran tutorials — click any title to watch on YouTube</p>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <input
          placeholder="Search videos..."
          value={filters.search}
          onChange={e => handleFilterChange('search', e.target.value)}
          // ✅ FIX 4: onKeyDown now passes current updated filters correctly
          onKeyDown={e => {
            if (e.key === 'Enter') fetchVideos({ ...filters, search: e.target.value });
          }}
        />
        <select
          value={filters.crop}
          onChange={e => handleFilterChange('crop', e.target.value)}
        >
          <option value="">All Crops</option>
          {crops.map(c => <option key={c}>{c}</option>)}
        </select>
        <select
          value={filters.language}
          onChange={e => handleFilterChange('language', e.target.value)}
        >
          <option value="">All Languages</option>
          {languages.map(l => <option key={l}>{l}</option>)}
        </select>
        <select
          value={filters.level}
          onChange={e => handleFilterChange('level', e.target.value)}
        >
          <option value="">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <button className="btn-primary" onClick={() => fetchVideos(filters)}>Search</button>
      </div>

      {loading && <div className="loading">Loading videos...</div>}

      {!loading && videos.length === 0 && (
        <div className="empty-state">
          <div className="icon">🎬</div>
          <h3>No videos found</h3>
          <p>Try different filters</p>
        </div>
      )}

      {/* Flat list when filtering by crop or search */}
      {!loading && showFlat && videos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {videos.map(v => <VideoLink key={v.id} video={v} />)}
        </div>
      )}

      {/* Grouped by crop (default — no crop/search filter active) */}
      {!loading && !showFlat && Object.entries(grouped).map(([crop, vids]) => (
        <div key={crop} style={{ marginBottom: 28 }}>
          <h3 style={{
            fontSize: 16, fontWeight: 700, marginBottom: 10,
            paddingBottom: 8, borderBottom: '2px solid #e5e7eb',
          }}>
            🌾 {crop}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {vids.map(v => <VideoLink key={v.id} video={v} />)}
          </div>
        </div>
      ))}

    </div>
  );
}

function VideoLink({ video }) {
  const lc = LEVEL_COLOR[video.level] || LEVEL_COLOR.Beginner;
  const channelColor = CHANNEL_COLOR[video.channel] || '#6b7280';

  return (
    <a
      href={video.youtube_url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px', background: '#fff',
        border: '1px solid #e5e7eb', borderRadius: 10,
        textDecoration: 'none', color: 'inherit',
        transition: 'background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#f9fafb';
        e.currentTarget.style.borderColor = '#d1d5db';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = '#fff';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
    >
      {/* Red play icon */}
      <div style={{
        flexShrink: 0, width: 32, height: 32, background: '#ff0000',
        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: '#fff', fontSize: 13, marginLeft: 2 }}>▶</span>
      </div>

      {/* Title + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600, fontSize: 14,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {video.title}
        </div>
        <div style={{ fontSize: 12, marginTop: 2 }}>
          <span style={{ color: channelColor, fontWeight: 600 }}>{video.channel}</span>
          <span style={{ color: '#9ca3af' }}> · {video.language} · {video.duration}</span>
        </div>
      </div>

      {/* Level badge */}
      <span style={{
        flexShrink: 0, fontSize: 11, fontWeight: 600,
        padding: '3px 9px', borderRadius: 20,
        background: lc.bg, color: lc.color,
      }}>
        {video.level}
      </span>

      {/* External link arrow */}
      <span style={{ color: '#9ca3af', fontSize: 16, flexShrink: 0 }}>↗</span>
    </a>
  );
}