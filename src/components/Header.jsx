import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, X, User, Bell, Trash2, ChevronDown, MessageSquare } from 'lucide-react';
import reproserveLogo from 'figma:asset/d443497cecc2870d74fc45d88e6b112a10bb43ab.png';
import { RequestDetailsModal } from './RequestDetailsModal';
import { MessagingModal } from './MessagingModal';
import {
  fetchNotificationsStart,
  markNotificationReadStart,
  markAllNotificationsReadStart,
  deleteNotificationStart,
  fetchQuoteDetailStart,
  fetchConversationsStart
} from '../Store/Features/Authentication/authslice';

export function Header({ currentUser, setCurrentUser }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isClosingNotifications, setIsClosingNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showRealEstateDropdown, setShowRealEstateDropdown] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [isClosingMessages, setIsClosingMessages] = useState(false);
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.AuthReducer.notifications);
  const unreadCount = useSelector((state) => state.AuthReducer.unreadCount);
  const messagesUnreadTotal = useSelector((state) => state.AuthReducer.messagesUnreadTotal);
  const conversations = useSelector((state) => state.AuthReducer.conversations);
  const quoteDetail = useSelector((state) => state.AuthReducer.quoteDetail);
  const quoteDetailLoading = useSelector((state) => state.AuthReducer.quoteDetailLoading);

  // Add CSS animations for notifications dropdown
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
      
      @keyframes dropdownPopIn {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(-10px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      
      @keyframes dropdownPopOut {
        from {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        to {
          opacity: 0;
          transform: scale(0.95) translateY(-10px);
        }
      }
      @keyframes modalPopIn {
        from {
          opacity: 0;
          transform: scale(0.9) translateY(-10px);
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
          transform: scale(0.9) translateY(-10px);
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load this user's notifications from the API.
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchNotificationsStart({ userId: currentUser.id }));
    }
  }, [currentUser?.id, dispatch]);

  // Close notifications dropdown when clicking outside. We used to test for
  // `.relative` here but Tailwind's `relative` class is everywhere, so almost
  // every click was treated as inside and the panel never closed. Switch to a
  // unique container class instead.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notifications-dropdown-container')) {
        setIsClosingNotifications(true);
        setTimeout(() => {
          setShowNotifications(false);
          setIsClosingNotifications(false);
        }, 200);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  // Close messages dropdown when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMessages && !event.target.closest('.messages-dropdown-container')) {
        setIsClosingMessages(true);
        setTimeout(() => {
          setShowMessages(false);
          setIsClosingMessages(false);
        }, 200);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMessages]);

  // Close Real Estate dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showRealEstateDropdown && !event.target.closest('.real-estate-dropdown-container')) {
        setShowRealEstateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRealEstateDropdown]);

  const handleLogout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('reproserve_current_user');
    }
    navigate('/');
  };

  const handleClearNotifications = () => {
    if (currentUser?.id) {
      dispatch(markAllNotificationsReadStart(currentUser.id));
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      dispatch(markNotificationReadStart(notif.id));
    }
    // A quote/meeting-request notification links to /request/<id> — open the
    // details modal rather than navigating to a route.
    const requestMatch = typeof notif.link === 'string' ? notif.link.match(/^\/request\/(\d+)$/) : null;
    if (requestMatch) {
      dispatch(fetchQuoteDetailStart(requestMatch[1]));
      setShowRequestModal(true);
      setShowNotifications(false);
      setIsClosingNotifications(false);
      return;
    }
    if (notif.link) {
      setIsClosingNotifications(true);
      setTimeout(() => {
        setShowNotifications(false);
        setIsClosingNotifications(false);
        navigate(notif.link);
      }, 200);
    }
  };

  const handleDeleteNotification = (e, id) => {
    e.stopPropagation();
    dispatch(deleteNotificationStart(id));
  };

  // Capitalize first letter of user name
  const capitalizeName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/20 transition-all duration-300"
      style={{
        background: (isScrolled || isMenuOpen) ?
        'linear-gradient(135deg, rgba(0, 137, 225, 1) 0%, rgba(0, 69, 113, 1) 50%, rgba(0, 137, 225, 1) 100%)' :
        'transparent',
        backdropFilter: (isScrolled || isMenuOpen) ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: (isScrolled || isMenuOpen) ? 'blur(20px)' : 'none'
      }}>
      
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 cursor-pointer">
            
            <img
              src={reproserveLogo}
              alt="ReproServe Logo"
              className="h-10 w-10" />
            
            <span className="font-bold text-xl text-white drop-shadow-lg">ReproServe</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-white transition-colors hover:text-white/80 drop-shadow-md">
              
              Home
            </Link>
            <div className="relative real-estate-dropdown-container">
              <button
                onClick={() => setShowRealEstateDropdown(!showRealEstateDropdown)}
                className="flex items-center space-x-1 text-white transition-colors hover:text-white/80 drop-shadow-md">

                <span>RealEstate Service</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showRealEstateDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showRealEstateDropdown &&
                  <div
                  className="absolute left-0 mt-2 w-48 rounded-2xl shadow-lg z-[100]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 137, 225, 0.95), rgba(0, 69, 113, 0.95))',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                    animation: 'fadeIn 0.2s ease-out',
                    isolation: 'isolate',
                    willChange: 'backdrop-filter',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                    WebkitFontSmoothing: 'antialiased'
                  }}>
                  
                    <Link
                    to="/realtors"
                    onClick={() => setShowRealEstateDropdown(false)}
                    className={`block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors duration-300 drop-shadow-md hover:text-base hover:font-semibold ${currentUser?.role === 'provider' ? 'rounded-2xl' : 'rounded-t-2xl'}`}>
                    
                      Realtors
                    </Link>
                    {currentUser?.role !== 'provider' &&
                  <Link
                    to="/open-house"
                    onClick={() => setShowRealEstateDropdown(false)}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors duration-300 drop-shadow-md rounded-b-2xl hover:text-base hover:font-semibold">
                    
                        Open House
                      </Link>
                  }
                  </div>
              }
            </div>
            <Link
              to="/find-providers"
              className="text-white transition-colors hover:text-white/80 drop-shadow-md">
              
              Contractors
            </Link>
            <Link
              to="/contact"
              className="text-white transition-colors hover:text-white/80 drop-shadow-md">
              
              Contact
            </Link>
          </nav>



          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {currentUser ?
            <div className="hidden md:flex items-center space-x-3">
                <div className="relative messages-dropdown-container">
                  <button
                    onClick={() => {
                      if (showMessages) {
                        setIsClosingMessages(true);
                        setTimeout(() => {
                          setShowMessages(false);
                          setIsClosingMessages(false);
                        }, 200);
                      } else {
                        setShowMessages(true);
                        setIsClosingMessages(false);
                        if (currentUser?.id) dispatch(fetchConversationsStart());
                        // Also close notifications if open.
                        if (showNotifications) {
                          setShowNotifications(false);
                        }
                      }
                    }}
                    className="p-2 rounded-md hover:bg-dark-blue relative"
                    title="Messages"
                  >
                    <MessageSquare className="h-5 w-5 text-white" />
                    {messagesUnreadTotal > 0 &&
                      <span className="absolute top-0 right-0 bg-coral-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {messagesUnreadTotal > 99 ? '99+' : messagesUnreadTotal}
                      </span>
                    }
                  </button>
                  {(showMessages || isClosingMessages) &&
                    <div
                      className="absolute right-0 mt-2 rounded-2xl shadow-lg z-50 max-h-96 overflow-y-auto scrollbar-hide"
                      style={{
                        width: '420px',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
                        animation: isClosingMessages
                          ? 'dropdownPopOut 0.2s ease-out forwards'
                          : 'dropdownPopIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}>
                      <div className="p-4 border-b border-white/20">
                        <h3 className="font-semibold text-white drop-shadow-md">Messages</h3>
                      </div>
                      {conversations.length === 0 ?
                        <div className="p-4 text-center text-white text-sm drop-shadow-md">
                          No conversations yet. Use the Connect button on a provider or realtor card to start one.
                        </div> :
                        <div className="divide-y divide-white/20">
                          {conversations.map((c) => {
                            const personal = c.partner?.firstName
                              ? `${c.partner.firstName} ${c.partner.lastName || ''}`.trim()
                              : '';
                            const biz = c.partner?.businessName?.trim() || '';
                            const display = (personal && biz && personal !== biz)
                              ? `${personal} (${biz})`
                              : (personal || biz || c.partner?.email || 'User');
                            const last = c.lastMessage?.content || '';
                            const ts = c.lastMessage?.createdAt;
                            return (
                              <button
                                key={c.partner?.id}
                                onClick={() => {
                                  setSelectedRecipient({ ...c.partner, name: display });
                                  setShowMessagingModal(true);
                                  setIsClosingMessages(true);
                                  setTimeout(() => {
                                    setShowMessages(false);
                                    setIsClosingMessages(false);
                                  }, 200);
                                }}
                                className="w-full text-left p-4 flex items-start gap-3 hover:bg-white/10 transition cursor-pointer"
                              >
                                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                  {display.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm text-white font-medium drop-shadow-md truncate">{display}</p>
                                    {ts && (
                                      <span className="text-[10px] text-white/60 flex-shrink-0">
                                        {new Date(ts).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between gap-2 mt-1">
                                    <p className="text-xs text-white/80 truncate">{last}</p>
                                    {Number(c.unreadCount) > 0 && (
                                      <span className="text-[10px] bg-coral-orange text-white rounded-full px-2 py-0.5 flex-shrink-0">
                                        {c.unreadCount}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      }
                    </div>
                  }
                </div>
                <div className="relative notifications-dropdown-container">
                  <button
                  onClick={() => {
                    if (showNotifications) {
                      setIsClosingNotifications(true);
                      setTimeout(() => {
                        setShowNotifications(false);
                        setIsClosingNotifications(false);
                      }, 200);
                    } else {
                      setShowNotifications(true);
                      setIsClosingNotifications(false);
                      if (currentUser?.id) {
                        dispatch(fetchNotificationsStart({ userId: currentUser.id }));
                      }
                    }
                  }}
                  className="p-2 rounded-md hover:bg-dark-blue relative">

                    <Bell className="h-5 w-5 text-white" />
                    {unreadCount > 0 &&
                  <span className="absolute top-0 right-0 bg-coral-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                  }
                  </button>
                  {(showNotifications || isClosingNotifications) &&
                <div
                  className="absolute right-0 mt-2 rounded-2xl shadow-lg z-50 max-h-96 overflow-y-auto scrollbar-hide"
                  style={{
                    width: '450px',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
                    animation: isClosingNotifications ?
                    'dropdownPopOut 0.2s ease-out forwards' :
                    'dropdownPopIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}>
                  
                      <div className="p-4 border-b border-white/20 flex items-center justify-between">
                        <h3 className="font-semibold text-white drop-shadow-md">Notifications</h3>
                        {unreadCount > 0 &&
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearNotifications();
                      }}
                      className="p-1.5 rounded-md hover:bg-white/10 transition-colors duration-300 text-white"
                      title="Mark all as read">

                            <Trash2 className="h-4 w-4 text-white" />
                          </button>
                    }
                      </div>
                      {notifications.length === 0 ?
                  <div className="p-4 text-center text-white text-sm drop-shadow-md">
                          No new notifications
                        </div> :

                  <div className="divide-y divide-white/20">
                          {notifications.map((notif) =>
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-white/10 cursor-pointer transition-colors duration-300 ${notif.isRead ? 'opacity-60' : ''}`}
                      onClick={() => handleNotificationClick(notif)}>

                              <div className="flex items-start gap-2">
                                {!notif.isRead &&
                          <span className="mt-1.5 h-2 w-2 rounded-full bg-coral-orange flex-shrink-0" />
                          }
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white font-medium drop-shadow-md">{notif.title}</p>
                                  {notif.message &&
                            <p className="text-xs text-white mt-1 drop-shadow-md">{notif.message}</p>
                            }
                                  <p className="text-xs text-white/70 mt-1 drop-shadow-md">
                                    {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}
                                  </p>
                                </div>
                                <button
                            onClick={(e) => handleDeleteNotification(e, notif.id)}
                            className="p-1 rounded-md hover:bg-white/20 transition-colors duration-300 flex-shrink-0"
                            title="Remove notification">

                                  <Trash2 className="h-4 w-4 text-white/70" />
                                </button>
                              </div>
                            </div>
                    )}
                        </div>
                  }
                    </div>
                }
                </div>
                <div className="relative profile-dropdown-container">
                  <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-dark-blue hover:text-white">

                    <User className="h-5 w-5 text-white" />
                    <span className="text-white">{capitalizeName(currentUser.name)}</span>
                  </button>
                  {showProfileDropdown &&
                      <div
                    className="absolute right-0 mt-2 w-48 rounded-2xl shadow-lg z-[100]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 137, 225, 0.95), rgba(0, 69, 113, 0.95))',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                      animation: 'fadeIn 0.2s ease-out',
                      isolation: 'isolate',
                      willChange: 'backdrop-filter',
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden',
                      WebkitFontSmoothing: 'antialiased'
                    }}>
                    
                        <Link
                      to="/profile"
                      onClick={() => setShowProfileDropdown(false)}
                      className="block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors duration-300 drop-shadow-md rounded-t-2xl">
                      
                          My Profile
                        </Link>

                        <Link
                      to="/change-password"
                      onClick={() => setShowProfileDropdown(false)}
                      className="block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors duration-300 drop-shadow-md">
                      
                          Change Password
                        </Link>

                        <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors duration-300 drop-shadow-md rounded-b-2xl cursor-pointer">

                          Logout
                        </button>
                      </div>
                }
                </div>
              </div> :

            <div className="hidden md:flex items-center space-x-3">
                <Link
                to="/login"
                className="px-4 py-2 rounded-md text-white transition-colors drop-shadow-md"
                style={{
                  '--hover-bg': '#33a1e8'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#33a1e8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>

                  Login
                </Link>
                <Link
                to="/register"
                className="px-4 py-2 rounded-md bg-coral-orange text-black transition-colors hover:opacity-90">

                  Signup
                </Link>
              </div>
            }

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}>
              
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen &&
        <div className="md:hidden py-4 space-y-4 bg-black/20 backdrop-blur-sm rounded-lg mx-4">

            {/* Mobile Navigation */}
            <div className="space-y-2">
              <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-left py-2 text-white hover:text-white/80 drop-shadow-md">
              
                Home
              </Link>
              <div className="space-y-1 real-estate-dropdown-container">
                <button
                onClick={() => setShowRealEstateDropdown(!showRealEstateDropdown)}
                className="flex items-center justify-between w-full text-left py-2 text-white hover:text-white/80 drop-shadow-md">
                
                  <span>RealEstate Service</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showRealEstateDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showRealEstateDropdown &&
              <div className="pl-4 space-y-1">
                    <Link
                  to="/realtors"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowRealEstateDropdown(false);
                  }}
                  className="block w-full text-left py-2 text-white/90 hover:text-white drop-shadow-md">
                  
                      Realtors
                    </Link>
                    <Link
                  to="/open-house"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowRealEstateDropdown(false);
                  }}
                  className="block w-full text-left py-2 text-white/90 hover:text-white drop-shadow-md">
                  
                      Open House
                    </Link>
                  </div>
              }
              </div>
              <Link
              to="/find-providers"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-left py-2 text-white hover:text-white/80 drop-shadow-md">
              
                Contractors
              </Link>
              <Link
              to="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-left py-2 text-white hover:text-white/80 drop-shadow-md">
              
                Contact
              </Link>
            </div>

            {/* Mobile Auth */}
            <div className="pt-4 border-t border-border space-y-2">
              {currentUser ?
            <>
                  <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowMessages(true);
                  setIsClosingMessages(false);
                  if (currentUser?.id) dispatch(fetchConversationsStart());
                }}
                className="block w-full text-left py-2 text-white drop-shadow-md">

                    Messages {messagesUnreadTotal > 0 ? `(${messagesUnreadTotal})` : ''}
                  </button>
                  <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left py-2 text-white drop-shadow-md">

                    My Profile
                  </Link>

                  <Link
                to="/change-password"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left py-2 text-white drop-shadow-md">
                
                    Change Password
                  </Link>

                  <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-white drop-shadow-md">

                    Logout
                  </button>
                </> :

            <>
                  <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left py-2 text-white drop-shadow-md">

                    Login
                  </Link>
                  <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left px-4 py-2 rounded-md bg-coral-orange text-black">

                    Signup
                  </Link>
                </>
            }
            </div>
          </div>
        }
      </div>

      <RequestDetailsModal
        isOpen={showRequestModal}
        request={quoteDetail}
        loading={quoteDetailLoading}
        onClose={() => setShowRequestModal(false)} />

      <MessagingModal
        isOpen={showMessagingModal}
        onClose={() => {
          setShowMessagingModal(false);
          setSelectedRecipient(null);
        }}
        recipient={selectedRecipient} />

    </header>);

}