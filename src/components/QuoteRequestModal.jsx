import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { X, Upload, FileText, MapPin, DollarSign, List, User, Mail, Phone, Home } from 'lucide-react';
import { fetchServiceTypesStart } from '../Store/Features/Authentication/authslice';

export function QuoteRequestModal({
  isOpen,
  onClose,
  onSubmit,
  initialCategory = '',
  initialDescription = '',
  initialLocation = '',
  initialBudgetMin = '',
  initialBudgetMax = '',
  categoryOptions = null,
  currentUser = null,
  isMeetingRequest = false
}) {
  const dispatch = useDispatch();
  const { serviceTypes, serviceTypesLoading } = useSelector((state) => state.AuthReducer);

  // The category list lives in the `service_types` table. Fetch once on mount
  // so every consumer of this modal gets the DB-driven list without each page
  // having to wire it up. Consumers may still override via `categoryOptions`.
  useEffect(() => {
    if (!serviceTypes || serviceTypes.length === 0) {
      dispatch(fetchServiceTypesStart());
    }
  }, [dispatch, serviceTypes]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyType: '',
    category: '',
    description: '',
    budgetMin: '',
    budgetMax: '',
    location: '',
    photos: []
  });
  const [isClosing, setIsClosing] = useState(false);

  // Memoised so the prefill effect below keeps a stable dependency. Previously
  // this was a fresh array every render, which re-ran the effect on every
  // keystroke and reset the form — making the inputs impossible to type into.
  const dbCategories = useMemo(() => {
    if (!Array.isArray(serviceTypes)) return [];
    // Show categories that match the logged-in user's audience. Normal users
    // (no business role) see the full catalog. Rows without a category fall
    // through so nothing silently disappears.
    const role = currentUser?.role;
    const cat = role === 'realtor'
      ? 'realtor'
      : (role === 'provider' || role === 'service_provider')
      ? 'service_provider'
      : null;
    const list = cat ? serviceTypes.filter((t) => !t?.category || t.category === cat) : serviceTypes;
    return list.map((t) => t?.name).filter(Boolean);
  }, [serviceTypes, currentUser]);
  const resolvedCategories = useMemo(
    () => (Array.isArray(categoryOptions) && categoryOptions.length > 0 ? categoryOptions : dbCategories),
    [categoryOptions, dbCategories]
  );

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      const categoryPrefill = initialCategory || (resolvedCategories.length === 1 ? resolvedCategories[0] : '');

      // Prefill user data if logged in
      const userName = currentUser?.name || currentUser?.first_name || '';
      const userEmail = currentUser?.email || '';
      const userPhone = currentUser?.phone || '';

      setFormData({
        name: userName,
        email: userEmail,
        phone: userPhone,
        propertyType: '',
        category: categoryPrefill,
        description: initialDescription || '',
        budgetMin: initialBudgetMin || '',
        budgetMax: initialBudgetMax || '',
        location: initialLocation || '',
        photos: []
      });
    }
  }, [isOpen, initialCategory, initialDescription, initialLocation, initialBudgetMin, initialBudgetMax, resolvedCategories, currentUser]);

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
    }, 150);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.photos.length + files.length <= 5) {
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...files]
      }));
    } else {
      alert('You can only upload up to 5 photos');
    }
  };

  const removePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation for meeting request (with new fields)
    if (isMeetingRequest) {
      if (!formData.name || !formData.email || !formData.phone || !formData.propertyType || !formData.category || !formData.description || !formData.budgetMin || !formData.location) {
        alert('Please fill in all required fields');
        return;
      }
    } else {
      // Original validation for quote request
      if (!formData.category || !formData.description || !formData.budgetMin || !formData.location) {
        alert('Please fill in all required fields');
        return;
      }
    }

    onSubmit(formData);
    handleClose();
  };

  if (!isOpen) return null;

  return typeof document !== 'undefined' && createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex: 99999,
        padding: '80px 16px 16px 16px',
        background: isClosing ? 'rgba(0, 69, 113, 0)' : 'rgba(0, 69, 113, 0.75)',
        backdropFilter: 'blur(4px)',
        animation: isClosing ? 'fadeOut 0.15s ease-out' : 'fadeIn 0.3s ease-out'
      }}
      onClick={handleClose}>
      
      <div
        className="relative w-full max-w-2xl rounded-2xl p-6 overflow-y-auto scrollbar-hide"
        style={{
          zIndex: 100000,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
          maxHeight: '90vh',
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
        <div className="mb-6">
          <h2 className="text-2xl text-white drop-shadow-lg mb-2 flex items-center">
            <FileText className="h-6 w-6 mr-2 text-white" />
            {isMeetingRequest ? 'Schedule a Meeting' : 'Request Quote'}
          </h2>
          <p className="text-sm text-white drop-shadow-md">
            {isMeetingRequest ?
            'Fill in your details to schedule a meeting with the realtor' :
            'Upload pictures and details to get quotes from service providers'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New fields for meeting request */}
          {isMeetingRequest &&
          <>
              {/* Name */}
              <div>
                <label className="block text-white mb-2 drop-shadow-md text-sm">
                  Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
                  <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60 transition-colors"
                  required />
                
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-white mb-2 drop-shadow-md text-sm">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
                  <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60 transition-colors"
                  required />
                
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-white mb-2 drop-shadow-md text-sm">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
                  <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="w-full pl-10 pr-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60 transition-colors"
                  required />
                
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-white mb-2 drop-shadow-md text-sm">
                  Property Type *
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
                  <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:border-white/60 transition-colors"
                  required>
                  
                    <option value="" className="bg-dark-blue">Select property type</option>
                    <option value="Residential" className="bg-dark-blue">Residential</option>
                    <option value="Commercial" className="bg-dark-blue">Commercial</option>
                  </select>
                </div>
              </div>
            </>
          }

          {/* Category */}
          <div>
            <label className="block text-white mb-2 drop-shadow-md text-sm">
              Service Category *
            </label>
            <div className="relative">
              <List className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white" />
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:border-white/60"
                required>
                
                <option value="" className="bg-dark-blue">
                  {serviceTypesLoading && resolvedCategories.length === 0 ? 'Loading categories…' : 'Select a category'}
                </option>
                {resolvedCategories.map((cat) =>
                <option key={cat} value={cat} className="bg-dark-blue">{cat}</option>
                )}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white mb-2 drop-shadow-md text-sm">
              Project Description *
            </label>
            <div className="relative">
              {/* <FileText className="absolute left-3 top-3 h-5 w-5 text-white" /> */}
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your project in detail..."
                rows={4}
                className="w-full pl-11 pr-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                required />
              
            </div>
          </div>

          {/* Budget Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2 drop-shadow-md text-sm">
                Budget ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
                <input
                  type="number"
                  name="budgetMin"
                  value={formData.budgetMin}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                  required
                  min="0" />
                
              </div>
            </div>
            {/* <div>
               <label className="block text-white mb-2 drop-shadow-md text-sm">
                 Budget Max ($)
               </label>
               <div className="relative">
                 <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
                 <input
                   type="number"
                   name="budgetMax"
                   value={formData.budgetMax}
                   onChange={handleInputChange}
                   placeholder="0"
                   className="w-full pl-10 pr-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                   min="0"
                 />
               </div>
              </div> */}
          </div>

          {/* Location */}
          <div>
            <label className="block text-white mb-2 drop-shadow-md text-sm">
              Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, State or ZIP code"
                className="w-full pl-10 pr-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                required />
              
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-white mb-2 drop-shadow-md text-sm">
              Photos (up to 5)
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-white/30 rounded-md bg-white/5 hover:bg-white/10 cursor-pointer transition-all duration-300">
                <Upload className="h-5 w-5 mr-2 text-white" />
                <span className="text-white text-sm">Upload Photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden" />
                
              </label>
              {formData.photos.length > 0 &&
              <div className="grid grid-cols-5 gap-2">
                  {formData.photos.map((photo, index) =>
                <div key={index} className="relative">
                      <img
                    src={URL.createObjectURL(photo)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-20 object-cover rounded-md" />
                  
                      <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full hover:bg-red-600">
                    
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                )}
                </div>
              }
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 rounded-xl border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 font-semibold backdrop-blur-sm">
              
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-coral-orange text-black hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg">
              
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}