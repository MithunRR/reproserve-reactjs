import React from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, User, Mail, Phone, MapPin, Home, DollarSign, Calendar, Tag } from 'lucide-react';

// Read-only modal showing the brief details of a single quote / meeting request.
// `request` is a quote record (from /quotes/:id or an already-loaded list item);
// pass `loading` while it is still being fetched.
export function RequestDetailsModal({ isOpen, onClose, request, loading = false }) {
  if (!isOpen) return null;

  const isMeeting = request?.isMeetingRequest;
  const status = request?.status || 'pending';
  const photos = Array.isArray(request?.photos) ? request.photos : [];

  const statusClass =
    status === 'accepted' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
    status === 'declined' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
    status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
    'bg-white/20 text-white border-white/30';

  const Row = ({ icon: Icon, label, value }) =>
    <div className="flex items-start">
      <Icon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-white/80" />
      <div className="min-w-0">
        <div className="text-xs text-white/70">{label}</div>
        <div className="text-white break-words">{value}</div>
      </div>
    </div>;

  return typeof document !== 'undefined' && createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex: 99999,
        padding: '16px',
        background: 'rgba(0, 69, 113, 0.75)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}>

      {/* Phone-only: the desktop 50vw panel is far too narrow on a phone, so
          widen it to ~full width and let height fit content. Desktop unchanged. */}
      <style>{`@media (max-width: 767px){ .rdm-panel{ width: 92vw !important; height: auto !important; max-height: 85vh !important; } }`}</style>

      <div
        className="rdm-panel relative rounded-2xl p-6 overflow-y-auto scrollbar-hide"
        style={{
          zIndex: 100000,
          width: '50vw',
          height: '70vh',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}
        onClick={(e) => e.stopPropagation()}>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-all duration-300">
          <X className="h-4 w-4 text-white" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-xl text-white drop-shadow-lg flex items-center">
            <FileText className="h-5 w-5 mr-2 text-white" />
            {isMeeting ? 'Meeting Request' : 'Quote Request'}
          </h2>
        </div>

        {loading &&
          <p className="text-white drop-shadow-md py-8 text-center">Loading request…</p>
        }

        {!loading && !request &&
          <p className="text-white drop-shadow-md py-8 text-center">Request details are unavailable.</p>
        }

        {!loading && request &&
          <div className="space-y-4">
            {/* Requester + status */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center text-base text-white font-medium drop-shadow-md">
                  <User className="h-4 w-4 mr-2 text-white/80" />
                  {request.name || 'Client'}
                </div>
                <div className="mt-1 space-y-1 text-sm text-white/90 drop-shadow-md">
                  {request.email &&
                    <div className="flex items-center"><Mail className="h-3.5 w-3.5 mr-2 text-white/70" />{request.email}</div>
                  }
                  {request.phone &&
                    <div className="flex items-center"><Phone className="h-3.5 w-3.5 mr-2 text-white/70" />{request.phone}</div>
                  }
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize border whitespace-nowrap ${statusClass}`}>
                {status}
              </span>
            </div>

            {/* Detail rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm drop-shadow-md pt-3 border-t border-white/20">
              {request.category && <Row icon={Tag} label="Service" value={request.category} />}
              {request.propertyType && <Row icon={Home} label="Property type" value={request.propertyType} />}
              {request.location && <Row icon={MapPin} label="Location" value={request.location} />}
              {(request.budgetMin || request.budgetMax) &&
                <Row
                  icon={DollarSign}
                  label="Budget"
                  value={`$${request.budgetMin || 0}${request.budgetMax ? ` - $${request.budgetMax}` : '+'}`} />
              }
              {request.createdAt &&
                <Row icon={Calendar} label="Submitted" value={new Date(request.createdAt).toLocaleString()} />
              }
            </div>

            {/* Description */}
            {request.description &&
              <div className="pt-3 border-t border-white/20">
                <p className="text-xs text-white/70 mb-1">Description</p>
                <p className="text-sm text-white leading-relaxed drop-shadow-md">{request.description}</p>
              </div>
            }

            {/* Photos */}
            {photos.length > 0 &&
              <div className="pt-3 border-t border-white/20">
                <p className="text-xs text-white/70 mb-2">Attachments</p>
                <div className="flex flex-wrap gap-2">
                  {photos.map((photo, idx) =>
                    <img
                      key={idx}
                      src={photo}
                      alt={`Attachment ${idx + 1}`}
                      className="w-16 h-16 object-cover rounded-md border border-white/20" />
                  )}
                </div>
              </div>
            }
          </div>
        }

        {/* Footer */}
        <div className="flex justify-end pt-5">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 font-semibold backdrop-blur-sm">
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
