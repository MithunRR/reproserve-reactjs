import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Star, MapPin, Calendar, DollarSign, Users, TrendingUp, MessageSquare, Camera, Plus, Edit3, X, FileText, Mail, Phone } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  providerBidsStorage,
  projectGalleryStorage,
  recentLeadsStorage,
  notificationSettingsStorage as providerNotificationSettingsStorage,
  profileImageStorage } from
'../utils/localStorage';
import { MessagingModal } from './MessagingModal';
import {
  fetchProfileStart,
  updateProfileStart,
  resetUpdateProfileFlag,
  fetchServiceTypesStart
} from '../Store/Features/Authentication/authslice';

export function ServiceProvidersPage({ navigate, currentUser }) {
  const dispatch = useDispatch();
  const {
    profileData,
    updateProfileSuccess,
    updateProfileError,
    serviceTypes
  } = useSelector((state) => state.AuthReducer);

  // Get provider ID for localStorage
  const providerId = currentUser?.id || currentUser?.email || 'provider_default';

  const emptyForm = {
    firstName: '', lastName: '', email: '', phone: '',
    streetAddress: '', city: '', state: '', zipCode: '',
    businessName: '', serviceTypeId: '', businessDesc: ''
  };
  const [profileForm, setProfileForm] = useState(emptyForm);

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchProfileStart(currentUser.id));
    }
    dispatch(fetchServiceTypesStart());
  }, [currentUser?.id, dispatch]);

  useEffect(() => {
    if (!profileData) return;
    setProfileForm({
      firstName: profileData.firstName ?? '',
      lastName: profileData.lastName ?? '',
      email: profileData.email ?? '',
      phone: profileData.phone ?? '',
      streetAddress: profileData.streetAddress ?? '',
      city: profileData.city ?? '',
      state: profileData.state ?? '',
      zipCode: profileData.zipCode ?? '',
      businessName: profileData.businessName ?? '',
      serviceTypeId: profileData.serviceTypeId ?? '',
      businessDesc: profileData.businessDesc ?? ''
    });
  }, [profileData]);

  useEffect(() => {
    if (updateProfileSuccess) {
      toast.success('Profile updated');
      setIsEditingProfile(false);
      dispatch(resetUpdateProfileFlag());
    }
  }, [updateProfileSuccess, dispatch]);

  useEffect(() => {
    if (updateProfileError) {
      const msg = typeof updateProfileError === 'string'
        ? updateProfileError
        : updateProfileError?.message || 'Failed to update profile';
      toast.error(msg);
      dispatch(resetUpdateProfileFlag());
    }
  }, [updateProfileError, dispatch]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = () => {
    if (!currentUser?.id) {
      setIsEditingProfile(false);
      return;
    }
    dispatch(updateProfileStart({
      id: currentUser.id,
      payload: {
        ...profileForm,
        serviceTypeId: profileForm.serviceTypeId === '' ? null : profileForm.serviceTypeId
      }
    }));
  };

  const fullName = [profileForm.firstName, profileForm.lastName].filter(Boolean).join(' ');
  const initials = (
    (profileForm.firstName?.[0] || '') + (profileForm.lastName?.[0] || '')
  ).toUpperCase() || 'SP';
  const specialtyName =
    serviceTypes?.find((t) => String(t.id) === String(profileForm.serviceTypeId))?.name ||
    profileData?.serviceType?.name ||
    '';
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showBidModal, setShowBidModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState(() => profileImageStorage.get(providerId));
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [selectedLeadForMessage, setSelectedLeadForMessage] = useState(null);
  const [showLeadDetailsModal, setShowLeadDetailsModal] = useState(false);
  const [isClosingLeadDetailsModal, setIsClosingLeadDetailsModal] = useState(false);
  const [selectedLeadForDetails, setSelectedLeadForDetails] = useState(null);

  // Add CSS animations for modal
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      
      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
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

  // Handle modal close with animation
  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowBidModal(false);
      setIsClosingModal(false);
      setSelectedLead(null);
    }, 150); // Match animation duration
  };

  // Handle lead details modal close with animation
  const handleCloseLeadDetailsModal = () => {
    setIsClosingLeadDetailsModal(true);
    setTimeout(() => {
      setShowLeadDetailsModal(false);
      setIsClosingLeadDetailsModal(false);
      setSelectedLeadForDetails(null);
    }, 150);
  };

  const [bidData, setBidData] = useState({
    amount: '',
    timeline: '',
    estimatedDays: '',
    notes: '',
    terms: '',
    providerName: '',
    phoneNumber: '',
    price: ''
  });

  // Mock provider category - in real app this would come from currentUser or provider profile
  const isPropertyShowingProvider = false; // This would be: currentUser?.category === 'Property Showing' || currentUser?.serviceType === 'Property Showing'

  // Load from localStorage
  const [submittedBids, setSubmittedBids] = useState(() =>
  providerBidsStorage.get(providerId)
  );
  const [notificationSettings, setNotificationSettings] = useState(() =>
  providerNotificationSettingsStorage.get(providerId)
  );

  // Save to localStorage when data changes
  useEffect(() => {
    providerBidsStorage.set(providerId, submittedBids);
  }, [submittedBids, providerId]);

  useEffect(() => {
    providerNotificationSettingsStorage.set(providerId, notificationSettings);
  }, [notificationSettings, providerId]);

  const dashboardStats = {
    totalLeads: 42,
    activeQuotes: 8,
    completedJobs: 156,
    monthlyRevenue: 15750,
    rating: 4.8,
    reviewCount: 89
  };

  // Load recent leads from localStorage with default mock data
  const defaultLeads = [
  {
    id: 1,
    customerName: 'Sarah Johnson',
    service: 'Kitchen Remodeling',
    location: 'Phoenix, AZ',
    budget: '$15,000 - $25,000',
    requestDate: '2024-01-15',
    status: 'new',
    description: 'Complete kitchen renovation including new cabinets, countertops, and appliances. Looking for a modern design with high-quality materials.'
  },
  {
    id: 2,
    customerName: 'Mike Chen',
    service: 'Bathroom Renovation',
    location: 'Phoenix, AZ',
    budget: '$8,000 - $12,000',
    requestDate: '2024-01-14',
    status: 'quoted',
    description: 'Master bathroom remodel with walk-in shower, new vanity, and tile work. Need licensed and insured contractor.'
  },
  {
    id: 3,
    customerName: 'Jennifer Davis',
    service: 'Home Addition',
    location: 'Scottsdale, AZ',
    budget: '$50,000+',
    requestDate: '2024-01-13',
    status: 'negotiating',
    description: 'Adding a 400 sq ft home office with custom built-ins. Need permits and architectural plans.'
  }];


  const [recentLeads, setRecentLeads] = useState(() => {
    const saved = recentLeadsStorage.get(providerId);
    return saved.length > 0 ? saved : defaultLeads;
  });

  // Save recent leads to localStorage
  useEffect(() => {
    recentLeadsStorage.set(providerId, recentLeads);
  }, [recentLeads, providerId]);

  const handleOpenBidModal = (lead) => {
    console.log('handleOpenBidModal called with lead:', lead);
    setIsClosingModal(false); // Reset closing state
    setSelectedLead(lead);
    // Pre-fill with existing bid data if updating
    const existingBid = submittedBids[lead.id];
    if (existingBid) {
      setBidData({
        amount: existingBid.amount || '',
        timeline: existingBid.timeline || '',
        estimatedDays: existingBid.estimatedDays || '',
        notes: existingBid.notes || '',
        terms: existingBid.terms || '',
        providerName: existingBid.providerName || '',
        phoneNumber: existingBid.phoneNumber || '',
        price: existingBid.price || ''
      });
    } else {
      setBidData({
        amount: '',
        timeline: '',
        estimatedDays: '',
        notes: '',
        terms: '',
        providerName: '',
        phoneNumber: '',
        price: ''
      });
    }
    setShowBidModal(true);
    console.log('Modal state set to true');
  };

  const handleBidInputChange = (e) => {
    const { name, value } = e.target;
    setBidData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitBid = (e) => {
    e.preventDefault();

    // Check required fields based on provider type
    if (isPropertyShowingProvider) {
      if (!bidData.providerName || !bidData.phoneNumber || !bidData.price) {
        alert('Please fill in required fields (Provider Name, Phone Number, and Price)');
        return;
      }
    } else {
      if (!bidData.amount || !bidData.estimatedDays) {
        alert('Please fill in required fields (Amount and Estimated Days)');
        return;
      }
    }

    // Store the bid
    const bidId = `bid-${selectedLead.id}-${Date.now()}`;
    const newBid = {
      id: bidId,
      leadId: selectedLead.id,
      amount: bidData.amount,
      timeline: bidData.timeline,
      estimatedDays: bidData.estimatedDays,
      notes: bidData.notes,
      terms: bidData.terms,
      providerName: bidData.providerName,
      phoneNumber: bidData.phoneNumber,
      price: bidData.price,
      submittedDate: new Date().toISOString(),
      status: 'pending'
    };

    const updatedBids = {
      ...submittedBids,
      [selectedLead.id]: newBid
    };
    setSubmittedBids(updatedBids);
    providerBidsStorage.set(providerId, updatedBids);

    // Update lead status
    const updatedLeads = recentLeads.map((lead) =>
    lead.id === selectedLead.id ?
    { ...lead, status: 'quoted' } :
    lead
    );
    setRecentLeads(updatedLeads);
    recentLeadsStorage.set(providerId, updatedLeads);

    alert('Bid submitted successfully!');
    handleCloseModal();
  };

  const upcomingJobs = [
  {
    id: 1,
    customer: 'Robert Wilson',
    service: 'Electrical Panel Upgrade',
    date: '2024-01-20',
    time: '9:00 AM',
    address: '123 Main St, Phoenix, AZ'
  },
  {
    id: 2,
    customer: 'Lisa Brown',
    service: 'Plumbing Repair',
    date: '2024-01-22',
    time: '2:00 PM',
    address: '456 Oak Ave, Tempe, AZ'
  }];


  const defaultProjectGallery = [
  {
    id: 1,
    title: 'Modern Kitchen Remodel',
    category: 'Kitchen',
    beforeImage: '/api/placeholder/300/200',
    afterImage: '/api/placeholder/300/200',
    description: 'Complete kitchen transformation with custom cabinets and granite countertops'
  },
  {
    id: 2,
    title: 'Master Bathroom Renovation',
    category: 'Bathroom',
    beforeImage: '/api/placeholder/300/200',
    afterImage: '/api/placeholder/300/200',
    description: 'Luxury bathroom renovation with walk-in shower and heated floors'
  },
  {
    id: 3,
    title: 'Home Office Addition',
    category: 'Addition',
    beforeImage: '/api/placeholder/300/200',
    afterImage: '/api/placeholder/300/200',
    description: 'New home office space with custom built-ins and skylights'
  }];


  const [projectGallery, setProjectGallery] = useState(() => {
    const saved = projectGalleryStorage.get(providerId);
    return saved.length > 0 ? saved : defaultProjectGallery;
  });

  // Save project gallery to localStorage
  useEffect(() => {
    projectGalleryStorage.set(providerId, projectGallery);
  }, [projectGallery, providerId]);

  const renderDashboard = () =>
  <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
        onClick={() => setActiveTab('leads')}
        className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-white text-sm drop-shadow-md">New Leads</p>
              <p className="text-2xl font-bold text-white drop-shadow-lg">{dashboardStats.totalLeads}</p>
              <p className="text-xs text-white drop-shadow-md">+12% this month</p>
            </div>
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          {/* Shine effect */}
          <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
        </div>

        <div
        onClick={() => setActiveTab('leads')}
        className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-white text-sm drop-shadow-md">Active Quotes</p>
              <p className="text-2xl font-bold text-white drop-shadow-lg">{dashboardStats.activeQuotes}</p>
              <p className="text-xs text-white drop-shadow-md">Pending responses</p>
            </div>
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          {/* Shine effect */}
          <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
        </div>

        <div
        className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-white text-sm drop-shadow-md">Completed Jobs</p>
              <p className="text-2xl font-bold text-white drop-shadow-lg">{dashboardStats.completedJobs}</p>
              <p className="text-xs text-white drop-shadow-md">All time</p>
            </div>
            <Users className="h-8 w-8 text-white" />
          </div>
          {/* Shine effect */}
          <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
        </div>

        <div
        className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-white text-sm drop-shadow-md">Monthly Revenue</p>
              <p className="text-2xl font-bold text-white drop-shadow-lg">${dashboardStats.monthlyRevenue.toLocaleString()}</p>
              <p className="text-xs text-white drop-shadow-md">+8% vs last month</p>
            </div>
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          {/* Shine effect */}
          <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
        </div>

        <div
        className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-white text-sm drop-shadow-md">Average Rating</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-white drop-shadow-lg">{dashboardStats.rating}</p>
                <Star className="h-5 w-5 text-white fill-white" />
              </div>
              <p className="text-xs text-white drop-shadow-md">{dashboardStats.reviewCount} reviews</p>
            </div>
          </div>
          {/* Shine effect */}
          <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
        </div>

        <div
        className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-white text-sm drop-shadow-md">Profile Views</p>
              <p className="text-2xl font-bold text-white drop-shadow-lg">247</p>
              <p className="text-xs text-white drop-shadow-md">+15% this week</p>
            </div>
            <Users className="h-8 w-8 text-white" />
          </div>
          {/* Shine effect */}
          <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
        </div>
      </div>

      {/* Create Open House Button - temporarily disabled */}
      {/* <div 
       className="rounded-2xl p-6 relative overflow-hidden"
       style={{
         background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
         backdropFilter: 'blur(20px)',
         border: '1px solid rgba(255,255,255,0.2)',
         boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
       }}
      >
       <div className="flex items-center justify-between">
         <div>
           <h3 className="text-xl text-white mb-2 drop-shadow-lg">Create Open House</h3>
           <p className="text-sm text-white drop-shadow-md">List a new property open house for potential buyers</p>
         </div>
         <button
           onClick={() => {
             if (currentUser) {
               localStorage.setItem('openCreateOpenHouseModal', 'true');
               navigate('open-house');
             } else {
               localStorage.setItem('pendingRedirect', '/open-house');
               navigate('login');
             }
           }}
           className="px-6 py-3 bg-coral-orange text-black rounded-xl hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 flex items-center space-x-2 font-semibold shadow-lg"
         >
           <Plus className="h-5 w-5" />
           <span>Create Open House</span>
         </button>
       </div>
      </div> */}

      {/* Upcoming Jobs */}
      <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}>
      
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl text-white drop-shadow-lg">Upcoming Jobs</h3>
          <button className="text-white hover:text-white transition-colors duration-300 drop-shadow-md cursor-pointer">View Calendar</button>
        </div>

        <div className="space-y-6">
          {upcomingJobs.map((job) =>
        <div
          key={job.id}
          className="group relative rounded-xl p-4 overflow-hidden transition-all duration-150 hover:-translate-y-1"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
            transform: 'scale(1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
          }}>
          
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h4 className="text-white font-medium drop-shadow-md group-hover:text-white transition-colors duration-300">{job.customer}</h4>
                  <p className="text-sm text-white drop-shadow-md group-hover:text-white transition-colors duration-300">{job.service}</p>
                  <p className="text-xs text-white mt-1 drop-shadow-md group-hover:text-white transition-colors duration-300">{job.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white font-medium drop-shadow-md">{job.date}</p>
                  <p className="text-xs text-white drop-shadow-md">{job.time}</p>
                </div>
              </div>
              {/* Shine effect */}
              <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
            </div>
        )}
        </div>
      </div>
    </div>;


  const renderProfile = () =>
  <div className="space-y-8">
      <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}>
      
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl text-white drop-shadow-lg">Profile Information</h3>
          <button
          onClick={() => {
            if (isEditingProfile) {
              setIsEditingProfile(false);
            } else {
              setIsEditingProfile(true);
            }
          }}
          className="px-6 py-3 bg-coral-orange text-black rounded-xl hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 flex items-center space-x-2 font-semibold shadow-lg">

            <Edit3 className="h-5 w-5" />
            <span>{isEditingProfile ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Name + role */}
          <div className="flex flex-col items-center text-center">
            <div
              className="h-28 w-28 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #0089e1 0%, #004571 100%)',
                border: '3px solid rgba(255,255,255,0.4)'
              }}>
              {initials}
            </div>
            <h4 className="text-lg text-white mt-4 drop-shadow-md font-semibold">{fullName || 'Your Name'}</h4>
            <p className="text-white/80 drop-shadow-md text-sm">Service Provider</p>
          </div>

          {/* Contact Information */}
          <div>
            <h5 className="text-white font-medium mb-4 drop-shadow-md">Contact Information</h5>
            {isEditingProfile ?
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    value={profileForm.firstName}
                    onChange={handleProfileChange}
                    className="px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60"
                    placeholder="First Name" />
                  <input
                    type="text"
                    name="lastName"
                    value={profileForm.lastName}
                    onChange={handleProfileChange}
                    className="px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60"
                    placeholder="Last Name" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60"
                  placeholder="Email" />
                <input
                  type="tel"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60"
                  placeholder="Phone" />
              </div> :
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-white" />
                  <span className="text-white drop-shadow-md">{profileForm.email || '—'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-white" />
                  <span className="text-white drop-shadow-md">{profileForm.phone || '—'}</span>
                </div>
              </div>
            }
          </div>

          {/* Address */}
          <div>
            <h5 className="text-white font-medium mb-4 drop-shadow-md">Address</h5>
            {isEditingProfile ?
              <div className="space-y-4">
                <input
                  type="text"
                  name="streetAddress"
                  value={profileForm.streetAddress}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60"
                  placeholder="Street Address" />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="city"
                    value={profileForm.city}
                    onChange={handleProfileChange}
                    className="px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60"
                    placeholder="City" />
                  <input
                    type="text"
                    name="state"
                    value={profileForm.state}
                    onChange={handleProfileChange}
                    className="px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60"
                    placeholder="State" />
                </div>
                <input
                  type="text"
                  name="zipCode"
                  value={profileForm.zipCode}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60"
                  placeholder="ZIP Code" />
              </div> :
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-white mt-1" />
                <div className="text-white drop-shadow-md">
                  <div>{profileForm.streetAddress || '—'}</div>
                  <div>{[profileForm.city, profileForm.state].filter(Boolean).join(', ')} {profileForm.zipCode}</div>
                </div>
              </div>
            }
          </div>
        </div>

        {/* Business Name + Specialty */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h5 className="text-white font-medium mb-4 drop-shadow-md">Business Name</h5>
            {isEditingProfile ?
              <input
                type="text"
                name="businessName"
                value={profileForm.businessName}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60"
                placeholder="Business Name" /> :
              <p className="text-white drop-shadow-md">{profileForm.businessName || '—'}</p>
            }
          </div>
          <div>
            <h5 className="text-white font-medium mb-4 drop-shadow-md">Specialty</h5>
            {isEditingProfile ?
              <select
                name="serviceTypeId"
                value={profileForm.serviceTypeId || ''}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white rounded focus:outline-none focus:border-white/60">
                <option value="" className="text-slate-900">Select specialty</option>
                {serviceTypes.map((t) =>
                  <option key={t.id} value={t.id} className="text-slate-900">{t.name}</option>
                )}
              </select> :
              <p className="text-white drop-shadow-md">{specialtyName || '—'}</p>
            }
          </div>
        </div>

        {/* About Me */}
        <div className="mt-8">
          <h5 className="text-white font-medium mb-4 drop-shadow-md">About Me</h5>
          {isEditingProfile ?
            <textarea
              name="businessDesc"
              value={profileForm.businessDesc}
              onChange={handleProfileChange}
              rows="3"
              className="w-full px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-shadow-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60"
              placeholder="Tell clients about your business..." /> :
            <p className="text-white leading-relaxed drop-shadow-md">{profileForm.businessDesc || '—'}</p>
          }
        </div>

        {isEditingProfile &&
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => setIsEditingProfile(false)}
              className="px-4 py-2 border-2 border-white/30 text-white rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300">
              Cancel
            </button>
            <button
              onClick={handleProfileSave}
              className="px-4 py-2 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg">
              Save Changes
            </button>
          </div>
        }

        {/* Notification Settings */}
        <div
        className="rounded-2xl p-8 relative overflow-hidden mt-8"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        
          <h3 className="text-xl text-white drop-shadow-lg mb-6">Notification Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white drop-shadow-md font-medium">Email Notifications</p>
                <p className="text-white text-sm drop-shadow-md">Receive notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                type="checkbox"
                checked={notificationSettings.email}
                onChange={(e) => setNotificationSettings((prev) => ({ ...prev, email: e.target.checked }))}
                className="sr-only peer" />
              
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-blue"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white drop-shadow-md font-medium">Push Notifications</p>
                <p className="text-white text-sm drop-shadow-md">Receive push notifications in browser</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                type="checkbox"
                checked={notificationSettings.push}
                onChange={(e) => setNotificationSettings((prev) => ({ ...prev, push: e.target.checked }))}
                className="sr-only peer" />
              
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-blue"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white drop-shadow-md font-medium">Open House Notifications</p>
                <p className="text-white text-sm drop-shadow-md">Get notified about new open houses</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                type="checkbox"
                checked={notificationSettings.openHouse}
                onChange={(e) => setNotificationSettings((prev) => ({ ...prev, openHouse: e.target.checked }))}
                className="sr-only peer" />
              
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-blue"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white drop-shadow-md font-medium">Quote Request Notifications</p>
                <p className="text-white text-sm drop-shadow-md">Get notified when users request quotes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                type="checkbox"
                checked={notificationSettings.quoteRequest}
                onChange={(e) => setNotificationSettings((prev) => ({ ...prev, quoteRequest: e.target.checked }))}
                className="sr-only peer" />
              
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-blue"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>;


  const renderGallery = () =>
  <div className="space-y-8">
      <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}>
      
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl text-white drop-shadow-lg">Project Gallery</h3>
          <button
          onClick={() => navigate('create-project')}
          className="px-4 py-2 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 flex items-center space-x-2 font-semibold">
          
            <Plus className="h-4 w-4" />
            <span>Add Project</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectGallery.map((project) =>
        <div
          key={project.id}
          className="group relative rounded-xl overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          
              <div className="grid grid-cols-2">
                <div className="relative">
                  <div className="aspect-square bg-gray-200 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    Before
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square bg-gray-200 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    After
                  </div>
                </div>
              </div>
              <div className="p-4 relative z-10">
                <h4 className="text-white font-medium mb-1 drop-shadow-md group-hover:text-white transition-colors duration-300">{project.title}</h4>
                <p className="text-sm text-white mb-2 drop-shadow-md group-hover:text-white transition-colors duration-300">{project.category}</p>
                <p className="text-xs text-white leading-relaxed drop-shadow-md group-hover:text-white transition-colors duration-300">{project.description}</p>
                <div className="flex justify-between items-center mt-3">
                  <button className="text-white text-sm hover:text-white transition-colors duration-300 cursor-pointer">View Details</button>
                  <button className="text-white text-sm hover:text-white transition-colors duration-300 cursor-pointer">Edit</button>
                </div>
              </div>
              {/* Shine effect */}
              <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
            </div>
        )}
        </div>

        <div className="text-center mt-8">
          <button
          className="px-6 py-3 border-2 border-dashed border-white/30 text-white rounded-xl hover:border-white/60 hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)'
          }}>
          
            <Camera className="h-6 w-6 mx-auto mb-2" />
            <span className="block drop-shadow-md">Add More Photos</span>
            <span className="text-xs drop-shadow-md">Showcase your best work</span>
          </button>
        </div>
      </div>
    </div>;


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
          <h1 className="text-3xl text-white drop-shadow-lg mb-2">Service Provider Dashboard</h1>
          <p className="text-white drop-shadow-md">Manage your business and connect with customers</p>
        </div>

        {/* Navigation Tabs */}
        <div
          className="rounded-lg shadow-lg mb-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          
          <div className="flex">
            {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'leads', label: 'Leads', icon: MessageSquare },
            { id: 'calendar', label: 'Schedule', icon: Calendar },
            { id: 'gallery', label: 'Photo Gallery', icon: Camera },
            { id: 'settings', label: 'Settings', icon: Edit3 }].
            map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 px-4 py-4 text-center transition-all duration-150 bg-transparent ${
                  activeTab === tab.id ?
                  'text-white border-b-2 border-coral-orange' :
                  'text-white hover:bg-white/20 backdrop-blur-sm'}`
                  }
                  style={{
                    backgroundColor: activeTab === tab.id ? 'transparent' : undefined
                  }}>
                  
                  {activeTab === tab.id &&
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-coral-orange"></div>
                  }
                  <IconComponent className={`h-5 w-5 mx-auto mb-1 ${activeTab === tab.id ? 'text-coral-orange' : 'text-white'}`} />
                  <span className={`text-sm drop-shadow-md ${activeTab === tab.id ? 'text-white font-semibold' : ''}`}>{tab.label}</span>
                </button>);

            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        
        {activeTab === 'leads' &&
        <div className="space-y-8">
            {/* Recent Leads */}
            <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl text-white drop-shadow-lg">Recent Leads</h3>
                <button className="text-white hover:text-white transition-colors duration-300 drop-shadow-md cursor-pointer">View All</button>
              </div>

              <div className="space-y-6">
                {recentLeads.map((lead) =>
              <div
                key={lead.id}
                className="group relative rounded-xl p-4 overflow-hidden transition-all duration-150 hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
                  transform: 'scale(1)',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                }}>
                
                    {/* Shine effect - moved to top so it doesn't interfere */}
                    <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100 pointer-events-none z-0"></div>
                    
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <div>
                        <h4 className="text-white font-medium drop-shadow-md group-hover:text-white transition-colors duration-300">{lead.customerName}</h4>
                        <p className="text-sm text-white drop-shadow-md group-hover:text-white transition-colors duration-300">{lead.service}</p>
                        <div className="flex items-center space-x-4 text-xs text-white mt-1">
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {lead.location}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {lead.requestDate}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white font-medium drop-shadow-md">{lead.budget}</p>
                        {submittedBids[lead.id] &&
                    <p className="text-xs text-white/80 drop-shadow-md mt-1">
                            Your Bid: ${submittedBids[lead.id].amount}
                          </p>
                    }
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                    submittedBids[lead.id] || lead.status === 'quoted' ? 'bg-green-500/20 backdrop-blur-sm border border-green-500/30 text-white' :
                    lead.status === 'new' ? 'bg-white/20 backdrop-blur-sm border border-white/30 text-white' :
                    'bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 text-white'}`
                    }>
                          {submittedBids[lead.id] || lead.status === 'quoted' ? 'Bid Submitted' :
                      lead.status === 'new' ? 'New' : 'Negotiating'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-3 relative z-30" style={{ pointerEvents: 'auto' }}>
                      <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedLeadForDetails(lead);
                      setIsClosingLeadDetailsModal(false);
                      setShowLeadDetailsModal(true);
                    }}
                    className="px-3 py-1 bg-sky-blue text-white rounded text-sm hover:bg-sky-blue/90 transition-all duration-300 relative z-30 cursor-pointer"
                    style={{ pointerEvents: 'auto', position: 'relative' }}>
                    
                        View Details
                      </button>
                      <button
                    type="button"
                    onClick={(e) => {
                      console.log('Submit Bid button clicked!', lead);
                      e.preventDefault();
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                      handleOpenBidModal(lead);
                    }}
                    className="px-3 py-1 bg-coral-orange text-black rounded text-sm hover:bg-coral-orange/90 transition-all duration-300 font-medium relative z-30 cursor-pointer"
                    style={{ pointerEvents: 'auto', position: 'relative', zIndex: 9999 }}>
                    
                        {submittedBids[lead.id] ? 'Update Bid' : 'Submit Bid'}
                      </button>
                      <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedLeadForMessage(lead);
                      setShowMessagingModal(true);
                    }}
                    className="px-3 py-1 border border-white text-white rounded text-sm hover:bg-white hover:text-sky-blue transition-all duration-300 relative z-30 cursor-pointer"
                    style={{ pointerEvents: 'auto', position: 'relative' }}>
                    
                        Message
                      </button>
                    </div>
                  </div>
              )}
              </div>
            </div>
          </div>
        }
        {activeTab === 'gallery' && renderGallery()}
        {activeTab === 'calendar' &&
        <div
          className="rounded-2xl p-8 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          
            <Calendar className="h-16 w-16 text-white mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2 drop-shadow-lg">Schedule</h3>
            <p className="text-white mb-6 drop-shadow-md">Integrated calendar and appointment scheduling would be implemented here</p>
            <button className="px-6 py-3 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 font-semibold">
              Coming Soon
            </button>
          </div>
        }
        {activeTab === 'settings' && renderProfile()}
      </div>

      {/* Bidding Modal */}
      {showBidModal && selectedLead && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 69, 113, 0.75)',
            backdropFilter: 'blur(4px)',
            animation: isClosingModal ? 'fadeOut 0.15s ease-out' : 'fadeIn 0.3s ease-out'
          }}
          onClick={handleCloseModal}>
          
          <div
            className="relative w-full max-w-2xl rounded-2xl p-4 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              maxHeight: '85vh',
              height: 'auto',
              width: '90%',
              maxWidth: '672px',
              animation: isClosingModal ? 'modalPopOut 0.15s ease-out' : 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/20 transition-all duration-300">
              
              <X className="h-4 w-4 text-white" />
            </button>

            {/* Modal Header */}
            <div className="mb-3">
              <h2 className="text-xl text-white drop-shadow-lg mb-1">
                {submittedBids[selectedLead.id] ? 'Update Bid' : 'Submit Bid'}
              </h2>
              <p className="text-sm text-white drop-shadow-md">Project: {selectedLead.service}</p>
              <p className="text-sm text-white drop-shadow-md">Customer: {selectedLead.customerName} • {selectedLead.location}</p>
              <p className="text-sm text-white drop-shadow-md mt-1">Budget Range: {selectedLead.budget}</p>
              {selectedLead.description &&
              <p className="text-sm text-white drop-shadow-md mt-1 italic">"{selectedLead.description}"</p>
              }
            </div>

            {/* Bid Form */}
            <form onSubmit={handleSubmitBid} className="space-y-3">
              {isPropertyShowingProvider ?
              <>
                  {/* Property Showing Provider Fields */}
                  <div>
                    <label className="block text-white mb-1 drop-shadow-md text-sm">
                      Provider Name * <span className="text-xs text-white/70">(Your name or business name)</span>
                    </label>
                    <input
                    type="text"
                    name="providerName"
                    value={bidData.providerName}
                    onChange={handleBidInputChange}
                    placeholder="Enter your name or business name"
                    className="w-full px-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60 text-sm"
                    required />
                  
                  </div>

                  <div>
                    <label className="block text-white mb-1 drop-shadow-md text-sm">
                      Phone Number * <span className="text-xs text-white/70">(Contact number)</span>
                    </label>
                    <input
                    type="tel"
                    name="phoneNumber"
                    value={bidData.phoneNumber}
                    onChange={handleBidInputChange}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60 text-sm"
                    required />
                  
                  </div>

                  <div>
                    <label className="block text-white mb-1 drop-shadow-md text-sm">
                      Price * <span className="text-xs text-white/70">(in USD)</span>
                    </label>
                    <input
                    type="number"
                    name="price"
                    value={bidData.price}
                    onChange={handleBidInputChange}
                    placeholder="Enter your price"
                    className="w-full px-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60 text-sm"
                    required
                    min="0"
                    step="0.01" />
                  
                  </div>
                </> :

              <>
                  {/* Regular Provider Fields */}
                  <div>
                    <label className="block text-white mb-1 drop-shadow-md text-sm">
                      Bid Amount * <span className="text-xs text-white/70">(in USD)</span>
                    </label>
                    <input
                    type="number"
                    name="amount"
                    value={bidData.amount}
                    onChange={handleBidInputChange}
                    placeholder="Enter your bid amount"
                    className="w-full px-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60 text-sm"
                    required
                    min="0"
                    step="0.01" />
                  
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white mb-1 drop-shadow-md text-sm">
                        Estimated Days * <span className="text-xs text-white/70">(to complete)</span>
                      </label>
                      <input
                      type="number"
                      name="estimatedDays"
                      value={bidData.estimatedDays}
                      onChange={handleBidInputChange}
                      placeholder="e.g., 14"
                      className="w-full px-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60 text-sm"
                      required
                      min="1" />
                    
                    </div>

                    <div>
                      <label className="block text-white mb-1 drop-shadow-md text-sm">
                        Timeline <span className="text-xs text-white/70">(optional)</span>
                      </label>
                      <input
                      type="text"
                      name="timeline"
                      value={bidData.timeline}
                      onChange={handleBidInputChange}
                      placeholder="e.g., 2-3 weeks"
                      className="w-full px-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60 text-sm" />
                    
                    </div>
                  </div>
                </>
              }

              <div>
                <label className="block text-white mb-1 drop-shadow-md text-sm">
                  Notes/Message <span className="text-xs text-white/70">(optional)</span>
                </label>
                  <textarea
                  name="notes"
                  value={bidData.notes}
                  onChange={handleBidInputChange}
                  placeholder="Add any additional details, approach, or message for the customer..."
                  rows={2}
                  className="w-full px-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60 text-sm" />
                
              </div>

              <div>
                <label className="block text-white mb-1 drop-shadow-md text-sm">
                  Terms & Conditions <span className="text-xs text-white/70">(optional)</span>
                </label>
                <textarea
                  name="terms"
                  value={bidData.terms}
                  onChange={handleBidInputChange}
                  placeholder="Payment terms, warranty, materials included, etc..."
                  rows={2}
                  className="w-full px-4 py-2 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60 text-sm" />
                
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2 rounded-xl border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 font-semibold backdrop-blur-sm text-sm">
                  
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-coral-orange text-black hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg text-sm">
                  
                  {submittedBids[selectedLead.id] ? 'Update Bid' : 'Submit Bid'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Messaging Modal */}
      <MessagingModal
        isOpen={showMessagingModal}
        onClose={() => {
          setShowMessagingModal(false);
          setSelectedLeadForMessage(null);
        }}
        recipient={selectedLeadForMessage} />
      

      {/* Lead Details Modal */}
      {showLeadDetailsModal && selectedLeadForDetails && typeof document !== 'undefined' && document.body && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            background: isClosingLeadDetailsModal ? 'rgba(0, 69, 113, 0)' : 'rgba(0, 69, 113, 0.75)',
            backdropFilter: 'blur(4px)',
            animation: isClosingLeadDetailsModal ? 'fadeOut 0.15s ease-out' : 'fadeIn 0.3s ease-out'
          }}
          onClick={handleCloseLeadDetailsModal}>
          
          <div
            className="relative w-full max-w-2xl rounded-2xl p-6 overflow-y-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              maxHeight: '85vh',
              animation: isClosingLeadDetailsModal ? 'modalPopOut 0.15s ease-out' : 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button
              onClick={handleCloseLeadDetailsModal}
              className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/20 transition-all duration-300">
              
              <X className="h-4 w-4 text-white" />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <h2 className="text-2xl text-white drop-shadow-lg mb-2">Lead Details</h2>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-white" />
                  <h3 className="text-xl text-white drop-shadow-md">{selectedLeadForDetails?.service || 'N/A'}</h3>
                </div>
                <p className="text-white drop-shadow-md">Customer: {selectedLeadForDetails?.customerName || 'N/A'}</p>
                <div className="flex items-center space-x-4 text-sm text-white drop-shadow-md">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedLeadForDetails?.location || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedLeadForDetails?.requestDate || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{selectedLeadForDetails?.budget || 'N/A'}</span>
                  </div>
                </div>
                {selectedLeadForDetails?.id && submittedBids && submittedBids[selectedLeadForDetails.id] &&
                <div className="mt-2 p-3 rounded-lg bg-green-500/20 border border-green-500/30">
                    <p className="text-sm text-white drop-shadow-md">
                      <span className="font-semibold">Your Bid:</span> ${submittedBids[selectedLeadForDetails.id]?.amount || 'N/A'}
                    </p>
                  </div>
                }
              </div>
            </div>

            {/* Project Description */}
            <div className="mb-6">
              <h4 className="text-lg text-white drop-shadow-md mb-3 font-semibold">Project Description</h4>
              <div
                className="p-4 rounded-lg"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                
                <p className="text-white drop-shadow-md leading-relaxed">
                  {selectedLeadForDetails?.description || 'No additional details provided.'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-white/20">
              <button
                type="button"
                onClick={handleCloseLeadDetailsModal}
                className="px-5 py-2 rounded-xl border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 font-semibold backdrop-blur-sm">
                
                Close
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleCloseLeadDetailsModal();
                  setTimeout(() => {
                    setSelectedLead(selectedLeadForDetails);
                    handleOpenBidModal(selectedLeadForDetails);
                  }, 200);
                }}
                className="px-5 py-2 rounded-xl bg-coral-orange text-black hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg">
                
                {selectedLeadForDetails?.id && submittedBids && submittedBids[selectedLeadForDetails.id] ? 'Update Bid' : 'Submit Bid'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>);

}