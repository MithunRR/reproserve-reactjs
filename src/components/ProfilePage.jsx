import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit3, Camera, Star, Calendar, MessageSquare, FileText, Home, Upload, Plus, Building, DollarSign, CheckCircle2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { QuoteRequestModal } from './QuoteRequestModal';
import { RequestDetailsModal } from './RequestDetailsModal';
import { RespondQuoteModal } from './RespondQuoteModal';
import { ReviewModal } from './ReviewModal';
import { AdminDashboard } from './AdminDashboard';
import {
  quoteRequestsStorage,
  profileDataStorage,
  notificationSettingsStorage,



  profileImageStorage } from
'../utils/localStorage';
import {
  fetchProfileStart,
  updateProfileStart,
  resetUpdateProfileFlag,
  fetchProjectsStart,
  fetchFavoritesStart,
  removeFavoriteStart,
  fetchQuotesStart,
  fetchIncomingQuotesStart,
  createQuoteStart,
  resetCreateQuoteFlag,
  addQuoteResponseStart,
  resetQuoteResponseFlag,
  updateQuoteStart,
  resetUpdateQuoteFlag,
  updateQuoteResponseStart,
  resetUpdateQuoteResponseFlag,
  createReviewStart,
  resetCreateReviewFlag,
  fetchShowRequestsStart,
  claimShowRequestStart,
  resetClaimShowRequestFlag,
  completeShowRequestStart,
  resetCompleteShowRequestFlag,
  fetchServiceTypesStart
} from '../Store/Features/Authentication/authslice';

export function ProfilePage({ navigate, currentUser, setCurrentUser }) {
  const dispatch = useDispatch();
  const {
    profileData: apiProfileData,
    profileLoading,
    updateProfileLoading,
    updateProfileSuccess,
    updateProfileError,
    projects: apiProjects,
    favorites: apiFavorites,
    quotes: apiQuotes,
    incomingQuotes,
    incomingQuotesLoading,
    createQuoteSuccess,
    createQuoteError,
    quoteResponseSuccess,
    quoteResponseError,
    quoteResponseLoading,
    updateQuoteSuccess,
    updateQuoteError,
    updateQuoteResponseSuccess,
    updateQuoteResponseError,
    createReviewSuccess,
    createReviewError,
    createReviewLoading,
    showRequests,
    showRequestsLoading,
    claimShowRequestSuccess,
    claimShowRequestError,
    claimShowRequestLoading,
    completeShowRequestSuccess,
    completeShowRequestError,
    completeShowRequestLoading,
    serviceTypes
  } = useSelector((state) => state.AuthReducer);

  const roleLabel =
    currentUser?.role === 'provider'
      ? 'Service Provider'
      : currentUser?.role === 'realtor'
        ? 'Realtor'
        : 'User';
  const isBusinessRole = currentUser?.role === 'provider' || currentUser?.role === 'realtor';

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  // Separate edit state for the Business Details panel so the two sections
  // can be edited and saved independently.
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [detailRequest, setDetailRequest] = useState(null);
  const [respondTarget, setRespondTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);

  // Add fast fade-in animation for tab content
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.2s ease-out;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Load data from localStorage on mount
  const userId = currentUser?.id || currentUser?.email || 'default';
  const [notificationSettings, setNotificationSettings] = useState(() =>
  notificationSettingsStorage.get(userId)
  );
  const [profileImage, setProfileImage] = useState(() => profileImageStorage.get(userId));
  const defaultProfileData = {
    firstName: currentUser?.name?.split(' ')[0] || '',
    lastName: currentUser?.name?.split(' ')[1] || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    bio: '',
    // Business fields — populated only for service_provider / realtor users.
    businessName: '',
    serviceTypeId: '',
    licenseNumber: ''
  };
  const [profileData, setProfileData] = useState(() => {
    const saved = profileDataStorage.get(userId);
    return saved || defaultProfileData;
  });

  // Fetch profile from API on mount whenever we know the user's id
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchProfileStart(currentUser.id));
    }
  }, [currentUser?.id, dispatch]);

  // Load the user's projects, favorites and quote requests from the API.
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchProjectsStart({ userId: currentUser.id }));
      dispatch(fetchFavoritesStart({ userId: currentUser.id }));
      dispatch(fetchQuotesStart({ userId: currentUser.id }));
      // Realtors / providers also load the requests directed at them.
      if (isBusinessRole) {
        dispatch(fetchIncomingQuotesStart({ providerId: currentUser.id }));
      }
      // Show-my-property: customers see their own listings, realtors see all
      // pending + their assigned ones (filtered client-side in renderShowings).
      if (currentUser.role === 'realtor') {
        dispatch(fetchShowRequestsStart({}));
      } else {
        dispatch(fetchShowRequestsStart({ userId: currentUser.id }));
      }
    }
  }, [currentUser?.id, currentUser?.role, isBusinessRole, dispatch]);

  // Sync profileData with API response — maps backend fields to form fields
  useEffect(() => {
    if (!apiProfileData) return;
    setProfileData((prev) => ({
      ...prev,
      firstName: apiProfileData.firstName ?? prev.firstName ?? '',
      lastName: apiProfileData.lastName ?? prev.lastName ?? '',
      email: apiProfileData.email ?? prev.email ?? '',
      phone: apiProfileData.phone ?? prev.phone ?? '',
      address: apiProfileData.streetAddress ?? prev.address ?? '',
      city: apiProfileData.city ?? prev.city ?? '',
      state: apiProfileData.state ?? prev.state ?? '',
      zipCode: apiProfileData.zipCode ?? prev.zipCode ?? '',
      bio: apiProfileData.businessDesc ?? prev.bio ?? '',
      businessName: apiProfileData.businessName ?? prev.businessName ?? '',
      serviceTypeId: apiProfileData.serviceTypeId ?? prev.serviceTypeId ?? '',
      licenseNumber: apiProfileData.licenseNumber ?? prev.licenseNumber ?? ''
    }));
  }, [apiProfileData]);

  // Load the service-types catalog once — populates the Business Details dropdown
  // for providers and the Request-Quote category dropdown for everyone.
  useEffect(() => {
    if (!serviceTypes || serviceTypes.length === 0) {
      dispatch(fetchServiceTypesStart());
    }
  }, [serviceTypes, dispatch]);

  // React to update result
  useEffect(() => {
    if (updateProfileSuccess) {
      toast.success('Profile updated');
      setIsEditing(false);
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

  // Save to localStorage whenever data changes
  useEffect(() => {
    notificationSettingsStorage.set(userId, notificationSettings);
  }, [notificationSettings, userId]);

  useEffect(() => {
    profileDataStorage.set(userId, profileData);
  }, [profileData, userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    profileDataStorage.set(userId, profileData);

    if (!currentUser?.id) {
      setIsEditing(false);
      return;
    }

    const payload = {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      phone: profileData.phone,
      streetAddress: profileData.address,
      city: profileData.city,
      state: profileData.state,
      zipCode: profileData.zipCode,
      businessDesc: profileData.bio
    };

    dispatch(updateProfileStart({ id: currentUser.id, payload }));
  };

  // Save only the business/company fields — keeps personal info untouched.
  const handleSaveBusiness = () => {
    if (!currentUser?.id) {
      setIsEditingBusiness(false);
      return;
    }
    dispatch(updateProfileStart({
      id: currentUser.id,
      payload: {
        businessName: profileData.businessName,
        // serviceTypeId is accepted; controller resolves it via resolveServiceTypeId
        serviceTypeId: profileData.serviceTypeId || null,
        businessDesc: profileData.bio,
        licenseNumber: profileData.licenseNumber.trim() || null
      }
    }));
    setIsEditingBusiness(false);
  };

  const handleQuoteSubmit = (formData) => {
    if (!currentUser?.id) {
      toast.error('Please sign in to request a quote.');
      return;
    }
    const fd = new FormData();
    fd.append('userId', currentUser.id);
    fd.append('name', formData.name || '');
    fd.append('email', formData.email || '');
    fd.append('phone', formData.phone || '');
    fd.append('propertyType', formData.propertyType || '');
    fd.append('category', formData.category || '');
    fd.append('description', formData.description || '');
    if (formData.budgetMin) fd.append('budgetMin', formData.budgetMin);
    if (formData.budgetMax) fd.append('budgetMax', formData.budgetMax);
    fd.append('location', formData.location || '');
    (formData.photos || []).forEach((photo) => fd.append('photos', photo));
    dispatch(createQuoteStart(fd));
  };

  useEffect(() => {
    if (createQuoteSuccess) {
      toast.success('Quote request submitted!');
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

  // ── Job lifecycle: provider quotes, customer accepts, completion, review ──
  const STATUS_LABELS = {
    pending: 'Pending',
    responded: 'Quoted',
    accepted: 'In Progress',
    closed: 'Completed',
    declined: 'Declined'
  };
  const statusLabel = (s) => STATUS_LABELS[s] || s;

  const refreshLists = () => {
    if (!currentUser?.id) return;
    dispatch(fetchQuotesStart({ userId: currentUser.id }));
    if (isBusinessRole) dispatch(fetchIncomingQuotesStart({ providerId: currentUser.id }));
  };

  const refreshShowRequests = () => {
    if (!currentUser?.id) return;
    if (currentUser.role === 'realtor') {
      dispatch(fetchShowRequestsStart({}));
    } else {
      dispatch(fetchShowRequestsStart({ userId: currentUser.id }));
    }
  };

  // Realtor claims an unassigned showing.
  const handleClaimShowing = (req) => {
    if (!currentUser?.id) return;
    dispatch(claimShowRequestStart({ id: req.id, agentId: currentUser.id }));
  };

  // Assigned realtor marks the showing complete.
  const handleCompleteShowing = (req) => {
    if (!currentUser?.id) return;
    dispatch(completeShowRequestStart({ id: req.id, agentId: currentUser.id }));
  };

  useEffect(() => {
    if (claimShowRequestSuccess) {
      toast.success('Showing claimed — the customer has been notified.');
      dispatch(resetClaimShowRequestFlag());
      refreshShowRequests();
    }
  }, [claimShowRequestSuccess, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (claimShowRequestError) {
      toast.error(typeof claimShowRequestError === 'string' ? claimShowRequestError : 'Failed to claim showing');
      dispatch(resetClaimShowRequestFlag());
    }
  }, [claimShowRequestError, dispatch]);

  useEffect(() => {
    if (completeShowRequestSuccess) {
      toast.success('Showing marked complete.');
      dispatch(resetCompleteShowRequestFlag());
      refreshShowRequests();
    }
  }, [completeShowRequestSuccess, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (completeShowRequestError) {
      toast.error(typeof completeShowRequestError === 'string' ? completeShowRequestError : 'Failed to complete showing');
      dispatch(resetCompleteShowRequestFlag());
    }
  }, [completeShowRequestError, dispatch]);

  // Status pill colour + label for show-my-property records.
  const SHOW_STATUS = {
    pending:   { label: 'Open',       cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
    scheduled: { label: 'Scheduled',  cls: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
    completed: { label: 'Completed',  cls: 'bg-green-500/20 text-green-300 border-green-500/30'   },
    cancelled: { label: 'Cancelled',  cls: 'bg-red-500/20 text-red-300 border-red-500/30'         }
  };

  const handleSendQuote = ({ amount, message }) => {
    if (!respondTarget || !currentUser?.id) return;
    dispatch(addQuoteResponseStart({
      quoteId: respondTarget.id,
      payload: { providerId: currentUser.id, amount: amount || null, message }
    }));
  };

  const handleAcceptResponse = (bid) => {
    if (bid) dispatch(updateQuoteResponseStart({ id: bid.id, payload: { status: 'accepted' } }));
  };

  const handleDeclineResponse = (bid) => {
    if (bid) dispatch(updateQuoteResponseStart({ id: bid.id, payload: { status: 'declined' } }));
  };

  const handleMarkDone = (request) => {
    dispatch(updateQuoteStart({ id: request.id, payload: { providerCompleted: true } }));
  };

  const handleConfirmCompletion = (request) => {
    dispatch(updateQuoteStart({ id: request.id, payload: { status: 'closed' } }));
  };

  const handleSubmitReview = ({ rating, title, comment }) => {
    if (!reviewTarget || !currentUser?.id) return;
    dispatch(createReviewStart({
      providerId: reviewTarget.providerId,
      userId: currentUser.id,
      rating,
      title,
      comment
    }));
  };

  const handleAddToPortfolio = (request) => {
    localStorage.setItem('portfolioPrefill', JSON.stringify({
      title: `${request.category || 'Project'}${request.location ? ` — ${request.location}` : ''}`,
      category: request.category || '',
      description: request.description || ''
    }));
    navigate('create-project');
  };

  useEffect(() => {
    if (quoteResponseSuccess) {
      toast.success('Quote sent to the customer.');
      setRespondTarget(null);
      dispatch(resetQuoteResponseFlag());
      refreshLists();
    }
  }, [quoteResponseSuccess, dispatch]);

  useEffect(() => {
    if (quoteResponseError) {
      toast.error(typeof quoteResponseError === 'string' ? quoteResponseError : 'Failed to send quote');
      dispatch(resetQuoteResponseFlag());
    }
  }, [quoteResponseError, dispatch]);

  useEffect(() => {
    if (updateQuoteSuccess) {
      toast.success('Job updated.');
      dispatch(resetUpdateQuoteFlag());
      refreshLists();
    }
  }, [updateQuoteSuccess, dispatch]);

  useEffect(() => {
    if (updateQuoteError) {
      toast.error(typeof updateQuoteError === 'string' ? updateQuoteError : 'Failed to update job');
      dispatch(resetUpdateQuoteFlag());
    }
  }, [updateQuoteError, dispatch]);

  useEffect(() => {
    if (updateQuoteResponseSuccess) {
      toast.success('Updated.');
      dispatch(resetUpdateQuoteResponseFlag());
      refreshLists();
    }
  }, [updateQuoteResponseSuccess, dispatch]);

  useEffect(() => {
    if (updateQuoteResponseError) {
      toast.error(typeof updateQuoteResponseError === 'string' ? updateQuoteResponseError : 'Action failed');
      dispatch(resetUpdateQuoteResponseFlag());
    }
  }, [updateQuoteResponseError, dispatch]);

  useEffect(() => {
    if (createReviewSuccess) {
      toast.success('Review submitted. Thank you!');
      setReviewTarget(null);
      dispatch(resetCreateReviewFlag());
      refreshLists();
    }
  }, [createReviewSuccess, dispatch]);

  useEffect(() => {
    if (createReviewError) {
      toast.error(typeof createReviewError === 'string' ? createReviewError : 'Failed to submit review');
      dispatch(resetCreateReviewFlag());
    }
  }, [createReviewError, dispatch]);

  // Provider-side action buttons for an incoming request. Decisions hinge on
  // *this* provider's own response, not the parent quote.status, because a
  // broadcast quote can be `responded`/`accepted` for another provider while
  // still pending for me.
  const renderProviderActions = (req) => {
    const resp = (req.responses || [])[0];
    const iResponded = !!resp;
    const myResponseAccepted = req.status === 'accepted' && iResponded;
    const myResponseDeclined = req.status === 'declined' && iResponded;

    if (!iResponded && (req.status === 'pending' || req.status === 'responded')) {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); setRespondTarget(req); }}
          className="px-4 py-2 rounded-lg bg-coral-orange text-black text-sm font-semibold hover:bg-coral-orange/90 transition-all duration-300">
          {req.isMeetingRequest ? 'Respond' : 'Send Quote'}
        </button>);
    }
    if (iResponded && (req.status === 'pending' || req.status === 'responded')) {
      return <span className="text-sm text-white drop-shadow-md">Quote sent{resp?.amount ? ` — $${resp.amount}` : ''} · awaiting customer</span>;
    }
    if (myResponseAccepted && !req.providerCompleted) {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); handleMarkDone(req); }}
          className="px-4 py-2 rounded-lg bg-sky-blue text-white text-sm font-semibold hover:bg-sky-blue/90 transition-all duration-300">
          Mark Work as Done
        </button>);
    }
    if (myResponseAccepted && req.providerCompleted) {
      return <span className="text-sm text-white drop-shadow-md">Marked done · awaiting customer confirmation</span>;
    }
    if (req.status === 'closed' && iResponded) {
      return (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-green-300 font-medium">Completed</span>
          <button
            onClick={(e) => { e.stopPropagation(); handleAddToPortfolio(req); }}
            className="px-4 py-2 rounded-lg bg-coral-orange text-black text-sm font-semibold hover:bg-coral-orange/90 transition-all duration-300">
            Add to Portfolio
          </button>
        </div>);
    }
    if (myResponseDeclined) {
      return <span className="text-sm text-red-300 drop-shadow-md">Declined by customer</span>;
    }
    return null;
  };

  // Customer-side action buttons for one of their quote requests, by status.
  const renderCustomerQuoteActions = (request) => {
    const bids = request.bids || [];
    if (request.status === 'responded') {
      const openBids = bids.filter((b) => !b.status || b.status === 'submitted' || b.status === 'pending');
      return (
        <div className="space-y-3">
          {openBids.length === 0 &&
            <p className="text-sm text-white/80 drop-shadow-md">Awaiting a quote from the provider…</p>
          }
          {openBids.map((bid) => {
            const providerName = bid.provider?.businessName
              || `${bid.provider?.firstName || ''} ${bid.provider?.lastName || ''}`.trim()
              || 'Provider';
            return (
              <div key={bid.id} className="p-3 rounded-lg bg-white/10 border border-white/20">
                <p className="text-sm text-white font-medium drop-shadow-md">
                  {providerName}'s quote{bid.amount ? `: $${bid.amount}` : ''}
                </p>
                {bid.message &&
                  <p className="text-xs text-white mt-1 drop-shadow-md">{bid.message}</p>
                }
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleAcceptResponse(bid)}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-600/90 transition-all duration-300">
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineResponse(bid)}
                    className="px-4 py-2 rounded-lg border border-white/30 text-white text-sm font-semibold hover:bg-white/20 transition-all duration-300">
                    Decline
                  </button>
                </div>
              </div>);
          })}
        </div>);
    }
    if (request.status === 'accepted' && !request.providerCompleted) {
      return <span className="text-sm text-white drop-shadow-md">Work in progress…</span>;
    }
    if (request.status === 'accepted' && request.providerCompleted) {
      return (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-white drop-shadow-md">The provider marked the work done.</span>
          <button
            onClick={() => handleConfirmCompletion(request)}
            className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-600/90 transition-all duration-300">
            Confirm Completion
          </button>
        </div>);
    }
    if (request.status === 'closed') {
      return (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-green-300 font-medium">Completed</span>
          <button
            onClick={() => setReviewTarget(request)}
            className="px-4 py-2 rounded-lg bg-coral-orange text-black text-sm font-semibold hover:bg-coral-orange/90 transition-all duration-300">
            Leave a Review
          </button>
        </div>);
    }
    if (request.status === 'declined') {
      return <span className="text-sm text-red-300 drop-shadow-md">You declined this quote.</span>;
    }
    return <span className="text-sm text-white drop-shadow-md">Awaiting a quote from the provider…</span>;
  };

  // Projects come from the API (/projects?userId=).
  const PROJECT_STATUS_LABEL = {
    open: 'Quoted', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled'
  };
  const recentProjects = (apiProjects || []).map((p) => ({
    id: p.id,
    title: p.title,
    provider: p.category || 'Project',
    status: PROJECT_STATUS_LABEL[p.status] || 'Quoted',
    date: p.createdAt,
    cost: p.budgetMin
      ? `$${p.budgetMin}${p.budgetMax ? ` - $${p.budgetMax}` : ''}`
      : 'Not set',
    rating: null
  }));


  // Favorite providers come from the API (/favorites?userId=).
  const favoriteProviders = (apiFavorites || []).map((f) => {
    const prov = f.provider || {};
    return {
      id: f.id,
      providerId: f.providerId,
      name: prov.businessName || `${prov.firstName || ''} ${prov.lastName || ''}`.trim() || 'Provider',
      category: prov.serviceType?.name || (prov.role === 'realtor' ? 'Realtor' : 'Service Provider'),
      rating: Number(prov.averageRating) || 0,
      reviews: prov.reviewCount || 0,
      lastUsed: f.createdAt
    };
  });


  // Quote requests come from the API (/quotes?userId=).
  const quoteRequests = (apiQuotes || []).map((q) => ({
    id: q.id,
    category: q.category,
    description: q.description,
    location: q.location,
    budgetMin: q.budgetMin,
    budgetMax: q.budgetMax,
    status: q.status,
    providerId: q.providerId,
    providerCompleted: q.providerCompleted,
    providerName: q.provider
      ? (q.provider.businessName || `${q.provider.firstName || ''} ${q.provider.lastName || ''}`.trim())
      : '',
    photos: q.photos || [],
    bids: q.responses || []
  }));

  // "Saved Quotes" = the user's quote requests that already have provider responses.
  const savedQuotes = (apiQuotes || [])
    .filter((q) => Array.isArray(q.responses) && q.responses.length > 0)
    .map((q) => {
      const resp = q.responses[0];
      const prov = resp.provider || {};
      return {
        id: q.id,
        service: q.category,
        provider: prov.businessName || `${prov.firstName || ''} ${prov.lastName || ''}`.trim() || 'Provider',
        amount: resp.amount ? `$${resp.amount}` : 'Quoted',
        validUntil: q.createdAt,
        status: q.status === 'accepted' ? 'Accepted' : 'Pending'
      };
    });


  if (!currentUser) {
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
        
        <div className="container mx-auto max-w-2xl text-center">
          <div
            className="rounded-2xl p-12 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            
            <h1 className="text-3xl text-white drop-shadow-lg mb-6">Please Login</h1>
            <p className="text-white drop-shadow-md mb-8">You need to be logged in to view your profile.</p>
            <button
              onClick={() => navigate('login')}
              className="px-6 py-3 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg">

              Login
            </button>
          </div>
        </div>
      </div>);

  }

  const renderOverview = () =>
  <div className="space-y-8 animate-fadeIn">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
        onClick={() => setActiveTab('projects')}
        className="rounded-2xl shadow-lg p-6 text-center relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        
          <div className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{recentProjects.length}</div>
          <div className="text-white drop-shadow-md">Total Projects</div>
        </div>
        <div
        onClick={() => setActiveTab('favorites')}
        className="rounded-2xl shadow-lg p-6 text-center relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        
          <div className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{favoriteProviders.length}</div>
          <div className="text-white drop-shadow-md">Favorite Providers</div>
        </div>
        <div
        onClick={() => setActiveTab('quotes')}
        className="rounded-2xl shadow-lg p-6 text-center relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        
          <div className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{savedQuotes.length}</div>
          <div className="text-white drop-shadow-md">Saved Quotes</div>
        </div>
      </div>

      {/* Create Open House Button */}
      <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}>
      
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
          className="px-6 py-3 bg-coral-orange text-black rounded-xl hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 flex items-center space-x-2 font-semibold shadow-lg">
          
            <Plus className="h-5 w-5" />
            <span>Create Open House</span>
          </button>
        </div>
      </div>
    </div>;


  const renderProjects = () =>
  <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h3 className="text-xl text-white drop-shadow-lg">My Projects</h3>
        <button
        onClick={() => navigate('create-project')}
        className="px-4 py-2 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg">
        
          Start New Project
        </button>
      </div>

      {recentProjects.map((project) =>
    <div
      key={project.id}
      className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}>
      
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-blue/10 via-transparent to-coral-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg text-white mb-1 drop-shadow-md group-hover:text-white transition-colors duration-300">{project.title}</h4>
                <p className="text-white drop-shadow-md group-hover:text-white transition-colors duration-300">{project.provider}</p>
                <div className="flex items-center space-x-4 text-sm text-white mt-2">
                  <span className="flex items-center drop-shadow-md group-hover:text-white transition-colors duration-300">
                    <Calendar className="h-4 w-4 mr-1 text-white" />
                    {new Date(project.date).toLocaleDateString()}
                  </span>
                  <span className="drop-shadow-md group-hover:text-white transition-colors duration-300">{project.cost}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${project.status === 'Completed' ? 'bg-green-500/20 text-white border border-green-500/30' :
            project.status === 'In Progress' ? 'bg-blue-500/20 text-white border border-blue-500/30' :
            'bg-orange-500/20 text-white border border-orange-500/30'}`
            }>
                  {project.status}
                </span>
                {project.rating &&
            <div className="flex items-center justify-end mt-2">
                    {[...Array(project.rating)].map((_, i) =>
              <Star key={i} className="h-4 w-4 text-coral-orange fill-coral-orange" />
              )}
                  </div>
            }
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="px-3 py-1 bg-sky-blue text-white rounded-xl text-sm hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 font-medium">
                View Details
              </button>
              {project.status === 'Completed' && !project.rating &&
          <button className="px-3 py-1 bg-coral-orange text-white rounded-xl text-sm hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 font-medium">
                  Leave Review
                </button>
          }
              <button className="px-3 py-1 border border-white/30 text-white rounded-xl text-sm hover:bg-white/20 hover:border-white/50 transition-all duration-300 font-medium">
                <MessageSquare className="h-3 w-3 inline mr-1" />
                Message
              </button>
            </div>
          </div>

          {/* Shine effect */}
          <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
        </div>
    )}
    </div>;


  const renderFavorites = () =>
  <div className="space-y-6 animate-fadeIn">
      <h3 className="text-xl text-white drop-shadow-lg">Favorite Providers</h3>
      {favoriteProviders.map((provider) =>
    <div
      key={provider.id}
      className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}>
      
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-blue/10 via-transparent to-coral-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg text-white mb-1 drop-shadow-md group-hover:text-white transition-colors duration-300">{provider.name}</h4>
                <p className="text-white mb-2 drop-shadow-md group-hover:text-white transition-colors duration-300">{provider.category}</p>
                <div className="flex items-center space-x-4 text-sm text-white">
                  <div className="flex items-center space-x-1 drop-shadow-md group-hover:text-white transition-colors duration-300">
                    <Star className="h-4 w-4 text-coral-orange fill-coral-orange" />
                    <span>{provider.rating} ({provider.reviews} reviews)</span>
                  </div>
                  <span className="drop-shadow-md group-hover:text-white transition-colors duration-300">Last used: {new Date(provider.lastUsed).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-sky-blue text-white rounded-xl text-sm hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 font-medium">
                  Contact
                </button>
                <button
                  onClick={() => dispatch(removeFavoriteStart(provider.id))}
                  className="px-3 py-1 border border-white/30 text-white rounded-xl text-sm hover:bg-white/20 hover:border-white/50 transition-all duration-300 font-medium">
                  Remove
                </button>
              </div>
            </div>
          </div>

          {/* Shine effect */}
          <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
        </div>
    )}
    </div>;


  const renderQuotes = () =>
  <div className="space-y-8 animate-fadeIn">
      {/* Provider-side: quoted / completed client requests */}
      {isBusinessRole && sentIncomingRequests.length > 0 &&
        <div>
          <h3 className="text-xl text-white drop-shadow-lg mb-1">Sent Quotes & Completed Jobs</h3>
          <p className="text-white/80 drop-shadow-md text-sm mb-6">
            Client requests you've already quoted or completed.
          </p>
          <div className="space-y-4">
            {sentIncomingRequests.map((req) => renderIncomingRequestCard(req))}
          </div>
        </div>
      }

      {/* Quote Requests */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl text-white drop-shadow-lg">My Quote Requests</h3>
          <button
          onClick={() => setShowQuoteModal(true)}
          className="px-4 py-2 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 flex items-center space-x-2 font-semibold">
          
            <Upload className="h-4 w-4" />
            <span>Request New Quote</span>
          </button>
        </div>
        {quoteRequests.length === 0 ?
      <div
        className="rounded-2xl p-8 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        
            <p className="text-white drop-shadow-md mb-4">No quote requests yet</p>
            <button
          onClick={() => setShowQuoteModal(true)}
          className="px-6 py-3 bg-coral-orange text-black rounded-xl hover:bg-coral-orange/90 transition-all duration-300 font-semibold">
          
              Create Your First Quote Request
            </button>
          </div> :

      <div className="space-y-4">
            {quoteRequests.map((request) =>
        <div
          key={request.id}
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-white font-medium drop-shadow-md mb-2">{request.category}</h4>
                    <p className="text-white text-sm drop-shadow-md">{request.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-white drop-shadow-md">
                      <span><MapPin className="h-3 w-3 inline mr-1" />{request.location}</span>
                      <span>Budget: ${request.budgetMin}{request.budgetMax ? ` - $${request.budgetMax}` : '+'}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
            request.status === 'closed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
            request.status === 'declined' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
            'bg-white/20 text-white border border-white/30'}`
            }>
                    {statusLabel(request.status)}
                  </span>
                </div>
                {request.photos && request.photos.length > 0 &&
          <div className="flex space-x-2 mb-4">
                    {request.photos.map((photo, idx) =>
            <img
              key={idx}
              src={photo}
              alt={`Photo ${idx + 1}`}
              className="w-16 h-16 object-cover rounded-md" />

            )}
                  </div>
          }
                <div className="pt-3 border-t border-white/20">
                  {renderCustomerQuoteActions(request)}
                </div>
              </div>
        )}
          </div>
      }
      </div>

      {/* Saved Quotes from Providers */}
      <div>
        <h3 className="text-xl text-white drop-shadow-lg mb-6">Saved Quotes</h3>
        <div className="space-y-4">
          {savedQuotes.map((quote) =>
        <div
          key={quote.id}
          className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-blue/10 via-transparent to-coral-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg text-white mb-1 drop-shadow-md group-hover:text-white transition-colors duration-300">{quote.service}</h4>
                    <p className="text-white mb-2 drop-shadow-md group-hover:text-white transition-colors duration-300">{quote.provider}</p>
                    <div className="flex items-center space-x-4 text-sm text-white">
                      <span className="drop-shadow-md group-hover:text-white transition-colors duration-300">Valid until: {new Date(quote.validUntil).toLocaleDateString()}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${quote.status === 'Accepted' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                  'bg-orange-500/20 text-orange-300 border border-orange-500/30'}`
                  }>
                        {quote.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white drop-shadow-lg group-hover:text-white transition-colors duration-300">{quote.amount}</div>
                    <div className="flex space-x-2 mt-2">
                      {quote.status === 'Pending' &&
                  <>
                          <button className="px-3 py-1 bg-green-600 text-white rounded-xl text-sm hover:bg-green-600/90 hover:scale-105 transition-all duration-300 font-medium">
                            Accept
                          </button>
                          <button className="px-3 py-1 bg-coral-orange text-black rounded-xl text-sm hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 font-medium">
                            Decline
                          </button>
                        </>
                  }
                      <button className="px-3 py-1 border border-white/30 text-white rounded-xl text-sm hover:bg-white/20 hover:border-white/50 transition-all duration-300 font-medium">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
            </div>
        )}
        </div>
      </div>
    </div>;


  // Incoming requests directed at this provider/realtor (/quotes?providerId=).
  const incomingRequests = (incomingQuotes || []).map((q) => ({
    id: q.id,
    name: q.name ||
    (q.requester ? `${q.requester.firstName || ''} ${q.requester.lastName || ''}`.trim() : '') ||
    'Client',
    email: q.email || q.requester?.email || '',
    phone: q.phone || q.requester?.phone || '',
    propertyType: q.propertyType || '',
    category: q.category || '',
    description: q.description || '',
    budgetMin: q.budgetMin,
    budgetMax: q.budgetMax,
    location: q.location || '',
    status: q.status || 'pending',
    providerCompleted: q.providerCompleted,
    responses: q.responses || [],
    isMeetingRequest: q.isMeetingRequest,
    photos: Array.isArray(q.photos) ? q.photos : [],
    createdAt: q.createdAt
  }));

  const glassPanelStyle = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.2)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
  };

  // Split by *my* participation, not the parent quote.status: a broadcast
  // quote that another provider has already quoted still belongs in my
  // Client Requests until I respond too.
  const pendingIncomingRequests = incomingRequests.filter((r) => (r.responses || []).length === 0);
  const sentIncomingRequests = incomingRequests.filter((r) => (r.responses || []).length > 0);

  const renderIncomingRequestCard = (req) => {
    // The badge must reflect *my* state: if I haven't responded, the quote
    // is still pending for me even if a peer provider has quoted it.
    const iResponded = (req.responses || []).length > 0;
    const effectiveStatus = iResponded ? req.status : 'pending';
    return (
    <div
      key={req.id}
      onClick={() => setDetailRequest(req)}
      className="rounded-2xl p-6 relative overflow-hidden cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
      style={glassPanelStyle}>
      <div className="flex justify-between items-start mb-4 gap-4">
        <div>
          <h4 className="text-lg text-white font-medium drop-shadow-md">{req.name}</h4>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-white/90 drop-shadow-md">
            {req.email &&
              <span className="flex items-center"><Mail className="h-3 w-3 mr-1" />{req.email}</span>
            }
            {req.phone &&
              <span className="flex items-center"><Phone className="h-3 w-3 mr-1" />{req.phone}</span>
            }
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap ${
          effectiveStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
          effectiveStatus === 'accepted' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
          effectiveStatus === 'declined' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
          'bg-white/20 text-white border border-white/30'}`
        }>
          {statusLabel(effectiveStatus)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-4 text-sm text-white drop-shadow-md">
        {req.category &&
          <div><span className="text-white/70">Service:</span> {req.category}</div>
        }
        {req.propertyType &&
          <div><span className="text-white/70">Property:</span> {req.propertyType}</div>
        }
        {req.location &&
          <div className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{req.location}</div>
        }
        {(req.budgetMin || req.budgetMax) &&
          <div>
            <span className="text-white/70">Budget:</span> ${req.budgetMin}{req.budgetMax ? ` - $${req.budgetMax}` : '+'}
          </div>
        }
      </div>

      {req.description &&
        <p className="text-sm text-white/90 drop-shadow-md mb-4 leading-relaxed">{req.description}</p>
      }

      {req.photos.length > 0 &&
        <div className="flex flex-wrap gap-2 mb-4">
          {req.photos.map((photo, idx) =>
            <img
              key={idx}
              src={photo}
              alt={`Attachment ${idx + 1}`}
              className="w-16 h-16 object-cover rounded-md border border-white/20" />
          )}
        </div>
      }

      <div className="mb-4" onClick={(e) => e.stopPropagation()}>
        {renderProviderActions(req)}
      </div>

      <div className="flex items-center justify-between text-xs text-white/70 drop-shadow-md pt-3 border-t border-white/20">
        <span className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {req.createdAt ? new Date(req.createdAt).toLocaleString() : ''}
        </span>
        {req.isMeetingRequest &&
          <span className="px-2 py-0.5 rounded-full bg-sky-blue/20 border border-sky-blue/30 text-white">
            Meeting Request
          </span>
        }
      </div>
    </div>);
  };

  const renderIncomingRequests = () =>
  <div className="space-y-6 animate-fadeIn">
      <div>
        <h3 className="text-xl text-white drop-shadow-lg mb-1">
          {currentUser?.role === 'realtor' ? 'Meeting Requests' : 'Client Requests'}
        </h3>
        <p className="text-white/80 drop-shadow-md text-sm">
          {currentUser?.role === 'realtor' ?
        'Meeting requests submitted to you by users' :
        'New quote requests waiting for your response'}
        </p>
      </div>

      {incomingQuotesLoading && pendingIncomingRequests.length === 0 &&
    <div className="rounded-2xl p-8 text-center relative overflow-hidden" style={glassPanelStyle}>
          <p className="text-white drop-shadow-md">Loading requests…</p>
        </div>
    }

      {!incomingQuotesLoading && pendingIncomingRequests.length === 0 &&
    <div className="rounded-2xl p-8 text-center relative overflow-hidden" style={glassPanelStyle}>
          <p className="text-white drop-shadow-md">No new requests</p>
          <p className="text-white/70 drop-shadow-md text-sm mt-1">
            New requests submitted by users will appear here. Already-quoted and completed jobs live in the Quotes tab.
          </p>
        </div>
    }

      {pendingIncomingRequests.length > 0 &&
    <div className="space-y-4">
          {pendingIncomingRequests.map((req) => renderIncomingRequestCard(req))}
        </div>
    }
    </div>;

  // ─── Show-my-property tab ──────────────────────────────────────────────
  // Customer view: their own listed properties + status + assigned agent.
  // Realtor view: split into "Available to claim" (status=pending,
  // unassigned) and "My Showings" (assignedAgentId === me).
  const renderShowings = () => {
    const list = Array.isArray(showRequests) ? showRequests : [];
    const isRealtor = currentUser?.role === 'realtor';
    const available = list.filter((r) => r.status === 'pending' && !r.assignedAgentId);
    const mine = list.filter((r) => r.assignedAgentId === currentUser?.id);
    const customerList = list.filter((r) => r.userId === currentUser?.id);

    const renderCard = (req, mode) => {
      const cfg = SHOW_STATUS[req.status] || SHOW_STATUS.pending;
      const isAssignedToMe = req.assignedAgentId === currentUser?.id;
      return (
        <div key={req.id} className="rounded-2xl p-5 relative overflow-hidden flex flex-col h-full" style={glassPanelStyle}>
          <div className="flex justify-between items-start gap-4 mb-3">
            <div className="min-w-0">
              <h4 className="text-lg text-white font-semibold drop-shadow-md truncate">
                {req.title || req.address}
              </h4>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white mt-1">
                <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" />{req.address}</span>
                {req.payoutPerHour &&
                  <span className="flex items-center"><DollarSign className="h-3 w-3 mr-1" />${Number(req.payoutPerHour).toFixed(2)}/hr</span>
                }
                {req.preferredDate &&
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(req.preferredDate).toLocaleDateString()}
                    {req.preferredDateTo && ` → ${new Date(req.preferredDateTo).toLocaleDateString()}`}
                  </span>
                }
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize border whitespace-nowrap ${cfg.cls}`}>
              {cfg.label}
            </span>
          </div>

          {req.description &&
            <p className="text-sm text-white mb-3 leading-relaxed">{req.description}</p>
          }

          {Array.isArray(req.photos) && req.photos.length > 0 &&
            <div className="flex flex-wrap gap-2 mb-3">
              {req.photos.slice(0, 4).map((p, i) =>
                <img key={i} src={p} alt={`Photo ${i + 1}`}
                  className="w-16 h-16 object-cover rounded-md border border-white/20" />
              )}
            </div>
          }

          {/* Customer-side: who is the agent? */}
          {!isRealtor && req.agent &&
            <div className="text-sm text-white mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Assigned to <span className="font-semibold">{req.agent.businessName || `${req.agent.firstName || ''} ${req.agent.lastName || ''}`.trim()}</span></span>
            </div>
          }
          {!isRealtor && req.status === 'pending' && !req.agent &&
            <p className="text-sm text-white/80 mb-3">No realtor has claimed this yet — they will be notified.</p>
          }

          {/* Realtor-side: action buttons */}
          {isRealtor && mode === 'available' && req.user &&
            <p className="text-xs text-white/80 mb-3">Posted by {req.user.firstName} {req.user.lastName}</p>
          }
          {isRealtor &&
            <div className="flex gap-2 pt-3 border-t border-white/20 mt-auto">
              {mode === 'available' &&
                <button
                  onClick={() => handleClaimShowing(req)}
                  disabled={claimShowRequestLoading}
                  className="px-4 py-2 rounded-lg bg-coral-orange text-black text-sm font-semibold hover:bg-coral-orange/90 transition-all duration-300 disabled:opacity-60">
                  Claim Showing
                </button>
              }
              {mode === 'mine' && req.status === 'scheduled' && isAssignedToMe &&
                <button
                  onClick={() => handleCompleteShowing(req)}
                  disabled={completeShowRequestLoading}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-600/90 transition-all duration-300 disabled:opacity-60 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Completed
                </button>
              }
              {mode === 'mine' && req.status === 'completed' &&
                <span className="text-sm text-green-300 font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Completed
                </span>
              }
            </div>
          }
        </div>);
    };

    return (
      <div className="space-y-8 animate-fadeIn">
        <div>
          <h3 className="text-xl text-white drop-shadow-lg mb-1">
            {isRealtor ? 'Opportunity' : 'My Property Showings'}
          </h3>
          <p className="text-white drop-shadow-md text-sm">
            {isRealtor
              ? 'Claim a showing posted by a customer, then mark it complete after the visit.'
              : 'Property listings you’ve posted for a realtor to host.'}
          </p>
        </div>

        {showRequestsLoading && list.length === 0 &&
          <div className="rounded-2xl p-8 text-center" style={glassPanelStyle}>
            <p className="text-white drop-shadow-md">Loading showings…</p>
          </div>
        }

        {isRealtor ? (
          <>
            {/* Available pool */}
            <div>
              <h4 className="text-lg text-white font-semibold mb-3 flex items-center gap-2">
                <Building className="h-5 w-5" /> Available to Claim
                <span className="text-sm text-white/80">({available.length})</span>
              </h4>
              {available.length === 0 ? (
                <div className="rounded-2xl p-6 text-center" style={glassPanelStyle}>
                  <p className="text-white drop-shadow-md">No open showings right now. Check back soon.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {available.map((req) => renderCard(req, 'available'))}
                </div>
              )}
            </div>

            {/* Mine */}
            <div>
              <h4 className="text-lg text-white font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" /> My Assigned Showings
                <span className="text-sm text-white/80">({mine.length})</span>
              </h4>
              {mine.length === 0 ? (
                <div className="rounded-2xl p-6 text-center" style={glassPanelStyle}>
                  <p className="text-white drop-shadow-md">You haven’t claimed any showings yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {mine.map((req) => renderCard(req, 'mine'))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {customerList.length === 0 ? (
              <div className="rounded-2xl p-8 text-center" style={glassPanelStyle}>
                <p className="text-white drop-shadow-md mb-4">You haven’t posted any properties for showing yet.</p>
                <button onClick={() => navigate('show-my-property')}
                  className="px-6 py-3 bg-coral-orange text-black rounded-xl hover:bg-coral-orange/90 transition-all duration-300 font-semibold">
                  Post a Property for Showing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {customerList.map((req) => renderCard(req, 'customer'))}
              </div>
            )}
          </>
        )}
      </div>);
  };


  // Admins get a separate screen entirely. The check happens AFTER all the
  // hooks above are declared so the hook order stays consistent across
  // renders (Rules of Hooks).
  if (currentUser?.role === 'admin') {
    return <AdminDashboard navigate={navigate} currentUser={currentUser} setCurrentUser={setCurrentUser} />;
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

      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-white drop-shadow-lg mb-2">My Profile</h1>
          <p className="text-white drop-shadow-md">Manage your account and track your projects</p>
        </div>

        {/* Navigation Tabs */}
        <div
          className="rounded-2xl shadow-lg mb-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          
          <div className="flex border-b border-white/30">
            {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'projects', label: 'My Projects', icon: Home },
            { id: 'favorites', label: 'Favorites', icon: Star },
            { id: 'quotes', label: 'Quotes', icon: FileText },
            ...(isBusinessRole ?
            [{ id: 'requests', label: currentUser?.role === 'realtor' ? 'Meeting Requests' : 'Client Requests', icon: Calendar }] :
            []),
            // Customer: "My Showings". Realtor: "Showing Jobs" (browse + claim).
            ...(currentUser?.role === 'realtor'
              ? [{ id: 'showings', label: 'Opportunity', icon: Building }]
              : [{ id: 'showings', label: 'My Showings', icon: Building }]),
            { id: 'settings', label: 'Settings', icon: Edit3 }].
            map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 px-4 py-4 text-center transition-all duration-150 bg-transparent ${activeTab === tab.id ?
                  'text-white border-b-2 border-coral-orange' :
                  'text-white hover:bg-white/20'}`
                  }>
                  
                  {activeTab === tab.id &&
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-coral-orange"></div>
                  }
                  <IconComponent className={`h-5 w-5 mx-auto mb-1 ${activeTab === tab.id ? 'text-coral-orange' : 'text-white'}`} />
                  <span className={`text-sm font-medium ${activeTab === tab.id ? 'text-white font-semibold' : ''}`}>{tab.label}</span>
                </button>);

            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'projects' && renderProjects()}
        {activeTab === 'favorites' && renderFavorites()}
        {activeTab === 'quotes' && renderQuotes()}
        {activeTab === 'requests' && renderIncomingRequests()}
        {activeTab === 'showings' && renderShowings()}
        {activeTab === 'settings' &&
        <div className="space-y-8 animate-fadeIn">
            {/* Profile Information */}
            <div
            className="rounded-2xl shadow-lg p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl text-white drop-shadow-lg">Profile Information</h3>
                <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-6 py-3 bg-coral-orange text-black rounded-xl hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 flex items-center space-x-2 font-semibold shadow-lg">
                
                  <Edit3 className="h-5 w-5" />
                  <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Picture */}
                <div className="text-center">
                  <div className="relative inline-block">
                    {profileImage ?
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-32 w-32 rounded-full object-cover mx-auto border-4 border-white/30" /> :


                  <div className="h-32 w-32 rounded-full bg-white flex items-center justify-center text-white text-4xl font-bold mx-auto">
                        {profileData.firstName[0]}{profileData.lastName[0]}
                      </div>
                  }
                    {isEditing &&
                  <>
                        <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64 = reader.result;
                            setProfileImage(base64);
                            profileImageStorage.set(userId, base64);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="profile-image-upload" />
                    
                        <label
                      htmlFor="profile-image-upload"
                      className="absolute bottom-0 right-0 bg-sky-blue rounded-full p-2 text-white hover:bg-sky-blue/90 transition-all duration-300 cursor-pointer">
                      
                          <Camera className="h-4 w-4" />
                        </label>
                      </>
                  }
                  </div>
                  <h4 className="text-lg text-white mt-4 drop-shadow-md">{profileData.firstName} {profileData.lastName}</h4>
                  <p className="text-white drop-shadow-md">{roleLabel}</p>
                </div>

                {/* Contact Information */}
                <div>
                  <h5 className="text-white font-medium mb-4 drop-shadow-md">Contact Information</h5>
                  {isEditing ?
                <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                      className="px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60"
                      placeholder="First Name" />
                    
                        <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                      className="px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60"
                      placeholder="Last Name" />
                    
                      </div>
                      <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60"
                    placeholder="Email" />
                  
                      <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60"
                    placeholder="Phone" />
                  
                    </div> :

                <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-white" />
                        <span className="text-white drop-shadow-md">{profileData.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-white" />
                        <span className="text-white drop-shadow-md">{profileData.phone}</span>
                      </div>
                    </div>
                }
                </div>

                {/* Address Information */}
                <div>
                  <h5 className="text-white font-medium mb-4 drop-shadow-md">Address</h5>
                  {isEditing ?
                <div className="space-y-4">
                      <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60"
                    placeholder="Street Address" />
                  
                      <div className="grid grid-cols-2 gap-2">
                        <input
                      type="text"
                      name="city"
                      value={profileData.city}
                      onChange={handleInputChange}
                      className="px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60"
                      placeholder="City" />
                    
                        <input
                      type="text"
                      name="state"
                      value={profileData.state}
                      onChange={handleInputChange}
                      className="px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60"
                      placeholder="State" />
                    
                      </div>
                      <input
                    type="text"
                    name="zipCode"
                    value={profileData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60"
                    placeholder="ZIP Code" />
                  
                    </div> :

                <div className="flex items-start space-x-3">
                      <MapPin className="h-4 w-4 text-white mt-1" />
                      <div className="text-white drop-shadow-md">
                        <div>{profileData.address}</div>
                        <div>{profileData.city}, {profileData.state} {profileData.zipCode}</div>
                      </div>
                    </div>
                }
                </div>
              </div>

              {/* Bio — non-business users only. For service_providers / realtors the
                  same field is edited as "Business Description" in the Business Details
                  panel below (both write to the user.businessDesc column). */}
              {!isBusinessRole &&
                <div className="mt-8">
                  <h5 className="text-white font-medium mb-4 drop-shadow-md">About Me</h5>
                  {isEditing ?
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60"
                      placeholder="Tell us about yourself..." /> :
                    <p className="text-white leading-relaxed drop-shadow-md">{profileData.bio}</p>
                  }
                </div>
              }

              {isEditing &&
            <div className="mt-6 flex justify-end space-x-4">
                  <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border-2 border-white/30 text-white rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300">

                    Cancel
                  </button>
                  <button
                onClick={handleSave}
                className="px-4 py-2 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg">

                    Save Changes
                  </button>
                </div>
            }
            </div>

            {/* Business / Company Details — only for service providers and realtors. */}
            {isBusinessRole &&
              <div
                className="rounded-2xl shadow-lg p-8 relative overflow-hidden mt-8"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl text-white drop-shadow-lg">Business Details</h3>
                    <p className="text-white text-sm drop-shadow-md mt-1">
                      How your {currentUser?.role === 'realtor' ? 'agency' : 'business'} appears to customers
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditingBusiness(!isEditingBusiness)}
                    className="px-6 py-3 bg-coral-orange text-black rounded-xl hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 flex items-center space-x-2 font-semibold shadow-lg">
                    <Edit3 className="h-5 w-5" />
                    <span>{isEditingBusiness ? 'Cancel' : 'Edit Business'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Business Name */}
                  <div>
                    <label className="block text-white font-medium mb-2 drop-shadow-md text-sm">
                      {currentUser?.role === 'realtor' ? 'Agency Name' : 'Business Name'}
                    </label>
                    {isEditingBusiness ?
                      <input
                        type="text"
                        name="businessName"
                        value={profileData.businessName}
                        onChange={handleInputChange}
                        placeholder={currentUser?.role === 'realtor' ? 'e.g. Acme Realty' : 'e.g. Acme Plumbing LLC'}
                        className="w-full px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60" /> :
                      <p className="text-white drop-shadow-md flex items-center">
                        <Building className="h-4 w-4 mr-2 text-white/80" />
                        {profileData.businessName || <span className="text-white/60 italic">Not set</span>}
                      </p>
                    }
                  </div>

                  {/* Service Type */}
                  <div>
                    <label className="block text-white font-medium mb-2 drop-shadow-md text-sm">
                      {currentUser?.role === 'realtor' ? 'Specialty' : 'Service Type'}
                    </label>
                    {isEditingBusiness ?
                      <select
                        name="serviceTypeId"
                        value={profileData.serviceTypeId || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white rounded focus:outline-none focus:border-white/60">
                        <option value="" className="text-slate-900">— Select —</option>
                        {(serviceTypes || []).map((t) =>
                          <option key={t.id} value={t.id} className="text-slate-900">{t.name}</option>
                        )}
                      </select> :
                      <p className="text-white drop-shadow-md">
                        {apiProfileData?.serviceType?.name || <span className="text-white/60 italic">Not set</span>}
                      </p>
                    }
                  </div>

                  {/* License Number */}
                  <div>
                    <label className="block text-white font-medium mb-2 drop-shadow-md text-sm">
                      License Number
                    </label>
                    {isEditingBusiness ?
                      <input
                        type="text"
                        name="licenseNumber"
                        value={profileData.licenseNumber}
                        onChange={handleInputChange}
                        placeholder="e.g. TX-12345 (leave blank if N/A)"
                        className="w-full px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60" /> :
                      <p className="text-white drop-shadow-md">
                        {profileData.licenseNumber || 'NA'}
                      </p>
                    }
                  </div>
                </div>

                {/* Business Description (same column as personal bio; surfaced here for business roles) */}
                <div className="mt-6">
                  <label className="block text-white font-medium mb-2 drop-shadow-md text-sm">Business Description</label>
                  {isEditingBusiness ?
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Describe your services, experience, and what makes you stand out…"
                      className="w-full px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60" /> :
                    <p className="text-white leading-relaxed drop-shadow-md whitespace-pre-line">
                      {profileData.bio || <span className="text-white/60 italic">No description yet — click Edit to add one.</span>}
                    </p>
                  }
                </div>

                {isEditingBusiness &&
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      onClick={() => setIsEditingBusiness(false)}
                      className="px-4 py-2 border-2 border-white/30 text-white rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300">
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveBusiness}
                      disabled={updateProfileLoading}
                      className="px-4 py-2 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
                      {updateProfileLoading ? 'Saving…' : 'Save Business Details'}
                    </button>
                  </div>
                }
              </div>
            }

            {/* Request Quote Section */}
            <div
            className="rounded-2xl shadow-lg p-8 relative overflow-hidden mt-8"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl text-white drop-shadow-lg mb-2">Request Quote</h3>
                  <p className="text-white drop-shadow-md text-sm">
                    Upload pictures and details to get quotes from service providers
                  </p>
                </div>
                <button
                onClick={() => setShowQuoteModal(true)}
                className="px-6 py-3 bg-coral-orange text-black rounded-xl hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 flex items-center space-x-2 font-semibold shadow-lg">
                
                  <Upload className="h-5 w-5" />
                  <span>Request Quote</span>
                </button>
              </div>
            </div>

            {/* Notification Settings */}
            <div
            className="rounded-2xl shadow-lg p-8 relative overflow-hidden mt-8"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            
              <h3 className="text-xl text-white drop-shadow-lg mb-6">Notification Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors duration-300">
                  <div className="flex items-center space-x-3 flex-1">
                    <input
                    type="checkbox"
                    id="email-notifications"
                    checked={notificationSettings.email || false}
                    onChange={(e) => setNotificationSettings((prev) => ({ ...prev, email: e.target.checked }))}
                    className="w-5 h-5 rounded border-2 border-white/30 bg-white/10 text-sky-blue focus:ring-2 focus:ring-sky-blue focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer transition-all duration-300" />
                  
                    <div className="flex-1">
                      <label htmlFor="email-notifications" className="text-white drop-shadow-md font-medium cursor-pointer block">
                        Email Notifications
                      </label>
                      <p className="text-white text-sm drop-shadow-md mt-1">Receive notifications via email</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors duration-300">
                  <div className="flex items-center space-x-3 flex-1">
                    <input
                    type="checkbox"
                    id="push-notifications"
                    checked={notificationSettings.push || false}
                    onChange={(e) => setNotificationSettings((prev) => ({ ...prev, push: e.target.checked }))}
                    className="w-5 h-5 rounded border-2 border-white/30 bg-white/10 text-sky-blue focus:ring-2 focus:ring-sky-blue focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer transition-all duration-300" />
                  
                    <div className="flex-1">
                      <label htmlFor="push-notifications" className="text-white drop-shadow-md font-medium cursor-pointer block">
                        Push Notifications
                      </label>
                      <p className="text-white text-sm drop-shadow-md mt-1">Receive push notifications in browser</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors duration-300">
                  <div className="flex items-center space-x-3 flex-1">
                    <input
                    type="checkbox"
                    id="openhouse-notifications"
                    checked={notificationSettings.openHouse || false}
                    onChange={(e) => setNotificationSettings((prev) => ({ ...prev, openHouse: e.target.checked }))}
                    className="w-5 h-5 rounded border-2 border-white/30 bg-white/10 text-sky-blue focus:ring-2 focus:ring-sky-blue focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer transition-all duration-300" />
                  
                    <div className="flex-1">
                      <label htmlFor="openhouse-notifications" className="text-white drop-shadow-md font-medium cursor-pointer block">
                        Open House Notifications
                      </label>
                      <p className="text-white text-sm drop-shadow-md mt-1">Get notified about new open houses</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors duration-300">
                  <div className="flex items-center space-x-3 flex-1">
                    <input
                    type="checkbox"
                    id="bid-notifications"
                    checked={notificationSettings.bidSubmission || false}
                    onChange={(e) => setNotificationSettings((prev) => ({ ...prev, bidSubmission: e.target.checked }))}
                    className="w-5 h-5 rounded border-2 border-white/30 bg-white/10 text-sky-blue focus:ring-2 focus:ring-sky-blue focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer transition-all duration-300" />
                  
                    <div className="flex-1">
                      <label htmlFor="bid-notifications" className="text-white drop-shadow-md font-medium cursor-pointer block">
                        Bid Submission Notifications
                      </label>
                      <p className="text-white text-sm drop-shadow-md mt-1">Get notified when providers submit bids</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      {/* Quote Request Modal */}
      <QuoteRequestModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        onSubmit={handleQuoteSubmit}
        categoryOptions={(serviceTypes || []).map((t) => t.name).filter(Boolean)}
        currentUser={currentUser} />

      {/* Request details modal — opened from the Meeting / Client Requests cards */}
      <RequestDetailsModal
        isOpen={!!detailRequest}
        request={detailRequest}
        onClose={() => setDetailRequest(null)} />

      {/* Provider: respond to a customer request with a quote */}
      <RespondQuoteModal
        isOpen={!!respondTarget}
        request={respondTarget}
        loading={quoteResponseLoading}
        onSubmit={handleSendQuote}
        onClose={() => setRespondTarget(null)} />

      {/* Customer: rate & review a provider after a completed job */}
      <ReviewModal
        isOpen={!!reviewTarget}
        providerName={reviewTarget?.providerName}
        loading={createReviewLoading}
        onSubmit={handleSubmitReview}
        onClose={() => setReviewTarget(null)} />

    </div>);

}