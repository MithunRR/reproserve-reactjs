import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Upload, X, Camera, Video, MapPin, DollarSign, Calendar, Building, Home, Star } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { currentUserStorage } from '../utils/localStorage';
import {
  createShowRequestStart, resetCreateShowRequestFlag,
  fetchProvidersStart
} from '../Store/Features/Authentication/authslice';

// Page where a customer posts a property they want shown. The listing goes
// into the marketplace where any realtor can claim it from their profile.
export function ShowMyPropertyPage({ navigate, currentUser }) {
  const [formData, setFormData] = useState({
    propertyType: 'residential',
    title: '',
    description: '',
    location: '',
    price: '',
    openHouseFromDate: '',
    openHouseToDate: '',
    proposedPayoutPerHour: '',
    photos: [],
    video: null
  });

  const dispatch = useDispatch();
  const createShowRequestSuccess = useSelector((s) => s.AuthReducer.createShowRequestSuccess);
  const createShowRequestError   = useSelector((s) => s.AuthReducer.createShowRequestError);
  const createShowRequestLoading = useSelector((s) => s.AuthReducer.createShowRequestLoading);
  const providersList            = useSelector((s) => s.AuthReducer.providersList);

  // Load real realtors as the "available showing agents" preview.
  useEffect(() => {
    dispatch(fetchProvidersStart({ role: 'realtor' }));
  }, [dispatch]);

  useEffect(() => {
    if (createShowRequestSuccess) {
      toast.success('Property listing posted! Realtors will be notified.');
      dispatch(resetCreateShowRequestFlag());
      navigate('profile');
    }
  }, [createShowRequestSuccess, dispatch, navigate]);

  useEffect(() => {
    if (createShowRequestError) {
      toast.error(typeof createShowRequestError === 'string' ? createShowRequestError : 'Failed to post listing');
      dispatch(resetCreateShowRequestFlag());
    }
  }, [createShowRequestError, dispatch]);

  // Phone-only responsive tweaks (laptops/desktops never match this).
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 767px) {
        .smp-card { padding: 1.5rem !important; }
        .smp-photos { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .smp-dates { grid-template-columns: 1fr; }
        .smp-submit { flex-direction: column; gap: 0.75rem; align-items: stretch; }
        .smp-submit > button { width: 100%; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const showingAgents = useMemo(() =>
    (providersList || [])
      .filter((p) => p.role === 'realtor')
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        name: p.businessName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Realtor',
        rating: Number(p.averageRating) || 0,
        reviewCount: p.reviewCount || 0,
        location: [p.city, p.state].filter(Boolean).join(', ') || '—',
        completedJobs: p.completedJobs || 0,
        specialties: (p.serviceType?.name ? [p.serviceType.name] : ['Realtor'])
      })),
    [providersList]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const max = 10; // upload middleware caps photos[] at 10 per request
    if (formData.photos.length + files.length <= max) {
      setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...files] }));
    } else {
      toast.error(`You can upload up to ${max} photos.`);
    }
  };

  const removePhoto = (index) => {
    setFormData((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size <= 25 * 1024 * 1024) {
      setFormData((prev) => ({ ...prev, video: file }));
    } else {
      toast.error('Video file must be 25MB or smaller');
    }
  };

  const removeVideo = () => setFormData((prev) => ({ ...prev, video: null }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location || !formData.proposedPayoutPerHour) {
      toast.error('Please fill in all required fields');
      return;
    }
    const user = currentUser || currentUserStorage.get();
    if (!user?.id) {
      toast.error('Please sign in to list a property.');
      navigate('login');
      return;
    }

    const fd = new FormData();
    fd.append('userId', user.id);
    fd.append('propertyType', formData.propertyType || '');
    fd.append('title', formData.title);
    fd.append('address', formData.location);
    fd.append('description', formData.description);
    if (formData.price) fd.append('price', formData.price);
    fd.append('payoutPerHour', formData.proposedPayoutPerHour);
    if (formData.openHouseFromDate) fd.append('preferredDate', formData.openHouseFromDate);
    if (formData.openHouseToDate) fd.append('preferredDateTo', formData.openHouseToDate);
    formData.photos.forEach((photo) => fd.append('photos', photo));
    dispatch(createShowRequestStart(fd));
  };

  const handleCancel = () => {
    if (window?.history?.length > 1) window.history.back();
    else navigate(-1);
  };

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

      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('realtors')}
            className="mr-4 p-2 rounded-md border border-white/30 hover:bg-white/20 backdrop-blur-sm transition-all duration-300">
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <h1 className="text-3xl text-white drop-shadow-lg">Show My Property</h1>
        </div>

        {/* How it works */}
        <div
          className="rounded-2xl p-6 mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
          <h2 className="text-xl text-white drop-shadow-lg mb-3">How this works</h2>
          <ol className="list-decimal list-inside text-white space-y-1 text-sm">
            <li>Post your property with the hourly rate you're offering.</li>
            <li>Every realtor on ReproServe is notified — the first to claim it becomes your showing agent.</li>
            <li>Track status under <span className="font-semibold">Profile → My Showings</span>.</li>
            <li>When the realtor marks the showing complete, you'll be able to leave a review.</li>
          </ol>
        </div>

        {/* Showing Agents preview (real realtors from the directory) */}
        {showingAgents.length > 0 &&
          <div
            className="smp-card rounded-2xl shadow-lg p-8 mb-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            <div className="mb-6">
              <h2 className="text-xl text-white drop-shadow-lg">Realtors who may claim your showing</h2>
              <p className="text-sm text-white drop-shadow-md">A sampling of agents on ReproServe — once you post, any of them can claim it.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showingAgents.map((agent) =>
                <div
                  key={agent.id}
                  className="group relative rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base text-white font-semibold drop-shadow-md truncate">{agent.name}</h3>
                      <p className="text-xs text-white/80 drop-shadow-md">{agent.location}</p>
                      <div className="flex items-center gap-2 text-xs text-white drop-shadow-md mt-1">
                        <Star className="h-3.5 w-3.5 text-coral-orange fill-coral-orange" />
                        <span>{agent.rating ? agent.rating.toFixed(1) : '—'}</span>
                        <span className="text-white/70">({agent.reviewCount} reviews)</span>
                        <span className="text-white/50">·</span>
                        <span>{agent.completedJobs} jobs</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('provider-profile')}
                      className="px-3 py-1.5 rounded-lg text-white text-xs hover:bg-white/20 transition-all border border-white/30 whitespace-nowrap">
                      View Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        }

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Property Details */}
          <div
            className="smp-card rounded-2xl shadow-lg p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            <h2 className="text-xl text-white drop-shadow-lg mb-6 flex items-center">
              <Building className="h-5 w-5 mr-2 text-white" />
              Property Details
            </h2>

            <div className="space-y-4">
              {/* Property Type */}
              <div>
                <label className="block text-white mb-2 drop-shadow-md">Property Type *</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="propertyType" value="residential"
                      checked={formData.propertyType === 'residential'} onChange={handleInputChange}
                      className="text-sky-blue" />
                    <Home className="h-4 w-4 text-white" />
                    <span className="text-white">Residential</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="propertyType" value="commercial"
                      checked={formData.propertyType === 'commercial'} onChange={handleInputChange}
                      className="text-sky-blue" />
                    <Building className="h-4 w-4 text-white" />
                    <span className="text-white">Commercial</span>
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-white mb-2 drop-shadow-md">Property Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange}
                  placeholder="e.g. 3BR Condo in downtown Phoenix"
                  className="w-full px-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                  required />
              </div>

              {/* Description */}
              <div>
                <label className="block text-white mb-2 drop-shadow-md">Description *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange}
                  placeholder="Describe your property and what kind of showing you need..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                  required />
              </div>

              {/* Location */}
              <div>
                <label className="block text-white mb-2 drop-shadow-md">Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange}
                    placeholder="Full address"
                    className="w-full pl-10 pr-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                    required />
                </div>
              </div>

              {/* Price + Payout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2 drop-shadow-md">Asking Price (optional)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange}
                      placeholder="Listed price"
                      className="w-full pl-10 pr-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                      min="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-white mb-2 drop-shadow-md">Hourly Payout to Agent *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
                    <input type="number" name="proposedPayoutPerHour" value={formData.proposedPayoutPerHour}
                      onChange={handleInputChange}
                      placeholder="e.g. 75"
                      className="w-full pl-10 pr-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                      required min="0" />
                  </div>
                </div>
              </div>

              {/* Date window */}
              <div className="smp-dates grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2 drop-shadow-md">Available From (optional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
                    <input type="date" name="openHouseFromDate" value={formData.openHouseFromDate}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:border-white/60" />
                  </div>
                </div>
                <div>
                  <label className="block text-white mb-2 drop-shadow-md">Available To (optional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
                    <input type="date" name="openHouseToDate" value={formData.openHouseToDate}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:border-white/60" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Photos & Video */}
          <div
            className="smp-card rounded-2xl shadow-lg p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            <h2 className="text-xl text-white drop-shadow-lg mb-6 flex items-center">
              <Camera className="h-5 w-5 mr-2 text-white" />
              Photos & Video
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-white/30 rounded-md bg-white/5 hover:bg-white/10 cursor-pointer transition-all duration-300">
                <Upload className="h-5 w-5 mr-2 text-white" />
                <span className="text-white">Upload Photos (up to 10)</span>
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
              </label>
              {formData.photos.length > 0 &&
                <div className="smp-photos grid grid-cols-5 gap-2">
                  {formData.photos.map((photo, index) =>
                    <div key={index} className="relative">
                      <img src={URL.createObjectURL(photo)} alt={`Photo ${index + 1}`}
                        className="w-full h-20 object-cover rounded-md" />
                      <button type="button" onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full hover:bg-red-600">
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              }
              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-white/30 rounded-md bg-white/5 hover:bg-white/10 cursor-pointer transition-all duration-300">
                <Video className="h-5 w-5 mr-2 text-white" />
                <span className="text-white">Upload Video (optional, max 25MB)</span>
                <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
              </label>
              {formData.video &&
                <div className="text-white text-sm">
                  {formData.video.name} ({(formData.video.size / 1024 / 1024).toFixed(2)} MB)
                  <button type="button" onClick={removeVideo} className="ml-2 text-red-400 hover:text-red-300">
                    Remove
                  </button>
                </div>
              }
            </div>
          </div>

          {/* Submit */}
          <div className="smp-submit flex justify-end space-x-4">
            <button type="button" onClick={handleCancel}
              className="px-6 py-3 rounded-md border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={createShowRequestLoading}
              className="px-6 py-3 rounded-md bg-coral-orange text-black hover:opacity-90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {createShowRequestLoading ? 'Posting…' : 'Post Property Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>);
}
