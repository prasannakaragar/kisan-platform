import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const api = (url, opts) => axios({ url: `${API_BASE}${url}`, ...opts }).then(r => r.data);
const LEVEL_COLOR = { Beginner:'badge-green', Intermediate:'badge-amber', Advanced:'badge-blue' };

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [crops, setCrops] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ crop:'', language:'', level:'', search:'' });
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    Promise.all([
      api('/videos/crops').then(r => setCrops(r.data)),
      api('/videos/languages').then(r => setLanguages(r.data))
    ]);
    fetchVideos();
  }, []);

  async function fetchVideos() {
    setLoading(true);
    try { const r = await api('/videos', { params: filters }); setVideos(r.data); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  }

  const grouped = crops.reduce((acc, crop) => {
    const vids = videos.filter(v => v.crop === crop);
    if (vids.length > 0) acc[crop] = vids;
    return acc;
  }, {});

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px' }}>
      <div className="page-header">
        <h1>🎬 Learn Farming Videos</h1>
        <p>Best tutorials from DD Kisan, ICAR, Krishi Jagran — in your local language</p>
      </div>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
        {[['📺 DD Kisan','#d32f2f'],['🔬 ICAR','#1565c0'],['🌾 Krishi Jagran','#2d6a2d'],['🎓 UAS Dharwad','#6a1b9a']].map(([name, color]) => (
          <span key={name} style={{ background:'white', border:`1.5px solid ${color}`, color, borderRadius:20, padding:'4px 14px', fontSize:13, fontWeight:500 }}>{name}</span>
        ))}
      </div>

      <div className="filter-bar">
        <input placeholder="Search videos..." value={filters.search} onChange={e=>setFilters(f=>({...f,search:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&fetchVideos()} />
        <select value={filters.crop} onChange={e=>setFilters(f=>({...f,crop:e.target.value}))}>
          <option value="">All Crops</option>
          {crops.map(c=><option key={c}>{c}</option>)}
        </select>
        <select value={filters.language} onChange={e=>setFilters(f=>({...f,language:e.target.value}))}>
          <option value="">All Languages</option>
          {languages.map(l=><option key={l}>{l}</option>)}
        </select>
        <select value={filters.level} onChange={e=>setFilters(f=>({...f,level:e.target.value}))}>
          <option value="">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <button className="btn-primary" onClick={fetchVideos}>Search</button>
      </div>

      {loading && <div className="loading">Loading videos...</div>}
      {!loading && videos.length === 0 && (
        <div className="empty-state"><div className="icon">🎬</div><h3>No videos found</h3><p>Try different filters</p></div>
      )}

      {filters.crop || filters.search ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {videos.map(v => <VideoCard key={v.id} video={v} onPlay={setPlaying} />)}
        </div>
      ) : (
        Object.entries(grouped).map(([crop, vids]) => (
          <div key={crop} style={{ marginBottom:32 }}>
            <h3 style={{ fontSize:17, fontWeight:700, marginBottom:12, paddingBottom:8, borderBottom:'2px solid #e5e7eb' }}>🌾 {crop}</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
              {vids.map(v => <VideoCard key={v.id} video={v} onPlay={setPlaying} />)}
            </div>
          </div>
        ))
      )}

      {playing && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={e=>{if(e.target===e.currentTarget)setPlaying(null);}}>
          <div style={{ background:'white', borderRadius:16, maxWidth:700, width:'100%', overflow:'hidden' }}>
            <div style={{ background:'#000', position:'relative', paddingBottom:'56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${playing.youtube_id}?autoplay=1`}
                title={playing.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none' }}
              />
            </div>
            <div style={{ padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:700 }}>{playing.title}</div>
                <div style={{ fontSize:13, color:'#6b7280' }}>{playing.channel} · {playing.duration}</div>
              </div>
              <button className="btn-secondary btn-sm" onClick={()=>setPlaying(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VideoCard({ video, onPlay }) {
  return (
    <div className="card" style={{ padding:0, overflow:'hidden', cursor:'pointer' }} onClick={()=>onPlay(video)}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';}}
      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
      <div style={{ position:'relative', background:'#000', paddingBottom:'56.25%' }}>
        <img src={video.thumbnail} alt={video.title} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.85 }} onError={e=>{e.target.style.display='none';}} />
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ width:44, height:44, background:'rgba(255,0,0,0.85)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ color:'white', fontSize:18, marginLeft:3 }}>▶</span>
          </div>
        </div>
        <div style={{ position:'absolute', bottom:8, right:8, background:'rgba(0,0,0,0.7)', color:'white', fontSize:11, padding:'2px 6px', borderRadius:4 }}>{video.duration}</div>
      </div>
      <div style={{ padding:'12px 14px' }}>
        <div style={{ display:'flex', gap:6, marginBottom:6, flexWrap:'wrap' }}>
          <span className={`badge ${LEVEL_COLOR[video.level] || 'badge-green'}`}>{video.level}</span>
          <span className="tag">{video.language}</span>
        </div>
        <div style={{ fontWeight:600, fontSize:14, lineHeight:1.4, marginBottom:4 }}>{video.title}</div>
        <div style={{ fontSize:12, color:'#9ca3af' }}>{video.channel} · {video.views} views</div>
      </div>
    </div>
  );
}