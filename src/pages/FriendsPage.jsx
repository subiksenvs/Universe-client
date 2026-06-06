import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPhoneCall, FiX } from 'react-icons/fi';
import { io } from 'socket.io-client';
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
  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCall, setOutgoingCall] = useState(null);
  const socketRef = useRef(null);
  const [globalSocket, setGlobalSocket] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!currentUser || currentUser.isGuest) navigate('/');
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!currentUser) return;
    const socketUrl = import.meta.env.VITE_SIGNALING_SERVER || (window.location.hostname === 'localhost' ? 'http://localhost:4000' : `http://${window.location.hostname}:4000`);
    const socket = io(socketUrl);
    socketRef.current = socket;
    setGlobalSocket(socket);

    socket.on('connect', () => {
      socket.emit('register', currentUser.id);
    });
    // Also emit immediately in case it's already connected (though usually it connects asynchronously)
    socket.emit('register', currentUser.id);

    socket.on('incoming_call', (data) => {
      setIncomingCall(data);
    });

    socket.on('call_rejected', () => {
      setOutgoingCall(null);
      alert('Call was declined or user is unavailable.');
    });

    socket.on('call_error', (data) => {
      setOutgoingCall(null);
      alert(data.error);
    });

    socket.on('call_started', ({ roomId, partnerInfo }) => {
      navigate(`/private-call/${roomId}`, { state: { partnerInfo } });
    });

    return () => socket.disconnect();
  }, [currentUser, navigate]);

  const handleAcceptCall = () => {
    if (incomingCall && socketRef.current) {
      socketRef.current.emit('accept_call', { toId: incomingCall.callerId, fromInfo: currentUser });
      setIncomingCall(null);
    }
  };

  const handleRejectCall = () => {
    if (incomingCall && socketRef.current) {
      socketRef.current.emit('reject_call', { toId: incomingCall.callerId });
      setIncomingCall(null);
    }
  };

  if (!currentUser) return null;

  const showList = !isMobile || !activeFriend;
  const showChat = !isMobile || !!activeFriend;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', padding: isMobile ? '0.5rem' : '1.5rem', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
      
      {incomingCall && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-panel" style={{ textAlign: 'center', width: '90%', maxWidth: '300px' }}>
            <h2 style={{ marginBottom: '1rem' }}>Incoming Call</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <img src={incomingCall.callerInfo.avatar || 'https://via.placeholder.com/50'} alt={incomingCall.callerInfo.name} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{incomingCall.callerInfo.name}</div>
                <div style={{ color: 'var(--text-muted)' }}>is calling...</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" style={{ background: 'var(--success)', padding: '0.8rem 1.5rem' }} onClick={handleAcceptCall}>
                <FiPhoneCall /> Accept
              </button>
              <button className="btn btn-danger" style={{ padding: '0.8rem 1.5rem' }} onClick={handleRejectCall}>
                <FiX /> Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {outgoingCall && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-panel" style={{ textAlign: 'center', width: '90%', maxWidth: '300px' }}>
            <h2 style={{ marginBottom: '1rem' }}>Calling...</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <img src={outgoingCall.avatar || 'https://via.placeholder.com/50'} alt={outgoingCall.name} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{outgoingCall.name}</div>
                <div style={{ color: 'var(--text-muted)' }}>Ringing...</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-danger" style={{ padding: '0.8rem 1.5rem' }} onClick={() => {
                // We don't have a cancel_call event yet, so just hide UI
                setOutgoingCall(null);
              }}>
                <FiX /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <header style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexShrink: 0 }}>
        <button
          className="btn"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}
          onClick={() => {
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
        {showList && (
          <div style={{ width: isMobile ? '100%' : '320px', flexShrink: 0, height: '100%', overflow: 'hidden' }}>
            <FriendsList
              userInfo={currentUser}
              onSelectFriend={(friend) => setActiveFriend(friend)}
            />
          </div>
        )}

        {showChat && (
          <div style={{ flex: 1, height: '100%', display: activeFriend ? 'flex' : 'flex', flexDirection: 'column' }}>
            {activeFriend ? (
              <DirectMessage
                userInfo={currentUser}
                friend={activeFriend}
                globalSocket={globalSocket}
                onClose={() => setActiveFriend(null)}
                onCallFriend={() => {
                  if (socketRef.current) {
                    setOutgoingCall(activeFriend);
                    socketRef.current.emit('request_call', { toId: activeFriend.id, fromInfo: currentUser });
                  }
                }}
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
