import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createPortal } from 'react-dom';
import { ArrowUp } from 'lucide-react';
import { currentUserStorage } from './utils/localStorage';
import { connectSocket, disconnectSocket, onSocket } from './services/socket';
import {
  receiveLiveMessage,
  receiveLiveNotification,
  fetchConversationsStart,
  fetchMessagesUnreadStart
} from './Store/Features/Authentication/authslice';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { FindProvidersPage } from './components/FindProvidersPage';
import { RealtorsPage } from './components/RealtorsPage';
import { ServiceProvidersPage } from './components/ServiceProvidersPage';
import { LoginPage } from './components/LoginPage';
import { AdminLoginPage } from './components/AdminLoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { RegisterPage } from './components/RegisterPage';
import { VerifyEmailPage } from './components/VerifyEmailPage';
import { AboutPage } from './components/AboutPage';
import { CareersPage } from './components/CareersPage';
import { PressPage } from './components/PressPage';
import { BlogPage } from './components/BlogPage';
import { ContactPage } from './components/ContactPage';
import { ProfilePage } from './components/ProfilePage';
import { ProviderProfilePage } from './components/ProviderProfilePage';

import { CreateProjectPage } from './components/CreateProjectPage';
import { ReadReviewsPage } from './components/ReadReviewsPage';
import { CostGuidesPage } from './components/CostGuidesPage';
import { SafetyTipsPage } from './components/SafetyTipsPage';
import { SuccessStoriesPage } from './components/SuccessStoriesPage';
import { OpenHousePage } from './components/OpenHousePage';
import { OpenHouseDetailsPage } from './components/OpenHouseDetailsPage';
import { ShowMyPropertyPage } from './components/ShowMyPropertyPage';
import { PageContent } from './components/PageContent';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { ChangePasswordPage } from './components/ChangePasswordPage';

function AppContent() {
  // Load current user from localStorage on mount
  const [currentUser, setCurrentUser] = useState(() => {
    return currentUserStorage.get();
  });
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Live chat socket lifecycle — connect when the user logs in, disconnect on
  // logout, route incoming `message:new` events to the redux store.
  useEffect(() => {
    if (!currentUser?.id) {
      disconnectSocket();
      return undefined;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) return undefined;

    connectSocket(token);
    dispatch(fetchConversationsStart());
    dispatch(fetchMessagesUnreadStart());

    const offMessage = onSocket('message:new', (message) => {
      dispatch(receiveLiveMessage({ message, me: currentUser.id }));
    });
    const offNotification = onSocket('notification:new', (notification) => {
      dispatch(receiveLiveNotification(notification));
    });
    return () => { offMessage(); offNotification(); };
  }, [currentUser?.id, dispatch]);

  // Save current user to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      currentUserStorage.set(currentUser);
    } else {
      currentUserStorage.clear();
    }
  }, [currentUser]);

  // Scroll to top when navigating to a new route
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Scroll to top button visibility - detect correct scrollable element
  useEffect(() => {
    const handleScroll = () => {
      // Try multiple scrollable elements
      let scrollTop = 0;

      // Check window/document first (most common)
      scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

      // If window scroll is 0, check for scrollable containers
      if (scrollTop === 0) {
        const root = document.getElementById('root');
        if (root) {
          scrollTop = root.scrollTop || 0;
        }
        // Check main element
        const main = document.querySelector('main');
        if (main && scrollTop === 0) {
          scrollTop = main.scrollTop || 0;
        }
      }

      // Show button when scrolled down more than 100px
      setShowScrollToTop(scrollTop > 100);
    };

    // Check immediately and on mount
    handleScroll();
    setTimeout(handleScroll, 100);
    setTimeout(handleScroll, 500);

    // Listen to window scroll
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Also listen to root element scroll if it exists
    const root = document.getElementById('root');
    if (root) {
      root.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Also check document scroll
    document.addEventListener('scroll', handleScroll, { passive: true });

    // Check main element
    const main = document.querySelector('main');
    if (main) {
      main.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      document.removeEventListener('scroll', handleScroll);
      if (root) {
        root.removeEventListener('scroll', handleScroll);
      }
      if (main) {
        main.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const scrollToTop = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Custom smooth scroll with constant speed
    const smoothScrollToTop = () => {
      const startPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

      if (startPosition === 0) return;

      const duration = 600; // Duration in milliseconds
      const startTime = performance.now();

      const animateScroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Linear interpolation for constant speed
        const currentPosition = startPosition * (1 - progress);

        // Use window.scrollTo as primary method
        window.scrollTo(0, currentPosition);

        // Handle other scrollable elements only if they exist and are scrollable
        const root = document.getElementById('root');
        if (root && root.scrollTop > 0) {
          root.scrollTop = currentPosition;
        }

        const main = document.querySelector('main');
        if (main && main.scrollTop > 0) {
          main.scrollTop = currentPosition;
        }

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          // Ensure we're at the top
          window.scrollTo(0, 0);
          if (root) root.scrollTop = 0;
          if (main) main.scrollTop = 0;
        }
      };

      // Start immediately with first frame
      requestAnimationFrame(animateScroll);
    };

    smoothScrollToTop();
  };

  return (
    <div className="min-h-screen bg-snow-white">
      <Header currentUser={currentUser} setCurrentUser={setCurrentUser} />
      <main style={{ paddingTop: '64px' }}>
        <Routes>
          <Route path="/" element={<HomePage navigate={navigate} />} />
          <Route path="/find-providers" element={<FindProvidersPage navigate={navigate} />} />
          <Route path="/realtors" element={<RealtorsPage navigate={navigate} currentUser={currentUser} />} />
          <Route path="/service-providers" element={<ServiceProvidersPage navigate={navigate} currentUser={currentUser} />} />
          <Route path="/login" element={<LoginPage navigate={navigate} setCurrentUser={setCurrentUser} />} />
          <Route path="/admin/login" element={<AdminLoginPage navigate={navigate} setCurrentUser={setCurrentUser} />} />
          <Route
            path="/admin"
            element={
              currentUser?.role === 'admin'
                ? <AdminDashboard navigate={navigate} currentUser={currentUser} setCurrentUser={setCurrentUser} />
                : <AdminLoginPage navigate={navigate} setCurrentUser={setCurrentUser} />
            }
          />
          <Route path="/register" element={<RegisterPage navigate={navigate} setCurrentUser={setCurrentUser} />} />
          <Route path="/verify-email" element={<VerifyEmailPage navigate={navigate} setCurrentUser={setCurrentUser} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage navigate={navigate} />} />
          <Route path="/change-password" element={<ChangePasswordPage navigate={navigate} />} />
          <Route path="/about" element={<AboutPage navigate={navigate} />} />
          <Route path="/careers" element={<CareersPage navigate={navigate} />} />
          <Route path="/press" element={<PressPage navigate={navigate} />} />
          <Route path="/blog" element={<BlogPage navigate={navigate} />} />
          <Route path="/contact" element={<ContactPage navigate={navigate} />} />
          <Route path="/profile" element={<ProfilePage navigate={navigate} currentUser={currentUser} setCurrentUser={setCurrentUser} />} />
          <Route path="/provider-profile" element={<ProviderProfilePage navigate={navigate} />} />
          <Route path="/create-project" element={<CreateProjectPage navigate={navigate} />} />
          <Route path="/read-reviews" element={<ReadReviewsPage navigate={navigate} />} />
          <Route path="/cost-guides" element={<CostGuidesPage navigate={navigate} />} />
          <Route path="/safety-tips" element={<SafetyTipsPage navigate={navigate} />} />
          <Route path="/success-stories" element={<SuccessStoriesPage navigate={navigate} />} />
          <Route path="/open-house" element={<OpenHousePage navigate={navigate} currentUser={currentUser} />} />
          <Route path="/open-house/:id" element={<OpenHouseDetailsPage navigate={navigate} currentUser={currentUser} />} />
          <Route path="/show-my-property" element={<ShowMyPropertyPage navigate={navigate} currentUser={currentUser} />} />
          <Route path="/page/:slug" element={<PageContent navigate={navigate} />} />
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<HomePage navigate={navigate} />} />
        </Routes>
      </main>
      <Footer />

      {/* Global Scroll to Top Button */}
      {typeof document !== 'undefined' && document.body && createPortal(
        <div
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            width: '56px',
            height: '56px',
            zIndex: 99999,
            opacity: showScrollToTop ? 1 : 0,
            pointerEvents: showScrollToTop ? 'auto' : 'none',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            visibility: 'visible',
            display: 'block'
          }}>

          <button
            onClick={scrollToTop}
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(0, 137, 225, 0.95), rgba(0, 69, 113, 0.95))',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '50%',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              margin: 0,
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            aria-label="Scroll to top"
            title="Scroll to top">

            <ArrowUp style={{ width: '24px', height: '24px', color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
          </button>
        </div>,
        document.body
      )}
    </div>);

}

export default function App() {
  return (
    
      <AppContent />
    );

}