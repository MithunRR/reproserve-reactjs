import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, User, Clock, Tag, Search, TrendingUp, ArrowRight, ChevronDown, Loader2 } from 'lucide-react';
import apiClient from '../utils/api';

export function BlogPage({ navigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [blogPosts, setBlogPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const authToken = localStorage.getItem('auth_token');
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };

        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await apiClient.get('/api/blogs', { headers });

        // Map API response to match component structure
        const mappedBlogs = response.data.map((blog) => ({
          id: blog.id,
          title: blog.title,
          excerpt: blog.description || '',
          content: blog.description || '', // Use description as content if available
          author: blog.author || 'ReproServe Team',
          date: blog.date || blog.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          readTime: `${blog.estimated_reading_time || 5} min read`,
          category: 'General', // Default category since API doesn't provide it
          tags: [], // Empty tags since API doesn't provide them
          featured: false, // Default to false, can be updated if needed
          image: blog.image ?
          `https://webrepro.creativecrows.com/storage/${blog.image}` :
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1080' // Fallback image
        }));

        setBlogPosts(mappedBlogs);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError(err.response?.data?.message || 'Failed to load blogs. Please try again later.');
        // Set empty array on error to prevent crashes
        setBlogPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const staticBlogPosts = [
  {
    id: 1,
    title: 'Top 10 Questions to Ask Before Hiring a General Contractor',
    excerpt: 'Hiring the right general contractor can make or break your renovation project. Here are the essential questions every user should ask before making their decision.',
    content: 'When embarking on a major home renovation, choosing the right general contractor is crucial for success. A qualified contractor will ensure your project is completed on time, within budget, and to your specifications...',
    author: 'Sarah Martinez',
    date: '2024-01-15',
    readTime: '8 min read',
    category: 'Construction & Renovation',
    tags: ['General Contractor', 'Home Renovation', 'Tips'],
    featured: true,
    image: 'https://images.unsplash.com/photo-1672627170267-fca17bb54156?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwY29uc3RydWN0aW9uJTIwY29udHJhY3RvcnxlbnwxfHx8fDE3NTg5NjE1ODN8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 2,
    title: 'Electrical Safety: When to Call a Professional vs. DIY',
    excerpt: 'Understanding when electrical work requires a licensed professional can save you money and, more importantly, keep your family safe.',
    content: 'Electrical work can be tempting to tackle yourself, especially for seemingly simple tasks. However, electrical safety should never be compromised...',
    author: 'Michael Chen',
    date: '2024-01-12',
    readTime: '6 min read',
    category: 'Repairs & Maintenance',
    tags: ['Electrical', 'Safety', 'DIY'],
    featured: false,
    image: 'https://images.unsplash.com/photo-1467733238130-bb6846885316?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2lhbiUyMHNhZmV0eSUyMGVxdWlwbWVudCUyMHdvcmtpbmd8ZW58MXx8fHwxNzU5MzAxMzIxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: 3,
    title: 'Landscaping on a Budget: Maximum Impact for Minimum Cost',
    excerpt: 'Transform your outdoor space without breaking the bank. Learn cost-effective landscaping strategies that deliver stunning results.',
    content: 'Creating a beautiful landscape doesnt have to cost a fortune. With careful planning and strategic choices, you can achieve remarkable results...',
    author: 'Jennifer Davis',
    date: '2024-01-10',
    readTime: '7 min read',
    category: 'Outdoor & Landscaping',
    tags: ['Landscaping', 'Budget', 'Outdoor'],
    featured: true,
    image: 'https://images.unsplash.com/photo-1521446652717-278e3f3f7353?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kc2NhcGluZyUyMGdhcmRlbiUyMGRlc2lnbnxlbnwxfHx8fDE3NTg5NjE1OTR8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 4,
    title: 'Home Security Trends 2024: Smart Solutions for Modern Homes',
    excerpt: 'Discover the latest home security technologies and trends that are reshaping how we protect our homes and families.',
    content: 'Home security has evolved dramatically with smart technology. Modern systems offer unprecedented control and monitoring capabilities...',
    author: 'David Wilson',
    date: '2024-01-08',
    readTime: '9 min read',
    category: 'Home Services & Lifestyle',
    tags: ['Security', 'Smart Home', 'Technology'],
    featured: false,
    image: 'https://images.unsplash.com/photo-1758523670768-db86402d5faf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwaW1wcm92ZW1lbnQlMjB0aXBzfGVufDF8fHx8MTc1ODk2MTU5OHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 5,
    title: 'Understanding Home Inspection Reports: A Buyer\'s Guide',
    excerpt: 'Navigate home inspection reports like a pro. Learn what to look for and how to interpret findings that could affect your purchase decision.',
    content: 'Home inspections are a critical part of the buying process. Understanding what inspectors look for and how to interpret their findings...',
    author: 'Lisa Thompson',
    date: '2024-01-05',
    readTime: '10 min read',
    category: 'Professional & Legal Services',
    tags: ['Home Inspection', 'Real Estate', 'Buying'],
    featured: false,
    image: 'https://images.unsplash.com/photo-1682888813726-24adc990e6f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwcmVub3ZhdGlvbnxlbnwxfHx8fDE3NTg4NDQ3MDV8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 6,
    title: 'Seasonal Home Maintenance Checklist: Preparing for Winter',
    excerpt: 'Keep your home in top condition with our comprehensive seasonal maintenance checklist. Prevent costly repairs with proactive care.',
    content: 'Regular maintenance is key to preserving your homes value and preventing expensive repairs. As seasons change, different areas require attention...',
    author: 'Robert Johnson',
    date: '2024-01-03',
    readTime: '12 min read',
    category: 'Repairs & Maintenance',
    tags: ['Maintenance', 'Winter', 'Prevention'],
    featured: true,
    image: 'https://images.unsplash.com/photo-1664227430687-9299c593e3da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXRocm9vbSUyMHJlbm92YXRpb24lMjBwcm9qZWN0fGVufDF8fHx8MTc1ODk2MTU4N3ww&ixlib=rb-4.1.0&q=80&w=1080'
  }];


  const categories = [
  'All Categories',
  'Construction & Renovation',
  'Repairs & Maintenance',
  'Outdoor & Landscaping',
  'Home Services & Lifestyle',
  'Professional & Legal Services'];


  const popularTags = [
  'General Contractor', 'Electrical', 'Plumbing', 'HVAC', 'Landscaping',
  'Home Security', 'Real Estate', 'DIY', 'Maintenance', 'Budget'];


  // Use API blogs if available, otherwise fall back to static blogs
  const postsToUse = blogPosts.length > 0 ? blogPosts : staticBlogPosts;

  const filteredPosts = postsToUse.filter((post) => {
    const matchesSearch = !searchTerm ||
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = !selectedCategory ||
    selectedCategory === 'All Categories' ||
    post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredPosts = postsToUse.filter((post) => post.featured);

  // Calculate dropdown position and handle click outside
  useEffect(() => {
    if (isCategoryDropdownOpen && categoryDropdownRef.current) {
      const rect = categoryDropdownRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }

    const handleClickOutside = (event) => {
      if (isCategoryDropdownOpen &&
      !event.target.closest('.category-dropdown') &&
      !event.target.closest('[data-dropdown-content]')) {
        setIsCategoryDropdownOpen(false);
      }
    };

    if (isCategoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isCategoryDropdownOpen]);

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
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl mb-6 text-white drop-shadow-lg">ReproServe Blog</h1>
          <p className="text-xl text-white drop-shadow-md max-w-3xl mx-auto">
            Expert advice, tips, and insights for users and service providers
          </p>
        </div>

        {/* Search and Filter */}
        <div
          className="rounded-2xl p-6 mb-12 relative overflow-visible"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          
          <div className="flex flex-row md:flex-row gap-4">
            <div className="relative" style={{ width: '60%', minWidth: 0 }}>
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
              <input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60" />
              
            </div>
            <div className="relative category-dropdown" style={{ width: '40%', minWidth: 0 }}>
              <button
                ref={categoryDropdownRef}
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:border-white/60 hover:bg-white/20 transition-all duration-300">
                
                <span>{selectedCategory || 'All Categories'}</span>
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-300 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCategoryDropdownOpen && typeof document !== 'undefined' && createPortal(
                <div
                  data-dropdown-content
                  className="fixed rounded-2xl shadow-lg"
                  style={{
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    width: dropdownPosition.width || 256,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
                    zIndex: 99999
                  }}>
                  
                  {categories.map((category, index) =>
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category === 'All Categories' ? '' : category);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors duration-300 drop-shadow-md ${index === 0 ? 'rounded-t-2xl' : ''} ${
                    index === categories.length - 1 ? 'rounded-b-2xl' : ''} ${
                    selectedCategory === category || !selectedCategory && category === 'All Categories' ?
                    'bg-white/10' : ''}`
                    }>
                    
                      {category}
                    </button>
                  )}
                </div>,
                document.body
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Posts */}
            {featuredPosts.length > 0 && !searchTerm && !selectedCategory &&
            <div className="mb-12">
                <h2 className="text-2xl text-white mb-6 flex items-center drop-shadow-lg">
                  <TrendingUp className="h-6 w-6 mr-2 text-sky-blue" />
                  Featured Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {featuredPosts.slice(0, 2).map((post) =>
                <div
                  key={post.id}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}>
                  
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-sky-blue/10 via-transparent to-coral-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="h-48 bg-gray-200 overflow-hidden relative">
                        <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    
                      </div>
                      <div className="p-6 relative z-10">
                        <div className="flex items-center space-x-4 text-sm text-white mb-3">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-sky-blue" />
                            <span className="drop-shadow-md">{new Date(post.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-sky-blue" />
                            <span className="drop-shadow-md">{post.readTime}</span>
                          </div>
                        </div>
                        <h3 className="text-xl text-white mb-3 group-hover:text-white transition-colors drop-shadow-md font-bold">
                          {post.title}
                        </h3>
                        <p className="text-white mb-4 leading-relaxed drop-shadow-md group-hover:text-white transition-colors duration-300">{post.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-white" />
                            <span className="text-sm text-white drop-shadow-md">{post.author}</span>
                          </div>
                          <button className="text-white hover:text-white flex items-center space-x-1 transition-colors duration-300 group-hover:translate-x-1">
                            <span>Read More</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                          </button>
                        </div>
                      </div>

                      {/* Shine effect */}
                      <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                    </div>
                )}
                </div>
              </div>
            }

            {/* Loading State */}
            {isLoading &&
            <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
                <p className="text-white drop-shadow-md">Loading blogs...</p>
              </div>
            }

            {/* Error State */}
            {error && !isLoading &&
            <div
              className="text-center py-12 rounded-2xl relative overflow-hidden mb-8"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
              
                <p className="text-xl text-white mb-4 drop-shadow-lg">Error loading blogs</p>
                <p className="text-white mb-6 drop-shadow-md">{error}</p>
                <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 font-semibold">
                
                  Retry
                </button>
              </div>
            }

            {/* All Posts */}
            {!isLoading &&
            <div>
              <h2 className="text-2xl text-white mb-6 drop-shadow-lg">
                {searchTerm || selectedCategory ? 'Search Results' : 'Latest Articles'}
              </h2>
              <div className="space-y-8">
                {filteredPosts.map((post) =>
                <div
                  key={post.id}
                  className="group relative rounded-2xl p-8 cursor-pointer overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}>
                  
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-blue/10 via-transparent to-coral-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="flex flex-col md:flex-row gap-6 relative z-10">
                      <div className="md:w-1/3">
                        <div className="h-48 bg-gray-200 rounded-lg overflow-hidden">
                          <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        
                        </div>
                      </div>
                      <div className="md:w-2/3">
                        <div className="flex items-center space-x-4 text-sm text-white mb-4">
                          <span className="px-4 py-2 bg-white backdrop-blur-sm border border-sky-blue/30 text-white rounded-full font-medium group-hover:bg-sky-blue/30 group-hover:border-sky-blue/50 transition-all duration-300">
                            {post.category}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-white" />
                            <span className="drop-shadow-md">{new Date(post.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-white" />
                            <span className="drop-shadow-md">{post.readTime}</span>
                          </div>
                        </div>
                        <h3 className="text-2xl text-white mb-4 group-hover:text-white transition-colors drop-shadow-md font-bold">
                          {post.title}
                        </h3>
                        <p className="text-white mb-4 leading-relaxed drop-shadow-md group-hover:text-white transition-colors duration-300">{post.excerpt}</p>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {post.tags.map((tag) =>
                        <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full text-xs font-medium group-hover:bg-sky-blue/20 group-hover:border-sky-blue/40 transition-all duration-300">
                              #{tag}
                            </span>
                        )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-white" />
                            <span className="text-sm text-white drop-shadow-md">{post.author}</span>
                          </div>
                          <button className="text-white hover:text-white flex items-center space-x-1 transition-colors duration-300 group-hover:translate-x-1">
                            <span>Read Full Article</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Shine effect */}
                    <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                  </div>
                )}
              </div>

              {filteredPosts.length === 0 &&
              <div
                className="text-center py-12 rounded-2xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                
                  <p className="text-xl text-white mb-4 drop-shadow-lg">No articles found</p>
                  <p className="text-white mb-6 drop-shadow-md">Try adjusting your search or browse all categories</p>
                  <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                  className="px-6 py-3 bg-sky-blue text-white rounded-xl hover:bg-sky-blue/90 hover:scale-105 transition-all duration-300 font-semibold">
                  
                    View All Articles
                  </button>
                </div>
              }
            </div>
            }
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-8 sticky top-8">
              {/* Popular Tags */}
              <div
                className="rounded-2xl p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                
                <h3 className="text-lg text-white mb-4 flex items-center drop-shadow-md">
                  <Tag className="h-5 w-5 mr-2 text-sky-blue" />
                  Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) =>
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full text-sm hover:bg-sky-blue/30 hover:border-sky-blue/50 hover:scale-105 transition-all duration-300 font-medium">
                    
                      #{tag}
                    </button>
                  )}
                </div>
              </div>

              {/* Newsletter Signup */}
              <div
                className="rounded-2xl p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                
                <h3 className="text-lg text-white mb-4 flex items-center drop-shadow-md">
                  <span className="mr-2">📧</span>
                  Stay Updated
                </h3>
                <p className="text-sm text-white mb-4 drop-shadow-md">Join 10,000+ subscribers getting weekly home improvement tips and expert insights</p>
                <div className="space-y-3">
                  <input
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm text-white border border-white/30 focus:outline-none focus:border-white/60 placeholder-white/90" />
                  
                  <button className="w-full py-3 bg-coral-orange text-black rounded-lg hover:bg-coral-orange/90 transition-all duration-300 transform hover:scale-105 shadow-lg text-center font-semibold">
                    Subscribe for Free
                  </button>
                </div>
                <p className="text-xs text-white text-center mt-3 drop-shadow-md">✓ No spam, unsubscribe anytime</p>
              </div>

              {/* Recent Posts */}
              <div
                className="rounded-2xl p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                
                <h3 className="text-lg text-white mb-4 drop-shadow-md">Recent Articles</h3>
                <div className="space-y-4">
                  {postsToUse.slice(0, 3).map((post) =>
                  <div key={post.id} className="border-b border-white/20 pb-4 last:border-b-0 last:pb-0 group">
                      <h4 className="text-sm text-white hover:text-white cursor-pointer mb-2 leading-tight transition-colors duration-300 drop-shadow-md group-hover:translate-x-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-white">
                        <Calendar className="h-3 w-3 text-sky-blue" />
                        <span className="drop-shadow-md">{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div
                className="rounded-2xl p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                
                <h3 className="text-lg text-white mb-4 drop-shadow-md">Categories</h3>
                <div className="space-y-2">
                  {categories.slice(1).map((category) =>
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`block w-full text-left py-3 px-4 rounded-xl transition-all duration-300 font-medium ${selectedCategory === category ?
                    'bg-sky-blue/30 border border-sky-blue/50 text-white backdrop-blur-sm' :
                    'text-white hover:bg-white/20 hover:border-white/30 border border-transparent backdrop-blur-sm'}`
                    }>
                    
                      {category}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}