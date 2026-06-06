import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiGlobe, FiMonitor, FiHeart, FiMusic, FiCoffee, FiCpu, FiUsers } from 'react-icons/fi';
import { io } from 'socket.io-client';

export default function Rooms() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(sessionStorage.getItem('userInfo'));
  const [roomCounts, setRoomCounts] = useState({});

  useEffect(() => {
    if (!currentUser) navigate('/');
  }, [currentUser, navigate]);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_SIGNALING_SERVER || 'http://localhost:4000';

    // Fetch initial counts
    fetch(`${apiUrl}/api/rooms/stats`)
      .then(r => r.json())
      .then(data => setRoomCounts(data))
      .catch(() => {});

    // Listen for live updates
    const socket = io(apiUrl);
    socket.on('room_counts_update', (counts) => {
      setRoomCounts({ ...counts });
    });

    return () => socket.disconnect();
  }, []);

  const rooms = [
    { id: 'global',  name: 'Global Random',    icon: <FiGlobe />,   desc: 'Connect with anyone across the Universe.',              color: '#00e5ff' },
    { id: 'gaming',  name: 'Gaming Zone',       icon: <FiMonitor />, desc: 'Find your next duo or talk about the latest drops.',    color: '#10b981' },
    { id: 'tech',    name: 'Tech Talk',         icon: <FiCpu />,     desc: 'Discuss AI, coding, hardware, and the future.',         color: '#3b82f6' },
    { id: 'dating',  name: 'Blind Date',        icon: <FiHeart />,   desc: 'Shoot your shot with a total stranger.',                color: '#ef4444' },
    { id: 'music',   name: 'Music Lounge',      icon: <FiMusic />,   desc: 'Jam out, share tracks, and vibe together.',             color: '#d946ef' },
    { id: 'chill',   name: 'Late Night Chill',  icon: <FiCoffee />,  desc: 'Deep conversations and relaxed vibes.',                 color: '#f59e0b' }
  ];

  if (!currentUser) return null;

  return (
    <div className="app-container" style={{ padding: 'clamp(1rem, 3vw, 2rem)', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.4rem 0.75rem', flexShrink: 0 }} onClick={() => navigate('/')}>
            <FiArrowLeft /> <span className="hide-on-mobile">Back</span>
          </button>
          <h2 style={{ fontSize: 'clamp(1rem, 5vw, 1.5rem)', whiteSpace: 'nowrap' }}>Explore Rooms</h2>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.35rem 0.85rem', borderRadius: '2rem',
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.05)',
          color: 'white', fontSize: '0.9rem', fontWeight: 500
        }}>
          {currentUser.avatar
            ? <img src={currentUser.avatar} alt="" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
            : <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>{currentUser.name.charAt(0).toUpperCase()}</div>
          }
          {currentUser.name}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '1rem' }}>
        {rooms.map(room => {
          const count = roomCounts[room.id] || 0;
          return (
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
                borderTop: `4px solid ${room.color}`,
                position: 'relative'
              }}
              onClick={() => navigate(`/chat?topic=${room.id}`)}
            >
              {/* Live count badge */}
              <div style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: count > 0 ? `${room.color}22` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${count > 0 ? room.color + '55' : 'rgba(255,255,255,0.1)'}`,
                color: count > 0 ? room.color : 'var(--text-muted)',
                padding: '0.2rem 0.6rem',
                borderRadius: '1rem',
                fontSize: '0.78rem',
                fontWeight: 600
              }}>
                {count > 0 && (
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: room.color,
                    display: 'inline-block',
                    boxShadow: `0 0 6px ${room.color}`,
                    animation: 'pulse-dot 1.5s infinite'
                  }} />
                )}
                <FiUsers size={11} />
                {count} {count === 1 ? 'person' : 'people'}
              </div>

              <div style={{ fontSize: '3.5rem', color: room.color, marginBottom: '1rem' }}>
                {room.icon}
              </div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>{room.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{room.desc}</p>
              <button
                className="btn btn-primary"
                style={{ marginTop: '1.5rem', width: '100%', background: room.color, boxShadow: `0 4px 15px ${room.color}40` }}
              >
                Join Room
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .room-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}
