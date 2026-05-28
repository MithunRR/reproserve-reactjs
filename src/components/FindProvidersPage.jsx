import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Filter, MapPin, Star, MessageSquare,
  Hammer, Wrench, Zap, Droplets, Thermometer, Trees, Paintbrush,
  Shield, Key, Palette, Truck,
  Home, Building, HardHat, Grid3X3, ChevronDown,
  CheckCircle, LocateFixed, Loader2, X } from
'lucide-react';
import apiClient from '../utils/api';
import { MessagingModal } from './MessagingModal';
import { QuoteRequestModal } from './QuoteRequestModal';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { currentUserStorage } from '../utils/localStorage';
import {
  fetchProvidersStart,
  createQuoteStart,
  resetCreateQuoteFlag
} from '../Store/Features/Authentication/authslice';

export function FindProvidersPage({ navigate }) {
  // Add CSS animations for dropdown effects
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        0% {
          opacity: 0;
          transform: translateY(-10px) scale(0.98);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      @keyframes fadeInUp {
        0% {
          opacity: 0;
          transform: translateY(8px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slideInFromTop {
        0% {
          opacity: 0;
          transform: translateY(-12px);
          max-height: 0;
        }
        100% {
          opacity: 1;
          transform: translateY(0);
          max-height: 500px;
        }
      }
      
      @keyframes scaleIn {
        0% {
          opacity: 0;
          transform: scale(0.95);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      /* Smooth accordion animation */
      .category-accordion {
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .category-accordion-content {
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: max-height, opacity, transform;
      }
      
      .service-item-enter {
        animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        opacity: 0;
        transform: translateY(8px);
      }
      
      /* Custom scrollbar styling */
      .scrollbar-thin::-webkit-scrollbar {
        width: 6px;
      }
      
      .scrollbar-thin::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .scrollbar-thin::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
      }
      
      .scrollbar-thin::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
      }
      
      /* Firefox scrollbar */
      .scrollbar-thin {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
      }
      
      /* Optimize scroll performance */
      .scroll-optimized {
        will-change: transform;
        transform: translateZ(0);
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }
      
      /* Prevent white flash during scroll */
      body {
        background-color: #001624 !important;
      }
      
      /* Optimize backdrop-filter elements */
      [style*="backdrop-filter"] {
        will-change: transform;
        transform: translateZ(0);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [searchTerm, setSearchTerm] = useState(() => {
    // Check for search term from home page search
    const globalSearch = localStorage.getItem('globalSearchTerm');
    if (globalSearch) {
      localStorage.removeItem('globalSearchTerm');
      return globalSearch;
    }
    return '';
  });
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isSubcategoryDropdownOpen, setIsSubcategoryDropdownOpen] = useState(false);
  const [dropdownJustOpened, setDropdownJustOpened] = useState(false);
  const categoryDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const subcategoryDropdownRef = useRef(null);
  const [categoryDropdownPosition, setCategoryDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [sortDropdownPosition, setSortDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [subcategoryDropdownPosition, setSubcategoryDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [location, setLocation] = useState('');
  // Radius-search state. coords is the user's centre point (browser GPS or
  // geocoded ZIP); radiusKm narrows the result set to that distance from it.
  const [coords, setCoords] = useState(null);   // { lat, lng } | null
  const [radiusKm, setRadiusKm] = useState(5);
  const [geolocating, setGeolocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [locationLabel, setLocationLabel] = useState(''); // "Your location" / city name
  const [selectedCategory, setSelectedCategory] = useState(() => {
    // Pre-select the category chosen from the home page category buttons.
    const storedCategory = localStorage.getItem('selectedProviderCategory');
    if (storedCategory) {
      localStorage.removeItem('selectedProviderCategory');
      return storedCategory;
    }
    return '';
  });
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteDefaults, setQuoteDefaults] = useState({ category: '', description: '', location: '', budgetMin: '', budgetMax: '', providerId: null });
  const [quoteCategories, setQuoteCategories] = useState([]);

  const dispatch = useDispatch();
  const currentUser = currentUserStorage.get();
  const apiProviders = useSelector((state) => state.AuthReducer.providers);
  const createQuoteSuccess = useSelector((state) => state.AuthReducer.createQuoteSuccess);
  const createQuoteError = useSelector((state) => state.AuthReducer.createQuoteError);

  // Load service providers from the API. When coords are set, the backend
  // applies a Haversine radius filter and returns sorted-by-distance results.
  useEffect(() => {
    const payload = { role: 'service_provider' };
    if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
      payload.lat = coords.lat;
      payload.lng = coords.lng;
      payload.radius = radiusKm;
    }
    dispatch(fetchProvidersStart(payload));
  }, [dispatch, coords, radiusKm]);

  // Browser-native geolocation — no API key, just a permission prompt.
  const useMyLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser.');
      return;
    }
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLabel('Your location');
        setLocation('');
        setGeolocating(false);
        toast.success(`Showing providers within ${radiusKm} km`);
      },
      (err) => {
        setGeolocating(false);
        toast.error(err.message || 'Could not get your location');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60_000 }
    );
  };

  // Geocode whatever was typed into the location box via /api/geocode (which
  // proxies OSM Nominatim). Triggered on Enter or blur.
  const geocodeTypedLocation = async () => {
    const q = location.trim();
    if (!q) return;
    setGeocoding(true);
    try {
      const res = await apiClient.get(`/api/geocode?q=${encodeURIComponent(q)}`);
      const hit = res.data?.data;
      if (hit?.lat != null && hit?.lng != null) {
        setCoords({ lat: hit.lat, lng: hit.lng });
        setLocationLabel(hit.displayName || q);
        toast.success(`Showing providers within ${radiusKm} km`);
      } else {
        toast.error('Could not find that location.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Lookup failed';
      toast.error(msg);
    } finally {
      setGeocoding(false);
    }
  };

  const clearRadius = () => {
    setCoords(null);
    setLocationLabel('');
  };

  useEffect(() => {
    if (createQuoteSuccess) {
      toast.success('Quote request submitted successfully!');
      setShowQuoteModal(false);
      dispatch(resetCreateQuoteFlag());
    }
  }, [createQuoteSuccess, dispatch]);

  useEffect(() => {
    if (createQuoteError) {
      toast.error(typeof createQuoteError === 'string' ? createQuoteError : 'Failed to submit quote');
      dispatch(resetCreateQuoteFlag());
    }
  }, [createQuoteError, dispatch]);

  // Calculate dropdown positions
  useEffect(() => {
    if (isCategoryDropdownOpen && categoryDropdownRef.current) {
      const rect = categoryDropdownRef.current.getBoundingClientRect();
      setCategoryDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: 280 // Fixed width for category dropdown
      });
    }
  }, [isCategoryDropdownOpen]);

  useEffect(() => {
    if (isSortDropdownOpen && sortDropdownRef.current) {
      const rect = sortDropdownRef.current.getBoundingClientRect();
      setSortDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: 200 // Fixed width for sort dropdown
      });
    }
  }, [isSortDropdownOpen]);

  useEffect(() => {
    if (isSubcategoryDropdownOpen && subcategoryDropdownRef.current) {
      const rect = subcategoryDropdownRef.current.getBoundingClientRect();
      setSubcategoryDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: 300 // Fixed width for subcategory dropdown
      });
    }
  }, [isSubcategoryDropdownOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is on dropdown trigger buttons
      const isCategoryClick = categoryDropdownRef.current && categoryDropdownRef.current.contains(event.target);
      const isSortClick = sortDropdownRef.current && sortDropdownRef.current.contains(event.target);
      const isSubcategoryClick = subcategoryDropdownRef.current && subcategoryDropdownRef.current.contains(event.target);

      // Check if click is on portal-rendered dropdown content
      const isDropdownContent = event.target.closest('[data-dropdown-content]');

      if (!isCategoryClick && !isSortClick && !isSubcategoryClick && !isDropdownContent) {
        setIsCategoryDropdownOpen(false);
        setIsSortDropdownOpen(false);
        setIsSubcategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = [
  {
    title: 'Construction & Renovation',
    services: [
    { name: 'General Contractor', icon: HardHat, description: 'Oversees renovation, remodeling, or building projects and coordinates subcontractors.' },
    { name: 'Roofer', icon: Home, description: 'Installs, repairs, and replaces roofs.' },
    { name: 'Flooring / Tile Installer', icon: Grid3X3, description: 'Installs hardwood, laminate, tiles, or stone flooring.' },
    { name: 'Window / Door Contractor', icon: Building, description: 'Installs or replaces windows, doors, and glass fittings.' },
    { name: 'Siding Contractor', icon: Building, description: 'Installs and repairs exterior siding or cladding.' },
    { name: 'Foundation / Structural Contractor', icon: Hammer, description: 'Repairs foundations and ensures structural stability.' },
    { name: 'Pool / Spa Contractor', icon: Droplets, description: 'Installs, repairs, and maintains pools and spas.' },
    { name: 'Utility / Infrastructure Installer', icon: Zap, description: 'Installs electricity, water, gas, sewer, or telecom connections.' }]

  },
  {
    title: 'Repairs & Maintenance',
    services: [
    { name: 'Handyman', icon: Wrench, description: 'Handles small repairs, maintenance, and odd jobs.' },
    { name: 'Electrician', icon: Zap, description: 'Installs and repairs electrical wiring, circuits, and systems.' },
    { name: 'Plumber', icon: Droplets, description: 'Installs and maintains pipes, fixtures, and drainage systems.' },
    { name: 'HVAC Technician', icon: Thermometer, description: 'Installs and repairs heating, ventilation, and air conditioning systems.' },
    { name: 'Gutter / Drainage Specialist', icon: Droplets, description: 'Installs and maintains gutters and drainage systems.' },
    { name: 'Septic / Wastewater Contractor', icon: Droplets, description: 'Installs and services septic systems and drainage.' },
    { name: 'Pest Control Technician', icon: Shield, description: 'Provides termite, insect, and rodent control services.' },
    { name: 'Cleaning Service Provider', icon: Paintbrush, description: 'Offers deep cleaning, routine cleaning, and specialized cleaning.' },
    { name: 'Tree Service Contractor', icon: Trees, description: 'Trims, removes, or maintains trees and large shrubs.' }]

  },
  {
    title: 'Outdoor & Landscaping',
    services: [
    { name: 'Landscaper / Hardscaper', icon: Trees, description: 'Designs and maintains lawns, gardens, patios, and outdoor spaces.' },
    { name: 'Tree Service Contractor', icon: Trees, description: 'Trims, removes, or maintains trees and large shrubs.' },
    { name: 'Pool / Spa Contractor', icon: Droplets, description: 'Installs, repairs, and maintains pools and spas.' }]

  },
  {
    title: 'Home Services & Lifestyle',
    services: [
    { name: 'Painter', icon: Paintbrush, description: 'Handles interior and exterior painting, finishes, and coatings.' },
    { name: 'Home Security Installer', icon: Shield, description: 'Installs alarms, cameras, and smart security systems.' },
    { name: 'Locksmith', icon: Key, description: 'Installs locks, provides key services, and emergency lockout help.' },
    { name: 'Interior Designer / Stager', icon: Palette, description: 'Designs and decorates interiors, stages homes for sale.' },
    { name: 'Moving / Relocation Service', icon: Truck, description: 'Provides moving, packing, and transport services.' }]

  }];


  // Service providers come from the API (/providers?role=service_provider).
  // Each backend user record is mapped into the card shape this page renders.
  const providers = (apiProviders || []).map((u) => ({
    id: u.id,
    name: u.businessName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Service Provider',
    category: u.serviceType?.name || 'Service Provider',
    subcategory: u.serviceType?.name || 'Service Provider',
    rating: Number(u.averageRating) || 0,
    reviewCount: u.reviewCount || 0,
    location: [u.city, u.state].filter(Boolean).join(', ') || 'Location not set',
    phone: u.phone || '',
    verified: u.isActive !== false,
    yearsInBusiness: u.createdAt
      ? Math.max(1, new Date().getFullYear() - new Date(u.createdAt).getFullYear())
      : 1,
    completedJobs: u.completedJobs || 0,
    specialties: Array.isArray(u.specialties) ? u.specialties : [],
    description: u.businessDesc || 'No description provided.',
    startingPrice: u.startingPrice || 'Contact for pricing',
    availability: u.availability || 'Contact for availability',
    distanceKm: u.distanceKm != null ? Number(u.distanceKm) : null
  }));


  // A provider's broad category is derived from its service type (subcategory)
  // using the `categories` taxonomy above. A service type can be listed under
  // more than one category, so membership is checked rather than a single map.
  const categoriesForSubcategory = (subcategoryName) =>
    categories
      .filter((cat) => cat.services.some((s) => s.name === subcategoryName))
      .map((cat) => cat.title);

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch = !searchTerm ||
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.specialties.some((specialty) => specialty.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = !selectedCategory ||
    categoriesForSubcategory(provider.subcategory).includes(selectedCategory);
    const matchesSubcategory = !selectedSubcategory || provider.subcategory === selectedSubcategory;
    const matchesLocation = !location || provider.location.toLowerCase().includes(location.toLowerCase());

    return matchesSearch && matchesCategory && matchesSubcategory && matchesLocation;
  });

  const parseBudgetFromText = (text) => {
    if (!text) return '';
    const numbers = text.replace(/[^0-9.]/g, '');
    return numbers ? numbers : '';
  };

  const sortedProviders = [...filteredProviders].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price':
        return parseInt(a.startingPrice.replace(/\D/g, '')) - parseInt(b.startingPrice.replace(/\D/g, ''));
      case 'experience':
        return b.yearsInBusiness - a.yearsInBusiness;
      case 'reviews':
        return b.reviewCount - a.reviewCount;
      default:
        return 0;
    }
  });

  const handleQuoteSubmit = (data) => {
    if (!currentUser?.id) {
      toast.error('Please sign in to request a quote.');
      navigate('/login');
      return;
    }
    const fd = new FormData();
    fd.append('userId', currentUser.id);
    if (quoteDefaults.providerId) fd.append('providerId', quoteDefaults.providerId);
    fd.append('name', data.name || '');
    fd.append('email', data.email || '');
    fd.append('phone', data.phone || '');
    fd.append('propertyType', data.propertyType || '');
    fd.append('category', data.category || '');
    fd.append('description', data.description || '');
    if (data.budgetMin) fd.append('budgetMin', data.budgetMin);
    if (data.budgetMax) fd.append('budgetMax', data.budgetMax);
    fd.append('location', data.location || '');
    (data.photos || []).forEach((photo) => fd.append('photos', photo));
    dispatch(createQuoteStart(fd));
  };

  return (
    <div
      className="px-4 relative"
      style={{
        minHeight: '100vh',
        paddingTop: '80px',
        paddingBottom: '64px',
        marginTop: '-65px',
        background: `
          radial-gradient(ellipse at top right, #0089e1 0%, transparent 50%),
          radial-gradient(ellipse at top left, #004571 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, #004471 0%, transparent 50%),
          radial-gradient(ellipse at bottom left, #001624 0%, transparent 50%),
          linear-gradient(225deg, #004571, #001624)
        `
      }}>
      
      {/* Fixed background layer to prevent white flicker */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: `
            radial-gradient(ellipse at top right, #0089e1 0%, transparent 50%),
            radial-gradient(ellipse at top left, #004571 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, #004471 0%, transparent 50%),
            radial-gradient(ellipse at bottom left, #001624 0%, transparent 50%),
            linear-gradient(225deg, #004571, #001624)
          `,
          willChange: 'transform',
          transform: 'translateZ(0)' // Force GPU acceleration
        }} />
      
      {/* Content wrapper */}
      <div
        className="relative z-0"
        style={{
          minHeight: 'calc(100vh - 80px)'
        }}>
        
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl mb-4 text-white drop-shadow-lg">Find a Service Provider</h1>
            <p className="text-xl text-white drop-shadow-md">Browse verified professionals in your area</p>
          </div>

          {/* Search and Filters */}
          <div
            className="rounded-2xl p-6 mb-8 relative overflow-visible"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            
            {/* Radius search controls — browser GPS or typed ZIP/address, both
                free via OpenStreetMap Nominatim. */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <button
                type="button"
                onClick={useMyLocation}
                disabled={geolocating}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.1))',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)'
                }}>
                {geolocating
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <LocateFixed className="h-4 w-4" />}
                <span>Use my location</span>
              </button>

              <div className="flex items-center gap-2 text-white">
                <span className="text-sm drop-shadow-md">Within</span>
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="px-3 py-2 rounded-md text-white text-sm cursor-pointer focus:outline-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.1))',
                    border: '2px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(10px)',
                    // Hide native arrow + use our own caret so colours stay on-theme
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    paddingRight: '28px',
                    backgroundImage:
                      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'><polyline points='6 9 12 15 18 9'/></svg>\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center'
                  }}>
                  {[2, 5, 10, 25, 50, 100].map((k) =>
                    // Inline bg/color so the OS-rendered options match the dark theme
                    <option key={k} value={k} style={{ background: '#004571', color: '#fff' }}>{k} km</option>
                  )}
                </select>
              </div>

              {coords &&
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/30 text-white text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="max-w-[280px] truncate">{locationLabel}</span>
                  <button
                    type="button"
                    onClick={clearRadius}
                    className="p-0.5 rounded-full hover:bg-white/20"
                    title="Clear radius filter">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              }
            </div>

            <div className="flex flex-nowrap items-center gap-3 mb-4">
              <Filter className="h-5 w-5 text-white flex-shrink-0" />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                {/* Search Input */}
                <div className="relative">
                  <input
                    placeholder="Search services or professionals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 text-white rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                    }} />

                </div>

                {/* Location Input — hit Enter or blur to geocode via OSM */}
                <div className="relative">
                  <input
                    placeholder="Location or ZIP (press Enter)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onBlur={geocodeTypedLocation}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); geocodeTypedLocation(); } }}
                    className="w-full px-4 py-3 pr-10 text-white rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                    }} />
                  {geocoding &&
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white animate-spin" />
                  }
                </div>

                {/* Category Dropdown */}
                <div className="relative">
                  <button
                    ref={categoryDropdownRef}
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 text-white rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg"
                    style={{
                      pointerEvents: 'auto',
                      zIndex: 9999,
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                    }}>
                    
                    <span className="truncate">{selectedCategory || 'All Categories'}</span>
                    <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-300 flex-shrink-0 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isCategoryDropdownOpen && typeof document !== 'undefined' && createPortal(
                    <div
                      data-dropdown-content
                      className="absolute rounded-2xl shadow-lg z-[9999]"
                      style={{
                        top: categoryDropdownPosition.top,
                        left: categoryDropdownPosition.left,
                        width: categoryDropdownPosition.width,
                        background: 'linear-gradient(135deg, rgba(0, 69, 113, 0.95), rgba(0, 69, 113, 0.95))',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
                        animation: 'slideDown 0.5s ease-out'
                      }}>
                      
                      <div className="py-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
                        <button
                          onClick={() => {
                            setSelectedCategory('');
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 transition-all duration-200 hover:bg-white/20 ${selectedCategory === '' ? 'bg-white/20 text-white' : 'text-white'}`
                          }>
                          
                          All Categories
                        </button>
                        {categories.map((category, index) =>
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedCategory(category.title);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 transition-all duration-200 hover:bg-white/20 ${selectedCategory === category.title ? 'bg-white/20 text-white' : 'text-white'}`
                          }
                          style={{
                            animation: `fadeInUp 0.3s ease-out ${index * 50}ms forwards`
                          }}>
                          
                            {category.title}
                          </button>
                        )}
                      </div>
                    </div>,
                    document.body
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    ref={sortDropdownRef}
                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 text-white rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg"
                    style={{
                      pointerEvents: 'auto',
                      zIndex: 9999,
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                    }}>
                    
                    <span className="truncate">
                      {sortBy === 'rating' ? 'Sort: Rating' :
                      sortBy === 'price' ? 'Sort: Price' :
                      sortBy === 'experience' ? 'Sort: Experience' :
                      'Sort: Reviews'}
                    </span>
                    <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-300 flex-shrink-0 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isSortDropdownOpen && typeof document !== 'undefined' && createPortal(
                    <div
                      data-dropdown-content
                      className="absolute rounded-2xl shadow-lg z-[9999]"
                      style={{
                        top: sortDropdownPosition.top,
                        left: sortDropdownPosition.left,
                        width: sortDropdownPosition.width,
                        background: 'linear-gradient(135deg, rgba(0, 69, 113, 0.95), rgba(0, 69, 113, 0.95))',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
                        animation: 'slideDown 0.5s ease-out'
                      }}>
                      
                      <div className="py-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
                        {[
                        { value: 'rating', label: 'Sort by Rating' },
                        { value: 'price', label: 'Sort by Price' },
                        { value: 'experience', label: 'Sort by Experience' },
                        { value: 'reviews', label: 'Sort by Reviews' }].
                        map((option, index) =>
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setIsSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 transition-all duration-200 hover:bg-white/20 ${sortBy === option.value ? 'bg-white/20 text-white' : 'text-white'}`
                          }
                          style={{
                            animation: `fadeInUp 0.3s ease-out ${index * 50}ms forwards`
                          }}>
                          
                            {option.label}
                          </button>
                        )}
                      </div>
                    </div>,
                    document.body
                  )}
                </div>
              </div>
            </div>

            {/* Reset Button */}
            {/* <div className="flex justify-end mt-4">
              <button
               onClick={() => {
                 setSearchTerm('');
                 setLocation('');
                 setSelectedCategory('');
                 setSelectedSubcategory('');
                 setSortBy('rating');
               }}
               className="px-6 py-3 text-white rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg"
               style={{
                 pointerEvents: 'auto',
                 zIndex: 9999,
                 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                 backdropFilter: 'blur(10px)',
                 border: '2px solid rgba(255, 255, 255, 0.4)',
                 boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
               }}
              >
               Reset
              </button>
              </div> */}

            <div
              className="overflow-visible"
              style={{
                maxHeight: selectedCategory ? '80px' : '0px',
                opacity: selectedCategory ? 1 : 0,
                marginTop: selectedCategory ? '16px' : '0px',
                transform: selectedCategory ? 'translateY(0)' : 'translateY(-8px)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: selectedCategory ? '0ms' : '0ms',
                willChange: 'max-height, opacity, transform, margin-top',
                paddingRight: selectedCategory ? '12px' : '0px'
              }}>
              
              {selectedCategory &&
              <div
                className="relative"
                style={{
                  animation: 'fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                  opacity: 0,
                  transform: 'translateY(8px)'
                }}>
                
                  <button
                  ref={subcategoryDropdownRef}
                  onClick={() => setIsSubcategoryDropdownOpen(!isSubcategoryDropdownOpen)}
                  className="w-full md:w-auto flex items-center justify-between px-4 py-3 text-white rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg"
                  style={{
                    pointerEvents: 'auto',
                    zIndex: 9999,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    maxWidth: '100%'
                  }}>
                  
                    <span>{selectedSubcategory || `All ${selectedCategory} Services`}</span>
                    <ChevronDown
                    className={`h-4 w-4 ml-2 flex-shrink-0 transition-transform duration-300 ${isSubcategoryDropdownOpen ? 'rotate-180' : ''}`}
                    style={{
                      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
                  
                  </button>

                  {isSubcategoryDropdownOpen && typeof document !== 'undefined' && createPortal(
                  <div
                    data-dropdown-content
                    className="absolute rounded-2xl shadow-lg z-[9999]"
                    style={{
                      top: subcategoryDropdownPosition.top,
                      left: subcategoryDropdownPosition.left,
                      width: subcategoryDropdownPosition.width,
                      background: 'linear-gradient(135deg, rgba(0, 69, 113, 0.95), rgba(0, 69, 113, 0.95))',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
                      animation: 'slideDown 0.5s ease-out'
                    }}>
                    
                      <div className="py-2">
                        <button
                        onClick={() => {
                          setSelectedSubcategory('');
                          setIsSubcategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 transition-all duration-200 hover:bg-white/20 ${selectedSubcategory === '' ? 'bg-white/20 text-white' : 'text-white'}`
                        }>
                        
                          All {selectedCategory} Services
                        </button>
                        {categories.
                      find((cat) => cat.title === selectedCategory)?.
                      services.map((service, index) =>
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedSubcategory(service.name);
                          setIsSubcategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 transition-all duration-200 hover:bg-white/20 ${selectedSubcategory === service.name ? 'bg-white/20 text-white' : 'text-white'}`
                        }
                        style={{
                          animation: `fadeInUp 0.3s ease-out ${index * 50}ms forwards`
                        }}>
                        
                              {service.name}
                            </button>
                      )}
                      </div>
                    </div>,
                  document.body
                )}
                </div>
              }
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Service Categories Sidebar */}
            {/* <div className="lg:w-1/4">
               <div
                 className="rounded-2xl p-6 sticky top-24 relative overflow-hidden"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                   backdropFilter: 'blur(20px)',
                   border: '1px solid rgba(255,255,255,0.2)',
                   boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                 }}
               >
                 <h3 className="text-lg mb-6 text-white drop-shadow-md font-semibold">Service Categories</h3>
                 <div className="space-y-3">
                   {categories.map((category, categoryIndex) => {
                     const isOpen = selectedCategory === category.title;
                     return (
                       <div key={categoryIndex} className="category-accordion">
                         <button
                           onClick={() => {
                             setSelectedCategory(isOpen ? '' : category.title);
                             setSelectedSubcategory('');
                           }}
                           className="w-full text-left p-4 rounded-xl cursor-pointer bg-white/20 backdrop-blur-sm text-white"
                           style={{
                             transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                             color: 'white',
                             backgroundColor: 'rgba(255, 255, 255, 0.2)',
                             transform: isOpen ? 'scale(1.02)' : 'scale(1)',
                             borderWidth: isOpen ? '2px' : '1px',
                             borderStyle: 'solid',
                             borderColor: isOpen ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.3)',
                             boxShadow: isOpen ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
                             textShadow: isOpen ? '0 1px 2px rgba(0, 0, 0, 0.2)' : 'none',
                           }}
                           onMouseEnter={(e) => {
                             if (!isOpen) {
                               e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                               e.currentTarget.style.transform = 'scale(1.01)';
                             }
                           }}
                           onMouseLeave={(e) => {
                             if (!isOpen) {
                               e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                               e.currentTarget.style.transform = 'scale(1)';
                             }
                           }}
                         >
                           <div className="flex items-center justify-between">
                             <span className="font-medium text-sm md:text-base">{category.title}</span>
                             <ChevronDown
                               className={`h-4 w-4 flex-shrink-0 transition-all duration-300 ${isOpen ? 'rotate-180' : ''
                                 }`}
                               style={{
                                 transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                               }}
                             />
                           </div>
                         </button>
                          <div
                           className={`category-accordion-content overflow-hidden ${isOpen ? 'mt-3' : 'mt-0'
                             }`}
                           style={{
                             maxHeight: isOpen ? `${category.services.length * 56 + 16}px` : '0px',
                             opacity: isOpen ? 1 : 0,
                             transform: isOpen ? 'translateY(0)' : 'translateY(-8px)',
                           }}
                         >
                           <div className="ml-2 space-y-2">
                             {category.services.map((service, serviceIndex) => {
                               const IconComponent = service.icon;
                               const isSelected = selectedSubcategory === service.name;
                               return (
                                 <div
                                   key={serviceIndex}
                                   className="service-item-enter"
                                   style={{
                                     animationDelay: `${serviceIndex * 50}ms`,
                                   }}
                                 >
                                   <button
                                     onClick={() => setSelectedSubcategory(service.name)}
                                     className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-all duration-300 cursor-pointer ${isSelected
                                       ? 'bg-white/30 text-white shadow-md scale-[1.02] border border-white/40'
                                       : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/40 hover:scale-[1.01]'
                                       }`}
                                     style={{
                                       transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                     }}
                                   >
                                     <IconComponent
                                       className={`h-4 w-4 flex-shrink-0 transition-all duration-300 ${isSelected ? 'scale-110' : ''
                                         }`}
                                     />
                                     <span className="text-sm font-medium">{service.name}</span>
                                   </button>
                                 </div>
                               );
                             })}
                           </div>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
              </div> */
            }

            {/* Provider Results */}
            <div className="lg:w-full">
              <div className="mb-6 flex justify-between items-center flex-wrap gap-2">
                <p className="text-white drop-shadow-md">
                  {sortedProviders.length} providers found
                  {selectedCategory && ` in ${selectedCategory}`}
                  {selectedSubcategory && ` - ${selectedSubcategory}`}
                  {coords && ` within ${radiusKm} km`}
                </p>
                {coords &&
                  <p className="text-[11px] text-white/60">
                    Geocoding ©{' '}
                    <a
                      href="https://www.openstreetmap.org/copyright"
                      target="_blank" rel="noreferrer"
                      className="underline hover:text-white">
                      OpenStreetMap contributors
                    </a>
                  </p>
                }
              </div>

              <div className="space-y-8">
                {sortedProviders.map((provider) =>
                <div
                  key={provider.id}
                  className="group relative rounded-2xl p-8 cursor-pointer overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2 z-10"
                  onClick={() => { localStorage.setItem('selectedProviderId', provider.id); navigate('provider-profile'); }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}>
                  
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-blue/10 via-transparent to-coral-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="flex flex-col lg:flex-row gap-6 relative z-10">
                      {/* Provider Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-lg bg-dark-blue group-hover:scale-110 transition-transform duration-300">
                              {provider.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div>
                              <h3 className="text-2xl text-white group-hover:text-white transition-colors drop-shadow-md font-bold">
                                {provider.name}
                              </h3>
                              <p className="text-white drop-shadow-md">{provider.subcategory}</p>
                              <div className="flex items-center space-x-4 text-sm text-white mt-2">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 text-coral-orange fill-coral-orange" />
                                  <span className="font-medium drop-shadow-md">{provider.rating}</span>
                                  <span className="drop-shadow-md">({provider.reviewCount} reviews)</span>
                                </div>
                                {provider.verified &&
                              <div className="px-3 py-1 rounded-full text-xs flex items-center bg-white/20 backdrop-blur-sm border border-white/30 text-white group-hover:bg-sky-blue/20 group-hover:border-sky-blue/40 transition-all duration-300">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    <span>Verified</span>
                                  </div>
                              }
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <div className="flex items-center text-sm text-white mb-3 flex-wrap gap-2">
                              <MapPin className="h-4 w-4 mr-1 text-sky-blue" />
                              <span className="drop-shadow-md">{provider.location}</span>
                              {provider.distanceKm != null &&
                                <span className="px-2 py-0.5 rounded-full text-[11px] bg-coral-orange/20 border border-coral-orange/40 text-white">
                                  {provider.distanceKm.toFixed(1)} km away
                                </span>
                              }
                            </div>
                            <div className="text-sm text-white">
                              <div className="drop-shadow-md">{provider.yearsInBusiness} years in business</div>
                              <div className="drop-shadow-md">{provider.completedJobs} jobs completed</div>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-white mb-3">
                              <span className="font-medium drop-shadow-md">Availability :</span> <span className="drop-shadow-md">{provider.availability}</span>
                            </div>
                            <div className="text-sm text-white">
                              <span className="font-medium drop-shadow-md">Starting at :</span>
                              <span className="text-xl text-white ml-2 drop-shadow-md font-bold">{provider.startingPrice}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-white mb-6 leading-relaxed drop-shadow-md group-hover:text-white transition-colors duration-300">
                          {provider.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {provider.specialties.map((specialty, index) =>
                        <span key={index} className="px-3 py-1 rounded-full text-xs bg-white/20 backdrop-blur-sm border border-white/30 text-white group-hover:bg-sky-blue/20 group-hover:border-sky-blue/40 transition-all duration-300 font-medium">
                              {specialty}
                            </span>
                        )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div
                      className="lg:w-48 flex lg:flex-col gap-3 relative z-30"
                      onClick={(e) => e.stopPropagation()}
                      style={{ pointerEvents: 'auto' }}>
                      
                        <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          localStorage.setItem('selectedProviderId', provider.id);
                          navigate('provider-profile');
                        }}
                        className="flex-1 lg:w-full py-3 px-4 rounded-lg text-white hover:scale-105 transition-all duration-300 font-semibold cursor-pointer shadow-lg"
                        style={{
                          pointerEvents: 'auto',
                          zIndex: 9999,
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(255, 255, 255, 0.4)',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        }}>
                        
                          View Profile
                        </button>
                        <button
                        className="flex-1 lg:w-full py-3 px-4 rounded-lg text-white hover:scale-105 transition-all duration-300 font-semibold cursor-pointer shadow-lg"
                        style={{
                          pointerEvents: 'auto',
                          zIndex: 9999,
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(255, 255, 255, 0.4)',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setQuoteDefaults({
                            category: provider.category || provider.subcategory,
                            description: `Requesting quote from ${provider.name}${provider.subcategory ? ` - ${provider.subcategory}` : ''}`,
                            location: provider.location,
                            budgetMin: parseBudgetFromText(provider.startingPrice),
                            budgetMax: '',
                            providerId: provider.id
                          });
                          setQuoteCategories([provider.subcategory || provider.category].filter(Boolean));
                          setShowQuoteModal(true);
                        }}>
                        
                          Request Quote
                        </button>
                        <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedProvider(provider);
                          setShowMessagingModal(true);
                        }}
                        className="flex-1 lg:w-full py-3 px-4 rounded-lg text-white hover:scale-105 transition-all duration-300 flex items-center justify-center font-semibold cursor-pointer shadow-lg"
                        style={{
                          pointerEvents: 'auto',
                          zIndex: 9999,
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(255, 255, 255, 0.4)',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        }}>
                        
                          <MessageSquare className="h-4 w-4 lg:mr-2" />
                          <span className="hidden lg:inline">Connect</span>
                        </button>
                      </div>
                    </div>

                    {/* Shine effect */}
                    <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                  </div>
                )}
              </div>

              {sortedProviders.length === 0 &&
              <div
                className="text-center py-12 rounded-2xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                
                  <p className="text-xl text-white mb-4 drop-shadow-lg">No providers found matching your criteria</p>
                  <p className="text-white mb-6 drop-shadow-md">Try adjusting your search filters or location</p>
                  <button
                  onClick={() => {
                    setSearchTerm('');
                    setLocation('');
                    setSelectedCategory('');
                    setSelectedSubcategory('');
                  }}
                  className="px-6 py-3 rounded-xl bg-coral-orange text-white transition-all duration-300 hover:bg-coral-orange/90 hover:scale-105 font-semibold">
                  
                    Clear Filters
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      </div> {/* End content wrapper */}

      {/* Messaging Modal */}
      <MessagingModal
        isOpen={showMessagingModal}
        onClose={() => {
          setShowMessagingModal(false);
          setSelectedProvider(null);
        }}
        recipient={selectedProvider} />
      
      <QuoteRequestModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        onSubmit={handleQuoteSubmit}
        initialCategory={quoteDefaults.category}
        initialDescription={quoteDefaults.description}
        initialLocation={quoteDefaults.location}
        initialBudgetMin={quoteDefaults.budgetMin}
        initialBudgetMax={quoteDefaults.budgetMax}
        categoryOptions={quoteCategories}
        currentUser={currentUser} />
      
    </div>);

}