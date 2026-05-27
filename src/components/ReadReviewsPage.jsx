import React, { useState } from 'react';
import { Star, Search, User, Calendar, CheckCircle, MessageSquare } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Check, ChevronsUpDown } from 'lucide-react';

export function ReadReviewsPage({ navigate }) {
  const [selectedProviderCategory, setSelectedProviderCategory] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedRealtorCategory, setSelectedRealtorCategory] = useState('');
  const [selectedRealtor, setSelectedRealtor] = useState('');
  const [providerCategoryOpen, setProviderCategoryOpen] = useState(false);
  const [providerOpen, setProviderOpen] = useState(false);
  const [realtorCategoryOpen, setRealtorCategoryOpen] = useState(false);
  const [realtorOpen, setRealtorOpen] = useState(false);
  const [minRating, setMinRating] = useState('');
  const [searchName, setSearchName] = useState('');

  const serviceProviderCategories = [
  'Construction & Renovation',
  'Repairs & Maintenance',
  'Outdoor & Landscaping',
  'Home Services & Lifestyle'];


  const realtorCategories = [
  'Real Estate Agents & Brokers',
  'Mortgage Lenders/Loan Officers',
  'Inspectors',
  'Insurance & Warranty Agents',
  'Title Companies'];


  const serviceProviders = [
  'Elite Construction Co.',
  'PowerFlow Electrical',
  'GreenScape Landscaping',
  'AquaFlow Plumbing',
  'SecureHome Security',
  'PaintPro Masters',
  'FloorCraft Installers',
  'RoofGuard Solutions'];


  const realtorProviders = [
  'Premier Real Estate Group',
  'HomeFinder Realty',
  'Mortgage Masters Inc.',
  'QuickLoan Solutions',
  'Certified Home Inspectors',
  'TrustGuard Insurance',
  'SecureTitle Company',
  'PropertyVision Appraisers'];


  const serviceProviderReviews = {
    'Elite Construction Co.': [
    {
      id: 1,
      reviewer: 'Sarah Johnson',
      rating: 5,
      date: '2024-01-15',
      comment: 'Outstanding work on our kitchen renovation! The team was professional, punctual, and exceeded our expectations. The quality of craftsmanship is exceptional.',
      project: 'Kitchen Renovation',
      verified: true
    },
    {
      id: 2,
      reviewer: 'Mike Rodriguez',
      rating: 5,
      date: '2024-01-10',
      comment: 'Elite Construction transformed our outdated bathroom into a modern masterpiece. Every detail was perfect, and they finished ahead of schedule.',
      project: 'Bathroom Remodel',
      verified: true
    },
    {
      id: 3,
      reviewer: 'Jennifer Liu',
      rating: 4,
      date: '2024-01-05',
      comment: 'Great communication throughout the project. Minor delays due to material delivery, but the final result was worth the wait.',
      project: 'Home Addition',
      verified: true
    }],

    'PowerFlow Electrical': [
    {
      id: 4,
      reviewer: 'David Chen',
      rating: 5,
      date: '2024-01-12',
      comment: 'Fast response for emergency electrical repair. Professional service and fair pricing. Highly recommend for any electrical work.',
      project: 'Emergency Panel Repair',
      verified: true
    },
    {
      id: 5,
      reviewer: 'Maria Santos',
      rating: 5,
      date: '2024-01-08',
      comment: 'Installed smart home wiring throughout our house. Clean work, great attention to detail, and explained everything clearly.',
      project: 'Smart Home Installation',
      verified: true
    }],

    'GreenScape Landscaping': [
    {
      id: 6,
      reviewer: 'Robert Taylor',
      rating: 5,
      date: '2024-01-14',
      comment: 'Incredible landscape design and installation. Our backyard is now our favorite space in the house. Professional team with creative vision.',
      project: 'Backyard Landscaping',
      verified: true
    },
    {
      id: 7,
      reviewer: 'Lisa Wilson',
      rating: 4,
      date: '2024-01-09',
      comment: 'Good work on our front yard makeover. Team was knowledgeable about plants and drainage. Would hire again.',
      project: 'Front Yard Renovation',
      verified: true
    }]

  };

  const realtorReviews = {
    'Premier Real Estate Group': [
    {
      id: 8,
      reviewer: 'Amanda Foster',
      rating: 5,
      date: '2024-01-16',
      comment: 'Exceptional service from start to finish. Found us the perfect home within our budget and timeline. Very knowledgeable about the local market.',
      service: 'Home Purchase',
      verified: true
    },
    {
      id: 9,
      reviewer: 'John Martinez',
      rating: 5,
      date: '2024-01-11',
      comment: 'Sold our house in just 2 weeks above asking price! Outstanding marketing strategy and negotiation skills.',
      service: 'Home Sale',
      verified: true
    }],

    'HomeFinder Realty': [
    {
      id: 10,
      reviewer: 'Katie Brown',
      rating: 4,
      date: '2024-01-13',
      comment: 'Great first-time buyer experience. Agent was patient and helped us understand every step of the process.',
      service: 'First Home Purchase',
      verified: true
    }],

    'Mortgage Masters Inc.': [
    {
      id: 11,
      reviewer: 'Steven Clark',
      rating: 5,
      date: '2024-01-07',
      comment: 'Secured an excellent mortgage rate and closed on time. Very responsive and professional throughout the process.',
      service: 'Mortgage Financing',
      verified: true
    }]

  };

  const getReviewsToShow = () => {
    let reviews = [];

    if (selectedProvider) {
      reviews = serviceProviderReviews[selectedProvider] || [];
    } else if (selectedRealtor) {
      reviews = realtorReviews[selectedRealtor] || [];
    } else {
      // Show all reviews when nothing specific is selected
      reviews = [
      ...Object.values(serviceProviderReviews).flat(),
      ...Object.values(realtorReviews).flat()];

    }

    // Apply filters
    let filteredReviews = reviews;

    // Filter by minimum rating
    if (minRating) {
      filteredReviews = filteredReviews.filter((review) => review.rating >= parseInt(minRating));
    }

    // Filter by name search
    if (searchName.trim()) {
      const searchTerm = searchName.toLowerCase();
      filteredReviews = filteredReviews.filter((review) =>
      review.reviewer.toLowerCase().includes(searchTerm) ||
      review.project && review.project.toLowerCase().includes(searchTerm) ||
      review.service && review.service.toLowerCase().includes(searchTerm)
      );
    }

    return filteredReviews;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) =>
    <Star
      key={i}
      className={`h-4 w-4 ${
      i < rating ? 'text-coral-orange fill-coral-orange' : 'text-gray-300'}`
      } />

    );
  };

  const selectedProviderName = selectedProvider || selectedRealtor;

  return (
    <div
      className="min-h-screen"
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
      
      {/* Header */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-6xl mb-6 text-white drop-shadow-lg">
            Read Reviews
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-white drop-shadow-md">
            See what customers are saying about our verified service providers and realtors
          </p>
        </div>
      </section>

      {/* Search Filters */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div
            className="rounded-2xl p-8 mb-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Service Provider Section */}
              <div className="space-y-4">
                <h3 className="text-lg text-white mb-4 drop-shadow-md">Service Providers</h3>
              
              {/* Service Provider Category Dropdown */}
              <div>
                <label className="block text-sm text-white mb-3 drop-shadow-md">
                  Service Provider Category
                </label>
                <Popover open={providerCategoryOpen} onOpenChange={setProviderCategoryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={providerCategoryOpen}
                        className="w-full justify-between h-12 px-4 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:border-white/60">
                        
                      {selectedProviderCategory || "Select a category..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-white" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search categories..." />
                      <CommandList>
                        <CommandEmpty>No categories found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                              value=""
                              onSelect={() => {
                                setSelectedProviderCategory('');
                                setProviderCategoryOpen(false);
                              }}>
                              
                            <Check
                                className={`mr-2 h-4 w-4 ${
                                selectedProviderCategory === '' ? "opacity-100" : "opacity-0"}`
                                } />
                              
                            All Categories
                          </CommandItem>
                          {serviceProviderCategories.map((category) =>
                            <CommandItem
                              key={category}
                              value={category}
                              onSelect={() => {
                                setSelectedProviderCategory(category);
                                setProviderCategoryOpen(false);
                              }}>
                              
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                selectedProviderCategory === category ? "opacity-100" : "opacity-0"}`
                                } />
                              
                              {category}
                            </CommandItem>
                            )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Service Provider Dropdown */}
              <div>
                <label className="block text-sm text-white mb-3 drop-shadow-md">
                  Service Provider
                </label>
                <Popover open={providerOpen} onOpenChange={setProviderOpen}>
                  <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={providerOpen}
                        className="w-full justify-between h-12 px-4 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:border-white/60">
                        
                      {selectedProvider || "Select a service provider..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-white" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search service providers..." />
                      <CommandList>
                        <CommandEmpty>No service providers found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                              value=""
                              onSelect={() => {
                                setSelectedProvider('');
                                setProviderOpen(false);
                              }}>
                              
                            <Check
                                className={`mr-2 h-4 w-4 ${
                                selectedProvider === '' ? "opacity-100" : "opacity-0"}`
                                } />
                              
                            All Service Providers
                          </CommandItem>
                          {serviceProviders.map((provider) =>
                            <CommandItem
                              key={provider}
                              value={provider}
                              onSelect={() => {
                                setSelectedProvider(provider);
                                setSelectedRealtor(''); // Clear realtor selection
                                setProviderOpen(false);
                              }}>
                              
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                selectedProvider === provider ? "opacity-100" : "opacity-0"}`
                                } />
                              
                              {provider}
                            </CommandItem>
                            )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Realtor Section */}
            <div className="space-y-4">
              <h3 className="text-lg text-white mb-4 drop-shadow-md">Realtors</h3>
              
              {/* Realtor Category Dropdown */}
              <div>
                <label className="block text-sm text-white mb-3 drop-shadow-md">
                  Realtor Category
                </label>
                <Popover open={realtorCategoryOpen} onOpenChange={setRealtorCategoryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={realtorCategoryOpen}
                        className="w-full justify-between h-12 px-4 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:border-white/60">
                        
                      {selectedRealtorCategory || "Select a category..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-white" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search categories..." />
                      <CommandList>
                        <CommandEmpty>No categories found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                              value=""
                              onSelect={() => {
                                setSelectedRealtorCategory('');
                                setRealtorCategoryOpen(false);
                              }}>
                              
                            <Check
                                className={`mr-2 h-4 w-4 ${
                                selectedRealtorCategory === '' ? "opacity-100" : "opacity-0"}`
                                } />
                              
                            All Categories
                          </CommandItem>
                          {realtorCategories.map((category) =>
                            <CommandItem
                              key={category}
                              value={category}
                              onSelect={() => {
                                setSelectedRealtorCategory(category);
                                setRealtorCategoryOpen(false);
                              }}>
                              
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                selectedRealtorCategory === category ? "opacity-100" : "opacity-0"}`
                                } />
                              
                              {category}
                            </CommandItem>
                            )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Realtor Dropdown */}
              <div>
                <label className="block text-sm text-white mb-3 drop-shadow-md">
                  Realtor/Real Estate Service
                </label>
                <Popover open={realtorOpen} onOpenChange={setRealtorOpen}>
                  <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={realtorOpen}
                        className="w-full justify-between h-12 px-4 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:border-white/60">
                        
                      {selectedRealtor || "Select a realtor/real estate service..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-white" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search realtors..." />
                      <CommandList>
                        <CommandEmpty>No realtors found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                              value=""
                              onSelect={() => {
                                setSelectedRealtor('');
                                setRealtorOpen(false);
                              }}>
                              
                            <Check
                                className={`mr-2 h-4 w-4 ${
                                selectedRealtor === '' ? "opacity-100" : "opacity-0"}`
                                } />
                              
                            All Realtors
                          </CommandItem>
                          {realtorProviders.map((realtor) =>
                            <CommandItem
                              key={realtor}
                              value={realtor}
                              onSelect={() => {
                                setSelectedRealtor(realtor);
                                setSelectedProvider(''); // Clear provider selection
                                setRealtorOpen(false);
                              }}>
                              
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                selectedRealtor === realtor ? "opacity-100" : "opacity-0"}`
                                } />
                              
                              {realtor}
                            </CommandItem>
                            )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

            {/* Additional Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Search by Name */}
              <div>
                <label className="block text-sm text-white mb-3 drop-shadow-md">
                  Search by Name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                    placeholder="Search by reviewer or provider name..." />
                  
                </div>
              </div>

              {/* Filter by Rating */}
              <div>
                <label className="block text-sm text-white mb-3 drop-shadow-md">
                  Minimum Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:border-white/60">
                  
                  <option value="" className="text-gray-800">All Ratings</option>
                  <option value="4" className="text-gray-800">4+ Stars</option>
                  <option value="3" className="text-gray-800">3+ Stars</option>
                  <option value="2" className="text-gray-800">2+ Stars</option>
                  <option value="1" className="text-gray-800">1+ Star</option>
                </select>
              </div>
            </div>

            {selectedProviderName &&
            <div className="text-center mb-8">
                <h2 className="text-2xl text-white mb-2 drop-shadow-lg">
                  Reviews for {selectedProviderName}
                </h2>
              </div>
            }
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getReviewsToShow().map((review) =>
            <div
              key={review.id}
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
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white drop-shadow-md group-hover:text-white transition-colors duration-300">{review.reviewer}</h3>
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            {renderStars(review.rating)}
                          </div>
                          {review.verified &&
                        <CheckCircle className="h-4 w-4 text-white" />
                        }
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-white flex items-center drop-shadow-md group-hover:text-white transition-colors duration-300">
                      <Calendar className="h-4 w-4 mr-1 text-white" />
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mb-4">
                    <span
                    className="text-sm px-3 py-1 rounded-full font-medium"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white'
                    }}>
                    
                      {review.project || review.service}
                    </span>
                  </div>

                  <p className="text-white leading-relaxed mb-4 drop-shadow-md group-hover:text-white transition-colors duration-300">
                    {review.comment}
                  </p>

                  <div className="flex items-center justify-between text-sm text-white">
                    <span className="drop-shadow-md group-hover:text-white transition-colors duration-300">Verified Review</span>
                    <button className="flex items-center space-x-1 hover:text-white transition-colors duration-300 group-hover:translate-x-1">
                      <MessageSquare className="h-4 w-4 text-white" />
                      <span className="drop-shadow-md group-hover:text-white transition-colors duration-300">Helpful</span>
                    </button>
                  </div>
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
              </div>
            )}
          </div>

          {getReviewsToShow().length === 0 &&
          <div
            className="text-center py-12 rounded-2xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            
              <Search className="h-16 w-16 text-white mx-auto mb-4 drop-shadow-md" />
              <h3 className="text-xl text-white mb-2 drop-shadow-lg">No Reviews Found</h3>
              <p className="text-white drop-shadow-md">
                Select a service provider or realtor to see their reviews.
              </p>
            </div>
          }
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div
            className="rounded-2xl p-12 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            
            <h2 className="text-3xl mb-4 text-white drop-shadow-lg">
              Ready to Find Your Perfect Professional?
            </h2>
            <p className="text-xl mb-8 text-white drop-shadow-md">
              Browse our verified service providers and get started on your next project
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('find-providers')}
                className="px-8 py-3 rounded-xl bg-coral-orange text-black transition-all duration-300 hover:bg-coral-orange/90 hover:scale-105 font-semibold shadow-lg">
                
                Find Service Providers
              </button>
              <button
                onClick={() => navigate('realtors')}
                className="px-8 py-3 rounded-xl border-2 border-white text-white transition-all duration-300 hover:bg-white hover:text-white hover:scale-105 font-semibold backdrop-blur-sm">
                
                Find Realtors
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>);

}