import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiX, FiUserMinus, FiVideo } from 'react-icons/fi';
import { io } from 'socket.io-client';

export default function DirectMessage({ userInfo, friend, onClose, onCallFriend, globalSocket }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const handleRemoveFriend = async () => {
    try {
      const apiUrl = import.meta.env.VITE_SIGNALING_SERVER || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/friends/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromId: userInfo.id, toId: friend.id })
      });
      if (res.ok) {
        onClose(); 
        window.location.reload(); 
      }
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const apiUrl = import.meta.env.VITE_SIGNALING_SERVER || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/messages/${userInfo.id}/${friend.id}`);
        if (response.ok) {
          const history = await response.json();
          setMessages(history);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchHistory();

    if (!globalSocket) return;

    const handleReceiveMessage = (msg) => {
      if (msg.sender === friend.id || msg.receiver === friend.id) {
        setMessages(prev => [...prev, msg]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    };

    globalSocket.on('receive_direct_message', handleReceiveMessage);

    return () => {
      globalSocket.off('receive_direct_message', handleReceiveMessage);
    };
  }, [userInfo.id, friend.id, globalSocket]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !globalSocket) return;

    const msgData = {
      senderId: userInfo.id,
      receiverId: friend.id,
      message: input,
      timestamp: Date.now()
    };

    globalSocket.emit('send_direct_message', msgData);
    
    // Optimistically add to UI
    const newMsg = { id: Date.now().toString(), sender: userInfo.id, receiver: friend.id, text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <img src={friend.avatar || 'https://via.placeholder.com/35'} alt={friend.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', background: friend.status === 'online' ? 'var(--success)' : '#666', border: '2px solid #111' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{friend.name}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{friend.status === 'online' ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="btn" style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '50%' }} onClick={onCallFriend} title="Video Call">
            <FiVideo size={18} />
          </button>
          <button className="btn" style={{ background: 'rgba(255,0,0,0.2)', color: 'var(--danger)', padding: '0.5rem', borderRadius: '50%' }} onClick={handleRemoveFriend} title="Remove Friend">
            <FiUserMinus size={18} />
          </button>
          <button className="btn" style={{ background: 'transparent', color: 'white', padding: '0.5rem' }} onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
            No messages yet. Say hi!
          </div>
        ) : (
          messages.map(msg => {
            const isSelf = msg.sender === userInfo.id;
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignSelf: isSelf ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                <div style={{ 
                  background: isSelf ? 'var(--primary)' : 'rgba(255,255,255,0.1)', 
                  padding: '0.75rem 1rem', 
                  borderRadius: '1.2rem', 
                  borderBottomRightRadius: isSelf ? '0.2rem' : '1.2rem', 
                  borderBottomLeftRadius: isSelf ? '1.2rem' : '0.2rem',
                  color: 'white',
                  fontSize: '0.95rem',
                  lineHeight: '1.4'
                }}>
                  {msg.text}
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem', alignSelf: isSelf ? 'flex-end' : 'flex-start' }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type a message..." 
          style={{ flex: 1, padding: '0.8rem 1.5rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: 'white', outline: 'none' }}
        />
        <button type="submit" className="btn btn-primary" style={{ borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '0.75rem' }}>
          <FiSend size={18} />
        </button>
      </form>
    </div>
  );
}
