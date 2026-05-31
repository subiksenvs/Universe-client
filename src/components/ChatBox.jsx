import React, { useState, useRef, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';

export default function ChatBox({ messages, sendMessage, status }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="chat-container glass-panel">
      <div className="messages">
        {messages.length === 0 && (
          <div className="message system">
            {status === 'connected' 
              ? 'Start chatting with the stranger!' 
              : 'Waiting for connection...'}
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
          disabled={status !== 'connected'}
        />
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={status !== 'connected' || !input.trim()}
        >
          <FiSend />
        </button>
      </form>
    </div>
  );
}
