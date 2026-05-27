import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, MessageSquare, MapPin, Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';
import apiClient from '../utils/api';
import reproserveLogo from 'figma:asset/d443497cecc2870d74fc45d88e6b112a10bb43ab.png';

export function Footer() {
  const location = useLocation();
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitMessage, setSubmitMessage] = React.useState('');
  const [pages, setPages] = React.useState([]);

  // Handle link clicks - scroll to top even if on same route
  const handleLinkClick = (e, targetPath) => {
    const currentPath = location.pathname;
    if (currentPath === targetPath) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle email subscription
  const handleSubscribe = async (e) => {
    e.preventDefault();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setSubmitMessage('Please enter a valid email address');
      setTimeout(() => setSubmitMessage(''), 3000);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitMessage('Thank you for subscribing!');
      setEmail('');
      setTimeout(() => setSubmitMessage(''), 3000);
    }, 1000);
  };

  // Fetch pages from API
  React.useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await apiClient.get('/api/pages', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        // Check if response is HTML (server returned index.html instead of JSON)
        const pagesData = response.data;
        if (typeof pagesData === 'string' && pagesData.trim().startsWith('<!DOCTYPE')) {
          console.warn('API endpoint returned HTML instead of JSON. Using default pages.');
          setPages([
          { id: 2, name: 'Terms and Conditions', slug: 'terms-and-conditions' },
          { id: 3, name: 'Contact Us', slug: 'contact-us' }]
          );
          return;
        }
        // Ensure response.data is an array
        if (Array.isArray(pagesData)) {
          setPages(pagesData);
        } else {
          console.warn('API returned non-array data for pages:', pagesData);
          setPages([
          { id: 2, name: 'Terms and Conditions', slug: 'terms-and-conditions' },
          { id: 3, name: 'Contact Us', slug: 'contact-us' }]
          );
        }
      } catch (err) {
        console.error('Error fetching pages:', err);
        // Set default pages if API fails
        setPages([
        { id: 2, name: 'Terms and Conditions', slug: 'terms-and-conditions' },
        { id: 3, name: 'Contact Us', slug: 'contact-us' }]
        );
      }
    };

    fetchPages();
  }, []);

  // Add style to remove any decorative lines
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      footer::before,
      footer::after,
      footer *::before,
      footer *::after {
        display: none !important;
        content: none !important;
        background-image: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <footer className="bg-cool-gray text-white" style={{ backgroundImage: 'none', position: 'relative' }}>
      {/* Newsletter Section */}
      <div className="border-b border-slate-600">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl mb-4 text-white">Stay Updated with Home Improvement Tips</h3>
            <p className="mb-6 text-slate-300">
              Get the latest home improvement advice, contractor tips, and exclusive offers delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white pointer-events-none z-20" style={{ color: '#ffffff' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-white/30 focus:outline-none focus:border-sky-blue transition-all duration-300 text-white placeholder:text-slate-400"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                    position: 'relative',
                    zIndex: 1
                  }}
                  disabled={isSubmitting} />
                
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-lg bg-coral-orange text-black font-semibold transition-all duration-300 hover:bg-coral-orange/90 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap">
                
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            {submitMessage &&
            <p className={`mt-3 text-sm ${submitMessage.includes('Thank you') ? 'text-green-400' : 'text-red-400'}`}>
                {submitMessage}
              </p>
            }
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src={reproserveLogo}
                alt="ReproServe Logo"
                className="h-10 w-10" />
              
              <span className="font-bold text-xl">ReproServe</span>
            </div>
            <p className="mb-6 text-sm text-slate-300">
              Connecting users with trusted service professionals for all your home improvement needs.
            </p>

            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>1-800-REPRO-SERVE</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>support@reproserve.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Nationwide Service</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div>
            <h4 className="font-semibold mb-4">For Users</h4>
            <ul className="space-y-2">
              {[
              { text: 'Find Service Providers', page: 'find-providers' },
              { text: 'Get Quotes', page: 'find-providers' },
              { text: 'Read Reviews', page: 'read-reviews' },
              { text: 'Home Guides', page: 'blog' }
              // { text: 'Cost Guides', page: 'cost-guides' }
              ].map((link, index) =>
              <li key={index}>
                  <Link
                  to={`/${link.page}`}
                  onClick={(e) => handleLinkClick(e, `/${link.page}`)}
                  className="text-sm text-slate-300 transition-colors hover:text-white">
                  
                    {link.text}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Professionals</h4>
            <ul className="space-y-2">
              {[
              { text: 'Signup', page: 'register' },
              // { text: 'Provider Profile', page: 'provider-profile' },
              // { text: 'Get Leads', page: 'service-providers' },
              // { text: 'Marketing Tools', page: 'service-providers' },
              { text: 'Success Stories', page: 'success-stories' },
              { text: 'Resource Center', page: 'blog' },
              { text: 'Safety Tips', page: 'safety-tips' }].
              map((link, index) =>
              <li key={index}>
                  <Link
                  to={`/${link.page}`}
                  onClick={(e) => handleLinkClick(e, `/${link.page}`)}
                  className="text-sm text-slate-300 transition-colors hover:text-white">
                  
                    {link.text}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              {[
              { text: 'Construction', page: 'find-providers' },
              { text: 'Repairs & Maintenance', page: 'find-providers' },
              { text: 'Landscaping', page: 'find-providers' },
              { text: 'Home Services', page: 'find-providers' },
              { text: 'Open House', page: 'open-house' },
              // { text: 'Dashboard', page: 'profile' },
              { text: 'All Categories', page: 'find-providers' }].
              map((link, index) =>
              <li key={index}>
                  <Link
                  to={`/${link.page}`}
                  onClick={(e) => handleLinkClick(e, `/${link.page}`)}
                  className="text-sm text-slate-300 transition-colors hover:text-white">
                  
                    {link.text}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {[
              { text: 'About Us', page: 'about' },
              { text: 'Careers', page: 'careers' },
              { text: 'Press', page: 'press' },
              { text: 'Blog', page: 'blog' },
              { text: 'Contact', page: 'contact' },
              { text: 'Help Center', page: 'contact' }].
              map((link, index) =>
              <li key={index}>
                  <Link
                  to={`/${link.page}`}
                  onClick={(e) => handleLinkClick(e, `/${link.page}`)}
                  className="text-sm text-slate-300 transition-colors hover:text-white">
                  
                    {link.text}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-600" style={{ position: 'relative', overflow: 'hidden', backgroundImage: 'none' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap items-center space-x-6 text-sm text-slate-300">
              <span>© 2025 ReproServe. All rights reserved.</span>
              {Array.isArray(pages) && pages.map((page) =>
              <Link
                key={page.id}
                to={`/page/${page.slug}`}
                onClick={(e) => handleLinkClick(e, `/page/${page.slug}`)}
                className="hover:text-sky-blue transition-colors cursor-pointer">
                
                  {page.name}
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-300">Follow us:</span>
              <div className="flex space-x-3">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) =>
                <button
                  key={index}
                  className="group text-slate-300 hover:text-white transition-colors duration-300">
                  
                    <Icon
                    className="h-5 w-5 transition-transform duration-300 ease-in-out"
                    style={{
                      transform: 'scale(1)',
                      transformOrigin: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }} />
                  
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>);

}