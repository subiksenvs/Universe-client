import React, { useEffect, useRef } from 'react';
import { FiVideo, FiVideoOff, FiSkipForward, FiSquare, FiRefreshCw } from 'react-icons/fi';

export default function VideoChat({ localStream, remoteStream, status, partnerInfo, hasMultipleCameras, isFrontCamera, startSearching, stopSearching, flipCamera }) {
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
        <div className="video-wrapper remote">
          {!remoteStream && (
            <div className="placeholder">
              <div className="universe-loader">
                <div className="planet"></div>
                <div className="orbit orbit1"><div className="dot"></div><div className="dot2"></div></div>
                <div className="orbit orbit2"><div className="dot"></div><div className="dot2"></div></div>
                <div className="orbit orbit3"><div className="dot"></div><div className="dot2"></div></div>
                <div className="orbit orbit4"><div className="dot"></div><div className="dot2"></div></div>
                <div className="orbit orbit5"><div className="dot"></div><div className="dot2"></div></div>
              </div>
              <p className="neon-text-blink" style={{ marginTop: '1rem' }}>
                {status === 'idle' ? 'Ready to connect' : 'Waiting for stranger...'}
              </p>
            </div>
          )}
          <video ref={remoteVideoRef} autoPlay playsInline style={{ display: remoteStream ? 'block' : 'none' }} />
          <div className="video-label" style={{ zIndex: 3 }}>
            {status === 'waiting' ? 'Stranger (Waiting...)' : partnerInfo ? `${partnerInfo.name}, ${partnerInfo.age} (${partnerInfo.gender.charAt(0)})` : 'Stranger'}
          </div>
        </div>
        
        <div className="video-wrapper local">
          {!localStream && (
            <div className="placeholder">
              <FiVideoOff className="placeholder-icon" style={{ fontSize: '1.5rem' }} />
            </div>
          )}
          <video ref={localVideoRef} autoPlay playsInline muted disablePictureInPicture className={isFrontCamera ? 'mirrored' : ''} style={{ display: localStream ? 'block' : 'none' }} />
          <div className="video-label" style={{ zIndex: 3, padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>You</div>
        </div>
      </div>
      
      <div className="controls">
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

        {hasMultipleCameras && (
          <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }} onClick={flipCamera}>
            <FiRefreshCw /> Flip
          </button>
        )}
      </div>
    </div>
  );
}
