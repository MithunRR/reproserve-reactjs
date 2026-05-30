import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { X, Send, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  fetchMessagesStart,
  sendMessageStart,
  setActiveThreadPeer,
  markThreadReadLocal
} from '../Store/Features/Authentication/authslice';
import { emitMessage, emitMessageRead } from '../services/socket';
import { currentUserStorage } from '../utils/localStorage';

export function MessagingModal({ isOpen, onClose, recipient }) {
  const dispatch = useDispatch();
  const messages = useSelector((s) => s.AuthReducer.messages);
  const messagesLoading = useSelector((s) => s.AuthReducer.messagesLoading);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const scrollRef = useRef(null);

  const me = currentUserStorage.get();
  const recipientId = recipient?.id;
  const recipientName = (() => {
    const personal = recipient?.firstName
      ? `${recipient.firstName} ${recipient.lastName || ''}`.trim()
      : (recipient?.name || '');
    const biz = recipient?.businessName ? recipient.businessName.trim() : '';
    if (personal && biz && personal !== biz) return `${personal} (${biz})`;
    return personal || biz || 'Provider';
  })();

  // Open / close lifecycle: load history, mark thread active, clear on close.
  useEffect(() => {
    if (!isOpen || !recipientId) return;
    setIsClosing(false);
    dispatch(setActiveThreadPeer(recipientId));
    dispatch(fetchMessagesStart({ withUserId: recipientId }));
    dispatch(markThreadReadLocal(recipientId));
    emitMessageRead(recipientId);
    return () => {
      dispatch(setActiveThreadPeer(null));
    };
  }, [isOpen, recipientId, dispatch]);

  // Auto-scroll on new messages.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
      @keyframes modalPopIn {
        from { opacity: 0; transform: scale(0.8) translateY(-20px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes modalPopOut {
        from { opacity: 1; transform: scale(1) translateY(0); }
        to { opacity: 0; transform: scale(0.8) translateY(20px); }
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
      setDraft('');
    }, 150);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !recipientId || sending) return;
    if (!me?.id) {
      toast.error('Please log in to send messages');
      return;
    }

    setSending(true);
    setDraft('');
    // Try socket first; fall back to REST if disconnected.
    const ack = await emitMessage(recipientId, text);
    if (!ack?.ok) {
      dispatch(sendMessageStart({ receiverId: recipientId, content: text }));
    }
    setSending(false);
  };

  if (!isOpen) return null;

  const onlyThisThread = messages.filter((m) =>
    (Number(m.senderId) === Number(me?.id) && Number(m.receiverId) === Number(recipientId)) ||
    (Number(m.receiverId) === Number(me?.id) && Number(m.senderId) === Number(recipientId))
  );

  return typeof document !== 'undefined' && createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 999999,
        background: isClosing ? 'rgba(0, 69, 113, 0)' : 'rgba(0, 69, 113, 0.75)',
        backdropFilter: 'blur(4px)',
        animation: isClosing ? 'fadeOut 0.15s ease-out' : 'fadeIn 0.3s ease-out'
      }}
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl p-6 overflow-hidden flex flex-col"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 137, 225, 0.95), rgba(0, 69, 113, 0.95))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
          maxHeight: '85vh',
          height: '85vh',
          width: '90%',
          maxWidth: '672px',
          animation: isClosing ? 'modalPopOut 0.15s ease-out' : 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-all duration-300"
        >
          <X className="h-4 w-4 text-white" />
        </button>

        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center space-x-3 mb-2">
            <MessageSquare className="h-5 w-5 text-white" />
            <h2 className="text-xl text-white drop-shadow-lg">Message {recipientName}</h2>
          </div>
          <p className="text-sm text-white/80 drop-shadow-md">
            All communication happens through ReproServe platform
          </p>
        </div>

        <div
          ref={scrollRef}
          className="mb-4 flex-1 min-h-0 overflow-y-auto space-y-2 pr-2 scrollbar-hide"
        >
          {messagesLoading && onlyThisThread.length === 0 ? (
            <div className="text-center py-8 text-white/70 drop-shadow-md">Loading…</div>
          ) : onlyThisThread.length === 0 ? (
            <div className="text-center py-8 text-white/70 drop-shadow-md">
              No messages yet. Start the conversation!
            </div>
          ) : (
            onlyThisThread.map((msg) => {
              const mine = Number(msg.senderId) === Number(me?.id);
              return (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg max-w-[80%] ${mine ? 'ml-auto bg-sky-blue text-white' : 'mr-auto bg-white/15 text-white'}`}
                  style={{
                    border: '1px solid rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <div className="text-xs text-white/80 mb-1">{mine ? 'You' : recipientName}</div>
                  <div className="text-white whitespace-pre-wrap break-words drop-shadow-md">{msg.content}</div>
                  <div className="text-[10px] text-white/60 mt-1">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleSend} className="flex space-x-2 flex-shrink-0">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={me?.id ? 'Type your message…' : 'Log in to send a message'}
            disabled={!me?.id || sending}
            className="flex-1 px-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!me?.id || !draft.trim() || sending}
            className="px-5 py-2 rounded-md bg-coral-orange text-black hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 font-semibold flex items-center space-x-2 disabled:opacity-60 disabled:hover:scale-100"
          >
            <Send className="h-4 w-4" />
            <span>{sending ? 'Sending…' : 'Send'}</span>
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
