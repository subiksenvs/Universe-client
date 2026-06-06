import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiVideo, FiUsers, FiGlobe, FiUser, FiLogOut } from 'react-icons/fi';

export default function Home() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState('none');
  const [formData, setFormData] = useState({ email: '', password: '', name: '', age: '', gender: '' });
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = sessionStorage.getItem('userInfo');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogout = () => {
    sessionStorage.removeItem('userInfo');
    setCurrentUser(null);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (authMode === 'guest') {
      if (formData.name && formData.age && formData.gender) {
        const guestInfo = {
          name: formData.name, age: formData.age, gender: formData.gender, isGuest: true
        };
        sessionStorage.setItem('userInfo', JSON.stringify(guestInfo));
        setCurrentUser(guestInfo);
        setAuthMode('none');
      } else {
        setError("Please fill out all fields.");
      }
      return;
    }

    try {
      const endpoint = authMode === 'login' ? '/api/login' : '/api/signup';
      const apiUrl = import.meta.env.VITE_SIGNALING_SERVER || 'http://localhost:4000';
      
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      sessionStorage.setItem('userInfo', JSON.stringify(data));
      setCurrentUser(data);
      setAuthMode('none');
    } catch (err) {
      setError(err.message);
    }
  };

  const renderModal = () => {
    if (authMode === 'none') return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>
            {authMode === 'login' && 'Welcome Back'}
            {authMode === 'signup' && 'Create Account'}
            {authMode === 'guest' && 'Guest Profile'}
          </h2>
          
          {error && <div style={{ color: '#ff4d4d', textAlign: 'center', background: 'rgba(255,0,0,0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>{error}</div>}

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {(authMode === 'login' || authMode === 'signup') && (
              <>
                <div className="form-group">
                  <label>Username or Email</label>
                  <input type="text" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="you@example.com or Username" />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                </div>
              </>
            )}

            {(authMode === 'signup' || authMode === 'guest') && (
              <>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" required maxLength="20" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Your Username" />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" required min="13" max="100" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} placeholder="e.g. 21" />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['Male', 'Female', 'Other'].map(g => (
                      <div key={g} onClick={() => setFormData({...formData, gender: g})} style={{ flex: 1, padding: '0.75rem', textAlign: 'center', borderRadius: '0.5rem', cursor: 'pointer', border: '1px solid', borderColor: formData.gender === g ? 'var(--primary)' : 'var(--glass-border)', background: formData.gender === g ? 'rgba(0, 229, 255, 0.2)' : 'rgba(0,0,0,0.3)', transition: 'all 0.2s', color: 'white', fontWeight: formData.gender === g ? 600 : 400 }}>
                        {g}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white' }} onClick={() => {setAuthMode('none'); setError('');}}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                {authMode === 'login' ? 'Log In' : authMode === 'signup' ? 'Sign Up' : 'Join as Guest'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="home-container" style={styles.container}>
      <header style={styles.header}>
        <div className="logo" style={styles.logo}>
          <img src="/logo.png" alt="Universe Logo" style={styles.logoImg} />
          Universe
        </div>
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {error && <span style={{ color: '#ff4d4d', fontSize: '0.85rem', width: '100%', textAlign: 'right' }}>{error}</span>}
            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: '3rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div 
                onClick={() => {
                  if (currentUser.isGuest) {
                    setError("Guests cannot edit profiles. Please create an account!");
                  } else {
                    navigate('/profile');
                  }
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              >
                <div 
                  className="header-avatar"
                  style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: currentUser.avatar ? `url(${currentUser.avatar}) center/cover no-repeat` : 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold', position: 'relative', overflow: 'hidden', flexShrink: 0 }}
                >
                  {!currentUser.avatar && currentUser.name.charAt(0).toUpperCase()}
                  <div className="avatar-hover-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', fontSize: '1rem' }}>
                    <FiUser />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 600, lineHeight: 1.2, fontSize: '0.9rem', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.name}</span>
                  {currentUser.isGuest && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Guest</span>}
                </div>
              </div>

              <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>

              <button className="btn" style={{ background: 'transparent', color: '#ff4d4d', border: 'none', padding: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }} onClick={handleLogout}>
                <FiLogOut size={18} /> <span className="hide-on-mobile" style={{ fontWeight: 600 }}>Log Out</span>
              </button>
            </div>
            
            {!currentUser.isGuest && (
              <button 
                className="btn btn-primary" 
                style={{ padding: '0.4rem 1rem', borderRadius: '2rem', fontWeight: 600, fontSize: '0.9rem' }} 
                onClick={() => navigate('/friends')}
              >
                Friends
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn" style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.5rem 1rem' }} onClick={() => setAuthMode('login')}>
              Log In
            </button>
            <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => setAuthMode('signup')}>
              Sign Up
            </button>
          </div>
        )}
      </header>
      
      <main style={styles.main}>
        <h1 style={styles.title}>Welcome to the Universe.</h1>
        <p style={styles.subtitle}>
          Meet, Learn, Play, and Grow with People from Around the World.
        </p>
        
        <div style={styles.features}>
          <div style={styles.featureCard} className="glass-panel">
            <FiVideo style={styles.featureIcon} />
            <h3>Video Chat</h3>
            <p>Connect instantly with strangers globally.</p>
          </div>
          <div style={styles.featureCard} className="glass-panel">
            <FiUsers style={styles.featureIcon} />
            <h3>Communities</h3>
            <p>Join interest-based groups. (Coming Soon)</p>
          </div>
          <div style={styles.featureCard} className="glass-panel">
            <FiGlobe style={styles.featureIcon} />
            <h3>Global Events</h3>
            <p>Attend live interactive sessions. (Coming Soon)</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1rem', paddingBottom: '2rem' }}>
          {currentUser ? (
            <button className="btn btn-primary" style={styles.ctaBtn} onClick={() => navigate('/rooms')}>
              Enter Universe
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn btn-primary" style={styles.ctaBtn} onClick={() => setAuthMode('signup')}>
                Start Chatting
              </button>
              <button className="btn" style={{ ...styles.ctaBtn, background: 'transparent', border: '2px solid var(--primary)', color: 'var(--primary)' }} onClick={() => setAuthMode('guest')}>
                Enter as Guest
              </button>
            </div>
          )}
        </div>
      </main>

      {renderModal()}
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: 'clamp(1rem, 4vw, 2rem)', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  logo: { fontSize: 'clamp(1.4rem, 5vw, 2.2rem)', display: 'flex', alignItems: 'center', gap: '0.4rem' },
  logoImg: { width: 'clamp(36px, 6vw, 55px)', height: 'clamp(36px, 6vw, 55px)', objectFit: 'contain' },
  main: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  title: { fontSize: 'clamp(1.8rem, 8vw, 4rem)', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(to right, #00e5ff, #743ad5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1, padding: '0 0.5rem' },
  subtitle: { fontSize: 'clamp(0.9rem, 3vw, 1.2rem)', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: 'clamp(1.5rem, 5vw, 3rem)', lineHeight: 1.6, padding: '0 1rem' },
  features: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' },
  featureCard: { padding: 'clamp(1rem, 3vw, 1.75rem)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', flex: '1 1 200px', maxWidth: '280px', textAlign: 'center' },
  featureIcon: { fontSize: '2.5rem', color: 'var(--primary)' },
  ctaBtn: { padding: 'clamp(0.75rem, 3vw, 1.2rem) clamp(2rem, 8vw, 4rem)', fontSize: 'clamp(1rem, 4vw, 1.4rem)', borderRadius: '2rem' }
};
