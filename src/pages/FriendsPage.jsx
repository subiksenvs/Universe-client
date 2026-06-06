import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import FriendsList from '../components/FriendsList';
import DirectMessage from '../components/DirectMessage';

export default function FriendsPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = sessionStorage.getItem('userInfo');
    return stored ? JSON.parse(stored) : null;
  });
  const [activeFriend, setActiveFriend] = useState(null);

  useEffect(() => {
    if (!currentUser || currentUser.isGuest) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate('/')}>
          <FiArrowLeft /> Back to Home
        </button>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Friends & Messages</h1>
      </header>

      <main style={{ flex: 1, display: 'flex', gap: '2rem', minHeight: 0 }}>
        <div style={{ width: '350px', flexShrink: 0, height: '100%' }}>
          <FriendsList 
            userInfo={currentUser} 
            onSelectFriend={(friend) => setActiveFriend(friend)} 
          />
        </div>
        
        <div style={{ flex: 1, height: '100%' }}>
          {activeFriend ? (
            <DirectMessage 
              userInfo={currentUser} 
              friend={activeFriend} 
              onClose={() => setActiveFriend(null)} 
            />
          ) : (
            <div className="glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Select a friend to start messaging.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
