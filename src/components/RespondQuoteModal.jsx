import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, DollarSign, MessageSquare, FileText } from 'lucide-react';

// Provider-facing modal: respond to a customer's request with a price + message.
// For realtor meeting requests the amount field is hidden.
export function RespondQuoteModal({ isOpen, onClose, onSubmit, request, loading = false }) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isMeeting = request?.isMeetingRequest;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert('Please enter a message for the customer.');
      return;
    }
    onSubmit({ amount: amount.trim(), message: message.trim() });
  };

  return typeof document !== 'undefined' && createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 99999, padding: '16px', background: 'rgba(0, 69, 113, 0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>

      <div
        className="relative w-full max-w-md rounded-2xl p-6 overflow-y-auto scrollbar-hide"
        style={{
          zIndex: 100000,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
          maxHeight: '85vh'
        }}
        onClick={(e) => e.stopPropagation()}>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-all duration-300">
          <X className="h-4 w-4 text-white" />
        </button>

        <div className="mb-5">
          <h2 className="text-xl text-white drop-shadow-lg flex items-center">
            <FileText className="h-5 w-5 mr-2 text-white" />
            {isMeeting ? 'Respond to Meeting Request' : 'Send a Quote'}
          </h2>
          {request?.name &&
            <p className="text-sm text-white/80 drop-shadow-md mt-1">For {request.name}'s request</p>
          }
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isMeeting &&
            <div>
              <label className="block text-white mb-2 drop-shadow-md text-sm">Quote Amount ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full pl-10 pr-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60" />
              </div>
            </div>
          }

          <div>
            <label className="block text-white mb-2 drop-shadow-md text-sm">Message *</label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-white" />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder={isMeeting ? 'Confirm your availability and any details…' : 'Describe what your quote covers, timeline, etc.'}
                className="w-full pl-10 pr-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60" />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 font-semibold backdrop-blur-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-coral-orange text-black hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100">
              {loading ? 'Sending…' : (isMeeting ? 'Send Response' : 'Send Quote')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
