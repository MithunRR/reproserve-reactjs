import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import apiClient from '../utils/api';
import { currentUserStorage } from '../utils/localStorage';

// Floating AI assistant. Sits just to the left of the global scroll-to-top
// button (which is fixed at bottom:32 / right:32). Answers questions about
// providers, realtors, open houses and services from live data via
// POST /api/assistant. Rendered into <body> so page layout never clips it.

const GREETING = {
  role: 'assistant',
  text: "Hi! I'm the ReproServe assistant. Ask me about top-rated providers, services near you, or upcoming open houses."
};

// Pull whatever location we know about the logged-in user for "near me" answers.
const buildContext = () => {
  const u = currentUserStorage.get() || {};
  const ctx = {};
  const city = u.city || (typeof u.location === 'string' ? u.location.split(',')[0].trim() : '');
  if (city) ctx.city = city;
  if (u.state) ctx.state = u.state;
  const lat = parseFloat(u.latitude);
  const lng = parseFloat(u.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    ctx.lat = lat;
    ctx.lng = lng;
  }
  return ctx;
};

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, open]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', text };
    // History = everything so far except the canned greeting.
    const history = messages.filter((m) => m !== GREETING);
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post('/api/assistant', {
        message: text,
        history: [...history, userMsg],
        context: buildContext()
      });
      const reply = res?.data?.reply || "Sorry, I couldn't find an answer.";
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: "Sorry, I'm having trouble right now. Please try again in a moment." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (typeof document === 'undefined' || !document.body) return null;

  return createPortal(
    <>
      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            width: 'min(370px, calc(100vw - 32px))',
            height: 'min(520px, calc(100vh - 140px))',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 12px 48px rgba(0,0,0,0.28)',
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.08)'
          }}>
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(0,137,225,0.97), rgba(0,69,113,0.97))',
              color: '#fff',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle style={{ width: 20, height: 20 }} />
              <span style={{ fontWeight: 600, fontSize: '15px' }}>ReproServe Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff', padding: 4 }}>
              <X style={{ width: 20, height: 20 }} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{ flex: 1, overflowY: 'auto', padding: '14px', background: '#f8fafc' }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '10px'
                }}>
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '9px 13px',
                    borderRadius: '14px',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    background: m.role === 'user' ? 'linear-gradient(135deg,#0089e1,#004571)' : '#ffffff',
                    color: m.role === 'user' ? '#fff' : '#1e293b',
                    border: m.role === 'user' ? 'none' : '1px solid #e2e8f0',
                    borderBottomRightRadius: m.role === 'user' ? '4px' : '14px',
                    borderBottomLeftRadius: m.role === 'user' ? '14px' : '4px'
                  }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
                <div
                  style={{
                    padding: '9px 13px',
                    borderRadius: '14px',
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                  <Loader2 className="animate-spin" style={{ width: 15, height: 15 }} />
                  Thinking…
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: '8px', padding: '10px', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about providers, open houses…"
              style={{
                flex: 1,
                minWidth: 0,
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '9px 12px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              style={{
                flexShrink: 0,
                background: loading || !input.trim() ? '#94a3b8' : 'linear-gradient(135deg,#0089e1,#004571)',
                border: 'none',
                borderRadius: '10px',
                width: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: loading || !input.trim() ? 'default' : 'pointer'
              }}>
              <Send style={{ width: 18, height: 18, color: '#fff' }} />
            </button>
          </div>
        </div>
      )}

      {/* Launcher bubble — sits left of the scroll-to-top button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        title="Ask the ReproServe Assistant"
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '100px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(0,137,225,0.95), rgba(0,69,113,0.95))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '2px solid rgba(255,255,255,0.5)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
          cursor: 'pointer',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
        {open ? (
          <X style={{ width: 24, height: 24, color: '#fff' }} />
        ) : (
          <MessageCircle style={{ width: 26, height: 26, color: '#fff' }} />
        )}
      </button>
    </>,
    document.body
  );
};

export default ChatbotWidget;
