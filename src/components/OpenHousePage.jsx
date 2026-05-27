import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Plus, Calendar, MapPin, DollarSign, Camera, X, Building, Home, Grid, List, UserCheck, User, Trash2, Maximize2, ChevronDown, Edit3 } from 'lucide-react';
import { openHousesStorage } from '../utils/localStorage';
import { ViewDetailsModal } from './ViewDetailsModal';
import {
  fetchOpenHousesStart,
  createOpenHouseStart,
  updateOpenHouseStart,
  resetCreateOpenHouseFlag,
  resetUpdateOpenHouseFlag
} from '../Store/Features/Authentication/authslice';

const CAN_CREATE_ROLES = ['user', 'realtor'];

export function OpenHousePage({ navigate, currentUser }) {
  const dispatch = useDispatch();
  const {
    openHouses: apiOpenHouses,
    createOpenHouseLoading,
    createOpenHouseSuccess,
    createOpenHouseError,
    updateOpenHouseLoading,
    updateOpenHouseSuccess,
    updateOpenHouseError
  } = useSelector((state) => state.AuthReducer);

  const canCreate = !!currentUser && CAN_CREATE_ROLES.includes(currentUser.role);

  useEffect(() => {
    dispatch(fetchOpenHousesStart());
  }, [dispatch]);

  // Mirror the Redux list locally so per-session mutations (attendees, etc.)
  // keep working until those features get a backend.
  const [openHouses, setOpenHouses] = useState([]);
  useEffect(() => {
    setOpenHouses(apiOpenHouses || []);
  }, [apiOpenHouses]);
  const [filterType, setFilterType] = useState('all'); // 'all', 'commercial', 'residential'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState(() => {
    // Check for search term from home page search
    const globalSearch = localStorage.getItem('globalSearchTerm');
    if (globalSearch) {
      localStorage.removeItem('globalSearchTerm');
      return globalSearch;
    }
    return '';
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOpenHouse, setSelectedOpenHouse] = useState(null);
  const [selectedOpenHouseForEdit, setSelectedOpenHouseForEdit] = useState(null);
  const [isClosingModal, setIsClosingModal] = useState(false);

  // New filter states
  const [minSquareFootage, setMinSquareFootage] = useState('');
  const [maxSquareFootage, setMaxSquareFootage] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef(null);
  const [typeDropdownPosition, setTypeDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Check for flag to auto-open create modal
  useEffect(() => {
    const shouldOpenModal = localStorage.getItem('openCreateOpenHouseModal');
    if (shouldOpenModal === 'true') {
      if (currentUser && canCreate) {
        setShowCreateModal(true);
      } else if (!currentUser) {
        localStorage.setItem('pendingRedirect', '/open-house');
        navigate('login');
      } else {
        toast.error('Only users and realtors can create open houses.');
      }
      localStorage.removeItem('openCreateOpenHouseModal');
    }
  }, [currentUser, canCreate, navigate]);

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
      @keyframes slideDown {
        0% {
          opacity: 0;
          transform: translateY(-20px);
        }
        50% {
          opacity: 0.7;
          transform: translateY(-5px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      /* Hide number input spinners */
      input[type="number"]::-webkit-inner-spin-button,
      input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input[type="number"] {
        -moz-appearance: textfield;
      }
      /* Make input text and placeholder fully white */
      input[type="text"]::placeholder {
        color: #ffffff !important;
        opacity: 1 !important;
      }
      input[type="text"] {
        color: #ffffff !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Calculate dropdown position
  useEffect(() => {
    if (isTypeDropdownOpen && typeDropdownRef.current) {
      const rect = typeDropdownRef.current.getBoundingClientRect();
      setTypeDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isTypeDropdownOpen]);

  // Handle click outside for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        if (!event.target.closest('[data-dropdown-content]')) {
          setIsTypeDropdownOpen(false);
        }
      }
    };

    if (isTypeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isTypeDropdownOpen]);

  const filteredOpenHouses = openHouses.filter((house) => {
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
      house.title?.toLowerCase().includes(searchLower) ||
      house.description?.toLowerCase().includes(searchLower) ||
      house.location?.toLowerCase().includes(searchLower) ||
      house.specs?.some((spec) => spec.toLowerCase().includes(searchLower));

      if (!matchesSearch) {
        return false;
      }
    }

    // Type filter
    if (filterType !== 'all' && house.type !== filterType) {
      return false;
    }

    // Square footage filter
    if (minSquareFootage && house.squareFootage) {
      const minSqft = parseFloat(minSquareFootage);
      if (isNaN(minSqft) || house.squareFootage < minSqft) {
        return false;
      }
    }
    if (maxSquareFootage && house.squareFootage) {
      const maxSqft = parseFloat(maxSquareFootage);
      if (isNaN(maxSqft) || house.squareFootage > maxSqft) {
        return false;
      }
    }

    // Price filter
    if (minPrice && house.price) {
      const minPriceVal = parseFloat(minPrice);
      if (isNaN(minPriceVal) || house.price < minPriceVal) {
        return false;
      }
    }
    if (maxPrice && house.price) {
      const maxPriceVal = parseFloat(maxPrice);
      if (isNaN(maxPriceVal) || house.price > maxPriceVal) {
        return false;
      }
    }

    return true;
  });

  const handleResetFilters = () => {
    setFilterType('all');
    setMinSquareFootage('');
    setMaxSquareFootage('');
    setMinPrice('');
    setMaxPrice('');
  };

  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowCreateModal(false);
      setShowAttendanceModal(false);
      setShowDetailsModal(false);
      setSelectedOpenHouse(null);
      setIsClosingModal(false);
    }, 150);
  };

  const buildOpenHouseFormData = (formData, isEdit) => {
    const body = new FormData();
    if (!isEdit) {
      if (currentUser?.id) body.append('userId', currentUser.id);
      if (currentUser?.role) {
        const apiRole = currentUser.role === 'provider' ? 'service_provider' : currentUser.role;
        body.append('role', apiRole);
      }
    }
    body.append('propertyType', formData.type || 'residential');
    body.append('title', formData.title || '');
    body.append('description', formData.description || '');
    body.append('location', formData.location || '');
    body.append('price', formData.price ?? '');
    if (formData.squareFootage !== '' && formData.squareFootage != null) {
      body.append('squareFootage', formData.squareFootage);
    }
    if (formData.fromDate) body.append('fromDateAndTime', formData.fromDate);
    if (formData.toDate) body.append('toDateAndTime', formData.toDate);
    body.append('specs', JSON.stringify(formData.specs || []));

    (formData.photos || []).forEach((photo) => {
      if (photo instanceof File) body.append('photos', photo);
    });
    if (formData.video instanceof File) body.append('video', formData.video);

    return body;
  };

  const handleCreateOpenHouse = (formData, editingHouseId = null) => {
    if (editingHouseId) {
      const target = openHouses.find((h) => h.id === editingHouseId);
      if (!target || !isCreator(target)) {
        toast.error('You can only edit your own open houses.');
        throw new Error('not_owner');
      }
      dispatch(updateOpenHouseStart({
        id: editingHouseId,
        payload: buildOpenHouseFormData(formData, true)
      }));
      return;
    }

    if (!canCreate) {
      toast.error('Only users and realtors can create open houses.');
      throw new Error('not_allowed');
    }
    if (!currentUser?.id) {
      toast.error('Please sign in again to create an open house.');
      throw new Error('no_user');
    }
    dispatch(createOpenHouseStart(buildOpenHouseFormData(formData, false)));
  };

  // Toast + close modal when create/edit completes.
  useEffect(() => {
    if (createOpenHouseSuccess) {
      toast.success('Open house created');
      setSelectedOpenHouseForEdit(null);
      handleCloseModal();
      dispatch(resetCreateOpenHouseFlag());
    }
  }, [createOpenHouseSuccess, dispatch]);

  useEffect(() => {
    if (updateOpenHouseSuccess) {
      toast.success('Open house updated');
      setSelectedOpenHouseForEdit(null);
      handleCloseModal();
      dispatch(resetUpdateOpenHouseFlag());
    }
  }, [updateOpenHouseSuccess, dispatch]);

  useEffect(() => {
    if (createOpenHouseError) {
      const msg = typeof createOpenHouseError === 'string'
        ? createOpenHouseError
        : createOpenHouseError?.message || 'Failed to create open house';
      toast.error(msg);
      dispatch(resetCreateOpenHouseFlag());
    }
  }, [createOpenHouseError, dispatch]);

  useEffect(() => {
    if (updateOpenHouseError) {
      const msg = typeof updateOpenHouseError === 'string'
        ? updateOpenHouseError
        : updateOpenHouseError?.message || 'Failed to update open house';
      toast.error(msg);
      dispatch(resetUpdateOpenHouseFlag());
    }
  }, [updateOpenHouseError, dispatch]);

  const handleAttendanceSubmit = (formData) => {
    if (!selectedOpenHouse) return;

    const updatedOpenHouses = openHouses.map((house) => {
      if (house.id === selectedOpenHouse.id) {
        return {
          ...house,
          attendees: [...(house.attendees || []), {
            id: Date.now(),
            ...formData,
            submittedDate: new Date().toISOString()
          }]
        };
      }
      return house;
    });

    setOpenHouses(updatedOpenHouses);
    openHousesStorage.set(updatedOpenHouses);
    handleCloseModal();
  };

  const handleDeleteOpenHouse = (houseId) => {
    if (window.confirm('Are you sure you want to delete this open house? This action cannot be undone.')) {
      const updatedOpenHouses = openHouses.filter((house) => house.id !== houseId);
      setOpenHouses(updatedOpenHouses);
      openHousesStorage.set(updatedOpenHouses);
    }
  };

  // Only the creator of an open house may edit it. We match against the
  // backend's userId first (the authoritative FK), then fall back to legacy
  // email/string createdBy for rows that pre-date the API integration.
  const isCreator = (house) => {
    if (!currentUser || !house) return false;

    const userId = currentUser.id != null ? String(currentUser.id).trim() : '';
    if (house.userId != null && userId && String(house.userId).trim() === userId) {
      return true;
    }
    if (house.user?.id != null && userId && String(house.user.id).trim() === userId) {
      return true;
    }

    const storedCreator = house.createdBy != null ? String(house.createdBy).trim() : '';
    if (!storedCreator) return false;
    if (currentUser.email && storedCreator === String(currentUser.email).trim()) {
      return true;
    }
    if (userId && storedCreator === userId) {
      return true;
    }
    return false;
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl mb-4 text-white drop-shadow-lg">Open Houses</h1>
              <p className="text-xl text-white drop-shadow-md">Browse upcoming property open houses</p>
            </div>
            {(!currentUser || canCreate) &&
              <button
                onClick={() => {
                  if (!currentUser) {
                    localStorage.setItem('pendingRedirect', '/open-house');
                    navigate('login');
                    return;
                  }
                  setShowCreateModal(true);
                }}
                className="px-6 py-3 bg-coral-orange text-black rounded-xl hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 flex items-center space-x-2 font-semibold shadow-lg">

                <Plus className="h-5 w-5" />
                <span>Create Open House</span>
              </button>
            }
          </div>
        </div>

        {/* Filters and View Toggle */}
        <div
          className="rounded-2xl p-6 mb-8 relative overflow-visible"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Filters */}
            <div className="flex flex-nowrap items-center gap-3 flex-1 overflow-x-auto">
              {/* <Filter className="h-5 w-5 text-white" /> */}

              {/* Search Input */}
              <div className="relative flex-shrink-0">
                {/* <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" /> */}
                <input
                  type="text"
                  placeholder="Search open houses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-left pr-4 py-3 text-white rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg w-[180px]"
                  style={{
                    paddingLeft: '0.875rem', // 14px - between pl-3 (12px) and pl-4 (16px)
                    color: '#ffffff',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  }} />
                
              </div>

              {/* Type Dropdown */}
              <div className="relative flex-shrink-0" ref={typeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className="flex items-center justify-between px-4 py-3 text-white rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg w-[140px]"
                  style={{
                    pointerEvents: 'auto',
                    zIndex: 9999,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  }}>
                  
                  <div className="flex items-center space-x-2">
                    {filterType === 'all' ?
                    <span>Type: All</span> :
                    filterType === 'residential' ?
                    <>
                        <Home className="h-4 w-4" />
                        <span>Residential</span>
                      </> :

                    <>
                        <Building className="h-4 w-4" />
                        <span>Commercial</span>
                      </>
                    }
                  </div>
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-300 ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isTypeDropdownOpen && typeof document !== 'undefined' && createPortal(
                  <div
                    data-dropdown-content
                    className="absolute rounded-2xl shadow-lg z-[9999]"
                    style={{
                      top: typeDropdownPosition.top,
                      left: typeDropdownPosition.left,
                      width: typeDropdownPosition.width,
                      background: 'linear-gradient(135deg, rgba(0, 69, 113, 0.95), rgba(0, 69, 113, 0.95))',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
                      animation: 'slideDown 0.5s ease-out'
                    }}>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setFilterType('all');
                        setIsTypeDropdownOpen(false);
                      }}
                      className={`group block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-all duration-300 drop-shadow-md flex items-center space-x-2 rounded-t-2xl hover:scale-[1.05] hover:translate-x-1 hover:shadow-lg ${filterType === 'all' ? 'bg-white/10' : ''}`}>
                      
                      <span className="group-hover:font-bold">All Types</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterType('residential');
                        setIsTypeDropdownOpen(false);
                      }}
                      className={`group block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-all duration-300 drop-shadow-md flex items-center space-x-2 hover:scale-[1.05] hover:translate-x-1 hover:shadow-lg ${filterType === 'residential' ? 'bg-white/10' : ''}`}>
                      
                      <Home className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-sky-blue" />
                      <span className="group-hover:font-bold">Residential</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterType('commercial');
                        setIsTypeDropdownOpen(false);
                      }}
                      className={`group block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors duration-300 drop-shadow-md flex items-center space-x-2 rounded-b-2xl hover:scale-[1.05] hover:translate-x-1 hover:shadow-lg ${filterType === 'commercial' ? 'bg-white/10' : ''}`}>
                      
                      <Building className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-sky-blue" />
                      <span className="group-hover:font-bold">Commercial</span>
                    </button>
                  </div>,
                  document.body
                )}
              </div>

              {/* Square Footage Filter */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="text-white text-sm drop-shadow-md whitespace-nowrap">Sq Ft:</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minSquareFootage}
                  onChange={(e) => setMinSquareFootage(e.target.value)}
                  className="w-20 px-2 py-3 rounded-lg text-white placeholder-white/70 focus:outline-none font-semibold shadow-lg text-sm"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  }} />
                
                <span className="text-white text-m">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxSquareFootage}
                  onChange={(e) => setMaxSquareFootage(e.target.value)}
                  className="w-20 px-2 py-3 rounded-lg text-white placeholder-white/70 focus:outline-none font-semibold shadow-lg text-sm"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  }} />
                
              </div>

              {/* Price Range Filter */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <DollarSign className="h-5 w-5 text-white flex-shrink-0" />
                <input
                  type="number"
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-24 px-2 py-3 rounded-lg text-white placeholder-white/70 focus:outline-none font-semibold shadow-lg text-sm"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  }} />
                
                <span className="text-white">-</span>
                <input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-24 px-2 py-3 rounded-lg text-white placeholder-white/70 focus:outline-none font-semibold shadow-lg text-sm"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  }} />
                
              </div>

            </div>

            {/* View Toggle and Reset */}
            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-white drop-shadow-md mr-2 text-m">View:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-all duration-300 hover:scale-105 font-semibold cursor-pointer shadow-lg ${viewMode === 'grid' ? 'text-white' : 'text-white'}`}
                  style={{
                    pointerEvents: 'auto',
                    zIndex: 9999,
                    background: viewMode === 'grid' ?
                    'linear-gradient(135deg, rgba(0, 137, 225, 0.8), rgba(0, 137, 225, 0.6))' :
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  }}>
                  
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-all duration-300 hover:scale-105 font-semibold cursor-pointer shadow-lg ${viewMode === 'list' ? 'text-white' : 'text-white'}`}
                  style={{
                    pointerEvents: 'auto',
                    zIndex: 9999,
                    background: viewMode === 'list' ?
                    'linear-gradient(135deg, rgba(0, 137, 225, 0.8), rgba(0, 137, 225, 0.6))' :
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  }}>
                  
                  <List className="h-5 w-5" />
                </button>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleResetFilters}
                className="px-4 py-3 text-white rounded-lg hover:scale-105 transition-all duration-300 font-semibold cursor-pointer shadow-lg"
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
        </div>

        {/* Open Houses List */}
        {filteredOpenHouses.length === 0 ?
        <div
          className="rounded-2xl p-12 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          
            <p className="text-xl text-white mb-4 drop-shadow-lg">No open houses found</p>
            <p className="text-white drop-shadow-md">Try adjusting your filters</p>
          </div> :

        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
            {filteredOpenHouses.map((house) =>
          <div
            key={house.id}
            className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            
                {/* Type Badge and Action Buttons */}
                <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
                  <span
                className="px-3 py-1 rounded-full text-xs font-medium text-white drop-shadow-md"
                style={{
                  background: house.type === 'commercial' ?
                  'rgba(59, 130, 246, 0.2)' :
                  'rgba(59, 130, 246, 0.2)',
                  border: '1px solid #ffffff'
                }}>
                
                    {house.type === 'commercial' ? 'Commercial' : 'Residential'}
                  </span>
                  {isCreator(house) &&
              <>
                      <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedOpenHouseForEdit(house);
                    setShowCreateModal(true);
                  }}
                  className="p-2 rounded-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-white transition-all duration-300 hover:scale-110 cursor-pointer"
                  title="Edit this open house"
                  style={{ pointerEvents: 'auto', zIndex: 9999 }}>
                  
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteOpenHouse(house.id);
                  }}
                  className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-white transition-all duration-300 hover:scale-110 cursor-pointer"
                  title="Delete this open house"
                  style={{ pointerEvents: 'auto', zIndex: 9999 }}>
                  
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
              }
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl text-white font-medium mb-2 drop-shadow-md group-hover:text-white transition-colors duration-300">
                    {house.title}
                  </h3>
                  <p className="text-white text-sm mb-4 drop-shadow-md line-clamp-2">
                    {house.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex items-center text-sm text-white drop-shadow-md">
                          <MapPin className="h-4 w-4 mr-2 text-white flex-shrink-0" />
                          {house.location}
                        </div>
                        <div className="flex items-center text-sm text-white drop-shadow-md">
                          <DollarSign className="h-4 w-4 mr-2 text-white flex-shrink-0" />
                          ${house.price.toLocaleString()}
                        </div>
                      </div>
                      {house.squareFootage &&
                  <div className="flex items-center justify-center min-w-16 h-16 px-3 rounded-lg bg-white/20 border border-white/30 backdrop-blur-sm flex-shrink-0">
                          <div className="text-center whitespace-nowrap">
                            <div className="text-lg font-bold text-white">{house.squareFootage.toLocaleString()}</div>
                            <div className="text-xs text-white">sq ft</div>
                          </div>
                        </div>
                  }
                    </div>
                  </div>
                  {/* Date Containers */}
                  <div className="flex items-center gap-3 mb-4">
                    {house.fromDate &&
                <div className="flex flex-col gap-1 min-w-24 px-3 py-2 rounded-lg bg-white/20 border border-white/30 backdrop-blur-sm flex-shrink-0">
                        <div className="text-xs text-white font-medium">From</div>
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-white flex-shrink-0 mt-0.5" />
                          <div className="flex flex-col">
                            <div className="text-sm text-white leading-tight">
                              {new Date(house.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-xs text-white leading-tight">
                              {new Date(house.fromDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                          </div>
                        </div>
                      </div>
                }
                    {house.toDate &&
                <div className="flex flex-col gap-1 min-w-24 px-3 py-2 rounded-lg bg-white/20 border border-white/30 backdrop-blur-sm flex-shrink-0">
                        <div className="text-xs text-white font-medium ">To</div>
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-white flex-shrink-0 mt-0.5" />
                          <div className="flex flex-col">
                            <div className="text-sm text-white leading-tight">
                              {new Date(house.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-xs text-white leading-tight">
                              {new Date(house.toDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                          </div>
                        </div>
                      </div>
                }
                    {!house.fromDate && !house.toDate && house.dateTime &&
                <div className="flex flex-col gap-1 min-w-24 px-3 py-2 rounded-lg bg-white/20 border border-white/30 backdrop-blur-sm flex-shrink-0">
                        <div className="text-xs text-white font-medium">Date</div>
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-white flex-shrink-0 mt-0.5" />
                          <div className="flex flex-col">
                            <div className="text-sm text-white leading-tight">
                              {new Date(house.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-xs text-white leading-tight">
                              {new Date(house.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                          </div>
                        </div>
                      </div>
                }
                    {!house.fromDate && !house.toDate && !house.dateTime &&
                <div className="text-sm text-white drop-shadow-md">Date not specified</div>
                }
                  </div>

                  {/* Specs */}
                  {house.specs && house.specs.length > 0 &&
              <div className="flex flex-wrap gap-2 mb-4">
                      {house.specs.map((spec, idx) =>
                <span
                  key={idx}
                  className="px-2 py-1 rounded-full text-xs text-white"
                  style={{
                    background: 'rgba(23, 95, 239, 0.1)',
                    border: '1px solid #ffffff'
                  }}>
                  
                          {spec}
                        </span>
                )}
                    </div>
              }

                  {/* Actions */}
                  <div className="flex space-x-2 justify-end relative z-30">
                    <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedOpenHouse(house);
                    setShowAttendanceModal(true);
                  }}
                  className={`${viewMode === 'list' ? 'px-8' : 'flex-1 px-4'} py-3 text-white rounded-lg hover:scale-105 transition-all duration-300 font-semibold cursor-pointer shadow-lg whitespace-nowrap`}
                  style={{
                    pointerEvents: 'auto',
                    zIndex: 9999,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  }}>
                  
                      Attend
                    </button>
                    <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`open-house/${house.id}`);
                  }}
                  className={`${viewMode === 'list' ? 'px-6' : 'flex-1 px-4'} py-3 text-white rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer font-semibold shadow-lg whitespace-nowrap`}
                  style={{
                    pointerEvents: 'auto',
                    zIndex: 9999,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  }}>
                  
                      View Details
                    </button>
                  </div>
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
              </div>
          )}
          </div>
        }
      </div>

      {/* Create Open House Modal */}
      {showCreateModal &&
      <CreateOpenHouseModal
        isOpen={showCreateModal}
        onClose={() => {
          handleCloseModal();
          setSelectedOpenHouseForEdit(null);
        }}
        onSubmit={(formData) => {
          handleCreateOpenHouse(formData, selectedOpenHouseForEdit?.id);
        }}
        isClosing={isClosingModal}
        isLoading={createOpenHouseLoading || updateOpenHouseLoading}
        initialData={selectedOpenHouseForEdit} />

      }

      {/* Attendance Confirmation Modal */}
      {showAttendanceModal && selectedOpenHouse &&
      <AttendanceModal
        isOpen={showAttendanceModal}
        onClose={handleCloseModal}
        onSubmit={handleAttendanceSubmit}
        openHouse={selectedOpenHouse}
        isClosing={isClosingModal}
        currentUser={currentUser} />

      }

      {/* View Details Modal */}
      {showDetailsModal && selectedOpenHouse &&
      <ViewDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseModal}
        openHouse={selectedOpenHouse}
        isClosing={isClosingModal}
        onAttendClick={() => {
          handleCloseModal();
          setTimeout(() => {
            setSelectedOpenHouse(selectedOpenHouse);
            setShowAttendanceModal(true);
          }, 200);
        }} />

      }
    </div>);

}

// Create Open House Modal Component
function CreateOpenHouseModal({ isOpen, onClose, onSubmit, isClosing, isLoading = false, initialData = null





}) {
  const [formData, setFormData] = useState({
    type: 'residential',
    title: '',
    description: '',
    specs: [],
    location: '',
    price: '',
    squareFootage: '',
    fromDate: '',
    toDate: '',
    photos: [],
    video: null
  });

  const availableSpecs = ['Parking Available', 'Wheelchair Accessible', 'Pet Friendly', 'Furnished', 'Utilities Included'];
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false); // Reset submitting state when modal opens
      if (initialData) {
        // Pre-populate form for editing
        // Convert datetime to datetime-local format (YYYY-MM-DDTHH:mm)
        const formatDateTimeLocal = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        setFormData({
          type: initialData.type || 'residential',
          title: initialData.title || '',
          description: initialData.description || '',
          specs: initialData.specs || [],
          location: initialData.location || '',
          price: initialData.price?.toString() || '',
          squareFootage: initialData.squareFootage?.toString() || '',
          fromDate: formatDateTimeLocal(initialData.fromDate),
          toDate: formatDateTimeLocal(initialData.toDate),
          photos: initialData.photos || [],
          video: initialData.video || null
        });
      } else {
        // Reset form for new creation
        setFormData({
          type: 'residential',
          title: '',
          description: '',
          specs: [],
          location: '',
          price: '',
          squareFootage: '',
          fromDate: '',
          toDate: '',
          photos: [],
          video: null
        });
      }
      setIsTypeDropdownOpen(false);
    }
  }, [isOpen, initialData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isTypeDropdownOpen && !event.target.closest('.property-type-dropdown')) {
        setIsTypeDropdownOpen(false);
      }
    };

    if (isTypeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isTypeDropdownOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecToggle = (spec) => {
    setFormData((prev) => ({
      ...prev,
      specs: prev.specs.includes(spec) ?
      prev.specs.filter((s) => s !== spec) :
      [...prev.specs, spec]
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxPhotos = 50; // Reasonable limit to prevent performance issues
    if (formData.photos.length + files.length <= maxPhotos) {
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...files]
      }));
    } else {
      alert(`You can only upload up to ${maxPhotos} photos. You currently have ${formData.photos.length} photos.`);
    }
  };

  const removePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 25 * 1024 * 1024) {
      setFormData((prev) => ({ ...prev, video: file }));
    } else {
      alert('Video file must be 25MB or smaller');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSubmitting || isLoading) return;

    if (!formData.title || !formData.description || !formData.location || !formData.price || !formData.fromDate) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        squareFootage: formData.squareFootage ? parseFloat(formData.squareFootage) : null
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
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
        
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-all duration-300">
          
          <X className="h-4 w-4 text-white" />
        </button>

        <h2 className="text-2xl text-white drop-shadow-lg mb-4">{initialData ? 'Edit Open House' : 'Create Open House'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-white mb-2 drop-shadow-md text-sm">Property Type *</label>
            <div className="relative property-type-dropdown">
              <button
                type="button"
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none transition-colors focus:border-white/60">
                
                <div className="flex items-center space-x-2">
                  {formData.type === 'residential' ?
                  <>
                      <Home className="h-4 w-4" />
                      <span>Residential</span>
                    </> :

                  <>
                      <Building className="h-4 w-4" />
                      <span>Commercial</span>
                    </>
                  }
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isTypeDropdownOpen &&
              <div
                className="absolute z-50 right-0 mt-2 w-full rounded-2xl shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 69, 113, 0.95), rgba(0, 69, 113, 0.95))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                
                  <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, type: 'residential' }));
                    setIsTypeDropdownOpen(false);
                  }}
                  className={`group block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-all duration-300 drop-shadow-md flex items-center space-x-2 ${formData.type === 'residential' ? 'rounded-t-2xl' : 'rounded-t-2xl'} hover:scale-[1.05] hover:translate-x-1 hover:shadow-lg`
                  }>
                  
                    <Home className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-sky-blue" />
                    <span className="transition-all duration-300 group-hover:font-medium">Residential</span>
                  </button>
                  <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, type: 'commercial' }));
                    setIsTypeDropdownOpen(false);
                  }}
                  className="group block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-all duration-300 drop-shadow-md flex items-center space-x-2 rounded-b-2xl hover:scale-[1.02] hover:translate-x-1 hover:shadow-lg">
                  
                    <Building className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-sky-blue" />
                    <span className="transition-all duration-300 group-hover:font-medium">Commercial</span>
                  </button>
                </div>
              }
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-white mb-2 drop-shadow-md text-sm">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter property title..."
              className="w-full px-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
              required />
            
          </div>

          {/* Description */}
          <div>
            <label className="block text-white mb-2 drop-shadow-md text-sm">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the property..."
              rows={4}
              className="w-full px-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
              required />
            
          </div>

          {/* Specs */}
          <div>
            <label className="block text-white mb-2 drop-shadow-md text-sm">Specifications</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableSpecs.map((spec) =>
              <label key={spec} className="flex items-center space-x-2 cursor-pointer">
                  <input
                  type="checkbox"
                  checked={formData.specs.includes(spec)}
                  onChange={() => handleSpecToggle(spec)}
                  className="text-sky-blue" />
                
                  <span className="text-white text-sm">{spec}</span>
                </label>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-white mb-2 drop-shadow-md text-sm">Location *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Full address"
                className="w-full pl-10 pr-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                required />
              
            </div>
          </div>

          {/* Price and Square Footage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2 drop-shadow-md text-sm">Price *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                  required
                  min="0" />
                
              </div>
            </div>
            <div>
              <label className="block text-white mb-2 drop-shadow-md text-sm">Square Footage</label>
              <div className="relative">
                <Maximize2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
                <input
                  type="number"
                  name="squareFootage"
                  value={formData.squareFootage}
                  onChange={handleInputChange}
                  placeholder="e.g., 2500"
                  className="w-full pl-10 pr-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                  min="0" />
                
              </div>
            </div>
          </div>

          {/* Date Range with Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2 drop-shadow-md text-sm">From Date & Time *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
                <input
                  type="datetime-local"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:border-white/60"
                  style={{
                    colorScheme: 'dark'
                  }}
                  required />
                
              </div>
            </div>
            <div>
              <label className="block text-white mb-2 drop-shadow-md text-sm">To Date & Time (optional)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
                <input
                  type="datetime-local"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:border-white/60"
                  style={{
                    colorScheme: 'dark'
                  }}
                  min={formData.fromDate} />
                
              </div>
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-white mb-2 drop-shadow-md text-sm">Photos (up to 50)</label>
            <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-white/30 rounded-md bg-white/5 hover:bg-white/10 cursor-pointer transition-all duration-300">
              <Camera className="h-5 w-5 mr-2 text-white" />
              <span className="text-white text-sm">Upload Photos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden" />
              
            </label>
            {formData.photos.length > 0 &&
            <div className={`grid gap-2 mt-2 ${formData.photos.length === 1 ?
            'grid-cols-1' :
            formData.photos.length === 2 ?
            'grid-cols-2' :
            formData.photos.length <= 4 ?
            'grid-cols-2 md:grid-cols-4' :
            'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'}`
            }>
                {formData.photos.map((photo, index) =>
              <div key={index} className="relative aspect-square overflow-hidden rounded-md">
                    <img
                  src={photo instanceof File ? URL.createObjectURL(photo) : photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-md" />
                
                    <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-all duration-300 z-10">
                  
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
              )}
              </div>
            }
          </div>

          {/* Video */}
          <div>
            <label className="block text-white mb-2 drop-shadow-md text-sm">Video (optional, max 25MB)</label>
            <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-white/30 rounded-md bg-white/5 hover:bg-white/10 cursor-pointer transition-all duration-300">
              <Camera className="h-5 w-5 mr-2 text-white" />
              <span className="text-white text-sm">Upload Video</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden" />
              
            </label>
            {formData.video &&
            <div className="mt-2 text-white text-sm">
                {formData.video instanceof File
                  ? `${formData.video.name} (${(formData.video.size / 1024 / 1024).toFixed(2)} MB)`
                  : 'Current video attached'}
                <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, video: null }))}
                className="ml-2 text-red-400 hover:text-red-300">

                  Remove
                </button>
              </div>
            }
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 font-semibold backdrop-blur-sm">
              
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-5 py-2 rounded-xl bg-coral-orange text-black hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">

              {(isSubmitting || isLoading) ?
              initialData ? 'Updating...' : 'Creating...' :
              initialData ? 'Update Open House' : 'Create Open House'
              }
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// Attendance Confirmation Modal Component
function AttendanceModal({ isOpen, onClose, onSubmit, openHouse, isClosing, currentUser }) {
  const [formData, setFormData] = useState({
    userType: 'user',
    name: '',
    email: '',
    phone: '',
    numberOfAttendees: '1'
  });

  useEffect(() => {
    if (isOpen) {
      const resolvedUserType = currentUser ?
      currentUser.role === 'provider' ? 'showing-agent' : currentUser.role || 'user' :
      'user';
      setFormData({
        userType: resolvedUserType,
        name: '',
        email: '',
        phone: '',
        numberOfAttendees: '1'
      });
    }
  }, [isOpen, currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }
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
            {currentUser ?
            <div className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white drop-shadow-md">
                Logged in as {currentUser.role === 'provider' ? 'Showing Agent' : currentUser.role === 'realtor' ? 'Realtor' : 'User'}
              </div> :

            <div className="flex space-x-4 flex-wrap">
                {[
              { value: 'user', label: 'User', icon: User },
              { value: 'realtor', label: 'Realtor', icon: UserCheck },
              { value: 'showing-agent', label: 'Showing Agent', icon: User }].
              map((option) => {
                const IconComponent = option.icon;
                return (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                      type="radio"
                      name="userType"
                      value={option.value}
                      checked={formData.userType === option.value}
                      onChange={handleInputChange}
                      className="text-sky-blue" />
                    
                      <IconComponent className="h-4 w-4 text-white" />
                      <span className="text-white">{option.label}</span>
                    </label>);

              })}
              </div>
            }
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
              name="numberOfAttendees"
              value={formData.numberOfAttendees}
              onChange={handleInputChange}
              min="1"
              className="w-full px-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60" />
            
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 font-semibold backdrop-blur-sm">
              
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-coral-orange text-black hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg">
              
              Confirm Attendance
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}