import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Star } from 'lucide-react';

// Customer-facing modal: leave a star rating + written feedback for a provider
// after a completed job.
export function ReviewModal({ isOpen, onClose, onSubmit, providerName, loading = false }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoverRating(0);
      setTitle('');
      setComment('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) {
      alert('Please select a star rating.');
      return;
    }
    onSubmit({ rating, title: title.trim(), comment: comment.trim() });
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
            <Star className="h-5 w-5 mr-2 text-coral-orange fill-coral-orange" />
            Rate &amp; Review
          </h2>
          {providerName &&
            <p className="text-sm text-white/80 drop-shadow-md mt-1">How was your experience with {providerName}?</p>
          }
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star rating */}
          <div>
            <label className="block text-white mb-2 drop-shadow-md text-sm">Your Rating *</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) =>
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform duration-150 hover:scale-110">
                  <Star
                    className={`h-8 w-8 ${(hoverRating || rating) >= star
                      ? 'text-coral-orange fill-coral-orange'
                      : 'text-white/40'}`} />
                </button>
              )}
              {rating > 0 &&
                <span className="ml-2 text-white drop-shadow-md">{rating}/5</span>
              }
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-white mb-2 drop-shadow-md text-sm">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sum up your experience"
              className="w-full px-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60" />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-white mb-2 drop-shadow-md text-sm">Feedback</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share details of your experience…"
              className="w-full px-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60" />
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
              {loading ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
