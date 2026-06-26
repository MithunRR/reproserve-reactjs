import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Filter, MapPin, Star, MessageSquare,
  ChevronDown, UserCheck, Calculator, Search as SearchIcon,
  ShieldCheck, ScrollText, Home,
  CheckCircle, LocateFixed, Loader2, X, List, Map as MapIcon } from
'lucide-react';
import apiClient from '../utils/api';
import { MessagingModal } from './MessagingModal';
import { QuoteRequestModal } from './QuoteRequestModal';
import ProvidersMap from './ProvidersMap';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  fetchProvidersStart,
  createQuoteStart,
  resetCreateQuoteFlag
} from '../Store/Features/Authentication/authslice';

export function RealtorsPage({ navigate, currentUser }) {
  const [searchTerm, setSearchTerm] = useState(() => {
    // Check for search term from home page search
    const globalSearch = localStorage.getItem('globalSearchTerm');
    if (globalSearch) {
      localStorage.removeItem('globalSearchTerm');
      return globalSearch;
    }
    return '';
  });
  const [location, setLocation] = useState('');
  // Radius search — coords come from browser GPS or by geocoding a typed ZIP.
  const [coords, setCoords] = useState(null);   // { lat, lng } | null
  const [radiusKm, setRadiusKm] = useState(5);
  const [geolocating, setGeolocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [locationLabel, setLocationLabel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState(() => {
    // Pre-select the category chosen from the home page category buttons.
    const storedCategory = localStorage.getItem('selectedRealtorCategory');
    if (storedCategory) {
      localStorage.removeItem('selectedRealtorCategory');
      return storedCategory;
    }
    return '';
  });
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteDefaults, setQuoteDefaults] = useState({ category: '', description: '', location: '', budgetMin: '', budgetMax: '', providerId: null });

  const dispatch = useDispatch();
  const apiProviders = useSelector((state) => state.AuthReducer.providers);
  const providersLoading = useSelector((state) => state.AuthReducer.providersLoading);
  const createQuoteSuccess = useSelector((state) => state.AuthReducer.createQuoteSuccess);
  const createQuoteError = useSelector((state) => state.AuthReducer.createQuoteError);

  // Load realtors from the API. When coords are set, backend applies a
  // Haversine filter and returns results sorted by nearest.
  useEffect(() => {
    const payload = { role: 'realtor' };
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
        toast.success(`Showing realtors within ${radiusKm} km`);
      },
      (err) => {
        setGeolocating(false);
        toast.error(err.message || 'Could not get your location');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60_000 }
    );
  };

  // Geocode whatever was typed into the location box via /api/geocode.
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
        toast.success(`Showing realtors within ${radiusKm} km`);
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
      toast.success('Request submitted successfully!');
      setShowQuoteModal(false);
      dispatch(resetCreateQuoteFlag());
    }
  }, [createQuoteSuccess, dispatch]);

  useEffect(() => {
    if (createQuoteError) {
      toast.error(typeof createQuoteError === 'string' ? createQuoteError : 'Failed to submit request');
      dispatch(resetCreateQuoteFlag());
    }
  }, [createQuoteError, dispatch]);

  // Dropdown states
  const [isSubcategoryDropdownOpen, setIsSubcategoryDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Dropdown refs
  const subcategoryDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  // Dropdown positions
  const [subcategoryDropdownPosition, setSubcategoryDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [sortDropdownPosition, setSortDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Calculate dropdown positions
  useEffect(() => {
    if (isSubcategoryDropdownOpen && subcategoryDropdownRef.current) {
      const rect = subcategoryDropdownRef.current.getBoundingClientRect();
      setSubcategoryDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isSubcategoryDropdownOpen]);

  useEffect(() => {
    if (isSortDropdownOpen && sortDropdownRef.current) {
      const rect = sortDropdownRef.current.getBoundingClientRect();
      setSortDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isSortDropdownOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is on dropdown trigger buttons
      const isSubcategoryClick = subcategoryDropdownRef.current && subcategoryDropdownRef.current.contains(event.target);
      const isSortClick = sortDropdownRef.current && sortDropdownRef.current.contains(event.target);

      // Check if click is on portal-rendered dropdown content
      const isDropdownContent = event.target.closest('[data-dropdown-content]');

      if (!isSubcategoryClick && !isSortClick && !isDropdownContent) {
        setIsSubcategoryDropdownOpen(false);
        setIsSortDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        0% {
          opacity: 0;
          transform: translateY(-10px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes fadeInUp {
        0% {
          opacity: 0;
          transform: translateY(10px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* ---- Phone-only filter layout (laptops/desktops never match) ---- */
      @media (max-width: 767px) {
        .realtor-filter-row {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
          overflow: visible !important;
        }
        /* Hide the funnel icon on phones to free up width */
        .realtor-filter-row > svg { display: none; }
        /* Each filter fills its grid cell */
        .realtor-filter-row > div,
        .realtor-filter-row > button {
          max-width: none !important;
          flex: none !important;
          width: 100%;
        }
        /* Reset spans the full width on its own row */
        .realtor-filter-row > button:last-child { grid-column: 1 / -1; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const categories = [
  {
    title: 'Realtors',
    services: [
    { name: 'Real Estate Agents & Brokers', icon: UserCheck, description: 'Licensed professionals who help buy, sell, and rent properties' },
    { name: 'Mortgage Lenders / Loan Officers', icon: Calculator, description: 'Financial professionals who provide home loans and mortgage services' },
    { name: 'Inspectors', icon: SearchIcon, description: 'Certified inspectors who examine property condition and safety' },
    { name: 'Insurance & Warranty Agents', icon: ShieldCheck, description: 'Agents providing home insurance and warranty protection' },
    { name: 'Title Companies', icon: ScrollText, description: 'Companies handling property titles, escrow, and closing services' },
    { name: 'Show My Property', icon: Home, description: 'Request property showing services from qualified showing agents', isSpecial: true, page: '/show-my-property' }]

  }];

  // Page header copy keyed by the selected subcategory. Falls back to the
  // generic "Find Realtors" heading when no subcategory is selected.
  const SUBCATEGORY_HEADER = {
    'Real Estate Agents & Brokers':   { title: 'Real Estate Agents & Brokers',   subtitle: 'Buy, sell, or rent with expert guidance.' },
    'Mortgage Lenders / Loan Officers': { title: 'Mortgage Lenders / Loan Officers', subtitle: 'Get the best home loan options tailored for you.' },
    'Inspectors':                     { title: 'Inspectors',                     subtitle: 'Know the condition of your property before you buy or sell.' },
    'Insurance & Warranty Agents':    { title: 'Insurance & Warranty Agents',    subtitle: 'Protect your home with insurance and warranty plans.' },
    'Title Companies':                { title: 'Title Companies',                subtitle: 'Secure your property’s ownership and clear title.' }
  };
  const headerCopy = SUBCATEGORY_HEADER[selectedSubcategory] || {
    title: 'Find Realtors',
    subtitle: 'Connect with verified real estate professionals in your area'
  };


  // Realtors come from the API (/providers?role=realtor). Each backend user
  // record is mapped into the card shape this page already renders.
  const providers = (apiProviders || []).map((u) => ({
    id: u.id,
    name: u.businessName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Realtor',
    category: 'Realtors',
    subcategory: u.serviceType?.name || 'Real Estate Agents & Brokers',
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
    distanceKm: u.distanceKm != null ? Number(u.distanceKm) : null,
    latitude: u.latitude != null ? Number(u.latitude) : null,
    longitude: u.longitude != null ? Number(u.longitude) : null,
    profilePhoto: u.profilePhoto || null
  }));


  const filteredProviders = providers.filter((provider) => {
    const matchesSearch = !searchTerm ||
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.specialties.some((specialty) => specialty.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = !selectedCategory || provider.category === selectedCategory;
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
      toast.error('Please sign in to send a request.');
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
    fd.append('isMeetingRequest', 'true');
    (data.photos || []).forEach((photo) => fd.append('photos', photo));
    dispatch(createQuoteStart(fd));
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setLocation('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSortBy('rating');
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
      
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl mb-4 text-white drop-shadow-lg">{headerCopy.title}</h1>
          <p className="text-xl text-white drop-shadow-md">{headerCopy.subtitle}</p>
        </div>

        {/* Search and Filters */}
        <div
          className="rounded-2xl shadow-lg p-4 sm:p-6 mb-8 relative overflow-visible"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          
          {/* Radius search — browser GPS or typed ZIP/address (OSM Nominatim). */}
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

          <div className="realtor-filter-row flex flex-nowrap items-center gap-3 overflow-x-auto">
          <Filter className="h-5 w-5 text-white flex-shrink-0" />
            {/* Search Input */}
            <div className="relative flex-shrink-0 flex-1 max-w-75">
              <input
                placeholder="Search realtor services..."
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
            <div className="relative flex-shrink-0 flex-1 max-w-50">
              <input
                placeholder="Location or ZIP (Enter)"
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

            {/* Subcategory Dropdown */}
            <div className="relative flex-shrink-0 flex-1 max-w-70" ref={subcategoryDropdownRef}>
              <button
                onClick={() => setIsSubcategoryDropdownOpen(!isSubcategoryDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-white rounded-lg hover:scale-105 transition-all duration-300  cursor-pointer shadow-lg"
                style={{
                  pointerEvents: 'auto',
                  zIndex: 9999,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }}>
                
                <span className="truncate">{selectedSubcategory || 'All Services'}</span>
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-300 flex-shrink-0 ${isSubcategoryDropdownOpen ? 'rotate-180' : ''}`} />
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
                      className={`w-full text-left px-4 py-3 transition-all duration-200 hover:bg-white/20 ${selectedSubcategory === '' ? 'bg-coral-orange/20 text-white' : 'text-white'}`
                      }>
                      
                      All Realtor Services
                    </button>
                    {categories[0].services.map((service, index) =>
                    <button
                      key={index}
                      onClick={() => {
                        if (service.isSpecial && service.page) {
                          navigate(service.page);
                          setIsSubcategoryDropdownOpen(false);
                        } else {
                          setSelectedSubcategory(service.name);
                          setIsSubcategoryDropdownOpen(false);
                        }
                      }}
                      className={`w-full text-left px-4 py-3 transition-all duration-200 hover:bg-white/20 ${selectedSubcategory === service.name ? 'bg-coral-orange/20 text-white' : 'text-white'}`
                      }
                      style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both` }}>
                      
                        {service.name}
                      </button>
                    )}
                  </div>
                </div>,
                document.body
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex-shrink-0 flex-1 max-w-45" ref={sortDropdownRef}>
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-white rounded-lg hover:scale-105 transition-all duration-300  cursor-pointer shadow-lg"
                style={{
                  pointerEvents: 'auto',
                  zIndex: 9999,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }}>
                
                <span className="truncate">
                  {sortBy === 'rating' && 'Sort: Rating'}
                  {sortBy === 'experience' && 'Sort: Experience'}
                  {sortBy === 'reviews' && 'Sort: Reviews'}
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
                  
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setSortBy('rating');
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 transition-all duration-200 hover:bg-white/20 ${sortBy === 'rating' ? 'bg-coral-orange/20 text-white' : 'text-white'}`
                      }>
                      
                      Sort by Rating
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('experience');
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 transition-all duration-200 hover:bg-white/20 ${sortBy === 'experience' ? 'bg-coral-orange/20 text-white' : 'text-white'}`
                      }
                      style={{ animation: 'fadeInUp 0.3s ease-out 0.1s both' }}>
                      
                      Sort by Experience
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('reviews');
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 transition-all duration-200 hover:bg-white/20 ${sortBy === 'reviews' ? 'bg-coral-orange/20 text-white' : 'text-white'}`
                      }
                      style={{ animation: 'fadeInUp 0.3s ease-out 0.2s both' }}>
                      
                      Sort by Reviews
                    </button>
                  </div>
                </div>,
                document.body
              )}
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetFilters}
              className="px-6 py-3 text-white rounded-lg hover:scale-105 transition-all duration-300  cursor-pointer shadow-lg flex-shrink-0"
              style={{
                pointerEvents: 'auto',
                zIndex: 9999,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
              }}>
              
              Reset
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Realtor Categories Sidebar */}
          <div className="lg:w-1/4">
            <div
              className="rounded-2xl shadow-lg p-6 sticky top-24 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
              
              <h3 className="text-lg mb-4 text-white drop-shadow-lg">Realtor Services</h3>
              <div className="space-y-3">
                {categories[0].services.map((service, serviceIndex) => {
                  const IconComponent = service.icon;
                  return (
                    <button
                      key={serviceIndex}
                      onClick={() => {
                        if (service.isSpecial && service.page) {
                          navigate(service.page);
                        } else {
                          setSelectedSubcategory(selectedSubcategory === service.name ? '' : service.name);
                        }
                      }}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${selectedSubcategory === service.name ?
                      'bg-dark-blue text-white scale-105' :
                      'bg-white/10 hover:bg-white/20 text-white border border-white/20'}`
                      }
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${serviceIndex * 0.1}s both`,
                        transitionDelay: selectedSubcategory === service.name ? '0ms' : `${serviceIndex * 50}ms`
                      }}>
                      
                      <div className="flex items-start space-x-3">
                        <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0 text-white" />
                        <div>
                          <div className="text-sm font-medium">{service.name}</div>
                          <div className="text-xs mt-1 text-white/80">{service.description}</div>
                        </div>
                      </div>
                    </button>);

                })}
              </div>
            </div>
          </div>

          {/* Provider Results */}
          <div className="lg:w-3/4">
            <div className="mb-6 flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-white drop-shadow-md">
                  {sortedProviders.length} realtors found
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
              {/* List | Map view toggle */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-white/10 border border-white/20">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'}`}>
                  <List className="h-4 w-4" /> List
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${viewMode === 'map' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'}`}>
                  <MapIcon className="h-4 w-4" /> Map
                </button>
              </div>
            </div>

            {viewMode === 'map' ?
            <ProvidersMap providers={sortedProviders} navigate={navigate} /> :
            <>
            <div className="space-y-6">
              {sortedProviders.map((provider) =>
              <div
                key={provider.id}
                className="group relative rounded-2xl p-4 sm:p-6 overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
                onClick={() => { localStorage.setItem('selectedProviderId', provider.id); navigate('provider-profile'); }}>

                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-blue/10 via-transparent to-coral-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                  <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Provider Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-lg bg-dark-blue">
                              {provider.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div>
                              <h3 className="text-xl text-white group-hover:text-white transition-colors drop-shadow-md">
                                {provider.name}
                              </h3>
                              <p className="text-white drop-shadow-md">{provider.subcategory}</p>
                              <div className="flex items-center space-x-4 text-sm text-white mt-1">
                                <div className="flex items-center space-x-1 drop-shadow-md">
                                  <Star className="h-4 w-4 text-coral-orange fill-coral-orange" />
                                  <span className="font-medium">{provider.rating}</span>
                                  <span>({provider.reviewCount} reviews)</span>
                                </div>
                                {provider.verified &&
                              <div className="px-2 py-1 rounded-xl text-xs flex items-center bg-sky-blue text-white">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    <span>Verified</span>
                                  </div>
                              }
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex items-center text-sm text-white mb-2 drop-shadow-md flex-wrap gap-2">
                              <MapPin className="h-4 w-4 mr-1 text-white" />
                              <span>{provider.location}</span>
                              {provider.distanceKm != null &&
                                <span className="px-2 py-0.5 rounded-full text-[11px] bg-coral-orange/20 border border-coral-orange/40 text-white">
                                  {provider.distanceKm.toFixed(1)} km away
                                </span>
                              }
                            </div>
                            <div className="text-sm text-white drop-shadow-md">
                              <div>{provider.yearsInBusiness} years in business</div>
                              <div>{provider.completedJobs} transactions completed</div>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-white mb-2 drop-shadow-md">
                              <span className="font-medium">Availability :</span> {provider.availability}
                            </div>
                            <div className="text-sm text-white drop-shadow-md">
                              <span className="font-medium">Starting at :</span>
                              <span className="text-lg text-white ml-2">{provider.startingPrice}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-white mb-4 leading-relaxed drop-shadow-md">
                          {provider.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {provider.specialties.map((specialty, index) =>
                        <span key={index} className="px-3 py-1 rounded-full text-xs bg-white/20 text-white border border-white/30">
                              {specialty}
                            </span>
                        )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div
                      className="lg:w-48 flex lg:flex-col gap-2 lg:gap-3 relative z-30"
                      onClick={(e) => e.stopPropagation()}
                      style={{ pointerEvents: 'auto' }}>
                      
                        <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          localStorage.setItem('selectedProviderId', provider.id);
                          navigate('provider-profile');
                        }}
                        className="flex-1 lg:w-full py-3 px-2 sm:px-4 rounded-lg text-white hover:scale-105 transition-all duration-300  cursor-pointer shadow-lg text-sm sm:text-base text-center"
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
                        className="flex-1 lg:w-full py-3 px-2 sm:px-4 rounded-lg text-white hover:scale-105 transition-all duration-300  cursor-pointer shadow-lg text-sm sm:text-base text-center"
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
                          setShowQuoteModal(true);
                        }}>
                        
                          Schedule a Meeting
                        </button>
                        <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedProvider(provider);
                          setShowMessagingModal(true);
                        }}
                        className="flex-1 lg:w-full py-3 px-2 sm:px-4 rounded-lg text-white hover:scale-105 transition-all duration-300 flex items-center justify-center  cursor-pointer shadow-lg text-sm sm:text-base"
                        style={{
                          pointerEvents: 'auto',
                          zIndex: 9999,
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(255, 255, 255, 0.4)',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        }}>
                        
                          <MessageSquare className="h-4 w-4 mr-1 sm:mr-0 lg:mr-2 flex-shrink-0" />
                          <span className="inline sm:hidden lg:inline">Connect</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100 pointer-events-none"></div>
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
              
                <p className="text-xl text-white mb-4 drop-shadow-lg">No realtors found matching your criteria</p>
                <p className="text-white mb-6 drop-shadow-md">Try adjusting your search filters or location</p>
                <button
                onClick={() => {
                  setSearchTerm('');
                  setLocation('');
                  setSelectedCategory('');
                  setSelectedSubcategory('');
                }}
                className="px-6 py-3 bg-coral-orange text-white rounded-xl hover:bg-coral-orange/90 hover:scale-105 hover:-translate-y-1 hover:shadow-lg hover:shadow-coral-orange/30 transition-all duration-300  group relative overflow-hidden">
                
                  <span className="relative z-10">Clear Filters</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
              </div>
            }
            </>
            }
          </div>
        </div>
      </div>

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
        currentUser={currentUser}
        isMeetingRequest={true} />
      
    </div>);

}