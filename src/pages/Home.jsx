import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiVideo, FiUsers, FiGlobe } from 'react-icons/fi';

export default function Home() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', age: '', gender: '' });

  const handleJoin = (e) => {
    e.preventDefault();
    if (formData.name && formData.age && formData.gender) {
      sessionStorage.setItem('userInfo', JSON.stringify(formData));
      navigate('/chat');
    }
  };

  return (
    <div className="home-container" style={styles.container}>
      <header style={styles.header}>
        <div className="logo" style={styles.logo}>
          <img src="/logo.png" alt="Universe Logo" style={styles.logoImg} />
          Universe
        </div>
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

        <button 
          className="btn btn-primary" 
          style={styles.ctaButton}
          onClick={() => setShowModal(true)}
        >
          <FiVideo /> Enter Video Chat
        </button>
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Profile Setup</h2>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1rem' }}>
              Tell others a bit about yourself before chatting.
            </p>
            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  required 
                  maxLength="20"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Your Name"
                />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input 
                  type="number" 
                  required 
                  min="13" 
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  placeholder="e.g. 21"
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Male', 'Female', 'Other'].map(g => (
                    <div 
                      key={g}
                      onClick={() => setFormData({...formData, gender: g})}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        textAlign: 'center',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: formData.gender === g ? 'var(--primary)' : 'var(--glass-border)',
                        background: formData.gender === g ? 'rgba(0, 229, 255, 0.2)' : 'rgba(0,0,0,0.3)',
                        transition: 'all 0.2s',
                        color: 'white',
                        fontWeight: formData.gender === g ? 600 : 400
                      }}
                    >
                      {g}
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Join</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4rem',
  },
  logo: {
    fontSize: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logoImg: {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginTop: '2rem',
  },
  title: {
    fontSize: '4rem',
    fontWeight: 800,
    marginBottom: '1rem',
    background: 'linear-gradient(to right, #00e5ff, #743ad5)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: 'var(--text-muted)',
    maxWidth: '600px',
    marginBottom: '4rem',
    lineHeight: 1.6,
  },
  features: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '4rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featureCard: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    width: '280px',
    textAlign: 'center',
  },
  featureIcon: {
    fontSize: '3rem',
    color: 'var(--primary)',
  },
  ctaButton: {
    padding: '1rem 3rem',
    fontSize: '1.25rem',
    borderRadius: '2rem',
  }
};
