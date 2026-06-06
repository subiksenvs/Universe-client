import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC';
import VideoChat from '../components/VideoChat';
import ChatBox from '../components/ChatBox';
import { FiArrowLeft, FiUser } from 'react-icons/fi';

export default function ChatRoom() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const topic = searchParams.get('topic') || 'global';
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

  React.useEffect(() => {
    if (!userInfo) {
      navigate('/');
    }
  }, [userInfo, navigate]);

  const [showProfile, setShowProfile] = React.useState(false);
  const [requestSent, setRequestSent] = React.useState(false);

  const {
    socket,
    localStream,
    remoteStream,
    status,
    messages,
    partnerInfo,
    hasMultipleCameras,
    isFrontCamera,
    startSearching,
    stopSearching,
    sendMessage,
    flipCamera
  } = useWebRTC(userInfo, topic);

  React.useEffect(() => {
    // Reset state when partner changes
    setShowProfile(false);
    setRequestSent(false);
  }, [partnerInfo]);

  const handleSendFriendRequest = async () => {
    try {
      const apiUrl = import.meta.env.VITE_SIGNALING_SERVER || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromId: userInfo.id, toId: partnerInfo.id })
      });
      if (response.ok) {
        setRequestSent(true);
        if (socket) {
          socket.emit('send_friend_request', { fromUser: userInfo, toId: partnerInfo.id });
        }
      } else {
        const data = await response.json();
        if (data.error === 'Already friends' || data.error === 'Request already sent') {
          setRequestSent(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLeave = () => {
    stopSearching();
    navigate('/');
  };

  return (
    <div className="app-container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={handleLeave}>
          <span style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', fontWeight: 800, background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Universe</span>
          <span className="hide-on-mobile" style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'capitalize' }}>| {topic} Room</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="status-indicator" style={{
            color: status === 'connected' ? 'var(--success)' : status === 'waiting' ? '#f59e0b' : 'var(--danger)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: 'clamp(0.75rem, 2.5vw, 1rem)',
            whiteSpace: 'nowrap'
          }}>
            {status === 'connected' ? '● Connected' : status === 'waiting' ? '● Waiting...' : '● Offline'}
          </div>
          {partnerInfo && status === 'connected' && (
            <button
              className="btn"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.4rem 0.6rem', fontSize: '0.85rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              onClick={() => setShowProfile(true)}
            >
              <FiUser /> <span className="hide-on-mobile">View Profile</span>
            </button>
          )}
          <button className="btn leave-btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.4rem 0.6rem' }} onClick={handleLeave}>
            <FiArrowLeft /> <span className="hide-on-mobile">Leave</span>
          </button>
        </div>
      </header>

      <main className="main-content">
        <VideoChat
          localStream={localStream}
          remoteStream={remoteStream}
          status={status}
          partnerInfo={partnerInfo}
          hasMultipleCameras={hasMultipleCameras}
          isFrontCamera={isFrontCamera}
          startSearching={startSearching}
          stopSearching={stopSearching}
          flipCamera={flipCamera}
        />
        <ChatBox
          messages={messages}
          sendMessage={sendMessage}
          status={status}
        />
      </main>

      {showProfile && partnerInfo && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content glass-panel" style={{ textAlign: 'center', width: '90%', maxWidth: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '1rem' }}>
              <button style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setShowProfile(false)}>×</button>
            </div>
            
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: partnerInfo.avatar ? `url(${partnerInfo.avatar}) center/cover no-repeat` : '#333', marginBottom: '1rem', border: '4px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold' }}>
              {!partnerInfo.avatar && partnerInfo.name.charAt(0).toUpperCase()}
            </div>
            
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>{partnerInfo.name}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
              <span>{partnerInfo.age} years old</span>
              <span>•</span>
              <span>{partnerInfo.gender}</span>
            </div>

            {userInfo.friends && userInfo.friends.includes(partnerInfo.id) ? (
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', background: 'var(--glass-border)', cursor: 'not-allowed' }}
                disabled
              >
                Already Friends
              </button>
            ) : (
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', background: requestSent ? 'var(--success)' : 'var(--primary)' }}
                onClick={handleSendFriendRequest}
                disabled={requestSent}
              >
                {requestSent ? 'Request Sent!' : 'Add Friend'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
