import React from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, DollarSign, Calendar, UserCheck } from 'lucide-react';

export function ViewDetailsModal({ isOpen, onClose, openHouse, isClosing, onAttendClick }) {
  if (!isOpen && !isClosing) return null;

  // Safety check - if no openHouse data, don't render
  if (!openHouse) return null;

  // Helper function to format price (handles both string and number)
  const formatPrice = (price) => {
    if (!price) return 'Not specified';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return price; // Return as-is if not a valid number
    return numPrice.toLocaleString();
  };

  // Helper function to format date
  const formatDate = (dateTime) => {
    if (!dateTime) return 'Not specified';
    try {
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) return dateTime; // Return as-is if invalid date
      // If it's a date-only string (YYYY-MM-DD), use toLocaleDateString, otherwise use toLocaleString
      if (typeof dateTime === 'string' && dateTime.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return date.toLocaleDateString();
      }
      return date.toLocaleString();
    } catch (e) {
      return dateTime; // Return as-is if error
    }
  };

  return typeof document !== 'undefined' && createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: isClosing ? 'rgba(0, 69, 113, 0)' : 'rgba(0, 69, 113, 0.75)',
        backdropFilter: 'blur(4px)',
        animation: isClosing ? 'fadeOut 0.15s ease-out' : 'fadeIn 0.3s ease-out'
      }}
      onClick={onClose}>
      
      <div
        className="relative w-full max-w-3xl rounded-2xl p-6 overflow-y-auto scrollbar-hide"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
          maxHeight: '90vh',
          animation: isClosing ? 'modalPopOut 0.15s ease-out' : 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="mb-6 relative">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl text-white drop-shadow-lg">{openHouse?.title || 'Open House Details'}</h2>
            <div className="flex items-center space-x-3">
              {openHouse?.type &&
              <span className={`px-3 py-1 rounded-full text-xs font-medium text-white drop-shadow-md ${
              openHouse.type === 'commercial' ?
              'bg-blue-500/20 border border-blue-500/30' :
              'bg-green-500/20 border border-green-500/30'}`
              }>
                  {openHouse.type === 'commercial' ? 'Commercial' : 'Residential'}
                </span>
              }
              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/20 transition-all duration-300 z-50 relative"
                style={{ zIndex: 9999 }}>
                
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Description */}
          {openHouse?.description &&
          <div>
              <h3 className="text-lg text-white font-medium mb-2 drop-shadow-md">Description</h3>
              <p className="text-white drop-shadow-md leading-relaxed">{openHouse.description}</p>
            </div>
          }

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-white mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white drop-shadow-md mb-1">Location</p>
                    <p className="text-white drop-shadow-md">{openHouse?.location || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <DollarSign className="h-5 w-5 text-white mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white drop-shadow-md mb-1">Price</p>
                    <p className="text-white drop-shadow-md">${formatPrice(openHouse?.price)}</p>
                  </div>
                </div>
              </div>
              {openHouse?.squareFootage &&
              <div className="flex items-center justify-center min-w-16 h-16 px-3 rounded-lg bg-white/20 border border-white/30 backdrop-blur-sm flex-shrink-0">
                  <div className="text-center whitespace-nowrap">
                    <div className="text-lg font-bold text-white">{openHouse.squareFootage.toLocaleString()}</div>
                    <div className="text-xs text-white/80">sq ft</div>
                  </div>
                </div>
              }
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-white mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-white drop-shadow-md mb-1">Date Range</p>
                <p className="text-white drop-shadow-md">
                  {openHouse?.fromDate && openHouse?.toDate ?
                  `${formatDate(openHouse.fromDate)} - ${formatDate(openHouse.toDate)}` :
                  openHouse?.fromDate ?
                  formatDate(openHouse.fromDate) :
                  openHouse?.dateTime ?
                  formatDate(openHouse.dateTime) :
                  'Not specified'}
                </p>
              </div>
            </div>

            {openHouse?.attendees && openHouse.attendees.length > 0 &&
            <div className="flex items-start space-x-3">
                <UserCheck className="h-5 w-5 text-white mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white drop-shadow-md mb-1">Attendees</p>
                  <p className="text-white drop-shadow-md">{openHouse.attendees.length} confirmed</p>
                </div>
              </div>
            }
          </div>

          {/* Specs */}
          {openHouse?.specs && openHouse.specs.length > 0 &&
          <div>
              <h3 className="text-lg text-white font-medium mb-3 drop-shadow-md">Property Features</h3>
              <div className="flex flex-wrap gap-2">
                {openHouse.specs.map((spec, idx) =>
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-sm bg-white/20 text-white border border-white/30">
                
                    {spec}
                  </span>
              )}
              </div>
            </div>
          }

          {/* Photos */}
          {openHouse?.photos && Array.isArray(openHouse.photos) && openHouse.photos.length > 0 &&
          <div>
              <h3 className="text-lg text-white font-medium mb-3 drop-shadow-md">Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {openHouse.photos.
              filter((photo) => photo != null && photo !== 'null' && photo !== 'undefined').
              map((photo, idx) => {
                // Handle both base64 strings (from localStorage) and File objects (newly uploaded)
                let photoSrc = null;
                try {
                  if (!photo) {
                    return null; // Skip null/undefined photos
                  }

                  if (typeof photo === 'string') {
                    // Check if it's a valid base64 data URL or regular URL
                    if (photo.startsWith('data:image/') ||
                    photo.startsWith('http://') ||
                    photo.startsWith('https://') ||
                    photo.startsWith('blob:')) {
                      photoSrc = photo;
                    } else {
                      // Invalid or corrupted data, skip
                      console.warn('Invalid photo data:', photo.substring(0, 50));
                      return null;
                    }
                  } else if (photo instanceof File) {
                    // File object - create object URL
                    photoSrc = URL.createObjectURL(photo);
                  } else {
                    // Unknown type, skip
                    console.warn('Unknown photo type:', typeof photo, photo);
                    return null;
                  }
                } catch (error) {
                  console.error('Error processing photo:', error, photo);
                  return null; // Skip this photo
                }

                // Don't render if photoSrc is invalid
                if (!photoSrc) {
                  return null;
                }

                return (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-white/10">
                        <img
                      src={photoSrc}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Replace with placeholder on error
                        const img = e.target;
                        img.style.display = 'none';
                        const placeholder = document.createElement('div');
                        placeholder.className = 'w-full h-full flex items-center justify-center text-white/50 text-sm absolute inset-0';
                        placeholder.textContent = 'Photo unavailable';
                        if (img.parentElement && !img.parentElement.querySelector('.photo-placeholder')) {
                          img.parentElement.appendChild(placeholder);
                        }
                      }} />
                    
                      </div>);

              }).
              filter(Boolean) // Remove null entries
              }
              </div>
            </div>
          }

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-white/20">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300 font-semibold">
              
              Close
            </button>
            <button
              onClick={onAttendClick || onClose}
              className="flex-1 px-6 py-3 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 font-semibold">
              
              Attend This Open House
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}