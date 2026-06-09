import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, MapPin, DollarSign, Calendar, UserCheck, X, User } from 'lucide-react';
import { openHousesStorage } from '../utils/localStorage';
import { fetchOpenHousesStart } from '../Store/Features/Authentication/authslice';

export function OpenHouseDetailsPage({ navigate, currentUser }) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { openHouses: apiOpenHouses, openHousesLoading } = useSelector(
    (state) => state.AuthReducer
  );

  const [openHouse, setOpenHouse] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);

  // Make sure the list is loaded — needed when the user lands directly on
  // /open-house/:id without first visiting the list page.
  useEffect(() => {
    if (!apiOpenHouses || apiOpenHouses.length === 0) {
      dispatch(fetchOpenHousesStart());
    }
  }, [dispatch, apiOpenHouses]);

  useEffect(() => {
    if (!id) return;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return;

    // Prefer the live API list; fall back to legacy localStorage rows so old
    // demo entries still resolve.
    let found = (apiOpenHouses || []).find(
      (house) => house && Number(house.id) === parsedId
    );
    if (!found) {
      const local = openHousesStorage.get() || [];
      found = local.find((house) => house && Number(house.id) === parsedId);
    }
    setOpenHouse(found || null);
  }, [id, apiOpenHouses]);

  // Phone-only responsive tweaks (laptops/desktops never match this).
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 767px) {
        .ohd-actions { flex-direction: column; gap: 0.75rem; align-items: stretch; }
        .ohd-actions > button { width: 100%; margin-left: 0 !important; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

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

  const handleAttendClick = () => {
    setShowAttendanceModal(true);
  };

  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowAttendanceModal(false);
      setIsClosingModal(false);
    }, 150);
  };

  const handleAttendanceSubmit = (formData) => {
    if (!openHouse || !openHouse.id) return;

    const openHouses = openHousesStorage.get() || [];
    const houseId = openHouse.id;
    const updatedOpenHouses = openHouses.map((house) => {
      if (house && house.id === houseId) {
        const currentAttendees = Array.isArray(house.attendees) ? house.attendees : [];
        return {
          ...house,
          attendees: [...currentAttendees, {
            id: Date.now(),
            ...formData,
            submittedDate: new Date().toISOString()
          }]
        };
      }
      return house;
    });

    openHousesStorage.set(updatedOpenHouses);
    const updated = updatedOpenHouses.find((h) => h && h.id === houseId);
    if (updated) {
      setOpenHouse(updated);
    }
    handleCloseModal();
  };

  if (!openHouse) {
    return (
      <div
        className="px-4 min-h-screen"
        style={{
          background: `
            radial-gradient(ellipse at top right, #0089e1 0%, transparent 50%),
            radial-gradient(ellipse at top left, #004571 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, #004471 0%, transparent 50%),
            radial-gradient(ellipse at bottom left, #001624 0%, transparent 50%),
            linear-gradient(225deg, #004571, #001624)
          `,
          paddingTop: '80px',
          paddingBottom: '64px',
          marginTop: '-65px'
        }}>
        
        <div className="container mx-auto max-w-7xl">
          <button
            onClick={() => navigate('open-house')}
            className="mb-6 flex items-center text-white hover:text-white/80 transition-colors duration-300">
            
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Open Houses</span>
          </button>
          <div className="text-center text-white">
            <p className="text-xl">{openHousesLoading ? 'Loading…' : 'Open house not found'}</p>
          </div>
        </div>
      </div>);

  }

  return (
    <div
      className="px-4 min-h-screen"
      style={{
        background: `
          radial-gradient(ellipse at top right, #0089e1 0%, transparent 50%),
          radial-gradient(ellipse at top left, #004571 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, #004471 0%, transparent 50%),
          radial-gradient(ellipse at bottom left, #001624 0%, transparent 50%),
          linear-gradient(225deg, #004571, #001624)
        `,
        paddingTop: '80px',
        paddingBottom: '64px',
        marginTop: '-65px'
      }}>
      
      <div className="container mx-auto max-w-7xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('open-house')}
          className="mb-6 flex items-center text-white hover:text-white/80 transition-colors duration-300">
          
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Back to Open Houses</span>
        </button>

        {/* Main Content */}
        <div
          className="rounded-2xl p-6 md:p-8 mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          
          {/* Header */}
          <div className="mb-6 relative">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
              <h1 className="text-3xl md:text-4xl text-white drop-shadow-lg">{openHouse?.title || 'Open House Details'}</h1>
              {openHouse?.type &&
              <span className={`px-3 py-1 rounded-full text-xs font-medium text-white drop-shadow-md ${openHouse.type === 'commercial' ?
              'bg-blue-500/20 border border-blue-500/30' :
              'bg-green-500/20 border border-green-500/30'}`
              }>
                  {openHouse.type === 'commercial' ? 'Commercial' : 'Residential'}
                </span>
              }
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Description */}
            {openHouse?.description &&
            <div>
                <h2 className="text-xl text-white font-medium mb-2 drop-shadow-md">Description</h2>
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
                      <div className="text-xs text-white">sq ft</div>
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
                <h2 className="text-xl text-white font-medium mb-3 drop-shadow-md">Property Features</h2>
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
                <h2 className="text-xl text-white font-medium mb-3 drop-shadow-md">Photos</h2>
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

            {/* Video */}
            {openHouse?.video && typeof openHouse.video === 'string' &&
            <div>
                <h2 className="text-xl text-white font-medium mb-3 drop-shadow-md">Video</h2>
                <div className="rounded-lg overflow-hidden bg-white/10 max-w-2xl">
                  <video
                    src={openHouse.video}
                    controls
                    className="w-full h-full"
                    style={{ maxHeight: '420px' }}>
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            }

            {/* Action Buttons */}
            <div className="ohd-actions flex space-x-8 justify-end pt-4 border-t border-white/20">
              <button
                onClick={() => navigate('open-house')}
                className="px-6 py-3 text-white rounded-lg hover:scale-105 transition-all duration-300 font-semibold cursor-pointer shadow-lg"
                style={{
                  pointerEvents: 'auto',
                  zIndex: 9999,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }}>
                
                Back
              </button>
              <button
                onClick={handleAttendClick}
                className="px-6 py-3 text-white rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer font-semibold shadow-lg"
                style={{
                  pointerEvents: 'auto',
                  zIndex: 9999,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }}>
                
                Attend This Open House
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Modal */}
        {showAttendanceModal && openHouse &&
        <AttendanceModal
          isOpen={showAttendanceModal}
          onClose={handleCloseModal}
          onSubmit={handleAttendanceSubmit}
          openHouse={openHouse}
          isClosing={isClosingModal} />

        }
      </div>
    </div>);

}

// Attendance Modal Component
function AttendanceModal({ isOpen, onClose, onSubmit, openHouse, isClosing }) {
  const [formData, setFormData] = useState({
    userType: 'realtor',
    name: '',
    email: '',
    phone: '',
    attendees: 1,
    message: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        userType: 'realtor',
        name: '',
        email: '',
        phone: '',
        attendees: 1,
        message: ''
      });
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return typeof document !== 'undefined' && createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 100000,
        background: isClosing ? 'rgba(0, 69, 113, 0)' : 'rgba(0, 69, 113, 0.75)',
        backdropFilter: 'blur(4px)',
        animation: isClosing ? 'fadeOut 0.15s ease-out' : 'fadeIn 0.3s ease-out'
      }}
      onClick={onClose}>

      <div
        className="relative w-full max-w-2xl rounded-2xl p-6 overflow-y-auto scrollbar-hide"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
          maxHeight: '90vh',
          animation: isClosing ? 'modalPopOut 0.15s ease-out' : 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        onClick={(e) => e.stopPropagation()}>
        
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-all duration-300">
          
          <X className="h-4 w-4 text-white" />
        </button>

        <h2 className="text-2xl text-white drop-shadow-lg mb-2">Confirm Attendance</h2>
        <p className="text-sm text-white drop-shadow-md mb-4">{openHouse?.title}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Type */}
          <div>
            <label className="block text-white mb-2 drop-shadow-md text-sm">I am a: *</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="realtor"
                  checked={formData.userType === 'realtor'}
                  onChange={handleInputChange}
                  className="text-sky-blue" />
                
                <UserCheck className="h-4 w-4 text-white" />
                <span className="text-white">Realtor</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="showing-agent"
                  checked={formData.userType === 'showing-agent'}
                  onChange={handleInputChange}
                  className="text-sky-blue" />
                
                <User className="h-4 w-4 text-white" />
                <span className="text-white">Showing Agent</span>
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-white mb-2 drop-shadow-md text-sm">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your full name"
              className="w-full px-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
              required />
            
          </div>

          {/* Email */}
          <div>
            <label className="block text-white mb-2 drop-shadow-md text-sm">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your.email@example.com"
              className="w-full px-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
              required />
            
          </div>

          {/* Phone */}
          <div>
            <label className="block text-white mb-2 drop-shadow-md text-sm">Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
              required />
            
          </div>

          {/* Number of Attendees */}
          <div>
            <label className="block text-white mb-2 drop-shadow-md text-sm">Number of Attendees</label>
            <input
              type="number"
              name="attendees"
              value={formData.attendees}
              onChange={handleInputChange}
              min="1"
              className="w-full px-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:border-white/60" />
            
          </div>

          {/* Message */}
          <div>
            <label className="block text-white mb-2 drop-shadow-md text-sm">Message (optional)</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Any additional information..."
              rows="3"
              className="w-full px-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60" />
            
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300 font-semibold">
              
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 font-semibold">
              
              Confirm Attendance
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}