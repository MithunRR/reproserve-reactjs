import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Edit3, Camera, Star, Calendar, MessageSquare, FileText, Home, Upload, Building, DollarSign, CheckCircle2, LocateFixed, Loader2, Lock, Eye, EyeOff, Clock, Plus, X, ChevronDown, CalendarOff, Bookmark, Send, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { QuoteRequestModal } from './QuoteRequestModal';
import { RequestDetailsModal } from './RequestDetailsModal';
import { RespondQuoteModal } from './RespondQuoteModal';
import { ReviewModal } from './ReviewModal';
import {
  quoteRequestsStorage,
  profileDataStorage,
  notificationSettingsStorage,



  profileImageStorage } from
'../utils/localStorage';
import apiClient from '../utils/api';
import {
  fetchProfileStart,
  updateProfileStart,
  resetUpdateProfileFlag,
  fetchProjectsStart,
  updateProjectStart,
  resetUpdateProjectFlag,
  removeProjectStart,
  resetRemoveProjectFlag,
  fetchFavoritesStart,
  removeFavoriteStart,
  fetchSavedQuotesStart,
  addSavedQuoteStart,
  removeSavedQuoteStart,
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
  fetchServiceTypesStart,
  changePasswordStart,
  resetChangePasswordFlag,
  fetchConversationsStart,
  fetchMessagesStart,
  sendMessageStart,
  setActiveThreadPeer,
  markThreadReadLocal
} from '../Store/Features/Authentication/authslice';
import { emitMessage, emitMessageRead } from '../services/socket';

// Weekday scaffold for the Standard Working Hours editor.
const WORKING_DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' }
];

// A sensible starting schedule: 9–5 on weekdays, Sunday closed.
const defaultWorkingHours = () =>
  WORKING_DAYS.reduce((acc, d) => {
    acc[d.key] = { closed: d.key === 'sun', open: '09:00', close: '17:00' };
    return acc;
  }, {});

// Coerces whatever is stored (JSON string / object / null) into a full,
// well-formed working-hours object so the editor always has every day.
const normaliseWorkingHours = (raw) => {
  let obj = raw;
  if (typeof raw === 'string') {
    try { obj = JSON.parse(raw); } catch (_) { obj = null; }
  }
  const base = defaultWorkingHours();
  if (obj && typeof obj === 'object') {
    for (const d of WORKING_DAYS) {
      if (obj[d.key]) base[d.key] = { ...base[d.key], ...obj[d.key] };
    }
  }
  return base;
};

// Maps the app's role value ('provider' | 'realtor' | …) to a
// service_types.category so each role sees its own categories.
const roleToServiceCategory = (role) =>
  role === 'realtor' ? 'realtor' : 'service_provider';

// Converts a stored ISO datetime to the value a datetime-local input expects
// (YYYY-MM-DDTHH:mm in local time), or '' when unset.
const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function ProfilePage({ navigate, currentUser, setCurrentUser, view = 'dashboard' }) {
  const dispatch = useDispatch();
  const {
    profileData: apiProfileData,
    profileLoading,
    updateProfileLoading,
    updateProfileSuccess,
    updateProfileError,
    projects: apiProjects,
    updateProjectSuccess,
    updateProjectError,
    updateProjectLoading,
    removeProjectSuccess,
    removeProjectError,
    removeProjectLoading,
    favorites: apiFavorites,
    savedQuotes: apiSavedQuotes,
    conversations,
    messages: threadMessages,
    messagesLoading,
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
    serviceTypes,
    changePasswordLoading,
    changePasswordError,
    changePasswordSuccess
  } = useSelector((state) => state.AuthReducer);

  const roleLabel =
    currentUser?.role === 'provider'
      ? 'Service Provider'
      : currentUser?.role === 'realtor'
        ? 'Realtor'
        : 'User';
  const isBusinessRole = currentUser?.role === 'provider' || currentUser?.role === 'realtor';
  const isRealtor = currentUser?.role === 'realtor';

  // Service types filtered to the logged-in user's audience. Rows without a
  // category (older data) fall through so nothing silently disappears.
  const roleServiceTypes = (serviceTypes || []).filter(
    (t) => !t?.category || t.category === roleToServiceCategory(currentUser?.role)
  );

  // Active tab + Quotes sub-tab are persisted for the browsing session so that
  // leaving the dashboard (e.g. "Add to Portfolio" → Create Project) and coming
  // back — via Cancel, the browser Back button, or a successful save — returns
  // to the exact tab/sub-tab you were on instead of resetting to Overview.
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === 'undefined') return 'overview';
    return sessionStorage.getItem('dash_activeTab') || 'overview';
  });
  // Sub-tab within the Quotes tab. "My Quote Requests" is the default/main one.
  const [quotesSubTab, setQuotesSubTab] = useState(() => {
    if (typeof window === 'undefined') return 'requests';
    return sessionStorage.getItem('dash_quotesSubTab') || 'requests';
  });

  // Keep the session-scoped copies in sync so a return trip restores them.
  useEffect(() => {
    if (typeof window !== 'undefined') sessionStorage.setItem('dash_activeTab', activeTab);
  }, [activeTab]);
  useEffect(() => {
    if (typeof window !== 'undefined') sessionStorage.setItem('dash_quotesSubTab', quotesSubTab);
  }, [quotesSubTab]);
  // "Add Listing" dropdown (realtor) + the project details modal.
  const [showAddListing, setShowAddListing] = useState(false);
  const [detailProject, setDetailProject] = useState(null);
  // Portfolio detail modal: view vs. inline-edit mode + the editable draft.
  const [projectEditMode, setProjectEditMode] = useState(false);
  const [projectForm, setProjectForm] = useState(null);
  // Requested-tour (show-my-property) details modal.
  const [detailShowing, setDetailShowing] = useState(null);
  // Pending "remove from portfolio" confirmation ({ project, request }).
  const [removePortfolioTarget, setRemovePortfolioTarget] = useState(null);
  // Inbox: selected conversation peer, message draft, per-thread quote picker.
  const [inboxPeer, setInboxPeer] = useState(null);
  const [inboxDraft, setInboxDraft] = useState('');
  const [inboxSending, setInboxSending] = useState(false);
  const [inboxQuoteId, setInboxQuoteId] = useState(null);
  const [inboxSearch, setInboxSearch] = useState('');
  // Collapsible quote panel inside a thread — hidden until the "Quotes" toggle.
  const [inboxQuotePanelOpen, setInboxQuotePanelOpen] = useState(false);
  const inboxScrollRef = useRef(null);
  // Standard working hours + block-calendar (business roles).
  const [showWorkingHoursModal, setShowWorkingHoursModal] = useState(false);
  const [workingHours, setWorkingHours] = useState(() => defaultWorkingHours());
  const [blockFrom, setBlockFrom] = useState('');
  const [blockUntil, setBlockUntil] = useState('');
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const location = useLocation();

  // Open a specific tab when navigated with ?tab=<id> (deep-link support).
  // Re-runs if the query changes.
  useEffect(() => {
    const requestedTab = new URLSearchParams(location.search).get('tab');
    if (requestedTab) {
      setActiveTab(requestedTab);
    }
  }, [location.search]);
  const [isEditing, setIsEditing] = useState(false);
  // Separate edit state for the Business Details panel so the two sections
  // can be edited and saved independently.
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [detailRequest, setDetailRequest] = useState(null);
  const [respondTarget, setRespondTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);

  // ── Change password (lives inside the Settings tab) ──────────────────
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    password: '',
    passwordConfirmation: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    if (passwordErrors[field]) {
      setPasswordErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!passwordForm.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwordForm.password.trim()) {
      newErrors.password = 'New password is required';
    } else if (passwordForm.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    if (!passwordForm.passwordConfirmation.trim()) {
      newErrors.passwordConfirmation = 'Please confirm your new password';
    } else if (passwordForm.password !== passwordForm.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Passwords do not match';
    }
    setPasswordErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!authToken) {
      toast.error('You must be logged in to change your password. Please log in again.');
      return;
    }

    dispatch(changePasswordStart({
      current_password: passwordForm.currentPassword,
      password: passwordForm.password,
      password_confirmation: passwordForm.passwordConfirmation
    }));
  };

  // Surface change-password result as a toast and reset the form on success.
  useEffect(() => {
    if (changePasswordSuccess) {
      toast.success('Password changed successfully.');
      setPasswordForm({ currentPassword: '', password: '', passwordConfirmation: '' });
      setPasswordErrors({});
      dispatch(resetChangePasswordFlag());
    }
  }, [changePasswordSuccess, dispatch]);

  useEffect(() => {
    if (changePasswordError) {
      toast.error(
        typeof changePasswordError === 'string'
          ? changePasswordError
          : 'Failed to change password. Please try again.'
      );
      dispatch(resetChangePasswordFlag());
    }
  }, [changePasswordError, dispatch]);

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

      /* ===== PHONE-ONLY layout (laptops/desktops never match this) ===== */
      @media (max-width: 767px) {
        /* Tab bar scrolls horizontally so labels stay readable instead of
           being crushed into 7 equal slivers. */
        .profile-tabs {
          overflow-x: auto;
          scrollbar-width: none;
        }
        .profile-tabs::-webkit-scrollbar { display: none; }
        .profile-tabs > button {
          flex: 0 0 auto;
          min-width: 92px;
        }
        /* Section headers: title stacks above its action button */
        .profile-head-row {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
        }
        /* Mobile-first compaction: trim oversized page chrome and the large
           p-8 glass panels so phones scroll less. */
        .profile-page { padding-left: 0.75rem; padding-right: 0.75rem; }
        .profile-page .profile-page-head { margin-bottom: 1.25rem; }
        .profile-page .profile-page-head h1 { font-size: 1.6rem; line-height: 1.2; }
        .profile-page .profile-tabs-card { margin-bottom: 1.25rem; }
        /* Shrink the generous p-8 padding inside dashboard/settings cards. */
        .profile-page .p-8 { padding: 1.25rem; }
        /* Tighten the big vertical rhythm between stacked sections. */
        .profile-page .space-y-8 > * + * { margin-top: 1.25rem; }
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
  // Trust-indicator profile photo (business roles). Stored server-side under
  // /uploads and surfaced on the public profile + search results.
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(currentUser?.profilePhoto || null);
  const [photoUploading, setPhotoUploading] = useState(false);
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
    licenseNumber: '',
    // Trust-indicator fields — service_provider / realtor only.
    specialties: '',
    responseTime: '',
    yearsOfExperience: ''
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
      dispatch(fetchSavedQuotesStart({ userId: currentUser.id }));
      dispatch(fetchConversationsStart());
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
      licenseNumber: apiProfileData.licenseNumber ?? prev.licenseNumber ?? '',
      specialties: Array.isArray(apiProfileData.specialties)
        ? apiProfileData.specialties.join(', ')
        : (apiProfileData.specialties ?? prev.specialties ?? ''),
      responseTime: apiProfileData.responseTime ?? prev.responseTime ?? '',
      yearsOfExperience: apiProfileData.yearsOfExperience != null
        ? apiProfileData.yearsOfExperience
        : (prev.yearsOfExperience ?? ''),
      latitude: apiProfileData.latitude != null ? Number(apiProfileData.latitude) : null,
      longitude: apiProfileData.longitude != null ? Number(apiProfileData.longitude) : null
    }));
    if (apiProfileData.profilePhoto) setProfilePhotoUrl(apiProfileData.profilePhoto);
    // Availability: working hours + block-calendar window.
    setWorkingHours(normaliseWorkingHours(apiProfileData.workingHours));
    setBlockFrom(toLocalInput(apiProfileData.blockedFrom));
    setBlockUntil(toLocalInput(apiProfileData.blockedUntil));
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

  // Save the user's GPS-resolved coordinates to the backend. Used by the
  // "Use my current location" button in the Service Location panel.
  const [gpsBusy, setGpsBusy] = useState(false);
  const handleUseGPSLocation = () => {
    if (!currentUser?.id) return;
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser.');
      return;
    }
    setGpsBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        dispatch(updateProfileStart({
          id: currentUser.id,
          payload: { latitude: lat, longitude: lng }
        }));
        setGpsBusy(false);
        toast.success('Location updated — customers nearby can now find you.');
      },
      (err) => {
        setGpsBusy(false);
        toast.error(err.message || 'Could not get your location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
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
        licenseNumber: profileData.licenseNumber.trim() || null,
        // Trust indicators — backend accepts a comma-separated specialties string.
        specialties: profileData.specialties,
        responseTime: profileData.responseTime || null,
        yearsOfExperience:
          profileData.yearsOfExperience === '' || profileData.yearsOfExperience == null
            ? null
            : Number(profileData.yearsOfExperience)
      }
    }));
    setIsEditingBusiness(false);
  };

  // Persist the weekly working hours. Sent as an object; the backend stores it
  // as JSON. Reuses the shared updateProfileSuccess/Error toasts.
  const handleSaveWorkingHours = () => {
    if (!currentUser?.id) return;
    dispatch(updateProfileStart({
      id: currentUser.id,
      payload: { workingHours }
    }));
    setShowWorkingHoursModal(false);
  };

  // Persist the block-calendar window. Empty inputs clear the block. A local
  // datetime-local value is converted to an ISO string for the API.
  const handleSaveBlockCalendar = () => {
    if (!currentUser?.id) return;
    if (blockFrom && blockUntil && new Date(blockFrom) >= new Date(blockUntil)) {
      toast.error('Block "from" must be before "to".');
      return;
    }
    setAvailabilitySaving(true);
    dispatch(updateProfileStart({
      id: currentUser.id,
      payload: {
        blockedFrom: blockFrom ? new Date(blockFrom).toISOString() : null,
        blockedUntil: blockUntil ? new Date(blockUntil).toISOString() : null
      }
    }));
  };

  // Clears availability-saving flag once the update round-trips.
  useEffect(() => {
    if (availabilitySaving && (updateProfileSuccess || updateProfileError)) {
      setAvailabilitySaving(false);
    }
  }, [updateProfileSuccess, updateProfileError, availabilitySaving]);

  // Immediate, standalone upload of the business profile photo. POSTs the file
  // as multipart/form-data ("photo") to /api/profile/photo. The request
  // interceptor on apiClient attaches the Bearer token.
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!currentUser?.id) {
      toast.error('Please sign in to upload a photo.');
      return;
    }
    const fd = new FormData();
    fd.append('photo', file);
    setPhotoUploading(true);
    try {
      const res = await apiClient.post('/api/profile/photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res?.data?.data?.profilePhoto;
      if (url) {
        setProfilePhotoUrl(url);
        if (typeof setCurrentUser === 'function') {
          setCurrentUser((prev) => (prev ? { ...prev, profilePhoto: url } : prev));
        }
        toast.success('Profile photo updated');
      } else {
        toast.error('Photo upload failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload photo');
    } finally {
      setPhotoUploading(false);
      // Allow re-selecting the same file.
      if (e.target) e.target.value = '';
    }
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

  // Deterministic title a completed job gets when added to the portfolio.
  const portfolioTitleFor = (request) =>
    `${request.category || 'Project'}${request.location ? ` — ${request.location}` : ''}`;

  // The portfolio Project created from this completed job, if one exists.
  // Matched by the explicit sourceQuoteId link (reliable — a plain title match
  // collides when two jobs share the same category + location).
  const portfolioProjectFor = (request) =>
    (apiProjects || []).find((p) => Number(p.sourceQuoteId) === Number(request.id)) || null;

  const handleAddToPortfolio = (request) => {
    localStorage.setItem('portfolioPrefill', JSON.stringify({
      title: portfolioTitleFor(request),
      category: request.category || '',
      description: request.description || '',
      // Portfolio pieces are finished work — pre-mark completed so they don't
      // show a misleading "Quoted"/"Active" badge on the card.
      status: 'completed',
      // Link back to the completed job so Add ⇄ Remove stays reliable.
      sourceQuoteId: request.id
    }));
    navigate('create-project');
  };

  const handleConfirmRemovePortfolio = () => {
    const id = removePortfolioTarget?.project?.id;
    if (id) dispatch(removeProjectStart(id));
  };

  // Close the confirm modal (and the portfolio detail modal, if open) + toast
  // once the delete round-trips.
  useEffect(() => {
    if (removeProjectSuccess) {
      toast.success('Removed from portfolio');
      setRemovePortfolioTarget(null);
      setDetailProject(null);
      setProjectEditMode(false);
      setProjectForm(null);
      dispatch(resetRemoveProjectFlag());
    }
  }, [removeProjectSuccess, dispatch]);

  useEffect(() => {
    if (removeProjectError) {
      toast.error(typeof removeProjectError === 'string' ? removeProjectError : 'Failed to remove from portfolio');
      dispatch(resetRemoveProjectFlag());
    }
  }, [removeProjectError, dispatch]);

  // ── Portfolio detail / edit (provider & realtor) ──────────────────────
  const openProjectDetail = (project) => {
    setProjectEditMode(false);
    setDetailProject(project);
  };

  const startEditProject = () => {
    if (!detailProject) return;
    setProjectForm({
      title: detailProject.title || '',
      category: detailProject.category || '',
      description: detailProject.description || '',
      budgetMin: detailProject.budgetMin ?? '',
      budgetMax: detailProject.budgetMax ?? '',
      status: detailProject.statusRaw || 'completed'
    });
    setProjectEditMode(true);
  };

  const handleSaveProject = () => {
    if (!detailProject?.id || !projectForm) return;
    dispatch(updateProjectStart({
      id: detailProject.id,
      payload: {
        title: projectForm.title,
        category: projectForm.category || null,
        description: projectForm.description,
        budgetMin: projectForm.budgetMin === '' ? null : projectForm.budgetMin,
        budgetMax: projectForm.budgetMax === '' ? null : projectForm.budgetMax,
        status: projectForm.status
      }
    }));
  };

  // Close the portfolio editor once the update round-trips successfully.
  useEffect(() => {
    if (updateProjectSuccess) {
      toast.success('Portfolio item updated');
      setProjectEditMode(false);
      setDetailProject(null);
      setProjectForm(null);
      dispatch(resetUpdateProjectFlag());
    }
  }, [updateProjectSuccess, dispatch]);

  useEffect(() => {
    if (updateProjectError) {
      toast.error(typeof updateProjectError === 'string' ? updateProjectError : 'Failed to update portfolio item');
      dispatch(resetUpdateProjectFlag());
    }
  }, [updateProjectError, dispatch]);

  // ── Saved Quotes (bookmarks) ──────────────────────────────────────────
  const savedQuoteRecords = apiSavedQuotes || [];
  const savedQuoteIds = new Set(savedQuoteRecords.map((s) => s.quoteId));

  const toggleSaveQuote = (quoteId) => {
    if (!currentUser?.id || !quoteId) return;
    const existing = savedQuoteRecords.find((s) => s.quoteId === quoteId);
    if (existing) {
      dispatch(removeSavedQuoteStart(existing.id));
    } else {
      dispatch(addSavedQuoteStart({ userId: currentUser.id, quoteId }));
    }
  };

  // ── Inbox (WhatsApp-style chat + embedded quote actions) ──────────────
  // Load a thread when a peer is selected; mark it read (locally + over socket).
  useEffect(() => {
    const pid = inboxPeer?.id;
    if (!pid) return;
    dispatch(setActiveThreadPeer(pid));
    dispatch(fetchMessagesStart({ withUserId: pid }));
    dispatch(markThreadReadLocal(pid));
    emitMessageRead(pid);
    return () => { dispatch(setActiveThreadPeer(null)); };
  }, [inboxPeer?.id, dispatch]);

  // Auto-scroll the open thread to the newest message.
  useEffect(() => {
    if (activeTab === 'inbox' && inboxScrollRef.current) {
      inboxScrollRef.current.scrollTop = inboxScrollRef.current.scrollHeight;
    }
  }, [threadMessages, activeTab, inboxPeer?.id]);

  const handleInboxSend = async (e) => {
    e.preventDefault();
    const text = inboxDraft.trim();
    const pid = inboxPeer?.id;
    if (!text || !pid || inboxSending || !currentUser?.id) return;
    setInboxSending(true);
    setInboxDraft('');
    // Try socket first; fall back to REST if the socket is disconnected.
    const ack = await emitMessage(pid, text);
    if (!ack?.ok) {
      dispatch(sendMessageStart({ receiverId: pid, content: text }));
    }
    setInboxSending(false);
  };

  // Small bookmark toggle placed to the right of a quote card's datetime.
  const renderSaveButton = (quoteId) => {
    const saved = savedQuoteIds.has(quoteId);
    return (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); toggleSaveQuote(quoteId); }}
        title={saved ? 'Remove from Saved Quotes' : 'Save this quote'}
        className={`p-1.5 rounded-lg transition-colors ${saved ? 'text-coral-orange hover:bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
        <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
      </button>);
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
      const inPortfolio = portfolioProjectFor(req);
      return (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-green-300 font-medium">Completed</span>
          {inPortfolio
            ? <button
                onClick={(e) => { e.stopPropagation(); setRemovePortfolioTarget({ project: inPortfolio, request: req }); }}
                className="px-4 py-2 rounded-lg bg-red-400/20 text-red-300 border border-red-400/40 text-sm font-semibold hover:bg-red-400/30 transition-all duration-300">
                Remove from Portfolio
              </button>
            : <button
                onClick={(e) => { e.stopPropagation(); handleAddToPortfolio(req); }}
                className="px-4 py-2 rounded-lg bg-coral-orange text-black text-sm font-semibold hover:bg-coral-orange/90 transition-all duration-300">
                Add to Portfolio
              </button>}
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
  // A customer's project is a request they posted (open → the provider has
  // "Quoted" it). A provider's/realtor's project is a portfolio piece, where
  // "Quoted" makes no sense — so business roles get showcase-oriented labels.
  const PROJECT_STATUS_LABEL = {
    open: 'Quoted', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled'
  };
  const PROJECT_STATUS_LABEL_BUSINESS = {
    open: 'Draft', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled'
  };
  const projectStatusLabels = isBusinessRole ? PROJECT_STATUS_LABEL_BUSINESS : PROJECT_STATUS_LABEL;
  const recentProjects = (apiProjects || []).map((p) => ({
    id: p.id,
    title: p.title,
    provider: p.category || 'Project',
    status: projectStatusLabels[p.status] || projectStatusLabels.completed,
    date: p.createdAt,
    cost: p.budgetMin
      ? `$${p.budgetMin}${p.budgetMax ? ` - $${p.budgetMax}` : ''}`
      : 'Not set',
    rating: null,
    // Raw fields kept for the editable portfolio modal.
    category: p.category || '',
    description: p.description || '',
    budgetMin: p.budgetMin ?? '',
    budgetMax: p.budgetMax ?? '',
    statusRaw: p.status || 'open',
    location: p.location || '',
    photos: Array.isArray(p.photos) ? p.photos : []
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
    bids: q.responses || [],
    createdAt: q.createdAt
  }));

  // Dashboard tab order is role-specific:
  //   Realtor:  Overview · Opportunity · My Listing · Meeting Requests · Quotes · Favorites
  //   Provider: Overview · Client Requests · My Projects · Quotes · Favorites
  //   User:     Overview · My Projects · Favorites · Quotes · My Showings
  const TAB = {
    overview: { id: 'overview', label: 'Overview', icon: User },
    favorites: { id: 'favorites', label: 'Favorites', icon: Star },
    quotes: { id: 'quotes', label: 'Quotes', icon: FileText },
    inbox: { id: 'inbox', label: 'Inbox', icon: MessageSquare }
  };
  const dashboardTabs = isRealtor
    ? [
        TAB.overview,
        { id: 'showings', label: 'Opportunity', icon: Building },
        { id: 'projects', label: 'My Portfolio', icon: Home },
        { id: 'requests', label: 'Meeting Requests', icon: Calendar },
        TAB.quotes,
        TAB.favorites,
        TAB.inbox
      ]
    : currentUser?.role === 'provider'
    ? [
        TAB.overview,
        { id: 'requests', label: 'Client Requests', icon: Calendar },
        { id: 'projects', label: 'My Portfolio', icon: Home },
        TAB.quotes,
        TAB.favorites,
        TAB.inbox
      ]
    : [
        TAB.overview,
        TAB.favorites,
        TAB.quotes,
        { id: 'showings', label: 'Requested Tour', icon: Building },
        TAB.inbox
      ];



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

  // Quick Actions for the Overview tab. Trimmed to just "View Messages" — there
  // is no standalone messages route, so it jumps to the relevant requests/quotes
  // tab where conversations live.
  const quickActions = [
    { key: 'messages', label: 'View Messages', icon: MessageSquare, onClick: () => setActiveTab(isBusinessRole ? 'requests' : 'quotes') }
  ];

  const renderOverview = () =>
  <div className="space-y-6 animate-fadeIn">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        <div
        onClick={() => setActiveTab(isBusinessRole ? 'projects' : 'showings')}
        className="rounded-2xl shadow-lg p-4 sm:p-6 text-center relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>

          <div className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{isBusinessRole ? recentProjects.length : (Array.isArray(showRequests) ? showRequests.length : 0)}</div>
          <div className="text-white drop-shadow-md">{isBusinessRole ? 'Total Portfolio' : 'Requested Tours'}</div>
        </div>
        <div
        onClick={() => setActiveTab('favorites')}
        className="rounded-2xl shadow-lg p-4 sm:p-6 text-center relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
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
        className="rounded-2xl shadow-lg p-4 sm:p-6 text-center relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        
          <div className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{savedQuoteRecords.length}</div>
          <div className="text-white drop-shadow-md">Saved Quotes</div>
        </div>
      </div>

      {/* Quick Actions — prominent shortcuts to the most common tasks so users
          can act immediately after login. Role-appropriate. */}
      <div
      className="rounded-2xl p-4 sm:p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}>
        <h3 className="text-lg sm:text-xl text-white mb-4 drop-shadow-lg">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {quickActions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={action.key}
                onClick={action.onClick}
                className="group flex flex-col items-center justify-center text-center gap-2 p-3 sm:p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-lg">
                <span className="flex items-center justify-center h-10 w-10 rounded-full bg-coral-orange/90 text-black group-hover:bg-coral-orange transition-colors duration-300">
                  <ActionIcon className="h-5 w-5" />
                </span>
                <span className="text-xs sm:text-sm font-semibold text-white drop-shadow-md leading-tight">{action.label}</span>
              </button>);
          })}
        </div>
      </div>
    </div>;


  const renderProjects = () =>
  <div className="space-y-6 animate-fadeIn">
      <div className="profile-head-row flex items-center justify-between">
        <h3 className="text-xl text-white drop-shadow-lg">{isBusinessRole ? 'My Portfolio' : 'My Projects'}</h3>
        {isRealtor ?
          <div className="relative">
            <button
              onClick={() => setShowAddListing((v) => !v)}
              className="px-4 py-2 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Listing</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showAddListing ? 'rotate-180' : ''}`} />
            </button>
            {showAddListing &&
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg z-30 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,137,225,0.97), rgba(0,69,113,0.97))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}>
                {[
                  { label: 'New Project', route: 'create-project' },
                  { label: 'Open House', route: 'open-house' },
                  { label: 'Show My Property', route: 'show-my-property' }
                ].map((item, i) =>
                  <button
                    key={item.route}
                    onClick={() => { setShowAddListing(false); navigate(item.route); }}
                    className={`block w-full text-left px-4 py-3 text-white hover:bg-white/15 transition-colors ${i > 0 ? 'border-t border-white/15' : ''}`}>
                    {item.label}
                  </button>
                )}
              </div>
            }
          </div> :
          <button
            onClick={() => navigate('create-project')}
            className="px-4 py-2 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg">
            Start New Project
          </button>
        }
      </div>

      {recentProjects.map((project) =>
    <div
      key={project.id}
      onClick={() => openProjectDetail(project)}
      role="button"
      tabIndex={0}
      className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer"
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
              <button
                onClick={(e) => { e.stopPropagation(); openProjectDetail(project); }}
                className="px-3 py-1 bg-sky-blue text-white rounded-xl text-sm hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 font-medium">
                View Details
              </button>
              {!isBusinessRole && project.status === 'Completed' && !project.rating &&
          <button
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-1 bg-coral-orange text-white rounded-xl text-sm hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 font-medium">
                  Leave Review
                </button>
          }
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


  const renderQuotes = () => {
    // Sub-tabs under the Quotes tab.
    //   Business roles: My Quote Requests · Quoted · Completed · Saved.
    //   Users:          All · Completed · Saved.
    const quotesSubTabs = [
      { id: 'requests', label: isBusinessRole ? 'My Quote Requests' : 'All' },
      ...(isBusinessRole
        ? [{ id: 'quoted', label: 'Quoted' }, { id: 'completed', label: 'Completed' }]
        : [{ id: 'completed', label: 'Completed' }]),
      { id: 'saved', label: 'Saved Quotes' }
    ];
    const activeSub = quotesSubTabs.some((t) => t.id === quotesSubTab) ? quotesSubTab : 'requests';
    // Users' own requests that are done.
    const completedRequests = quoteRequests.filter((q) => q.status === 'closed');
    // Split the requests I've quoted by lifecycle: closed → Completed, the rest
    // (responded / accepted / in-progress) → Quoted.
    const quotedIncoming = sentIncomingRequests.filter((r) => r.status !== 'closed');
    const completedIncoming = sentIncomingRequests.filter((r) => r.status === 'closed');
    const glass = {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
    };
    const emptyState = (text) =>
      <div className="rounded-2xl p-8 text-center relative overflow-hidden" style={glass}>
        <p className="text-white drop-shadow-md">{text}</p>
      </div>;

    // One of the user's own quote-request cards (used by both All and Completed).
    // Clicking the card opens the read-only details modal; the action buttons
    // and save toggle stop propagation so they still work independently.
    const renderCustomerQuoteCard = (request) =>
      <div
        key={request.id}
        onClick={() => setDetailRequest({ ...request, name: request.name || currentUser?.name || 'Quote Request' })}
        role="button"
        tabIndex={0}
        className="rounded-2xl p-6 relative overflow-hidden cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
        style={glass}>
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
              <img key={idx} src={photo} alt={`Photo ${idx + 1}`} className="w-16 h-16 object-cover rounded-md" />
            )}
          </div>
        }
        <div className="pt-3 border-t border-white/20" onClick={(e) => e.stopPropagation()}>
          {renderCustomerQuoteActions(request)}
        </div>
        <div className="flex items-center justify-between text-xs text-white/70 drop-shadow-md pt-3 mt-3 border-t border-white/20">
          <span className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {request.createdAt ? new Date(request.createdAt).toLocaleString() : ''}
          </span>
          {renderSaveButton(request.id)}
        </div>
      </div>;

    return (
  <div className="space-y-6 animate-fadeIn">
      {/* Request for Quote — pinned to the top of the Quotes tab for every dashboard */}
      <div className="profile-head-row flex items-center justify-between">
        <h3 className="text-xl text-white drop-shadow-lg">Quotes</h3>
        <button
        onClick={() => setShowQuoteModal(true)}
        className="px-4 py-2 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 flex items-center space-x-2 font-semibold shadow-lg">
          <Upload className="h-4 w-4" />
          <span>Request New Quote</span>
        </button>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex gap-2 flex-wrap">
        {quotesSubTabs.map((t) =>
          <button
            key={t.id}
            onClick={() => setQuotesSubTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${activeSub === t.id ?
              'bg-coral-orange text-black shadow-lg' :
              'bg-white/10 text-white hover:bg-white/20 border border-white/20'}`}>
            {t.label}
          </button>
        )}
      </div>

      {/* Quoted — client requests I've responded to that are still active */}
      {activeSub === 'quoted' && isBusinessRole &&
        <div className="space-y-4">
          <p className="text-white/80 drop-shadow-md text-sm">
            Client requests you've quoted and are awaiting or working on.
          </p>
          {quotedIncoming.length > 0
            ? quotedIncoming.map((req) => renderIncomingRequestCard(req))
            : emptyState('No active quoted requests yet')}
        </div>
      }

      {/* Completed — closed jobs (business roles) */}
      {activeSub === 'completed' && isBusinessRole &&
        <div className="space-y-4">
          <p className="text-white/80 drop-shadow-md text-sm">
            Jobs you've completed for clients.
          </p>
          {completedIncoming.length > 0
            ? completedIncoming.map((req) => renderIncomingRequestCard(req))
            : emptyState('No completed jobs yet')}
        </div>
      }

      {/* Completed — the user's own requests that are done */}
      {activeSub === 'completed' && !isBusinessRole &&
        <div className="space-y-4">
          {completedRequests.length > 0
            ? completedRequests.map((request) => renderCustomerQuoteCard(request))
            : emptyState('No completed quotes yet')}
        </div>
      }

      {/* All / My Quote Requests (main) */}
      {activeSub === 'requests' &&
      <div>
        {quoteRequests.length === 0
          ? emptyState('No quote requests yet')
          : <div className="space-y-4">
              {quoteRequests.map((request) => renderCustomerQuoteCard(request))}
            </div>
        }
      </div>
      }

      {/* Saved Quotes — anything bookmarked with the Save icon, from any tab */}
      {activeSub === 'saved' &&
      <div className="space-y-4">
          <p className="text-white/80 drop-shadow-md text-sm">
            Quotes you've bookmarked with the <Bookmark className="h-3 w-3 inline -mt-0.5" /> icon.
          </p>
          {savedQuoteRecords.length > 0 ? savedQuoteRecords.map((rec) => {
            const q = rec.quote || {};
            const requesterName = q.requester
              ? `${q.requester.firstName || ''} ${q.requester.lastName || ''}`.trim()
              : (q.name || '');
            const providerName = q.provider
              ? (q.provider.businessName || `${q.provider.firstName || ''} ${q.provider.lastName || ''}`.trim())
              : '';
            // Is this one of my own requests, or an incoming client request I saved?
            const mine = q.userId === currentUser?.id;
            const counterparty = mine ? providerName : requesterName;
            // Open the same read-only details modal the other quote cards use.
            const openSaved = () => setDetailRequest({
              ...q,
              name: q.name || requesterName || 'Client',
              email: q.email || q.requester?.email || '',
              phone: q.phone || q.requester?.phone || ''
            });
            return (
              <div
                key={rec.id}
                onClick={openSaved}
                role="button"
                tabIndex={0}
                className="rounded-2xl p-6 relative overflow-hidden cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
                style={glass}>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="min-w-0">
                    <h4 className="text-lg text-white font-medium drop-shadow-md">{q.category || 'Quote'}</h4>
                    {counterparty &&
                      <p className="text-sm text-white/80 drop-shadow-md mt-0.5">
                        {mine ? 'Provider: ' : 'From: '}{counterparty}
                      </p>
                    }
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      q.status === 'closed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                      q.status === 'declined' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      q.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                      'bg-white/20 text-white border border-white/30'}`}>
                      {statusLabel(q.status)}
                    </span>
                    {renderSaveButton(q.id)}
                  </div>
                </div>
                {q.description &&
                  <p className="text-sm text-white/90 drop-shadow-md mb-3 leading-relaxed">{q.description}</p>
                }
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/80 drop-shadow-md">
                  {q.location &&
                    <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" />{q.location}</span>
                  }
                  {(q.budgetMin || q.budgetMax) &&
                    <span>Budget: ${q.budgetMin}{q.budgetMax ? ` - $${q.budgetMax}` : '+'}</span>
                  }
                  {q.createdAt &&
                    <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" />{new Date(q.createdAt).toLocaleDateString()}</span>
                  }
                </div>
              </div>);
          }) : emptyState('No saved quotes yet')}
      </div>
      }
    </div>
    );
  };


  // Incoming requests directed at this provider/realtor (/quotes?providerId=).
  const incomingRequests = (incomingQuotes || []).map((q) => ({
    id: q.id,
    requesterId: q.userId,
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
        <div className="flex items-center gap-2">
          {req.isMeetingRequest &&
            <span className="px-2 py-0.5 rounded-full bg-sky-blue/20 border border-sky-blue/30 text-white">
              Meeting Request
            </span>
          }
          {renderSaveButton(req.id)}
        </div>
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
    // A realtor can also post their own property for showing; those must not
    // appear in their own "Available to Claim" pool — only other realtors see them.
    const available = list.filter((r) =>
      r.status === 'pending' && !r.assignedAgentId && r.userId !== currentUser?.id);
    const mine = list.filter((r) => r.assignedAgentId === currentUser?.id);
    const customerList = list.filter((r) => r.userId === currentUser?.id);

    const renderCard = (req, mode) => {
      const cfg = SHOW_STATUS[req.status] || SHOW_STATUS.pending;
      const isAssignedToMe = req.assignedAgentId === currentUser?.id;
      // Customer cards are read-only — clicking opens the full details modal.
      const clickable = mode === 'customer';
      return (
        <div
          key={req.id}
          onClick={clickable ? () => setDetailShowing(req) : undefined}
          role={clickable ? 'button' : undefined}
          tabIndex={clickable ? 0 : undefined}
          className={`rounded-2xl p-5 relative overflow-hidden flex flex-col h-full ${clickable ? 'cursor-pointer transition-transform duration-200 hover:-translate-y-0.5' : ''}`}
          style={glassPanelStyle}>
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

          {/* Owner-side (poster): who is the agent? */}
          {mode === 'customer' && req.agent &&
            <div className="text-sm text-white mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Assigned to <span className="font-semibold">{req.agent.businessName || `${req.agent.firstName || ''} ${req.agent.lastName || ''}`.trim()}</span></span>
            </div>
          }
          {mode === 'customer' && req.status === 'pending' && !req.agent &&
            <p className="text-sm text-white/80 mb-3">No realtor has claimed this yet — they will be notified.</p>
          }

          {/* Realtor-side: action buttons */}
          {isRealtor && mode === 'available' && req.user &&
            <p className="text-xs text-white/80 mb-3">Posted by {req.user.firstName} {req.user.lastName}</p>
          }
          {isRealtor && mode !== 'customer' &&
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
            {isRealtor ? 'Opportunity' : 'Requested Tours'}
          </h3>
          <p className="text-white drop-shadow-md text-sm">
            {isRealtor
              ? 'Claim a showing posted by a customer, then mark it complete after the visit.'
              : 'Property tours you’ve requested — tap a card for full details.'}
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

            {/* Showings this realtor posted as an owner (they can't claim their own) */}
            {customerList.length > 0 &&
            <div>
              <h4 className="text-lg text-white font-semibold mb-3 flex items-center gap-2">
                <Building className="h-5 w-5" /> My Posted Showings
                <span className="text-sm text-white/80">({customerList.length})</span>
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {customerList.map((req) => renderCard(req, 'customer'))}
              </div>
            </div>
            }
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


  // ── Inbox tab: WhatsApp-style two-pane chat with an embedded quote panel ──
  const renderInbox = () => {
    const me = Number(currentUser?.id);

    // Contact list = everyone I have a quote with, then overlaid with real
    // conversations (which carry last-message text + unread counts).
    const byId = new Map();
    const upsert = (id, patch) => {
      const k = Number(id);
      if (!k || k === me) return;
      byId.set(k, { id: k, ...(byId.get(k) || {}), ...patch });
    };
    if (isBusinessRole) {
      incomingRequests.forEach((r) => { if (r.requesterId) upsert(r.requesterId, { name: r.name || 'Client' }); });
    } else {
      quoteRequests.forEach((q) => {
        if (q.providerId) upsert(q.providerId, { name: q.providerName || 'Provider' });
        (q.bids || []).forEach((b) => {
          const pid = b.providerId || b.provider?.id;
          const pname = b.provider?.businessName || `${b.provider?.firstName || ''} ${b.provider?.lastName || ''}`.trim();
          if (pid) upsert(pid, { name: pname || 'Provider' });
        });
      });
    }
    (conversations || []).forEach((c) => {
      const p = c.partner || {};
      const name = p.businessName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'User';
      upsert(p.id, { name, role: p.role, lastMessage: c.lastMessage?.content || '', lastTime: c.lastMessage?.createdAt, unread: c.unreadCount || 0 });
    });
    let contacts = Array.from(byId.values());
    if (inboxSearch.trim()) {
      const s = inboxSearch.trim().toLowerCase();
      contacts = contacts.filter((c) => (c.name || '').toLowerCase().includes(s));
    }
    contacts.sort((a, b) => (b.unread || 0) - (a.unread || 0) || (new Date(b.lastTime || 0) - new Date(a.lastTime || 0)));

    const peerId = inboxPeer?.id ? Number(inboxPeer.id) : null;
    const peerName = inboxPeer?.name || '';

    const thread = (threadMessages || []).filter((m) =>
      (Number(m.senderId) === me && Number(m.receiverId) === peerId) ||
      (Number(m.receiverId) === me && Number(m.senderId) === peerId)
    );

    // Quotes shared with the open peer → the embedded action panel.
    const peerQuotes = !peerId ? [] : (isBusinessRole
      ? incomingRequests
          .filter((r) => Number(r.requesterId) === peerId)
          .map((r) => ({ id: r.id, side: 'provider', data: r, category: r.category, status: r.status, budgetMin: r.budgetMin, budgetMax: r.budgetMax }))
      : quoteRequests
          .filter((q) => Number(q.providerId) === peerId || (q.bids || []).some((b) => Number(b.providerId || b.provider?.id) === peerId))
          .map((q) => ({ id: q.id, side: 'customer', data: q, category: q.category, status: q.status, budgetMin: q.budgetMin, budgetMax: q.budgetMax })));
    const activeQuote = peerQuotes.find((x) => x.id === inboxQuoteId) || peerQuotes[0] || null;

    return (
      <div className="animate-fadeIn">
        <div className="rounded-2xl overflow-hidden" style={glassPanelStyle}>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ height: '70vh' }}>
            {/* Left: contacts list */}
            <div className={`md:col-span-1 md:border-r border-white/15 flex-col min-h-0 ${peerId ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-3 border-b border-white/15">
                <div className="relative">
                  <Search className="h-4 w-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={inboxSearch}
                    onChange={(e) => setInboxSearch(e.target.value)}
                    placeholder="Search chats"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-coral-orange" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {contacts.length === 0
                  ? <p className="text-white/60 text-sm p-4 text-center">No conversations yet.</p>
                  : contacts.map((c) =>
                    <button
                      key={c.id}
                      onClick={() => { setInboxPeer(c); setInboxQuoteId(null); }}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-white/10 transition-colors ${peerId === c.id ? 'bg-white/15' : 'hover:bg-white/10'}`}>
                      <span className="h-10 w-10 rounded-full bg-coral-orange/80 text-black font-semibold flex items-center justify-center shrink-0">
                        {(c.name || 'U').charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-white font-medium truncate">{c.name}</span>
                          {c.lastTime && <span className="text-[10px] text-white/50 shrink-0">{new Date(c.lastTime).toLocaleDateString()}</span>}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-white/60 truncate">{c.lastMessage || 'Tap to chat'}</span>
                          {c.unread > 0 && <span className="text-[10px] font-bold bg-green-500 text-white rounded-full px-1.5 py-0.5 shrink-0">{c.unread}</span>}
                        </div>
                      </div>
                    </button>
                  )}
              </div>
            </div>

            {/* Right: active thread */}
            <div className={`md:col-span-2 flex-col min-h-0 ${peerId ? 'flex' : 'hidden md:flex'}`}>
              {!peerId ? (
                <div className="flex-1 flex items-center justify-center text-white/60 text-sm p-6 text-center">
                  Select a conversation to start chatting.
                </div>
              ) : (
                <>
                  {/* Thread header */}
                  <div className="p-3 border-b border-white/15 flex items-center gap-3">
                    <button onClick={() => setInboxPeer(null)} className="md:hidden p-1 text-white">
                      <ChevronDown className="h-5 w-5 rotate-90" />
                    </button>
                    <span className="h-9 w-9 rounded-full bg-coral-orange/80 text-black font-semibold flex items-center justify-center shrink-0">
                      {(peerName || 'U').charAt(0).toUpperCase()}
                    </span>
                    <span className="text-white font-semibold truncate">{peerName}</span>
                  </div>

                  {/* Embedded quote panel — hidden behind a "Quotes" toggle,
                      opens in place at the top of the thread. */}
                  {activeQuote &&
                    <div className="border-b border-white/15">
                      <button
                        onClick={() => setInboxQuotePanelOpen((v) => !v)}
                        className="w-full flex items-center justify-between px-4 py-2 text-white hover:bg-white/5 transition-colors">
                        <span className="flex items-center gap-2 font-medium">
                          <FileText className="h-4 w-4" /> Quotes
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${inboxQuotePanelOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {inboxQuotePanelOpen &&
                    <div className="px-4 py-3 bg-white/5">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-white/70 shrink-0" />
                          {peerQuotes.length > 1
                            ? <select
                                value={activeQuote.id}
                                onChange={(e) => setInboxQuoteId(Number(e.target.value))}
                                className="bg-white/10 border border-white/20 text-white text-sm rounded px-2 py-1 max-w-[220px]">
                                {peerQuotes.map((x) =>
                                  <option key={x.id} value={x.id} className="text-black">{(x.category || 'Quote')} · {statusLabel(x.status)}</option>
                                )}
                              </select>
                            : <span className="text-white font-medium truncate">{activeQuote.category || 'Quote'}</span>}
                        </div>
                        <span className="text-xs text-white/70 shrink-0">
                          {(activeQuote.budgetMin || activeQuote.budgetMax) ? `$${activeQuote.budgetMin || 0}${activeQuote.budgetMax ? ` - $${activeQuote.budgetMax}` : '+'}` : statusLabel(activeQuote.status)}
                        </span>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        {activeQuote.side === 'provider'
                          ? renderProviderActions(activeQuote.data)
                          : renderCustomerQuoteActions(activeQuote.data)}
                      </div>
                    </div>
                      }
                    </div>
                  }

                  {/* Message bubbles */}
                  <div ref={inboxScrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                    {messagesLoading && thread.length === 0
                      ? <p className="text-center text-white/60 text-sm py-6">Loading…</p>
                      : thread.length === 0
                      ? <p className="text-center text-white/60 text-sm py-6">No messages yet. Say hello 👋</p>
                      : thread.map((m) => {
                          const mine = Number(m.senderId) === me;
                          return (
                            <div key={m.id} className={`max-w-[78%] px-3 py-2 rounded-2xl ${mine ? 'ml-auto bg-sky-blue text-white rounded-br-sm' : 'mr-auto bg-white/15 text-white rounded-bl-sm'}`}>
                              <div className="whitespace-pre-wrap break-words text-sm">{m.content}</div>
                              <div className="text-[10px] text-white/60 mt-0.5 text-right">
                                {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </div>
                            </div>);
                        })}
                  </div>

                  {/* Composer */}
                  <form onSubmit={handleInboxSend} className="p-3 border-t border-white/15 flex items-center gap-2">
                    <input
                      value={inboxDraft}
                      onChange={(e) => setInboxDraft(e.target.value)}
                      placeholder="Type a message…"
                      disabled={inboxSending}
                      className="flex-1 min-w-0 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-coral-orange disabled:opacity-60" />
                    <button
                      type="submit"
                      disabled={!inboxDraft.trim() || inboxSending}
                      className="shrink-0 h-10 w-10 rounded-full bg-coral-orange text-black flex items-center justify-center hover:bg-coral-orange/90 transition-colors disabled:opacity-50">
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>);
  };


  // Admins have their own dedicated /admin route — bounce them there.
  if (currentUser?.role === 'admin') {
    navigate('/admin');
    return null;
  }

  return (
    <div
      className="profile-page px-4 min-h-screen"
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
        <div className="profile-page-head mb-8">
          <h1 className="text-3xl text-white drop-shadow-lg mb-2">{view === 'settings' ? 'Settings' : view === 'profile' ? 'My Profile' : 'Dashboard'}</h1>
          <p className="text-white drop-shadow-md">
            {view === 'settings'
              ? 'Manage your service location, password and notification preferences'
              : view === 'profile'
              ? 'View and edit your personal and business details'
              : 'Manage your account and track your projects'}
          </p>
        </div>

        {/* Navigation Tabs — dashboard view only */}
        {view === 'dashboard' &&
        <div
          className="profile-tabs-card rounded-2xl shadow-lg mb-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          
          <div className="profile-tabs flex border-b border-white/30">
            {dashboardTabs.
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
        }

        {/* Tab Content — dashboard view only */}
        {view === 'dashboard' && <>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'projects' && renderProjects()}
        {activeTab === 'favorites' && renderFavorites()}
        {activeTab === 'quotes' && renderQuotes()}
        {activeTab === 'requests' && renderIncomingRequests()}
        {activeTab === 'showings' && renderShowings()}
        {activeTab === 'inbox' && renderInbox()}
        </>
        }

        {/* My Profile page: profile information + business details (its own page) */}
        {view === 'profile' &&
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
            
              <div className="profile-head-row flex items-center justify-between mb-6">
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
                <div className="profile-head-row flex items-center justify-between mb-6">
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

                {/* Profile Photo — uploads immediately to /api/profile/photo. */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/15">
                  <div className="relative shrink-0">
                    {profilePhotoUrl ?
                      <img
                        src={profilePhotoUrl}
                        alt="Profile"
                        className="h-20 w-20 rounded-full object-cover border-2 border-white/30" /> :
                      <div className="h-20 w-20 rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center">
                        <Camera className="h-6 w-6 text-white/70" />
                      </div>
                    }
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2 drop-shadow-md text-sm">Profile Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      id="business-photo-upload"
                      className="hidden"
                      onChange={handlePhotoUpload} />
                    <label
                      htmlFor="business-photo-upload"
                      className={`inline-flex items-center gap-2 px-4 py-2 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 transition-all duration-300 font-semibold shadow-lg cursor-pointer ${photoUploading ? 'opacity-60 pointer-events-none' : ''}`}>
                      {photoUploading
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Camera className="h-4 w-4" />}
                      <span>{photoUploading ? 'Uploading…' : 'Upload Photo'}</span>
                    </label>
                    <p className="text-xs text-white/70 mt-2">Shown on your public profile and in search results.</p>
                  </div>
                </div>

                {/* Availability — Standard Working Hours + Block Calendar. Saved
                    independently of the Edit Business form. */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-white/15">
                  {/* Standard Working Hours */}
                  <div className="rounded-xl p-4 bg-white/5 border border-white/15">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-white/80" />
                      <span className="text-white font-medium text-sm">Standard Working Hours</span>
                    </div>
                    <p className="text-xs text-white/70 mb-3">
                      {WORKING_DAYS.filter((d) => !workingHours[d.key]?.closed).length} day(s) open per week.
                    </p>
                    <div className="space-y-1 mb-3">
                      {WORKING_DAYS.map((d) =>
                        <div key={d.key} className="flex justify-between text-xs text-white/80">
                          <span>{d.label}</span>
                          <span>
                            {workingHours[d.key]?.closed
                              ? <span className="text-white/50">Closed</span>
                              : `${workingHours[d.key]?.open || '—'} – ${workingHours[d.key]?.close || '—'}`}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setShowWorkingHoursModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 transition-all duration-300 font-semibold text-sm">
                      <Clock className="h-4 w-4" />
                      Set Working Hours
                    </button>
                  </div>

                  {/* Block Calendar */}
                  <div className="rounded-xl p-4 bg-white/5 border border-white/15">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarOff className="h-4 w-4 text-white/80" />
                      <span className="text-white font-medium text-sm">Block Calendar</span>
                    </div>
                    <p className="text-xs text-white/70 mb-3">
                      Hide your profile from search during this window. You reappear automatically once it ends.
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-white/80 text-xs mb-1">From</label>
                        <input
                          type="datetime-local"
                          value={blockFrom}
                          onChange={(e) => setBlockFrom(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-white/30 bg-white/10 text-white rounded focus:outline-none focus:border-white/60 text-sm" />
                      </div>
                      <div>
                        <label className="block text-white/80 text-xs mb-1">To</label>
                        <input
                          type="datetime-local"
                          value={blockUntil}
                          onChange={(e) => setBlockUntil(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-white/30 bg-white/10 text-white rounded focus:outline-none focus:border-white/60 text-sm" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveBlockCalendar}
                          disabled={availabilitySaving}
                          className="px-4 py-2 bg-coral-orange text-black rounded-xl hover:bg-coral-orange/90 transition-all duration-300 font-semibold text-sm disabled:opacity-60">
                          {availabilitySaving ? 'Saving…' : 'Save Block'}
                        </button>
                        {(blockFrom || blockUntil) &&
                          <button
                            onClick={() => { setBlockFrom(''); setBlockUntil(''); }}
                            className="px-4 py-2 border-2 border-white/30 text-white rounded-xl hover:bg-white/20 transition-all duration-300 text-sm">
                            Clear
                          </button>
                        }
                      </div>
                    </div>
                  </div>
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
                        {roleServiceTypes.map((t) =>
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

                  {/* Specialties (comma-separated) */}
                  <div>
                    <label className="block text-white font-medium mb-2 drop-shadow-md text-sm">
                      Specialties
                    </label>
                    {isEditingBusiness ?
                      <>
                        <input
                          type="text"
                          name="specialties"
                          value={profileData.specialties}
                          onChange={handleInputChange}
                          placeholder="e.g. Leak Repair, Pipe Installation"
                          className="w-full px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60" />
                        <p className="text-xs text-white/60 mt-1">Separate each specialty with a comma.</p>
                      </> :
                      <p className="text-white drop-shadow-md">
                        {profileData.specialties || <span className="text-white/60 italic">Not set</span>}
                      </p>
                    }
                  </div>

                  {/* Response Time */}
                  <div>
                    <label className="block text-white font-medium mb-2 drop-shadow-md text-sm">
                      Response Time
                    </label>
                    {isEditingBusiness ?
                      <select
                        name="responseTime"
                        value={profileData.responseTime || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white rounded focus:outline-none focus:border-white/60">
                        <option value="" className="text-slate-900">— Select —</option>
                        <option value="Within 1 hour" className="text-slate-900">Within 1 hour</option>
                        <option value="Within a few hours" className="text-slate-900">Within a few hours</option>
                        <option value="Within a day" className="text-slate-900">Within a day</option>
                        <option value="Within 2 days" className="text-slate-900">Within 2 days</option>
                      </select> :
                      <p className="text-white drop-shadow-md">
                        {profileData.responseTime || <span className="text-white/60 italic">Not set</span>}
                      </p>
                    }
                  </div>

                  {/* Years of Experience */}
                  <div>
                    <label className="block text-white font-medium mb-2 drop-shadow-md text-sm">
                      Years of Experience
                    </label>
                    {isEditingBusiness ?
                      <input
                        type="number"
                        min="0"
                        name="yearsOfExperience"
                        value={profileData.yearsOfExperience}
                        onChange={handleInputChange}
                        placeholder="e.g. 5"
                        className="w-full px-3 py-2 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded focus:outline-none focus:border-white/60" /> :
                      <p className="text-white drop-shadow-md">
                        {(profileData.yearsOfExperience !== '' && profileData.yearsOfExperience != null)
                          ? `${profileData.yearsOfExperience} year${Number(profileData.yearsOfExperience) === 1 ? '' : 's'}`
                          : <span className="text-white/60 italic">Not set</span>}
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
        </div>
        }

        {/* Settings page: service location + change password + notifications */}
        {view === 'settings' &&
        <div className="space-y-8 animate-fadeIn">
            {/* Service Location — provider/realtor only. Powers the "providers
                within N km" search on the public Find Providers page. */}
            {isBusinessRole &&
              <div
                className="rounded-2xl shadow-lg p-8 relative overflow-hidden mt-8"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                  <div>
                    <h3 className="text-xl text-white drop-shadow-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" /> Service Location
                    </h3>
                    <p className="text-white/80 text-sm drop-shadow-md mt-1 max-w-xl">
                      Used to show your profile to nearby customers when they search by radius.
                      We pick this up automatically when you save your address — or click below to set it from your device's GPS.
                    </p>
                  </div>
                  <button
                    onClick={handleUseGPSLocation}
                    disabled={gpsBusy || updateProfileLoading}
                    className="px-4 py-2 bg-coral-orange text-black rounded-xl hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
                    {gpsBusy
                      ? <Loader2 className="h-5 w-5 animate-spin" />
                      : <LocateFixed className="h-5 w-5" />}
                    <span>{gpsBusy ? 'Locating…' : 'Use my current location'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/15">
                  <div>
                    <div className="text-xs text-white/70 mb-1">Latitude</div>
                    <div className="text-white font-mono">
                      {profileData.latitude != null && profileData.latitude !== ''
                        ? Number(profileData.latitude).toFixed(6)
                        : <span className="text-yellow-300">Not set</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/70 mb-1">Longitude</div>
                    <div className="text-white font-mono">
                      {profileData.longitude != null && profileData.longitude !== ''
                        ? Number(profileData.longitude).toFixed(6)
                        : <span className="text-yellow-300">Not set</span>}
                    </div>
                  </div>
                </div>

                {(profileData.latitude == null || profileData.longitude == null) &&
                  <div className="mt-4 p-3 rounded-lg bg-yellow-500/20 border border-yellow-400/50">
                    <p className="text-sm text-white drop-shadow-md">
                      <span className="text-yellow-300 mr-1">⚠</span>
                      Your location is not set yet — you won't appear in radius-based searches.
                      Click <span className="font-semibold">"Use my current location"</span> or save your address above.
                    </p>
                  </div>
                }
              </div>
            }

            {/* Change Password + Notification Settings — side by side on large screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 items-start">
            {/* Change Password */}
            <div
            className="rounded-2xl shadow-lg p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>

              <div className="flex items-center gap-3 mb-2">
                <Lock className="h-5 w-5 text-white" />
                <h3 className="text-xl text-white drop-shadow-lg">Change Password</h3>
              </div>
              <p className="text-white/80 text-sm drop-shadow-md mb-6">
                Enter your current password and choose a new one.
              </p>

              <form onSubmit={handleChangePasswordSubmit} className="space-y-6 max-w-md">
                {/* Current Password */}
                <div>
                  <label htmlFor="settings-current-password" className="block text-sm font-medium text-white mb-2 drop-shadow-md">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white pointer-events-none" />
                    <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="settings-current-password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    placeholder="Enter your current password"
                    className={`w-full pl-12 pr-12 py-3 rounded-md border-2 ${
                    passwordErrors.currentPassword ?
                    'border-coral-orange focus:border-coral-orange' :
                    'border-white/30 focus:border-white/60'} bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 focus:outline-none transition-colors`} />

                    <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-white/80 transition-colors">

                      {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword &&
                  <p className="mt-2 text-sm text-coral-orange drop-shadow-md">{passwordErrors.currentPassword}</p>
                  }
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="settings-new-password" className="block text-sm font-medium text-white mb-2 drop-shadow-md">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white pointer-events-none" />
                    <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="settings-new-password"
                    value={passwordForm.password}
                    onChange={(e) => handlePasswordChange('password', e.target.value)}
                    placeholder="Enter your new password"
                    className={`w-full pl-12 pr-12 py-3 rounded-md border-2 ${
                    passwordErrors.password ?
                    'border-coral-orange focus:border-coral-orange' :
                    'border-white/30 focus:border-white/60'} bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 focus:outline-none transition-colors`} />

                    <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-white/80 transition-colors">

                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {passwordErrors.password &&
                  <p className="mt-2 text-sm text-coral-orange drop-shadow-md">{passwordErrors.password}</p>
                  }
                </div>

                {/* Confirm New Password */}
                <div>
                  <label htmlFor="settings-confirm-password" className="block text-sm font-medium text-white mb-2 drop-shadow-md">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white pointer-events-none" />
                    <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="settings-confirm-password"
                    value={passwordForm.passwordConfirmation}
                    onChange={(e) => handlePasswordChange('passwordConfirmation', e.target.value)}
                    placeholder="Confirm your new password"
                    className={`w-full pl-12 pr-12 py-3 rounded-md border-2 ${
                    passwordErrors.passwordConfirmation ?
                    'border-coral-orange focus:border-coral-orange' :
                    'border-white/30 focus:border-white/60'} bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 focus:outline-none transition-colors`} />

                    <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-white/80 transition-colors">

                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {passwordErrors.passwordConfirmation &&
                  <p className="mt-2 text-sm text-coral-orange drop-shadow-md">{passwordErrors.passwordConfirmation}</p>
                  }
                </div>

                <div className="flex justify-start pt-2">
                  <button
                    type="submit"
                    disabled={changePasswordLoading}
                    className="px-6 py-3 bg-coral-orange text-black rounded-xl hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">

                    {changePasswordLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                    {changePasswordLoading ? 'Changing Password...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>

            {/* Notification Settings */}
            <div
            className="rounded-2xl shadow-lg p-8 relative overflow-hidden"
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
          </div>
        }
      </div>

      {/* Quote Request Modal */}
      <QuoteRequestModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        onSubmit={handleQuoteSubmit}
        categoryOptions={roleServiceTypes.map((t) => t.name).filter(Boolean)}
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

      {/* Set Working Hours modal (business roles) */}
      {showWorkingHoursModal &&
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowWorkingHoursModal(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ background: 'linear-gradient(135deg, rgba(0,69,113,0.98), rgba(0,22,36,0.98))', border: '1px solid rgba(255,255,255,0.25)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-white font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5" /> Standard Working Hours
              </h3>
              <button onClick={() => setShowWorkingHoursModal(false)} className="p-1 rounded hover:bg-white/10">
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
            <div className="space-y-3">
              {WORKING_DAYS.map((d) => {
                const day = workingHours[d.key] || { closed: false, open: '09:00', close: '17:00' };
                return (
                  <div key={d.key} className="flex items-center gap-3 flex-wrap">
                    <span className="w-24 text-white text-sm">{d.label}</span>
                    <label className="flex items-center gap-1 text-xs text-white/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!day.closed}
                        onChange={(e) => setWorkingHours((prev) => ({ ...prev, [d.key]: { ...prev[d.key], closed: e.target.checked } }))} />
                      Closed
                    </label>
                    <input
                      type="time"
                      value={day.open || '09:00'}
                      disabled={day.closed}
                      onChange={(e) => setWorkingHours((prev) => ({ ...prev, [d.key]: { ...prev[d.key], open: e.target.value } }))}
                      className="px-2 py-1 border border-white/30 bg-white/10 text-white rounded text-sm disabled:opacity-40" />
                    <span className="text-white/60">–</span>
                    <input
                      type="time"
                      value={day.close || '17:00'}
                      disabled={day.closed}
                      onChange={(e) => setWorkingHours((prev) => ({ ...prev, [d.key]: { ...prev[d.key], close: e.target.value } }))}
                      className="px-2 py-1 border border-white/30 bg-white/10 text-white rounded text-sm disabled:opacity-40" />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowWorkingHoursModal(false)}
                className="px-4 py-2 border-2 border-white/30 text-white rounded-xl hover:bg-white/20 transition-all">
                Cancel
              </button>
              <button
                onClick={handleSaveWorkingHours}
                disabled={updateProfileLoading}
                className="px-4 py-2 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 transition-all font-semibold disabled:opacity-60">
                {updateProfileLoading ? 'Saving…' : 'Save Working Hours'}
              </button>
            </div>
          </div>
        </div>
      }

      {/* Project / portfolio details modal (opened by clicking a project card).
          Business roles can flip it into an inline editor to curate what shows
          on their public provider profile. */}
      {detailProject && (() => {
        const closeModal = () => { setDetailProject(null); setProjectEditMode(false); setProjectForm(null); };
        const inputCls = 'w-full px-3 py-2 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-coral-orange';
        const setField = (k, v) => setProjectForm((prev) => ({ ...prev, [k]: v }));
        return (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={closeModal}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ background: 'linear-gradient(135deg, rgba(0,69,113,0.98), rgba(0,22,36,0.98))', border: '1px solid rgba(255,255,255,0.25)' }}>
            <div className="flex items-start justify-between mb-5 gap-4">
              {projectEditMode
                ? <h3 className="text-xl text-white font-semibold">Edit Portfolio Item</h3>
                : <h3 className="text-xl text-white font-semibold">{detailProject.title}</h3>}
              <button onClick={closeModal} className="p-1 rounded hover:bg-white/10 shrink-0">
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {projectEditMode ? (
              /* ── Edit mode (provider / realtor) ── */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Title</label>
                  <input className={inputCls} value={projectForm?.title || ''}
                    onChange={(e) => setField('title', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Category</label>
                  <select className={inputCls} value={projectForm?.category || ''}
                    onChange={(e) => setField('category', e.target.value)}>
                    <option value="" className="text-black">Select a category</option>
                    {projectForm?.category && !roleServiceTypes.some((t) => t.name === projectForm.category) &&
                      <option value={projectForm.category} className="text-black">{projectForm.category}</option>
                    }
                    {roleServiceTypes.map((t) =>
                      <option key={t.id} value={t.name} className="text-black">{t.name}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Description</label>
                  <textarea rows={4} className={inputCls} value={projectForm?.description || ''}
                    onChange={(e) => setField('description', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Budget min ($)</label>
                    <input type="number" className={inputCls} value={projectForm?.budgetMin ?? ''}
                      onChange={(e) => setField('budgetMin', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Budget max ($)</label>
                    <input type="number" className={inputCls} value={projectForm?.budgetMax ?? ''}
                      onChange={(e) => setField('budgetMax', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Status</label>
                  <select className={inputCls} value={projectForm?.status || 'completed'}
                    onChange={(e) => setField('status', e.target.value)}>
                    <option value="completed" className="text-black">Completed</option>
                    <option value="in_progress" className="text-black">In Progress</option>
                    <option value="open" className="text-black">Draft</option>
                    <option value="cancelled" className="text-black">Cancelled</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => { setProjectEditMode(false); setProjectForm(null); }}
                    className="px-4 py-2 border border-white/30 text-white rounded-xl hover:bg-white/10 transition-all font-medium">
                    Cancel
                  </button>
                  <button onClick={handleSaveProject} disabled={updateProjectLoading}
                    className="px-4 py-2 bg-coral-orange text-black rounded-xl hover:bg-coral-orange/90 transition-all font-semibold disabled:opacity-60">
                    {updateProjectLoading ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              /* ── View mode ── */
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {detailProject.provider &&
                    <span className="px-3 py-1 rounded-full text-xs bg-sky-blue/20 border border-sky-blue/30 text-white">{detailProject.provider}</span>
                  }
                  <span className={`px-3 py-1 rounded-full text-xs border ${
                    detailProject.status === 'Completed' ? 'bg-green-500/20 text-green-200 border-green-500/30' :
                    detailProject.status === 'In Progress' ? 'bg-blue-500/20 text-blue-200 border-blue-500/30' :
                    'bg-orange-500/20 text-orange-200 border-orange-500/30'}`}>
                    {detailProject.status}
                  </span>
                </div>

                {detailProject.photos && detailProject.photos.length > 0 &&
                  <div className="flex flex-wrap gap-2 mb-4">
                    {detailProject.photos.map((p, i) =>
                      <img key={i} src={p} alt={`Photo ${i + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border border-white/20" />
                    )}
                  </div>
                }

                {detailProject.description &&
                  <p className="text-sm text-white/90 leading-relaxed mb-4">{detailProject.description}</p>
                }

                <div className="space-y-3 text-white/90 text-sm border-t border-white/15 pt-4">
                  {detailProject.location &&
                    <div className="flex justify-between">
                      <span className="text-white/60">Location</span>
                      <span>{detailProject.location}</span>
                    </div>
                  }
                  <div className="flex justify-between">
                    <span className="text-white/60">Created</span>
                    <span>{detailProject.date ? new Date(detailProject.date).toLocaleDateString() : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Budget</span>
                    <span>{detailProject.cost}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 mt-6">
                  {isBusinessRole
                    ? <button
                        onClick={() => setRemovePortfolioTarget({ project: { id: detailProject.id, title: detailProject.title } })}
                        className="px-4 py-2 rounded-xl bg-red-400/20 text-red-300 border border-red-400/40 text-sm font-semibold hover:bg-red-400/30 transition-all">
                        Remove from Portfolio
                      </button>
                    : <span />}
                  <div className="flex gap-3">
                    {isBusinessRole &&
                      <button
                        onClick={startEditProject}
                        className="px-4 py-2 bg-coral-orange text-black rounded-xl hover:bg-coral-orange/90 transition-all font-semibold flex items-center gap-2">
                        <Edit3 className="h-4 w-4" /> Edit
                      </button>
                    }
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 transition-all font-semibold">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>);
      })()}

      {/* Requested-tour details modal (opened by clicking a customer showing card) */}
      {detailShowing &&
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setDetailShowing(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ background: 'linear-gradient(135deg, rgba(0,69,113,0.98), rgba(0,22,36,0.98))', border: '1px solid rgba(255,255,255,0.25)' }}>
            <div className="flex items-start justify-between mb-4 gap-4">
              <h3 className="text-xl text-white font-semibold">{detailShowing.title || detailShowing.address}</h3>
              <button onClick={() => setDetailShowing(null)} className="p-1 rounded hover:bg-white/10 shrink-0">
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs border capitalize ${(SHOW_STATUS[detailShowing.status] || SHOW_STATUS.pending).cls}`}>
                {(SHOW_STATUS[detailShowing.status] || SHOW_STATUS.pending).label}
              </span>
            </div>
            {Array.isArray(detailShowing.photos) && detailShowing.photos.length > 0 &&
              <div className="flex flex-wrap gap-2 mb-4">
                {detailShowing.photos.map((p, i) =>
                  <img key={i} src={p} alt={`Photo ${i + 1}`} className="w-24 h-24 object-cover rounded-lg border border-white/20" />
                )}
              </div>
            }
            {detailShowing.description &&
              <p className="text-sm text-white/90 leading-relaxed mb-4">{detailShowing.description}</p>
            }
            <div className="space-y-3 text-white/90 text-sm border-t border-white/15 pt-4">
              <div className="flex justify-between gap-4">
                <span className="text-white/60">Address</span>
                <span className="text-right">{detailShowing.address || '—'}</span>
              </div>
              {detailShowing.payoutPerHour &&
                <div className="flex justify-between">
                  <span className="text-white/60">Payout</span>
                  <span>${Number(detailShowing.payoutPerHour).toFixed(2)}/hr</span>
                </div>
              }
              {detailShowing.preferredDate &&
                <div className="flex justify-between gap-4">
                  <span className="text-white/60">Preferred date</span>
                  <span className="text-right">
                    {new Date(detailShowing.preferredDate).toLocaleDateString()}
                    {detailShowing.preferredDateTo ? ` → ${new Date(detailShowing.preferredDateTo).toLocaleDateString()}` : ''}
                  </span>
                </div>
              }
              <div className="flex justify-between gap-4">
                <span className="text-white/60">Assigned realtor</span>
                <span className="text-right">
                  {detailShowing.agent
                    ? (detailShowing.agent.businessName || `${detailShowing.agent.firstName || ''} ${detailShowing.agent.lastName || ''}`.trim())
                    : 'Not yet claimed'}
                </span>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setDetailShowing(null)}
                className="px-4 py-2 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 transition-all font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      }

      {/* Confirm removal from portfolio */}
      {removePortfolioTarget &&
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => !removeProjectLoading && setRemovePortfolioTarget(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl shadow-2xl p-6"
            style={{ background: 'linear-gradient(135deg, rgba(0,69,113,0.98), rgba(0,22,36,0.98))', border: '1px solid rgba(255,255,255,0.25)' }}>
            <h3 className="text-lg text-white font-semibold mb-2">Remove from portfolio?</h3>
            <p className="text-sm text-white/80 mb-6">
              “{removePortfolioTarget.project?.title}” will be removed from your public portfolio. You can add it again later.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRemovePortfolioTarget(null)}
                disabled={removeProjectLoading}
                className="px-4 py-2 border border-white/30 text-white rounded-xl hover:bg-white/10 transition-all font-medium disabled:opacity-60">
                Cancel
              </button>
              <button
                onClick={handleConfirmRemovePortfolio}
                disabled={removeProjectLoading}
                className="px-4 py-2 rounded-xl bg-red-500/90 text-white hover:bg-red-500 transition-all font-semibold disabled:opacity-60">
                {removeProjectLoading ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      }

    </div>);

}