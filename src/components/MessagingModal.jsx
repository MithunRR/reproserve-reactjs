import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, MessageSquare } from 'lucide-react';

export function MessagingModal({ isOpen, onClose, recipient }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      // Load existing messages for this recipient (mock data for now)
      setMessages([
      {
        id: 1,
        sender: 'You',
        text: 'Hello, I\'m interested in your services.',
        timestamp: new Date(Date.now() - 3600000).toLocaleString()
      }]
      );
    }
  }, [isOpen, recipient]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @keyframes modalPopIn {
        from {
          opacity: 0;
          transform: scale(0.8) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      @keyframes modalPopOut {
        from {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        to {
          opacity: 0;
          transform: scale(0.8) translateY(20px);
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setMessage('');
    }, 150);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'You',
      text: message,
      timestamp: new Date().toLocaleString()
    };

    setMessages([...messages, newMessage]);
    setMessage('');
    // In a real app, this would send to backend
  };

  if (!isOpen) return null;

  return typeof document !== 'undefined' && createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: isClosing ? 'rgba(0, 69, 113, 0)' : 'rgba(0, 69, 113, 0.75)',
        backdropFilter: 'blur(4px)',
        animation: isClosing ? 'fadeOut 0.15s ease-out' : 'fadeIn 0.3s ease-out'
      }}
      onClick={handleClose}>
      
      <div
        className="relative w-full max-w-2xl rounded-2xl p-6 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
          maxHeight: '85vh',
          height: 'auto',
          width: '90%',
          maxWidth: '672px',
          animation: isClosing ? 'modalPopOut 0.15s ease-out' : 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-all duration-300">
          
          <X className="h-4 w-4 text-white" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center space-x-3 mb-2">
            <MessageSquare className="h-5 w-5 text-white" />
            <h2 className="text-xl text-white drop-shadow-lg">
              Message {recipient?.name || 'Provider'}
            </h2>
          </div>
          <p className="text-sm text-white drop-shadow-md">
            All communication happens through ReproServe platform
          </p>
        </div>

        {/* Messages */}
        <div className="mb-4 h-64 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
          {messages.length === 0 ?
          <div className="text-center py-8">
              <p className="text-white/70 drop-shadow-md">No messages yet. Start the conversation!</p>
            </div> :

          messages.map((msg) =>
          <div
            key={msg.id}
            className={`p-3 rounded-lg ${
            msg.sender === 'You' ?
            'bg-sky-blue ml-auto max-w-[80%]' :
            'bg-white mr-auto max-w-[80%]'}`
            }>
            
                <div className="text-xs text-white mb-1">{msg.sender}</div>
                <div className="text-white drop-shadow-md">{msg.text}</div>
                <div className="text-xs text-white mt-1">{msg.timestamp}</div>
              </div>
          )
          }
        </div>

        {/* Message Input */}
        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60" />
          
          <button
            type="submit"
            className="px-5 py-2 rounded-md bg-coral-orange text-black hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 font-semibold flex items-center space-x-2">
            
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}