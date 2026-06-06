import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SIGNALING_SERVER = import.meta.env.VITE_SIGNALING_SERVER || (window.location.hostname === 'localhost' ? 'http://localhost:4000' : `http://${window.location.hostname}:4000`);

export function usePrivateWebRTC(userInfo, roomId) {
  const [socket, setSocket] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [status, setStatus] = useState('connecting'); // connecting, connected
  const [messages, setMessages] = useState([]);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  
  const peerConnection = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingCandidates = useRef([]);
  const facingModeRef = useRef('user');

  const checkCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      setHasMultipleCameras(videoInputs.length > 1);
    } catch (err) {
      console.warn("Could not enumerate devices", err);
    }
  };

  useEffect(() => {
    checkCameras();
  }, []);

  const initializeMedia = async () => {
    let stream = localStreamRef.current;
    if (!stream) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: facingModeRef.current }, 
          audio: true 
        });
      } catch (e1) {
        console.warn("Failed to get both video and audio. Trying video only.", e1);
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facingModeRef.current } });
        } catch (e2) {
          console.error("No media devices available.", e2);
          return null;
        }
      }
      localStreamRef.current = stream;
      setLocalStream(stream);
    }
    return stream;
  };

  const createPeerConnection = (stream) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    if (stream) {
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice_candidate', { room: roomId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setRemoteStream(null);
        setStatus('disconnected');
        setMessages(prev => [...prev, { text: 'Partner disconnected.', sender: 'system' }]);
      }
    };

    return pc;
  };

  const flipCamera = async () => {
    if (!hasMultipleCameras) return;
    const newFacingMode = facingModeRef.current === 'user' ? 'environment' : 'user';
    facingModeRef.current = newFacingMode;
    setIsFrontCamera(newFacingMode === 'user');

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: newFacingMode }, 
        audio: true 
      });
      localStreamRef.current = stream;
      setLocalStream(stream);

      if (peerConnection.current) {
        const videoTrack = stream.getVideoTracks()[0];
        const sender = peerConnection.current.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      }
    } catch (e) {
      console.error("Error flipping camera", e);
    }
  };

  useEffect(() => {
    const newSocket = io(SIGNALING_SERVER);
    setSocket(newSocket);
    socketRef.current = newSocket;

    const setupCall = async () => {
      const stream = await initializeMedia();
      
      newSocket.emit('join_private_room', { roomId, userInfo });

      newSocket.on('private_room_joined', async ({ isInitiator }) => {
        setStatus('connected');
        if (peerConnection.current) peerConnection.current.close();
        
        peerConnection.current = createPeerConnection(stream);
        pendingCandidates.current = [];

        if (isInitiator) {
          try {
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            newSocket.emit('offer', { room: roomId, offer });
          } catch (e) { console.error('Offer error:', e); }
        }
      });

      newSocket.on('offer', async (offer) => {
        try {
          if (!peerConnection.current) {
            peerConnection.current = createPeerConnection(localStreamRef.current);
          }
          if (peerConnection.current.signalingState !== 'stable') return;
          
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          newSocket.emit('answer', { room: roomId, answer });
          
          pendingCandidates.current.forEach(candidate => {
            peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e));
          });
          pendingCandidates.current = [];
        } catch (e) { console.error('Handling offer error:', e); }
      });

      newSocket.on('answer', async (answer) => {
        try {
          if (peerConnection.current && peerConnection.current.signalingState === 'have-local-offer') {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
          }
        } catch (e) { console.error('Handling answer error:', e); }
      });

      newSocket.on('ice_candidate', async (candidate) => {
        try {
          if (peerConnection.current && peerConnection.current.remoteDescription) {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          } else {
            pendingCandidates.current.push(candidate);
          }
        } catch (e) { console.error('Adding ice candidate error:', e); }
      });

      newSocket.on('chat_message', (message) => {
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('partner_left', () => {
        setRemoteStream(null);
        setStatus('disconnected');
        setMessages(prev => [...prev, { text: 'Partner left the call.', sender: 'system' }]);
      });
    };

    setupCall();

    const handleBeforeUnload = () => {
      newSocket.emit('leave_room', roomId);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      newSocket.emit('leave_room', roomId);
      newSocket.disconnect();
    };
  }, [roomId]);

  const sendMessage = (text) => {
    const msg = { text, sender: 'self' };
    setMessages(prev => [...prev, msg]);
    if (socketRef.current) {
      socketRef.current.emit('chat_message', { room: roomId, message: { text, sender: 'stranger' } });
    }
  };

  const endCall = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave_room', roomId);
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setStatus('disconnected');
  };

  return {
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
  };
}
