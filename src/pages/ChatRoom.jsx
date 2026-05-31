import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC';
import VideoChat from '../components/VideoChat';
import ChatBox from '../components/ChatBox';
import { FiArrowLeft } from 'react-icons/fi';

export default function ChatRoom() {
  const navigate = useNavigate();
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

  React.useEffect(() => {
    if (!userInfo) {
      navigate('/');
    }
  }, [userInfo, navigate]);

  const {
    localStream,
    remoteStream,
    status,
    messages,
    partnerInfo,
    startSearching,
    stopSearching,
    sendMessage
  } = useWebRTC(userInfo);

  const handleLeave = () => {
    stopSearching();
    navigate('/');
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo" style={{ cursor: 'pointer' }} onClick={handleLeave}>
          <img src="/logo.png" alt="Logo" className="header-logo-img" style={{ width: 75, height: 75, objectFit: 'contain' }} />
          Universe <span className="hide-on-mobile" style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>| Video Chat</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="status-indicator" style={{ color: status === 'connected' ? 'var(--success)' : 'var(--text-muted)' }}>
            {status === 'connected' ? '● Connected' : status === 'waiting' ? '● Waiting' : '○ Offline'}
          </div>
          <button className="btn leave-btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem' }} onClick={handleLeave}>
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
          startSearching={startSearching}
          stopSearching={stopSearching}
        />
        <ChatBox 
          messages={messages}
          sendMessage={sendMessage}
          status={status}
        />
      </main>
    </div>
  );
}
