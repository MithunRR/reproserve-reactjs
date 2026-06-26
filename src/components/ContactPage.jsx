import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, User, Building, ChevronDown } from 'lucide-react';
import ChatbotWidget from './ChatbotWidget';
import {
  submitContactStart,
  resetSubmitContactFlag
} from '../Store/Features/Authentication/authslice';

export function ContactPage({ navigate }) {
  const dispatch = useDispatch();
  const { submitContactLoading, submitContactSuccess, submitContactError } =
    useSelector((s) => s.AuthReducer);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    userType: 'user',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Dropdown states
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

  // Dropdown refs
  const subjectDropdownRef = useRef(null);

  // Dropdown positions
  const [subjectDropdownPosition, setSubjectDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Calculate dropdown positions
  useEffect(() => {
    if (isSubjectDropdownOpen && subjectDropdownRef.current) {
      const rect = subjectDropdownRef.current.getBoundingClientRect();
      setSubjectDropdownPosition({
        top: rect.bottom + 8 + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isSubjectDropdownOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is on dropdown trigger button
      const isSubjectClick = subjectDropdownRef.current && subjectDropdownRef.current.contains(event.target);

      // Check if click is on portal-rendered dropdown content
      const isDropdownContent = event.target.closest('[data-dropdown-content]');

      if (!isSubjectClick && !isDropdownContent) {
        setIsSubjectDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns when scrolling
  useEffect(() => {
    let scrollTimeout;

    const handleScroll = () => {
      // Clear any existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Add a small delay to prevent immediate close
      scrollTimeout = setTimeout(() => {
        setIsSubjectDropdownOpen(false);
      }, 420);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
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

      /* ===== PHONE-ONLY layout (laptops/desktops never match this) ===== */
      @media (max-width: 767px) {
        /* Smaller, tighter header */
        .contact-header { margin-bottom: 2.5rem; }
        .contact-header h1 { font-size: 2.25rem; line-height: 1.15; margin-bottom: 1rem; }
        .contact-header p { font-size: 1rem; }
        /* Tighter gap between the info and form columns */
        .contact-grid { gap: 2rem; }
        /* Form card uses less padding on small screens */
        .contact-form-card { padding: 1.5rem; }
        /* Submit row: note on top, full-width button below */
        .contact-submit-row {
          flex-direction: column;
          align-items: stretch;
          gap: 1rem;
        }
        .contact-submit-row > p { text-align: center; }
        .contact-submit-row > button {
          width: 100%;
          justify-content: center;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const subjectOptions = [
  { value: '', label: 'Select a subject' },
  // { value: 'account-support', label: 'Account Support' },
  // { value: 'service-provider', label: 'Service Provider Issues' },
  { value: 'technical-support', label: 'Technical Support' },
  { value: 'billing', label: 'Billing & Payments' },
  { value: 'partnership', label: 'Partnership Inquiry' },
  // { value: 'media', label: 'Media & Press' },
  { value: 'feedback', label: 'Feedback & Suggestions' },
  { value: 'other', label: 'Other' }];


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in name, email and message.');
      return;
    }
    dispatch(submitContactStart({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject || null,
      userType: formData.userType,
      message: formData.message
    }));
  };

  // React to Redux response — show the success screen, or surface an error.
  useEffect(() => {
    if (submitContactSuccess) {
      setIsSubmitted(true);
      setFormData({
        name: '', email: '', phone: '',
        subject: '', userType: 'user', message: ''
      });
      dispatch(resetSubmitContactFlag());
    }
  }, [submitContactSuccess, dispatch]);

  useEffect(() => {
    if (submitContactError) {
      const msg = typeof submitContactError === 'string'
        ? submitContactError
        : submitContactError?.message || 'Failed to send message';
      toast.error(msg);
      dispatch(resetSubmitContactFlag());
    }
  }, [submitContactError, dispatch]);

  const contactInfo = [
  {
    icon: Phone,
    title: 'Phone',
    details: ['1-800-REPRO-SERVE', '(1-800-737-7673)'],
    description: 'Call us for immediate assistance'
  },
  {
    icon: Mail,
    title: 'Email',
    details: ['support@reproserve.com', 'info@reproserve.com'],
    description: 'Send us an email anytime'
  },
  {
    icon: MapPin,
    title: 'Address',
    details: ['123 Innovation Drive', 'Tech Park, Phoenix, AZ 85001'],
    description: 'Visit our headquarters'
  },
  {
    icon: Clock,
    title: 'Business Hours',
    details: ['Monday - Friday: 8:00 AM - 8:00 PM', 'Saturday: 9:00 AM - 5:00 PM', 'Sunday: Closed'],
    description: 'Customer support hours'
  }];


  const supportTopics = [
  {
    title: 'Account Support',
    description: 'Help with registration, login, and account management',
    icon: User
  },
  {
    title: 'Service Provider Issues',
    description: 'Questions about finding or working with contractors',
    icon: Building
  },
  {
    title: 'Technical Support',
    description: 'Website, app, or platform technical issues',
    icon: MessageSquare
  },
  {
    title: 'Billing & Payments',
    description: 'Questions about charges, refunds, or payment methods',
    icon: Phone
  }];


  if (isSubmitted) {
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
            
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl text-white mb-6 drop-shadow-lg">Connection Established!</h2>
            <p className="text-white mb-8 text-lg drop-shadow-md">
              Thank you for reaching out to ReproServe. We've received your message and will connect with you within 24 hours.
            </p>
            <button
              onClick={() => navigate('home')}
              className="px-8 py-4 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 font-semibold">
              
              Return to Homepage
            </button>
          </div>
        </div>
      </div>);

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
      
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="contact-header text-center mb-16">
          <h1 className="text-5xl md:text-5xl mb-8 text-white drop-shadow-lg">Connect Now</h1>
          <p className="text-xl md:text-2 text-white drop-shadow-md max-w-4xl mx-auto leading-relaxed">
            Ready to start your home improvement journey? Let's connect! We're here to help you find the perfect service providers and make your project a success.
          </p>
        </div>

        <div className="contact-grid grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl p-8 h-fit relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
              
              <h2 className="text-3xl text-white mb-8 drop-shadow-lg">Let's Connect</h2>
              <div className="space-y-8">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <IconComponent className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl text-white mb-2 drop-shadow-md">{info.title}</h3>
                        {info.details.map((detail, idx) =>
                        <p key={idx} className="text-white mb-1 drop-shadow-md">{detail}</p>
                        )}
                        <p className="text-sm text-white mt-2 drop-shadow-md">{info.description}</p>
                      </div>
                    </div>);

                })}
              </div>

              {/* Support Topics */}
              <div className="mt-10">
                <h3 className="text-2xl text-white mb-6 drop-shadow-lg">How We Can Help</h3>
                <div className="space-y-4">
                  {supportTopics.map((topic, index) => {
                    const IconComponent = topic.icon;
                    return (
                      <div
                        key={index}
                        className="group relative rounded-xl p-5 overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                        }}>
                        
                        <div className="flex items-start space-x-4 relative z-10">
                          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-dark-blue/20 group-hover:border-dark-blue/40 transition-all duration-300">
                            <IconComponent className="h-5 w-5 text-white group-hover:text-white transition-colors duration-300" />
                          </div>
                          <div>
                            <h4 className="text-white mb-2 drop-shadow-md group-hover:text-white transition-colors duration-300">{topic.title}</h4>
                            <p className="text-sm text-white drop-shadow-md group-hover:text-white transition-colors duration-300">{topic.description}</p>
                          </div>
                        </div>
                        {/* Shine effect */}
                        <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                      </div>);

                  })}
                </div>
              </div>
            </div>

          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div
              className="contact-form-card rounded-2xl shadow-xl p-10 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
              
              <h2 className="text-3xl text-white mb-8 drop-shadow-lg">Start Your Connection</h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* User Type */}
                <div>
                  <label className="block text-lg text-white mb-4 drop-shadow-md">I am a:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                    { value: 'user', label: 'User' },
                    { value: 'provider', label: 'Service Provider' },
                    { value: 'other', label: 'Other' }].
                    map((type) =>
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, userType: type.value }))}
                      className={`p-4 rounded-lg text-center transition-all duration-300 font-semibold ${formData.userType === type.value ?
                      'hover:scale-105 shadow-lg' :
                      'hover:scale-105'}`
                      }
                      style={formData.userType === type.value ? {
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.3))',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255, 255, 255, 0.6)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                        color: 'white'
                      } : {
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                        color: 'white'
                      }}>
                      
                        {type.label}
                      </button>
                    )}
                  </div>
                </div>

                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-white mb-3 drop-shadow-md">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-5 py-4 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/90 focus:outline-none focus:border-white/60 transition-colors"
                      placeholder="Enter your full name" />
                    
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-white mb-3 drop-shadow-md">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-5 py-4 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60 transition-colors"
                      placeholder="Enter your email" />
                    
                  </div>
                </div>

                {/* Phone and Subject */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-white mb-3 drop-shadow-md">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60 transition-colors"
                      placeholder="Enter your phone number" />
                    
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-white mb-3 drop-shadow-md">
                      Subject *
                    </label>
                    <div className="relative" ref={subjectDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                        className="w-full px-5 py-4 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:border-white/60 transition-colors flex items-center justify-between">
                        
                        <span>{subjectOptions.find((option) => option.value === formData.subject)?.label || 'Select a subject'}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isSubjectDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isSubjectDropdownOpen && createPortal(
                        <div
                          data-dropdown-content
                          className="absolute rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm z-[99999] overflow-hidden"
                          style={{
                            top: subjectDropdownPosition.top,
                            left: subjectDropdownPosition.left,
                            width: subjectDropdownPosition.width,
                            animation: 'slideDown 0.5s ease-out'
                          }}>
                          
                          <div className="py-2">
                            {subjectOptions.map((option, index) =>
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, subject: option.value }));
                                setIsSubjectDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 transition-all duration-200 hover:bg-white/20 ${formData.subject === option.value ? 'bg-dark-blue/20 text-white' : 'text-white'}`
                              }
                              style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both` }}>
                              
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

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-white mb-3 drop-shadow-md">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    className="w-full px-5 py-4 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white focus:outline-none focus:border-white/60 transition-colors resize-none"
                    placeholder="Tell us how we can help you with your home improvement project..." />
                  
                </div>

                {/* Submit Button */}
                <div className="contact-submit-row flex items-center justify-between pt-4">
                  <p className="text-white drop-shadow-md">
                    Fields marked with * are required
                  </p>
                  <button
                    type="submit"
                    disabled={submitContactLoading}
                    className="px-10 py-4 text-white rounded-lg hover:scale-105 flex items-center space-x-3 shadow-lg transition-all duration-300 font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                    }}>

                    <Send className="h-5 w-5" />
                    <span>{submitContactLoading ? 'Sending…' : 'Connect With Us'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Emergency Contact */}
            <div
              className="mt-10 rounded-2xl p-8 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
              
              <h3 className="text-2xl text-white mb-4 drop-shadow-lg">Need Immediate Help?</h3>
              <p className="text-white mb-6 text-lg drop-shadow-md">
                For urgent technical issues or account problems, call our support hotline:
              </p>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl text-white drop-shadow-md">1-800-REPRO-SERVE</span>
              </div>
              <p className="text-white drop-shadow-md">
                Available Monday-Friday 8:00 AM - 8:00 PM PST
              </p>
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="mt-20">
          <h2 className="text-3xl text-white text-center mb-12 drop-shadow-lg">Visit Our Office</h2>
          <div
            className="rounded-2xl h-80 flex items-center justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MapPin className="h-10 w-10 text-white" />
              </div>
              <p className="text-xl text-white mb-2 drop-shadow-md">Interactive Map</p>
              <p className="text-white drop-shadow-md">123 Innovation Drive, Tech Park, Phoenix, AZ 85001</p>
            </div>
          </div>
        </div>
      </div>

      <ChatbotWidget />
    </div>);

}