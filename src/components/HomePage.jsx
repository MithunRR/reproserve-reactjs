import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, MapPin, Star, ThumbsUp, Phone, MessageSquare,
  Hammer, Wrench, Zap, Droplets, Thermometer, Trees, Paintbrush,
  Shield, Key, Palette,
  Home, Building, HardHat, Grid3X3, ArrowRight, UserCheck,
  Calculator, Search as SearchIcon, ShieldCheck, ScrollText,
  TreePalm } from
'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProvidersStart } from '../Store/Features/Authentication/authslice';
import { currentUserStorage } from '../utils/localStorage';
const FALLBACK_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

function ImageWithFallback({ src, alt, style, className, ...rest }) {
  const [didError, setDidError] = useState(false);
  if (didError) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
        style={style}>
        <div className="flex items-center justify-center w-full h-full">
          <img src={FALLBACK_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
        </div>
      </div>
    );
  }
  return (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={() => setDidError(true)} />
  );
}

export function HomePage({ navigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Live service providers for the "Featured Service Providers" section.
  const dispatch = useDispatch();
  const apiProviders = useSelector((state) => state.AuthReducer.providers);
  const currentUser = currentUserStorage.get();

  useEffect(() => {
    dispatch(fetchProvidersStart({ role: 'service_provider' }));
  }, [dispatch]);

  // Scroll-float animation hook
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-float-visible');
        }
      });
    }, observerOptions);

    // Observe all elements with scroll-float class
    const elements = document.querySelectorAll('.scroll-float');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .scroll-float {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
      }
      
      .scroll-float-visible {
        opacity: 1;
        transform: translateY(0);
      }
      
      .scroll-float-delay-1 {
        transition-delay: 0.1s;
      }
      
      .scroll-float-delay-2 {
        transition-delay: 0.2s;
      }
      
      .scroll-float-delay-3 {
        transition-delay: 0.3s;
      }
      
      .scroll-float-delay-4 {
        transition-delay: 0.4s;
      }
      
      /* Custom scrollbar for autocomplete dropdown */
      .autocomplete-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      
      .autocomplete-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
      }
      
      .autocomplete-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
      }
      
      .autocomplete-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
      }
      
      /* Firefox scrollbar */
      .autocomplete-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* ---- Phone-only layout overrides (laptops/desktops never match) ---- */
      @media (max-width: 767px) {
        /* Realtor services: stop the squashed single-letter row, use 2 columns */
        .realtor-cards-row {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
          overflow: visible !important;
        }
        .realtor-cards-row > button {
          flex: none !important;
          padding: 0.75rem !important;
        }
        /* Service-provider categories: 2 columns instead of a single column */
        .provider-cards-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 0.75rem !important;
        }
        .provider-cards-grid > button {
          padding: 0.75rem !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Search suggestions list
  const searchSuggestions = [
  // Service Providers
  { text: 'General Contractor', category: 'Service Provider', icon: HardHat },
  { text: 'Electrician', category: 'Service Provider', icon: Zap },
  { text: 'Plumber', category: 'Service Provider', icon: Droplets },
  { text: 'HVAC Technician', category: 'Service Provider', icon: Thermometer },
  { text: 'Roofer', category: 'Service Provider', icon: Home },
  { text: 'Handyman', category: 'Service Provider', icon: Wrench },
  { text: 'Landscaper', category: 'Service Provider', icon: Trees },
  { text: 'Painter', category: 'Service Provider', icon: Paintbrush },
  { text: 'Home Security', category: 'Service Provider', icon: Shield },
  { text: 'Locksmith', category: 'Service Provider', icon: Key },
  { text: 'Interior Designer', category: 'Service Provider', icon: Palette },
  { text: 'Flooring Installer', category: 'Service Provider', icon: Grid3X3 },
  // Realtors
  { text: 'Real Estate Agent', category: 'Realtor', icon: UserCheck },
  { text: 'Real Estate Broker', category: 'Realtor', icon: UserCheck },
  { text: 'Mortgage Lender', category: 'Realtor', icon: Calculator },
  { text: 'Home Inspector', category: 'Realtor', icon: SearchIcon },
  { text: 'Insurance Agent', category: 'Realtor', icon: ShieldCheck },
  { text: 'Title Company', category: 'Realtor', icon: ScrollText },
  // Open Houses
  { text: 'Open House', category: 'Open House', icon: Home },
  { text: 'Property Listing', category: 'Open House', icon: Building },
  { text: 'Home for Sale', category: 'Open House', icon: Home },
  { text: 'Residential Property', category: 'Open House', icon: Home },
  { text: 'Commercial Property', category: 'Open House', icon: Building },
  // Popular Searches
  { text: 'Kitchen Renovation', category: 'Service', icon: Hammer },
  { text: 'Bathroom Remodel', category: 'Service', icon: Wrench },
  { text: 'Electrical Repair', category: 'Service', icon: Zap },
  { text: 'Plumbing Repair', category: 'Service', icon: Droplets },
  { text: 'Landscaping Design', category: 'Service', icon: Trees }];


  // Filter suggestions based on search term
  const filteredSuggestions = searchTerm.trim() ?
  searchSuggestions.filter((suggestion) =>
  suggestion.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
  suggestion.category.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 8) // Limit to 8 suggestions
  : searchSuggestions.slice(0, 6); // Show top 6 when no search term

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (showSuggestions && searchInputRef.current) {
      const rect = searchInputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8, // 8px for mt-2 margin - fixed positioning uses viewport coordinates
        left: rect.left,
        width: rect.width
      });
    }
  }, [showSuggestions, searchTerm]);

  // Handle scroll to close dropdown
  useEffect(() => {
    const handleScroll = () => {
      if (showSuggestions) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [showSuggestions]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
      suggestionsRef.current &&
      !suggestionsRef.current.contains(event.target) &&
      searchInputRef.current &&
      !searchInputRef.current.contains(event.target))
      {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredSuggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch(e);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          const selected = filteredSuggestions[selectedSuggestionIndex];
          setSearchTerm(selected.text);
          setShowSuggestions(false);
          setTimeout(() => {
            localStorage.setItem('globalSearchTerm', selected.text);
            // Navigate based on category
            if (selected.category === 'Realtor') {
              navigate('realtors');
            } else if (selected.category === 'Open House') {
              navigate('open-house');
            } else {
              navigate('find-providers');
            }
          }, 100);
        } else {
          handleSearch(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleSearch = (e) => {
    if (e) {
      e.preventDefault();
    }

    setShowSuggestions(false);

    if (!searchTerm.trim()) {
      // If no search term, just navigate to find providers
      navigate('find-providers');
      return;
    }

    // Store search term in localStorage for the target page to pick up
    localStorage.setItem('globalSearchTerm', searchTerm.trim());

    // Determine which page to navigate to based on search term keywords
    const searchLower = searchTerm.toLowerCase();

    // Check for realtor/open house related keywords
    if (searchLower.includes('realtor') ||
    searchLower.includes('real estate') ||
    searchLower.includes('agent') ||
    searchLower.includes('broker') ||
    searchLower.includes('mortgage') ||
    searchLower.includes('lender')) {
      navigate('realtors');
    }
    // Check for open house/property listing keywords
    else if (searchLower.includes('open house') ||
    searchLower.includes('property') ||
    searchLower.includes('listing') ||
    searchLower.includes('for sale') ||
    searchLower.includes('home for sale')) {
      navigate('open-house');
    }
    // Default to service providers
    else {
      navigate('find-providers');
    }
  };



  const categories = [
  {
    title: 'Construction & Renovation',
    description: 'Building, renovation, and structural work',
    services: [
    { name: 'General Contractor', icon: HardHat, description: 'Oversees renovation, remodeling, or building projects' },
    { name: 'Roofer', icon: Home, description: 'Installs, repairs, and replaces roofs' },
    { name: 'Flooring / Tile Installer', icon: Grid3X3, description: 'Installs hardwood, laminate, tiles, or stone flooring' },
    { name: 'Window / Door Contractor', icon: Building, description: 'Installs or replaces windows, doors, and glass fittings' }]

  },
  {
    title: 'Repairs & Maintenance',
    description: 'Essential home repairs and maintenance services',
    services: [
    { name: 'Handyman', icon: Wrench, description: 'Handles small repairs, maintenance, and odd jobs' },
    { name: 'Electrician', icon: Zap, description: 'Installs and repairs electrical wiring, circuits, and systems' },
    { name: 'Plumber', icon: Droplets, description: 'Installs and maintains pipes, fixtures, and drainage systems' },
    { name: 'HVAC Technician', icon: Thermometer, description: 'Installs and repairs heating, ventilation, and air conditioning' }]

  },
  {
    title: 'Outdoor & Landscaping',
    description: 'Outdoor spaces, gardens, and landscape design',
    services: [
    { name: 'Landscaper / Hardscaper', icon: Trees, description: 'Designs and maintains lawns, gardens, patios, and outdoor spaces' },
    { name: 'Tree Service Contractor', icon: Trees, description: 'Trims, removes, or maintains trees and large shrubs' }]

  },
  {
    title: 'Home Services & Lifestyle',
    description: 'Interior design, security, and convenience services',
    services: [
    { name: 'Painter', icon: Paintbrush, description: 'Handles interior and exterior painting, finishes, and coatings' },
    { name: 'Home Security Installer', icon: Shield, description: 'Installs alarms, cameras, and smart security systems' },
    { name: 'Locksmith', icon: Key, description: 'Installs locks, provides key services, and emergency lockout help' },
    { name: 'Interior Designer / Stager', icon: Palette, description: 'Designs and decorates interiors, stages homes for sale' }]

  }];


  const realtorCategories = [
  {
    title: 'Realtors',
    description: 'Real estate professionals and support services',
    services: [
    { name: 'Real Estate Agents & Brokers', icon: UserCheck, description: 'Licensed professionals who help buy, sell, and rent properties' },
    { name: 'Mortgage Lenders / Loan Officers', icon: Calculator, description: 'Financial professionals who provide home loans and mortgage services' },
    { name: 'Inspectors', icon: SearchIcon, description: 'Certified inspectors who examine property condition and safety' },
    { name: 'Insurance & Warranty Agents', icon: ShieldCheck, description: 'Agents providing home insurance and warranty protection' },
    { name: 'Title Companies', icon: ScrollText, description: 'Companies handling property titles, escrow, and closing services' },
    { name: 'Show My Property', icon: Home, description: 'Request property showing services from qualified showing agents', isSpecial: true, page: '/show-my-property' }]

  }];


  // Featured providers come from the live directory (/providers?role=service_provider).
  // A provider is featured when their rating is 4★ or higher, OR — when the visitor
  // is logged in — when they're located in the same city as the visitor.
  const userCity = (currentUser?.location || '').split(',')[0].trim().toLowerCase();
  const featuredProviders = (apiProviders || []).
  map((u) => ({
    id: u.id,
    name: u.businessName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Service Provider',
    category: u.serviceType?.name || 'Service Provider',
    rating: Number(u.averageRating) || 0,
    reviewCount: u.reviewCount || 0,
    location: [u.city, u.state].filter(Boolean).join(', ') || 'Location not set',
    city: (u.city || '').trim().toLowerCase(),
    phone: u.phone || '',
    verified: u.isActive !== false,
    yearsInBusiness: u.createdAt
      ? Math.max(1, new Date().getFullYear() - new Date(u.createdAt).getFullYear())
      : 1,
    completedJobs: u.completedJobs || 0,
    specialties: Array.isArray(u.specialties) ? u.specialties : [],
    description: u.businessDesc || 'No description provided.',
    startingPrice: u.startingPrice || 'Contact for pricing',
    image: null
  })).
  filter((p) => {
    const ratingOk = p.rating >= 4;
    const cityOk = !!currentUser?.id && !!userCity && p.city === userCity;
    return ratingOk || cityOk;
  }).
  slice(0, 4);


  return (
    <div>
      {/* Hero Section */}
      <section
        className="px-4"
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
        
        <div className="container mx-auto max-w-6xl text-center mt-8">
          <h1 className="text-3xl md:text-4xl mb-4 text-white drop-shadow-lg">
            Find Trusted Professionals for Every Step
          </h1>
          <p className="text-lg mb-6 max-w-2xl mx-auto text-white drop-shadow-md">
            Choose the service you need and connect instantly.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="scroll-float scroll-float-delay-2 flex flex-col md:flex-row gap-4 max-w-2xl mx-auto mb-12 relative">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white z-10" />
              <input
                ref={searchInputRef}
                placeholder="Search providers, realtors, or open houses..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                  setSelectedSuggestionIndex(-1);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-3 text-base rounded-md border-4 border-white bg-white/50 backdrop-blur-md text-white placeholder:text-white focus:outline-none focus:border-white focus:bg-white/30"
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 -2px 6px rgba(0,0,0,0.1), 0 0 0 2px rgba(255,255,255,0.3)' }} />
              
            </div>

            <button
              type="submit"
              className="py-3 px-6 text-base font-medium rounded-md bg-coral-orange text-black transition-colors hover:opacity-90 flex-shrink-0">
              
              Search
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown - Rendered via Portal */}
          {showSuggestions && filteredSuggestions.length > 0 && typeof document !== 'undefined' && createPortal(
            <>
              {/* Backdrop to block all pointer events */}
              <div
                className="fixed inset-0"
                style={{
                  zIndex: 9998,
                  pointerEvents: 'auto',
                  background: 'transparent'
                }}
                onClick={(e) => {
                  if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
                    setShowSuggestions(false);
                  }
                }}
                onMouseMove={(e) => {
                  // Block all mouse events from reaching content below
                  e.stopPropagation();
                }} />
              
              {/* Dropdown */}
              <div
                ref={suggestionsRef}
                className="fixed rounded-lg overflow-hidden autocomplete-scrollbar"
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1))',
                  backdropFilter: 'blur(15px)',
                  border: '2px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 8px 32px rgba(0,0,1,0.8), inset 0 1px 0 rgba(255,255,255,0.2)',
                  maxHeight: '400px',
                  minHeight: '200px',
                  overflowY: 'auto',
                  animation: 'fadeIn 0.2s ease-out',
                  zIndex: 9999,
                  pointerEvents: 'auto'
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseMove={(e) => e.stopPropagation()}
                onMouseEnter={(e) => e.stopPropagation()}>
                
                {filteredSuggestions.map((suggestion, index) => {
                  const isSelected = index === selectedSuggestionIndex;
                  return (
                    <button
                      key={`${suggestion.text}-${index}`}
                      type="button"
                      onClick={() => {
                        setSearchTerm(suggestion.text);
                        setShowSuggestions(false);
                        setTimeout(() => {
                          localStorage.setItem('globalSearchTerm', suggestion.text);
                          if (suggestion.category === 'Realtor') {
                            navigate('realtors');
                          } else if (suggestion.category === 'Open House') {
                            navigate('open-house');
                          } else {
                            navigate('find-providers');
                          }
                        }, 100);
                      }}
                      onMouseEnter={() => setSelectedSuggestionIndex(index)}
                      className={`w-full px-4 text-left flex items-center transition-all duration-200 ${isSelected ?
                      'bg-white/30 text-white' :
                      'bg-white/30 text-white hover:bg-black/90'}`
                      }
                      style={{
                        minHeight: '56px',
                        height: '56px',
                        paddingTop: '12px',
                        paddingBottom: '12px',
                        cursor: 'pointer'
                      }}>
                      
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className={`font-medium transition-all duration-200 ${isSelected ? 'text-base' : 'text-sm'}`}>{suggestion.text}</div>
                        <div className={`transition-all duration-200 ${isSelected ? 'text-sm' : 'text-xs'} text-white/70 mt-0.5`}>{suggestion.category}</div>
                      </div>
                    </button>);

                })}
              </div>
            </>,
            document.body
          )}

          {/* Featured Realtor Services */}
          <div className="scroll-float scroll-float-delay-3 mb-12">
            <div className="realtor-cards-row flex flex-nowrap gap-6 max-w-7xl mx-auto overflow-x-auto scrollbar-hide">
              {realtorCategories[0].services.map((service, serviceIndex) => {
                const IconComponent = service.icon;
                const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
                const [isHovered, setIsHovered] = useState(false);
                const cardRef = useRef(null);

                const handleMouseMove = (e) => {
                  if (cardRef.current) {
                    const rect = cardRef.current.getBoundingClientRect();
                    setMousePosition({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top
                    });
                  }
                };

                return (
                  <button
                    key={serviceIndex}
                    ref={cardRef}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onMouseMove={handleMouseMove}
                    onClick={() => {
                      if (service.isSpecial && service.page) {
                        navigate(service.page);
                      } else {
                        // Pre-select this realtor category on the Realtors page.
                        localStorage.setItem('selectedRealtorCategory', service.name);
                        navigate('realtors');
                      }
                    }}
                    className="group relative bg-white/10 backdrop-blur-md p-4 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/30 hover:border-white/60 transform skew-x-12 hover:skew-x-6 hover:scale-105 hover:bg-white/20 flex-1 min-w-0 overflow-hidden cursor-pointer"
                    style={{
                      clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}>
                    
                    {/* Spotlight effect */}
                    {isHovered &&
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle 300px at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.15), transparent 70%)`
                      }} />

                    }
                    {/* Content */}
                    <div className="relative z-10 text-center transform -skew-x-12 group-hover:-skew-x-6 transition-transform duration-300">
                      {/* Icon */}
                      <div className="mb-3 flex justify-center">
                        <IconComponent className="h-8 w-8 text-white drop-shadow-lg" />
                      </div>

                      {/* Service Name */}
                      <h3 className="text-sm font-medium text-white group-hover:text-light-blue transition-colors duration-300 px-2">
                        {service.name}
                      </h3>
                    </div>
                  </button>);

              })}
            </div>
          </div>

          {/* Featured Service Provider Categories */}
          <div className="scroll-float scroll-float-delay-4 mb-12">
            <div className="provider-cards-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
              {[
              {
                name: 'Construction and Renovation',
                icon: HardHat,
                description: 'Oversees renovation, remodeling, or building projects',
                category: 'Construction & Renovation'
              },
              {
                name: 'Repairs and Maintenance',
                icon: Hammer,
                description: 'Installs and repairs electrical wiring and systems',
                category: 'Repairs & Maintenance'
              },
              {
                name: 'Outdoor and Landscaping',
                icon: TreePalm,
                description: 'Installs and maintains pipes and drainage systems',
                category: 'Outdoor & Landscaping'
              },
              {
                name: 'Home Services and Lifestyle',
                icon: Home,
                description: 'Designs and maintains outdoor spaces and gardens',
                category: 'Home Services & Lifestyle'
              },
              {
                name: 'Interior and Exterior Designs',
                icon: Palette,
                description: 'Creative design solutions for beautiful living spaces',
                category: 'Home Services & Lifestyle'
              }].
              map((service, serviceIndex) => {
                const IconComponent = service.icon;
                const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
                const [isHovered, setIsHovered] = useState(false);
                const cardRef = useRef(null);

                const handleMouseMove = (e) => {
                  if (cardRef.current) {
                    const rect = cardRef.current.getBoundingClientRect();
                    setMousePosition({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top
                    });
                  }
                };

                return (
                  <button
                    key={serviceIndex}
                    ref={cardRef}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onMouseMove={handleMouseMove}
                    onClick={() => {
                      // Pre-select this category on the Find Providers page.
                      localStorage.setItem('selectedProviderCategory', service.category);
                      navigate('find-providers');
                    }}
                    className="group relative bg-white/10 backdrop-blur-md p-4 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/30 hover:border-white/60 transform skew-x-12 hover:skew-x-6 hover:scale-105 hover:bg-white/20 overflow-hidden cursor-pointer"
                    style={{
                      clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}>
                    
                    {/* Spotlight effect */}
                    {isHovered &&
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle 300px at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.15), transparent 70%)`
                      }} />

                    }
                    {/* Content */}
                    <div className="relative z-10 text-center transform -skew-x-12 group-hover:-skew-x-6 transition-transform duration-300">
                      {/* Icon */}
                      <div className="mb-3 flex justify-center">
                        <IconComponent className="h-8 w-8 text-white drop-shadow-lg" />
                      </div>

                      {/* Service Name */}
                      <h3 className="text-sm font-medium text-white group-hover:text-light-blue transition-colors duration-300 px-2">
                        {service.name}
                      </h3>
                    </div>
                  </button>);

              })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl mb-2 text-white drop-shadow-lg">50,000+</div>
              <p className="text-white drop-shadow-md">Verified Professionals</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2 text-white drop-shadow-lg">1M+</div>
              <p className="text-white drop-shadow-md">Projects Completed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2 text-white drop-shadow-lg">4.8/5</div>
              <p className="text-white drop-shadow-md">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="scroll-float py-16 px-4 bg-powder-blue/20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="scroll-float text-3xl md:text-4xl mb-4 text-cool-gray">
              Featured Service Providers
            </h2>
            <p className="scroll-float scroll-float-delay-1 text-xl max-w-3xl mx-auto text-cool-gray">
              Top-rated professionals in your area, vetted and verified for quality service
            </p>
          </div>

          {featuredProviders.length === 0 ?
          <p className="text-center text-cool-gray text-lg py-8">No featured providers to show right now.</p> :
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProviders.map((provider, index) =>
            <div
              key={provider.id}
              className={`group relative rounded-2xl p-8 cursor-pointer overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2 flex flex-col`}
              onClick={() => { localStorage.setItem('selectedProviderId', provider.id); navigate('provider-profile'); }}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
              
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-sky-blue/10 via-transparent to-coral-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-20 w-20 rounded-full overflow-hidden ring-4 ring-white/20 group-hover:ring-sky-blue/30 transition-all duration-300 flex items-center justify-center bg-dark-blue text-white text-2xl font-bold">
                      {provider.image ?
                      <ImageWithFallback
                        src={provider.image}
                        alt={provider.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" /> :
                      provider.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
                      }
                    </div>
                    {provider.verified &&
                  <div className="px-3 py-1.5 rounded-full text-xs flex items-center bg-sky-blue/20 backdrop-blur-sm border border-sky-blue/30 text-sky-blue font-semibold group-hover:bg-sky-blue/30 transition-all duration-300">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Verified
                      </div>
                  }
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl mb-2 group-hover:text-sky-blue transition-colors text-cool-gray font-bold">
                      {provider.name}
                    </h3>
                    <p className="text-sm mb-3 text-cool-gray group-hover:text-gray-700 transition-colors duration-300 font-medium">
                      {provider.category}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-cool-gray">
                      <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30 group-hover:bg-coral-orange/20 group-hover:border-coral-orange/40 transition-all duration-300">
                        <Star className="h-4 w-4 text-coral-orange fill-coral-orange" />
                        <span className="font-semibold">{provider.rating}</span>
                        <span>({provider.reviewCount})</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6 flex-grow">
                    <div className="flex items-center text-sm text-cool-gray group-hover:text-gray-700 transition-colors duration-300">
                      <MapPin className="h-4 w-4 mr-2 text-sky-blue" />
                      {provider.location}
                    </div>

                    <div className="text-sm text-cool-gray group-hover:text-gray-700 transition-colors duration-300 space-y-1">
                      <div className="font-medium">{provider.yearsInBusiness} years in business</div>
                      <div className="font-medium">{provider.completedJobs} jobs completed</div>
                    </div>

                    <p className="text-sm leading-relaxed text-cool-gray group-hover:text-gray-700 transition-colors duration-300 line-clamp-3">
                      {provider.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {provider.specialties.slice(0, 2).map((specialty, index) =>
                    <span key={index} className="px-3 py-1.5 rounded-full text-xs bg-white/20 backdrop-blur-sm border border-white/30 text-sky-blue font-medium group-hover:bg-sky-blue/20 group-hover:border-sky-blue/40 transition-all duration-300">
                          {specialty}
                        </span>
                    )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/20">
                      <span className="text-sm text-cool-gray group-hover:text-gray-700 transition-colors duration-300 font-medium flex-shrink-0">Starting at</span>
                      <span className="text-base text-sky-blue font-bold group-hover:text-sky-blue transition-colors duration-300 text-right">{provider.startingPrice}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-auto">
                    <button className="flex-1 py-3 px-4 rounded-xl text-sm bg-dark-blue text-white font-semibold transition-all duration-300 hover:bg-coral-orange/90 hover:scale-105 group-hover:shadow-lg">
                      View Profile
                    </button>
                    <button className="p-3 rounded-xl border-2 border-dark-blue text-dark-blue transition-all duration-300 hover:bg-dark-blue hover:text-white group-hover:scale-105">
                      <MessageSquare className="h-5 w-5" />
                    </button>
                    <button className="p-3 rounded-xl border-2 border-dark-blue text-dark-blue transition-all duration-300 hover:bg-coral-orange hover:text-white group-hover:scale-105">
                      <Phone className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
              </div>
            )}
          </div>
          }

          <div className="text-center mt-8">
            <button
              onClick={() => navigate('find-providers')}
              className="px-6 py-3 rounded-md bg-dark-blue text-white transition-colors hover:opacity-90">

              View All Featured Providers
            </button>
          </div>
        </div>
      </section>

      {/* Service Categories Preview */}
      <section className="scroll-float py-16 px-4 bg-snow-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="scroll-float text-3xl md:text-4xl mb-4 text-cool-gray">
              Find the Right Professional for Your Project
            </h2>
            <p className="scroll-float scroll-float-delay-1 text-xl max-w-3xl mx-auto text-cool-gray">
              Browse our comprehensive directory of home service professionals across all categories
            </p>
          </div>

          {/* Service Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, categoryIndex) =>
            <div
              key={categoryIndex}
              className={`scroll-float scroll-float-delay-${Math.min(categoryIndex % 4, 3)} group relative rounded-2xl p-8 cursor-pointer overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2`}
              onClick={() => navigate('find-providers')}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
              
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-sky-blue/10 via-transparent to-coral-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-2xl mb-3 text-cool-gray font-bold group-hover:text-sky-blue transition-colors duration-300">
                    {category.title}
                  </h3>
                  <p className="text-cool-gray mb-6 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {category.description}
                  </p>

                  <div className="space-y-4">
                    {category.services.slice(0, 3).map((service, serviceIndex) => {
                    const IconComponent = service.icon;
                    return (
                      <div key={serviceIndex} className="flex items-center space-x-4 group/item">
                          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 group-hover/item:bg-sky-blue/20 group-hover/item:border-sky-blue/40 transition-all duration-300">
                            <IconComponent className="h-6 w-6 text-sky-blue group-hover/item:text-sky-blue transition-colors duration-300" />
                          </div>
                          <span className="text-cool-gray group-hover/item:text-gray-700 font-medium transition-colors duration-300">
                            {service.name}
                          </span>
                        </div>);

                  })}
                  </div>

                  <button className="mt-6 inline-flex items-center text-sky-blue hover:text-sky-blue font-semibold group-hover:translate-x-1 transition-all duration-300">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => navigate('find-providers')}
              className="px-6 py-3 rounded-md bg-dark-blue text-white transition-colors hover:opacity-90">
              
              View All Categories
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="scroll-float py-16 px-4 bg-snow-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="scroll-float text-3xl md:text-4xl mb-4 text-cool-gray">How ReproServe Works</h2>
            <p className="scroll-float scroll-float-delay-1 text-xl text-cool-gray">Simple steps to find and hire the perfect professional</p>
          </div>

          <div className="flex flex-col md:flex-row items-start justify-center gap-8 md:gap-12">
            <div className="scroll-float scroll-float-delay-2 text-center flex-1 max-w-xs">
              <div className="w-16 h-16 rounded-full bg-light-blue text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl mb-3 text-cool-gray">Search & Compare</h3>
              <p className="text-cool-gray">Browse verified professionals in your area and compare profiles, reviews, and pricing.</p>
            </div>

            {/* Arrow 1 → 2 */}
            <div className="scroll-float scroll-float-delay-2 hidden md:flex items-center justify-center h-16 self-start">
              <div className="text-4xl text-light-blue font-bold">→</div>
            </div>

            <div className="scroll-float scroll-float-delay-3 text-center flex-1 max-w-xs">
              <div className="w-16 h-16 rounded-full bg-light-blue text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl mb-3 text-cool-gray">Get Quotes</h3>
              <p className="text-cool-gray">Request quotes from multiple professionals and choose the best fit for your project and budget.</p>
            </div>

            {/* Arrow 2 → 3 */}
            <div className="scroll-float scroll-float-delay-3 hidden md:flex items-center justify-center h-16 self-start">
              <div className="text-4xl text-light-blue font-bold">→</div>
            </div>

            <div className="scroll-float scroll-float-delay-4 text-center flex-1 max-w-xs">
              <div className="w-16 h-16 rounded-full bg-light-blue text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl mb-3 text-cool-gray">Hire & Review</h3>
              <p className="text-cool-gray">Book your preferred professional and leave a review to help other users make informed decisions.</p>
            </div>
          </div>
        </div>
      </section>

    </div>);

}