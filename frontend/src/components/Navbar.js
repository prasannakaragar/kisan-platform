import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: '🏠 Home' },
  { path: '/prices', label: '📈 Prices' },
  { path: '/schemes', label: '🏛️ Schemes' },
  { path: '/labour', label: '👷 Labour' },
  { path: '/marketplace', label: '🛒 Market' },
  { path: '/barter', label: '🔄 Barter' },
  { path: '/advisor', label: '🤖 Advisor' },
  { path: '/fear', label: '💪 Fear' },
  { path: '/videos', label: '🎬 Videos' },
  { path: '/finance', label: '💰 Finance' },
  { path: '/business', label: '🏪 Business' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{ background:'white', borderBottom:'1px solid #e5e7eb', position:'sticky', top:0, zIndex:100, boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 12px', display:'flex', alignItems:'center', height:56 }}>
        <NavLink to="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', marginRight:16, flexShrink:0 }}>
          <span style={{ fontSize:24 }}>🌾</span>
          <div>
            <div style={{ fontWeight:700, fontSize:15, color:'#2d6a2d', lineHeight:1.1 }}>Kisan Platform</div>
            <div style={{ fontSize:10, color:'#6b7280' }}>ಕಿಸಾನ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್</div>
          </div>
        </NavLink>

        <div style={{ display:'flex', gap:2, flex:1, alignItems:'center', overflowX:'auto' }} className="desktop-nav">
          {NAV_ITEMS.slice(1).map(item => (
            <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
              padding:'5px 9px', borderRadius:7, fontSize:12, fontWeight:isActive?600:400,
              color:isActive?'#2d6a2d':'#374151', background:isActive?'#e8f5e9':'transparent',
              textDecoration:'none', whiteSpace:'nowrap'
            })}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <button onClick={()=>setMenuOpen(!menuOpen)} style={{ background:'none', border:'none', fontSize:22, padding:4, marginLeft:'auto', display:'none', cursor:'pointer' }} className="mobile-menu-btn">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div style={{ background:'white', borderTop:'1px solid #e5e7eb', padding:'8px 12px 16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.path} to={item.path} onClick={()=>setMenuOpen(false)}
              style={({ isActive }) => ({ display:'block', padding:'10px 12px', borderRadius:8, fontSize:14, fontWeight:isActive?600:400, color:isActive?'#2d6a2d':'#374151', background:isActive?'#e8f5e9':'transparent', textDecoration:'none' })}>
              {item.label}
            </NavLink>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
