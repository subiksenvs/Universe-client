import React, { useState, useEffect } from 'react';
import { FiUserCheck, FiUserX, FiMessageSquare } from 'react-icons/fi';

export default function FriendsList({ userInfo, onSelectFriend }) {
  const [friendsData, setFriendsData] = useState({ friends: [], friendRequests: [] });

  const fetchFriends = async () => {
    try {
      const apiUrl = import.meta.env.VITE_SIGNALING_SERVER || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/friends/${userInfo.id}`);
      if (response.ok) {
        const data = await response.json();
        setFriendsData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFriends();
    const interval = setInterval(fetchFriends, 3000); // Polling for updates
    return () => clearInterval(interval);
  }, []);

  const handleRequest = async (action, fromId) => {
    try {
      const apiUrl = import.meta.env.VITE_SIGNALING_SERVER || 'http://localhost:4000';
      await fetch(`${apiUrl}/api/friends/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromId, toId: userInfo.id })
      });
      fetchFriends();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="friends-list glass-panel" style={{ padding: '1rem', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Friends</h3>
      
      {friendsData.friendRequests.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Pending Requests</h4>
          {friendsData.friendRequests.map(req => (
            <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img src={req.avatar || 'https://via.placeholder.com/30'} alt={req.name} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
                <span style={{ fontSize: '0.9rem' }}>{req.name}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn" style={{ background: 'var(--success)', padding: '0.3rem', color: 'white', display: 'flex' }} onClick={() => handleRequest('accept', req.id)}><FiUserCheck size={16} /></button>
                <button className="btn" style={{ background: 'var(--danger)', padding: '0.3rem', color: 'white', display: 'flex' }} onClick={() => handleRequest('reject', req.id)}><FiUserX size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Your Friends</h4>
        {friendsData.friends.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No friends yet. Meet people in the Global Room!</p>
        ) : (
          friendsData.friends.map(friend => (
            <div key={friend.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => onSelectFriend(friend)} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ position: 'relative' }}>
                  <img src={friend.avatar || 'https://via.placeholder.com/35'} alt={friend.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', background: friend.status === 'online' ? 'var(--success)' : '#666', border: '2px solid #111' }} />
                </div>
                <span style={{ fontWeight: 500 }}>{friend.name}</span>
              </div>
              <FiMessageSquare style={{ color: 'var(--primary)', fontSize: '1.2rem' }} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
