import React, { useState, useRef, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';

export default function ChatBox({ messages, sendMessage, status }) {
  const [input, setInput] = useState('');
  const [sendErrorCount, setSendErrorCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (status === 'connected') {
      setSendErrorCount(0);
    }
  }, [status]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      if (status !== 'connected') {
        setSendErrorCount(prev => prev + 1);
        return;
      }
      setSendErrorCount(0);
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="chat-container glass-panel">
      <div className="messages">
        {messages.length === 0 && (
          <div className="message system" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div>
              {status === 'connected' 
                ? 'Start chatting with the stranger!' 
                : 'Waiting for connection...'}
            </div>
            {Array.from({ length: sendErrorCount }).map((_, i) => (
              <div key={i} style={{ color: '#ff4d4d', fontSize: '0.85rem', background: 'rgba(255,0,0,0.1)', padding: '0.5rem 1rem', borderRadius: '1rem' }}>
                You must connect to a stranger first!
              </div>
            ))}
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input" onSubmit={handleSend}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={!input.trim()}
        >
          <FiSend />
        </button>
      </form>
    </div>
  );
}
