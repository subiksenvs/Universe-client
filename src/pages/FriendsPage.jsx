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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!currentUser || currentUser.isGuest) navigate('/');
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  // On mobile: show either the list OR the chat (not both side-by-side)
  const showList = !isMobile || !activeFriend;
  const showChat = !isMobile || !!activeFriend;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', padding: isMobile ? '0.5rem' : '1.5rem', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexShrink: 0 }}>
        <button
          className="btn"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}
          onClick={() => {
            // On mobile when in a chat, go back to list instead of home
            if (isMobile && activeFriend) {
              setActiveFriend(null);
            } else {
              navigate('/');
            }
          }}
        >
          <FiArrowLeft /> {isMobile && activeFriend ? 'Friends' : 'Home'}
        </button>
        <h1 style={{ margin: 0, fontSize: isMobile ? '1.3rem' : '1.8rem', fontWeight: 800 }}>
          {isMobile && activeFriend ? activeFriend.name : 'Friends & Messages'}
        </h1>
      </header>

      <main style={{ flex: 1, display: 'flex', gap: isMobile ? 0 : '1.5rem', minHeight: 0, overflow: 'hidden' }}>
        {/* Friends List Panel */}
        {showList && (
          <div style={{ width: isMobile ? '100%' : '320px', flexShrink: 0, height: '100%', overflow: 'hidden' }}>
            <FriendsList
              userInfo={currentUser}
              onSelectFriend={(friend) => setActiveFriend(friend)}
            />
          </div>
        )}

        {/* Direct Message Panel */}
        {showChat && (
          <div style={{ flex: 1, height: '100%', display: activeFriend ? 'flex' : 'flex', flexDirection: 'column' }}>
            {activeFriend ? (
              <DirectMessage
                userInfo={currentUser}
                friend={activeFriend}
                onClose={() => setActiveFriend(null)}
              />
            ) : (
              <div className="glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                👈 Select a friend from the list to start messaging
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
