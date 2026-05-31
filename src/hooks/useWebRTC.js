import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SIGNALING_SERVER = import.meta.env.VITE_SIGNALING_SERVER || 'http://localhost:4000';



export function useWebRTC(userInfo) {
  const [socket, setSocket] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, waiting, connected
  const [messages, setMessages] = useState([]);
  const [partnerInfo, setPartnerInfo] = useState(null);
  
  const peerConnection = useRef(null);
  const currentRoom = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingCandidates = useRef([]);

  const initializeMedia = async () => {
    let stream = localStreamRef.current;
    if (!stream) {
      try {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (e1) {
          console.warn("Failed to get both video and audio. Trying video only.", e1);
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
          } catch (e2) {
            console.warn("Failed to get video. Trying audio only.", e2);
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          }
        }
        setLocalStream(stream);
        localStreamRef.current = stream;
      } catch (err) {
        console.error('Error accessing media devices.', err);
        setLocalStream(null);
        localStreamRef.current = null;
        setMessages(prev => [...prev, { text: 'Camera access denied or unavailable. You will not send video.', sender: 'system' }]);
      }
    }
    return stream;
  };

  // Initialize socket and media on mount
  useEffect(() => {
    const newSocket = io(SIGNALING_SERVER);
    setSocket(newSocket);
    socketRef.current = newSocket;

    initializeMedia();

    const handleBeforeUnload = () => {
      if (currentRoom.current) {
        newSocket.emit('leave_room', currentRoom.current);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      newSocket.disconnect();
    };
  }, []);

  // Cleanup media when component unmounts
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  // Handle socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('match_found', async ({ room, role, partnerInfo: pInfo }) => {
      setStatus('connected');
      currentRoom.current = room;
      setPartnerInfo(pInfo);
      setMessages(prev => [...prev, { text: `You are now chatting with ${pInfo ? pInfo.name : 'a random stranger'}. Say hi!`, sender: 'system' }]);

      createPeerConnection();

      if (role === 'initiator') {
        try {
          const offer = await peerConnection.current.createOffer();
          await peerConnection.current.setLocalDescription(offer);
          socket.emit('offer', { room, offer });
        } catch (error) {
          console.error("Error creating offer:", error);
        }
      }
    });

    socket.on('offer', async (offer) => {
      if (!peerConnection.current) createPeerConnection();
      try {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        
        // Add any candidates that arrived before the offer
        pendingCandidates.current.forEach(async (c) => {
          try { await peerConnection.current.addIceCandidate(new RTCIceCandidate(c)); } catch(e) {}
        });
        pendingCandidates.current = [];

        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit('answer', { room: currentRoom.current, answer });
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    });

    socket.on('answer', async (answer) => {
      try {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        
        // Add any candidates that arrived before the answer
        pendingCandidates.current.forEach(async (c) => {
          try { await peerConnection.current.addIceCandidate(new RTCIceCandidate(c)); } catch(e) {}
        });
        pendingCandidates.current = [];
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    });

    socket.on('ice_candidate', async (candidate) => {
      try {
        if (peerConnection.current) {
          if (peerConnection.current.remoteDescription) {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          } else {
            pendingCandidates.current.push(candidate);
          }
        }
      } catch (error) {
        console.error("Error adding ice candidate:", error);
      }
    });

    socket.on('chat_message', (message) => {
      setMessages(prev => [...prev, { text: message, sender: 'stranger' }]);
    });

    socket.on('partner_left', () => {
      setMessages(prev => [...prev, { text: 'Stranger has disconnected. Searching for a new one...', sender: 'system' }]);
      if (currentRoom.current) {
        socket.emit('leave_room', currentRoom.current);
      }
      cleanupConnection();
      setStatus('waiting');
      socket.emit('join_queue', userInfo);
    });

    return () => {
      socket.off('match_found');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice_candidate');
      socket.off('chat_message');
      socket.off('partner_left');
    };
  }, [socket, localStream]);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443?transport=tcp',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ]
    });

    peerConnection.current = pc;

    // Add local tracks
    const streamToUse = localStreamRef.current;
    if (streamToUse) {
      streamToUse.getTracks().forEach(track => {
        pc.addTrack(track, streamToUse);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice_candidate', {
          room: currentRoom.current,
          candidate: event.candidate
        });
      }
    };

    // Handle incoming streams
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };
  };

  const cleanupConnection = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setRemoteStream(null);
    currentRoom.current = null;
    setPartnerInfo(null);
    pendingCandidates.current = [];
  };

  const startSearching = async () => {
    cleanupConnection();
    setMessages([]);
    
    const stream = await initializeMedia();
    
    if (!stream) {
      setMessages([{ text: 'Camera access is required to start a chat. Please enable it in your browser settings.', sender: 'system' }]);
      return;
    }

    setStatus('waiting');
    socketRef.current.emit('join_queue', userInfo);
  };

  const stopSearching = () => {
    if (currentRoom.current) {
      socketRef.current.emit('leave_room', currentRoom.current);
    }
    cleanupConnection();
    setStatus('idle');
    setMessages([{ text: 'You disconnected.', sender: 'system' }]);
  };

  const sendMessage = (text) => {
    if (currentRoom.current && text.trim()) {
      socketRef.current.emit('chat_message', { room: currentRoom.current, message: text });
      setMessages(prev => [...prev, { text, sender: 'self' }]);
    }
  };

  return {
    localStream,
    remoteStream,
    status,
    messages,
    partnerInfo,
    startSearching,
    stopSearching,
    sendMessage
  };
}
