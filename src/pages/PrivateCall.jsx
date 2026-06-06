import React, { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { usePrivateWebRTC } from '../hooks/usePrivateWebRTC';
import VideoChat from '../components/VideoChat';
import ChatBox from '../components/ChatBox';
import { FiArrowLeft } from 'react-icons/fi';

export default function PrivateCall() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const location = useLocation();
  const partnerInfo = location.state?.partnerInfo || null;

  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo) {
      navigate('/');
    }
  }, [userInfo, navigate]);

  const {
    socket,
    localStream,
    remoteStream,
    status,
    messages,
    hasMultipleCameras,
    isFrontCamera,
    sendMessage,
    flipCamera,
    endCall
  } = usePrivateWebRTC(userInfo, roomId);

  const handleLeave = () => {
    endCall();
    navigate('/friends');
  };

  if (!userInfo) return null;

  return (
    <div className="app-container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={handleLeave}>
          <span className="hide-on-mobile" style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', fontWeight: 800, background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Universe</span>
          <span className="hide-on-mobile" style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'capitalize' }}>| Private Call</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="status-indicator" style={{
            color: status === 'connected' ? 'var(--success)' : status === 'connecting' ? '#f59e0b' : 'var(--danger)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: 'clamp(0.75rem, 2.5vw, 1rem)',
            whiteSpace: 'nowrap'
          }}>
            {status === 'connected' ? '● Connected' : status === 'connecting' ? '● Connecting...' : '● Disconnected'}
          </div>
          <button className="btn leave-btn" style={{ background: 'rgba(255,0,0,0.2)', color: 'var(--danger)', padding: '0.4rem 0.6rem' }} onClick={handleLeave}>
            <FiArrowLeft /> <span className="hide-on-mobile">End Call</span>
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
          startSearching={() => {}} // Not used in private
          stopSearching={endCall}
          flipCamera={flipCamera}
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
