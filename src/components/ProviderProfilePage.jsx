import React, { useState, useEffect } from 'react';
import { Star, MapPin, MessageSquare, Calendar, Camera, ThumbsUp, DollarSign, Clock, Shield } from 'lucide-react';
import { MessagingModal } from './MessagingModal';
import { GlassmorphicButton } from './GlassmorphicButton';
import { CoralOrangeButton } from './CoralOrangeButton';
import { QuoteRequestModal } from './QuoteRequestModal';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { currentUserStorage } from '../utils/localStorage';
import {
  fetchProviderDetailStart,
  fetchReviewsStart,
  fetchProjectsStart,
  createQuoteStart,
  resetCreateQuoteFlag
} from '../Store/Features/Authentication/authslice';

export function ProviderProfilePage({ navigate }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteDefaults, setQuoteDefaults] = useState({ category: '', description: '', location: '', budgetMin: '', budgetMax: '' });
  const [quoteCategories, setQuoteCategories] = useState([]);

  const dispatch = useDispatch();
  const currentUser = currentUserStorage.get();
  // The provider to display is set by the listing page before navigation.
  const providerId = typeof window !== 'undefined' ? localStorage.getItem('selectedProviderId') : null;

  const providerDetail = useSelector((state) => state.AuthReducer.providerDetail);
  const apiReviews = useSelector((state) => state.AuthReducer.reviews);
  const apiProjects = useSelector((state) => state.AuthReducer.projects);
  const createQuoteSuccess = useSelector((state) => state.AuthReducer.createQuoteSuccess);
  const createQuoteError = useSelector((state) => state.AuthReducer.createQuoteError);

  // Load this provider, their reviews and their portfolio from the API.
  useEffect(() => {
    if (providerId) {
      dispatch(fetchProviderDetailStart(providerId));
      dispatch(fetchReviewsStart({ providerId }));
      dispatch(fetchProjectsStart({ userId: providerId }));
    }
  }, [dispatch, providerId]);

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

  // Inject phone-only responsive tweaks (laptops/desktops never match this).
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 767px) {
        /* Tighter tab padding so all four labels fit on a phone */
        .pp-tabs > button {
          padding-left: 0.5rem;
          padding-right: 0.5rem;
          font-size: 0.875rem;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Map the API provider record into the shape this page renders.
  const p = providerDetail || {};
  const providerData = {
    id: p.id,
    name: p.businessName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Provider',
    category: p.serviceType?.name || (p.role === 'realtor' ? 'Realtor' : 'Service Provider'),
    rating: Number(p.averageRating) || 0,
    reviewCount: p.reviewCount || 0,
    location: [p.city, p.state].filter(Boolean).join(', ') || 'Location not set',
    phone: p.phone || '—',
    email: p.email || '—',
    website: '—',
    verified: p.isActive !== false && !!p.id,
    yearsInBusiness: p.createdAt
      ? Math.max(1, new Date().getFullYear() - new Date(p.createdAt).getFullYear())
      : 1,
    completedJobs: p.completedJobs || 0,
    employeeCount: '—',
    licenseNumber: p.licenseNumber || 'NA',
    insuranceProvider: '—',
    // Real trust indicators from the backend, with graceful fallbacks.
    profilePhoto: p.profilePhoto || null,
    responseTime: p.responseTime || 'Contact for availability',
    yearsOfExperience: p.yearsOfExperience != null ? Number(p.yearsOfExperience) : null,
    badges: Array.isArray(p.badges) ? p.badges : [],
    specialties: Array.isArray(p.specialties) && p.specialties.length
      ? p.specialties
      : (p.serviceType?.name ? [p.serviceType.name] : []),
    description: p.businessDesc || 'No description provided.',
    serviceAreas: [p.city, p.state].filter(Boolean),
    pricing: {
      startingPrice: 'Contact for pricing',
      hourlyRate: 'Contact',
      consultationFee: 'Contact'
    },
    availability: p.isActive !== false ? 'Available' : 'Unavailable',
    certifications: (Array.isArray(p.badges) && p.badges.length)
      ? p.badges
      : (p.id ? ['Verified Account'] : [])
  };

  const handleQuoteSubmit = (data) => {
    if (!currentUser?.id) {
      toast.error('Please sign in to request a quote.');
      navigate('/login');
      return;
    }
    const fd = new FormData();
    fd.append('userId', currentUser.id);
    if (providerData.id) fd.append('providerId', providerData.id);
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

  const openQuoteModal = (categoryText, service) => {
    const budgetMinParsed = providerData.pricing?.startingPrice ?
    providerData.pricing.startingPrice.replace(/[^0-9.]/g, '') :
    '';
    const categories = service?.name ? [service.name] : providerData.services?.map((s) => s.name) || [providerData.category];
    setQuoteDefaults({
      category: categoryText || providerData.category,
      description: `Requesting quote from ${providerData.name}${categoryText ? ` - ${categoryText}` : ''}${service?.description ? ` • ${service.description}` : ''}`,
      location: providerData.location,
      budgetMin: service?.startingPrice ? service.startingPrice.replace(/[^0-9.]/g, '') : budgetMinParsed || '',
      budgetMax: ''
    });
    setQuoteCategories(categories);
    setShowQuoteModal(true);
  };

  // Portfolio = the provider's project records (/projects?userId=).
  const portfolioImages = (apiProjects || []).map((pr) => ({
    id: pr.id,
    title: pr.title,
    category: pr.category || 'Project',
    description: pr.description || '',
    projectCost: pr.budgetMin ? `$${pr.budgetMin}` : '—',
    duration: pr.timeline || '—',
    photos: Array.isArray(pr.photos) ? pr.photos : []
  }));


  // Reviews come from the API (/reviews?providerId=).
  const reviews = (apiReviews || []).map((r) => ({
    id: r.id,
    customerName: r.reviewer
      ? `${r.reviewer.firstName || ''} ${r.reviewer.lastName || ''}`.trim() || 'Customer'
      : 'Customer',
    rating: r.rating,
    date: r.createdAt,
    project: r.title || 'Service',
    review: r.comment || '',
    helpful: 0
  }));


  // The provider's service type from the API drives the Services tab.
  const services = providerDetail?.serviceType
    ? [{
        name: providerDetail.serviceType.name,
        description: providerDetail.businessDesc || 'Professional services offered.',
        startingPrice: 'Contact for pricing',
        duration: 'Varies'
      }]
    : [];


  const renderOverview = () =>
  <div className="space-y-8">
      {/* Provider Details */}
      <div
      className="rounded-2xl shadow-lg p-8 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}>
      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Basic Info */}
          <div className="text-center lg:text-left">
            {providerData.profilePhoto ?
            <img
              src={providerData.profilePhoto}
              alt={providerData.name}
              className="h-32 w-32 rounded-full object-cover border-2 border-white/40 mx-auto lg:mx-0 mb-4"
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }} /> :
            null}
            <div
              className="h-32 w-32 rounded-full bg-sky-blue items-center justify-center text-white text-4xl font-bold mx-auto lg:mx-0 mb-4"
              style={{ display: providerData.profilePhoto ? 'none' : 'flex' }}>
              {providerData.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <h3 className="text-xl text-white mb-2 drop-shadow-md">{providerData.name}</h3>
            <p className="text-white mb-3 drop-shadow-md">{providerData.category}</p>
            <div className="flex items-center justify-center lg:justify-start space-x-1 mb-4">
              <Star className="h-5 w-5 text-coral-orange fill-coral-orange" />
              <span className="text-white font-medium drop-shadow-md">{providerData.rating}</span>
              <span className="text-white drop-shadow-md">({providerData.reviewCount} reviews)</span>
            </div>
            {/* Trust badges (falls back to a Verified pill when none provided) */}
            {(providerData.badges.length > 0 || providerData.verified) &&
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
              {(providerData.badges.length > 0 ? providerData.badges : ['Verified']).map((badge, index) =>
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white bg-white/20 backdrop-blur-sm border border-white/30">
                <Shield className="h-3 w-3" />
                {badge}
              </span>
              )}
            </div>
            }
          </div>

          {/* Contact & Location */}
          <div>
            <h4 className="text-white font-medium mb-4 drop-shadow-md">Contact Information</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-white" />
                <span className="text-white drop-shadow-md">{providerData.location}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-white" />
                <span className="text-white drop-shadow-md">Response time: {providerData.responseTime}</span>
              </div>
              <button
              onClick={() => setShowMessagingModal(true)}
              className="w-full mt-4 py-2 px-4 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 font-semibold cursor-pointer">
              
                <MessageSquare className="h-4 w-4" />
                <span>Send Message</span>
              </button>
            </div>
          </div>

          {/* Business Stats */}
          <div>
            <h4 className="text-white font-medium mb-4 drop-shadow-md">Business Information</h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-white drop-shadow-md">{providerData.yearsOfExperience != null ? 'Years of Experience:' : 'Years in Business:'}</span>
                <p className="text-white drop-shadow-md">{providerData.yearsOfExperience != null ? providerData.yearsOfExperience : providerData.yearsInBusiness} years</p>
              </div>
              <div>
                <span className="text-sm text-white drop-shadow-md">Projects Completed:</span>
                <p className="text-white drop-shadow-md">{providerData.completedJobs}</p>
              </div>
              <div>
                <span className="text-sm text-white drop-shadow-md">Team Size:</span>
                <p className="text-white drop-shadow-md">{providerData.employeeCount} employees</p>
              </div>
              <div>
                <span className="text-sm text-white drop-shadow-md">License:</span>
                <p className="text-white drop-shadow-md">{providerData.licenseNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8">
          <h4 className="text-white font-medium mb-4 drop-shadow-md">About Our Business</h4>
          <p className="text-white leading-relaxed drop-shadow-md">{providerData.description}</p>
        </div>

        {/* Specialties */}
        <div className="mt-6">
          <h4 className="text-white font-medium mb-4 drop-shadow-md">Specialties</h4>
          <div className="flex flex-wrap gap-2">
            {providerData.specialties.map((specialty, index) =>
          <span key={index} className="px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full text-sm font-medium">
                {specialty}
              </span>
          )}
          </div>
        </div>

        {/* Service Areas */}
        <div className="mt-6">
          <h4 className="text-white font-medium mb-4 drop-shadow-md">Service Areas</h4>
          <div className="flex flex-wrap gap-2">
            {providerData.serviceAreas.map((area, index) =>
          <span key={index} className="px-3 py-1 bg-green-500/20 backdrop-blur-sm border border-green-500/30 text-white rounded-full text-sm font-medium">
                {area}
              </span>
          )}
          </div>
        </div>

        {/* Certifications */}
        <div className="mt-6">
          <h4 className="text-white font-medium mb-4 drop-shadow-md">Certifications & Credentials</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {providerData.certifications.map((cert, index) =>
          <div key={index} className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-white" />
                <span className="text-white text-sm drop-shadow-md">{cert}</span>
              </div>
          )}
          </div>
        </div>
      </div>

      {/* Pricing & Availability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
        className="rounded-2xl shadow-lg p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        
          <h4 className="text-white font-medium mb-4 flex items-center drop-shadow-md">
            <DollarSign className="h-5 w-5 mr-2 text-white" />
            Pricing Information
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white drop-shadow-md">Starting Price:</span>
              <span className="font-medium text-white drop-shadow-md">{providerData.pricing.startingPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white drop-shadow-md">Hourly Rate:</span>
              <span className="font-medium text-white drop-shadow-md">{providerData.pricing.hourlyRate}/hr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white drop-shadow-md">Consultation:</span>
              <span className="font-medium text-white drop-shadow-md">{providerData.pricing.consultationFee}</span>
            </div>
          </div>
        </div>

        <div
        className="rounded-2xl shadow-lg p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        
          <h4 className="text-white font-medium mb-4 flex items-center drop-shadow-md">
            <Calendar className="h-5 w-5 mr-2 text-white" />
            Availability
          </h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-white drop-shadow-md">{providerData.availability}</span>
            </div>
            <p className="text-sm text-white drop-shadow-md">
              Response time: {providerData.responseTime}
            </p>
            <button className="w-full py-2 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 font-semibold">
              Check Availability
            </button>
          </div>
        </div>
      </div>
    </div>;


  const renderPortfolio = () =>
  <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl text-white drop-shadow-lg">Project Portfolio</h3>
        <p className="text-white drop-shadow-md">{portfolioImages.length} completed projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {portfolioImages.map((project) =>
      <div
        key={project.id}
        className="group relative rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-2"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        
            <div className="aspect-video bg-gray-200 flex items-center justify-center overflow-hidden">
              {project.photos[0] ?
              <img src={project.photos[0]} alt={project.title} className="w-full h-full object-cover" /> :
              <Camera className="h-10 w-10 text-white" />}
            </div>
            <div className="p-4 relative z-10">
              <h4 className="text-white font-medium mb-1 drop-shadow-md group-hover:text-white transition-colors duration-300">{project.title}</h4>
              <span className="px-2 py-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded text-xs mb-2 inline-block font-medium">
                {project.category}
              </span>
              <p className="text-xs text-white leading-relaxed mb-3 drop-shadow-md group-hover:text-white transition-colors duration-300">{project.description}</p>
              <div className="flex justify-between items-center text-xs text-white drop-shadow-md">
                <span>Cost: {project.projectCost}</span>
                <span>Duration: {project.duration}</span>
              </div>
            </div>
            {/* Shine effect */}
            <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
          </div>
      )}
      </div>
    </div>;


  const renderReviews = () =>
  <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl text-white drop-shadow-lg">Customer Reviews</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Star className="h-5 w-5 text-coral-orange fill-coral-orange" />
            <span className="text-white font-medium drop-shadow-md">{providerData.rating}</span>
            <span className="text-white drop-shadow-md">({providerData.reviewCount} reviews)</span>
          </div>
        </div>
      </div>

      {/* Rating Breakdown */}
      <div
      className="rounded-2xl shadow-lg p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}>
      
        <h4 className="text-white font-medium mb-4 drop-shadow-md">Rating Breakdown</h4>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
          const count = reviews.filter((r) => r.rating === rating).length;
          const percentage = count / reviews.length * 100;
          return (
            <div key={rating} className="flex items-center space-x-3">
                <span className="w-8 text-sm text-white drop-shadow-md">{rating}★</span>
                <div className="flex-1 bg-white/20 rounded-full h-2">
                  <div
                  className="bg-coral-orange h-2 rounded-full"
                  style={{ width: `${percentage}%` }}>
                </div>
                </div>
                <span className="text-sm text-white w-8 drop-shadow-md">{count}</span>
              </div>);

        })}
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-6">
        {reviews.map((review) =>
      <div
        key={review.id}
        className="group relative rounded-2xl shadow-lg p-6 overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-white drop-shadow-md">{review.customerName}</span>
                  <span className="text-sm text-white drop-shadow-md">•</span>
                  <span className="text-sm text-white drop-shadow-md">{new Date(review.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex">
                    {[...Array(review.rating)].map((_, i) =>
                <Star key={i} className="h-4 w-4 text-coral-orange fill-coral-orange" />
                )}
                  </div>
                  <span className="text-sm text-white drop-shadow-md">• {review.project}</span>
                </div>
              </div>
            </div>
            <p className="text-white leading-relaxed mb-4 drop-shadow-md group-hover:text-white transition-colors duration-300">{review.review}</p>
            <div className="flex items-center justify-between">
              <button className="text-sm text-white hover:text-white transition-colors duration-300">
                Helpful ({review.helpful})
              </button>
              <button className="text-sm text-white hover:text-white transition-colors duration-300">
                Report
              </button>
            </div>
            {/* Shine effect */}
            <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
          </div>
      )}
      </div>
    </div>;


  const renderServices = () =>
  <div className="space-y-6">
      <h3 className="text-xl text-white drop-shadow-lg">Services Offered</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((service, index) =>
      <div
        key={index}
        className="group relative rounded-2xl shadow-lg p-6 overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
        
            <h4 className="text-lg text-white mb-2 drop-shadow-md group-hover:text-white transition-colors duration-300">{service.name}</h4>
            <p className="text-white mb-4 leading-relaxed drop-shadow-md group-hover:text-white transition-colors duration-300">{service.description}</p>
            <div className="flex justify-between items-center text-sm text-white mb-4 drop-shadow-md">
              <span>Starting at: <span className="text-white font-medium">{service.startingPrice}</span></span>
              <span>Duration: {service.duration}</span>
            </div>
            <button
          className="w-full py-2 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 font-semibold"
          onClick={() => openQuoteModal(service.name, service)}>
          
              Request Quote
            </button>
            {/* Shine effect */}
            <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
          </div>
      )}
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
        {/* Header with Action Buttons */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl text-white drop-shadow-lg mb-2">{providerData.name}</h1>
              <div className="flex items-center space-x-4 text-white drop-shadow-md">
                <span>{providerData.category}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-white" />
                  <span>{providerData.location}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <GlassmorphicButton
                onClick={() => setShowMessagingModal(true)}
                icon={<MessageSquare className="h-4 w-4" />}
                size="md">
                
                Send Message
              </GlassmorphicButton>
              <CoralOrangeButton size="md" onClick={() => openQuoteModal(providerData.category)}>
                Request Quote
              </CoralOrangeButton>
            </div>
          </div>
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
          
          <div className="pp-tabs flex">
            {[
            { id: 'overview', label: 'Overview' },
            { id: 'portfolio', label: 'Portfolio' },
            { id: 'reviews', label: 'Reviews' },
            { id: 'services', label: 'Services' }].
            map((tab) =>
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 px-6 py-4 text-center transition-all duration-150 font-medium bg-transparent ${
              activeTab === tab.id ?
              'text-white border-b-2 border-coral-orange' :
              'text-white hover:bg-white/20 backdrop-blur-sm'}`
              }>
              
                {activeTab === tab.id &&
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-coral-orange"></div>
              }
                <span className={activeTab === tab.id ? 'text-white font-semibold' : ''}>{tab.label}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'portfolio' && renderPortfolio()}
        {activeTab === 'reviews' && renderReviews()}
        {activeTab === 'services' && renderServices()}
      </div>

      {/* Messaging Modal */}
      <MessagingModal
        isOpen={showMessagingModal}
        onClose={() => setShowMessagingModal(false)}
        recipient={providerData} />
      
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