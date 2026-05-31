import React, { useEffect, useRef } from 'react';
import { FiVideo, FiVideoOff, FiSkipForward, FiSquare, FiRefreshCcw } from 'react-icons/fi';

export default function VideoChat({ localStream, remoteStream, status, partnerInfo, startSearching, stopSearching, toggleCamera }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="video-chat-container">
      <div className="video-grid">
        <div className="video-wrapper glass-panel">
          {!remoteStream && (
            <div className="placeholder">
              <img src="/logo.png" alt="Logo" className="placeholder-logo animated-logo" />
              <p>{status === 'idle' ? 'Ready to connect' : 'Waiting for stranger...'}</p>
            </div>
          )}
          <video ref={remoteVideoRef} autoPlay playsInline style={{ display: remoteStream ? 'block' : 'none' }} />
          <div className="video-label" style={{ zIndex: 3 }}>
            {status === 'waiting' ? 'Stranger (Waiting...)' : partnerInfo ? `${partnerInfo.name}, ${partnerInfo.age} (${partnerInfo.gender.charAt(0)})` : 'Stranger'}
          </div>
        </div>
        
        <div className="video-wrapper glass-panel">
          {!localStream && (
            <div className="placeholder">
              <FiVideoOff className="placeholder-icon" />
              <p>Camera inactive</p>
            </div>
          )}
          {localStream && (
             <button 
               className="btn" 
               onClick={toggleCamera} 
               style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 4, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '0.5rem', borderRadius: '50%' }}
               title="Flip Camera"
             >
               <FiRefreshCcw size={18} />
             </button>
          )}
          <video ref={localVideoRef} autoPlay playsInline muted style={{ display: localStream ? 'block' : 'none', transform: 'scaleX(-1)' }} />
          <div className="video-label" style={{ zIndex: 3 }}>You</div>
        </div>
      </div>
      
      <div className="controls glass-panel">
        {status === 'idle' && (
          <button className="btn btn-primary" onClick={startSearching}>
            <FiVideo /> Start Video Chat
          </button>
        )}
        
        {(status === 'waiting' || status === 'connected') && (
          <>
            <button className="btn btn-danger" onClick={stopSearching}>
              <FiSquare /> Stop
            </button>
            <button className="btn btn-primary" onClick={startSearching}>
              <FiSkipForward /> Next
            </button>
          </>
        )}
      </div>
    </div>
  );
}
