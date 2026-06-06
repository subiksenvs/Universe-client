import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiGlobe, FiMonitor, FiHeart, FiMusic, FiCoffee, FiCpu } from 'react-icons/fi';

export default function Rooms() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(sessionStorage.getItem('userInfo'));

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const rooms = [
    { id: 'global', name: 'Global Random', icon: <FiGlobe />, desc: 'Connect with anyone across the Universe.', color: '#00e5ff' },
    { id: 'gaming', name: 'Gaming Zone', icon: <FiMonitor />, desc: 'Find your next duo or talk about the latest drops.', color: '#10b981' },
    { id: 'tech', name: 'Tech Talk', icon: <FiCpu />, desc: 'Discuss AI, coding, hardware, and the future.', color: '#3b82f6' },
    { id: 'dating', name: 'Blind Date', icon: <FiHeart />, desc: 'Shoot your shot with a total stranger.', color: '#ef4444' },
    { id: 'music', name: 'Music Lounge', icon: <FiMusic />, desc: 'Jam out, share tracks, and vibe together.', color: '#d946ef' },
    { id: 'chill', name: 'Late Night Chill', icon: <FiCoffee />, desc: 'Deep conversations and relaxed vibes.', color: '#f59e0b' }
  ];

  if (!currentUser) return null;

  return (
    <div className="app-container" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem' }} onClick={() => navigate('/')}>
            <FiArrowLeft /> Back
          </button>
          <h2>Explore Rooms</h2>
        </div>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.35rem 0.85rem', borderRadius: '2rem',
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.05)',
          color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500
        }}>
          {currentUser.avatar 
            ? <img src={currentUser.avatar} alt="" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
            : <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>{currentUser.name.charAt(0).toUpperCase()}</div>
          }
          {currentUser.name}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {rooms.map(room => (
          <div 
            key={room.id}
            className="glass-panel room-card"
            style={{ 
              padding: '2rem', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderTop: `4px solid ${room.color}`
            }}
            onClick={() => navigate(`/chat?topic=${room.id}`)}
          >
            <div style={{ fontSize: '3.5rem', color: room.color, marginBottom: '1rem' }}>
              {room.icon}
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>{room.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{room.desc}</p>
            <button className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%', background: room.color, boxShadow: `0 4px 15px ${room.color}40` }}>
              Join Room
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
