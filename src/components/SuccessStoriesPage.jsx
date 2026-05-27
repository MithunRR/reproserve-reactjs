import React from 'react';
import { Star, CheckCircle, User, Home, Wrench, Calendar, MapPin, Quote } from 'lucide-react';



export function SuccessStoriesPage({ navigate }) {
  const successStories = [
  {
    id: 1,
    type: 'user',
    title: 'Kitchen Renovation Success',
    author: 'Sarah Martinez',
    location: 'Austin, TX',
    date: 'December 2024',
    rating: 5,
    category: 'Home Renovation',
    story: 'After months of research, I found Elite Construction Co. through ReproServe. Their detailed profile showed exactly what I was looking for - licensed, insured, and with stellar reviews for kitchen renovations. The entire process was seamless from quote to completion.',
    details: 'The team completed my kitchen renovation 2 days ahead of schedule and $500 under budget. The quality exceeded my expectations, and they were incredibly professional throughout the 3-week project. I couldn\'t be happier with the results!',
    outcome: 'Project completed on time and under budget',
    savings: '$500 saved',
    timeframe: '3 weeks',
    verified: true
  },
  {
    id: 2,
    type: 'realtor',
    title: 'First-Time Homebuyer Success',
    author: 'Michael Chen - Premier Real Estate Group',
    location: 'Denver, CO',
    date: 'November 2024',
    rating: 5,
    category: 'Real Estate',
    story: 'Working with the Thompson family was an absolute pleasure. As first-time homebuyers, they were understandably nervous about the process. Through ReproServe\'s platform, I was able to connect with them and guide them through every step of their home-buying journey.',
    details: 'From pre-approval to closing, we found their dream home in just 6 weeks. The integrated tools on ReproServe helped us stay organized with all the documentation and communication. The family was thrilled to close on their perfect starter home.',
    outcome: 'Successfully purchased first home',
    savings: 'Negotiated $8,000 below asking price',
    timeframe: '6 weeks',
    verified: true
  },
  {
    id: 3,
    type: 'provider',
    title: 'Emergency Plumbing Saves the Day',
    author: 'David Rodriguez - AquaFlow Plumbing',
    location: 'Phoenix, AZ',
    date: 'January 2025',
    rating: 5,
    category: 'Emergency Services',
    story: 'I received an urgent request through ReproServe from the Johnson family at 9 PM on a Sunday. Their main water line had burst, flooding their basement. Thanks to the platform\'s instant notification system, I was able to respond immediately.',
    details: 'I arrived within 45 minutes and had the water shut off and damage contained within an hour. The family was so grateful for the quick response. The next day, I completed the full repair and helped them coordinate with their insurance company.',
    outcome: 'Prevented major water damage',
    savings: 'Saved thousands in potential damage',
    timeframe: 'Emergency response: 45 minutes',
    verified: true
  },
  {
    id: 4,
    type: 'user',
    title: 'Landscape Transformation',
    author: 'Jennifer Wilson',
    location: 'Seattle, WA',
    date: 'October 2024',
    rating: 5,
    category: 'Landscaping',
    story: 'Our backyard was a disaster - overgrown, poorly drained, and completely unusable. I found GreenScape Landscaping through ReproServe and was impressed by their portfolio and customer reviews. They completely transformed our outdoor space.',
    details: 'The team created a beautiful, functional outdoor living area with proper drainage, native plants, and a stunning patio. The project took 4 weeks, and they communicated with us daily about progress. Our property value increased significantly.',
    outcome: 'Complete landscape transformation',
    savings: 'Increased home value by $15,000',
    timeframe: '4 weeks',
    verified: true
  },
  {
    id: 5,
    type: 'realtor',
    title: 'Investment Property Portfolio Growth',
    author: 'Amanda Foster - HomeFinder Realty',
    location: 'Miami, FL',
    date: 'September 2024',
    rating: 5,
    category: 'Investment Properties',
    story: 'I\'ve been helping investors build their portfolios for over 10 years, but ReproServe has revolutionized how I serve my clients. The platform\'s comprehensive tools allow me to provide unmatched service to property investors.',
    details: 'In the last 6 months, I\'ve helped my client acquire 8 investment properties using ReproServe\'s market analysis tools and contractor network. The integrated approach means my clients can purchase, renovate, and rent properties seamlessly.',
    outcome: 'Built successful investment portfolio',
    savings: '8 properties acquired efficiently',
    timeframe: '6 months',
    verified: true
  }];


  const getTypeIcon = (type) => {
    switch (type) {
      case 'user':
        return User;
      case 'realtor':
        return Home;
      case 'provider':
        return Wrench;
      default:
        return User;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'user':
        return 'bg-sky-blue';
      case 'realtor':
        return 'bg-coral-orange';
      case 'provider':
        return 'bg-cool-gray';
      default:
        return 'bg-sky-blue';
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'user':
        return 'Verified User';
      case 'realtor':
        return 'Verified Realtor';
      case 'provider':
        return 'Verified Provider';
      default:
        return 'Verified User';
    }
  };

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
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl mb-4 text-white drop-shadow-lg">
            Success Stories
          </h1>
          <p className="text-lg mb-6 max-w-3xl mx-auto text-white drop-shadow-md">
            Real stories from verified users, realtors, and service providers who found success through ReproServe
          </p>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center">
                <div className="text-3xl text-white mb-2 drop-shadow-lg">50,000+</div>
                <div className="text-sm text-white drop-shadow-md">Projects Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl text-white mb-2 drop-shadow-lg">98%</div>
                <div className="text-sm text-white drop-shadow-md">Customer Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl text-white mb-2 drop-shadow-lg">5,000+</div>
                <div className="text-sm text-white drop-shadow-md">Verified Professionals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl text-white mb-2 drop-shadow-lg">$2M+</div>
                <div className="text-sm text-white drop-shadow-md">Saved by Customers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-8">
            {successStories.map((story) => {
              const IconComponent = getTypeIcon(story.type);
              return (
                <div
                  key={story.id}
                  className="group relative rounded-2xl p-8 overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}>
                  
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-blue/10 via-transparent to-coral-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl text-white mb-2 group-hover:text-white transition-colors drop-shadow-md font-bold">{story.title}</h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-white drop-shadow-md">{story.author}</span>
                            {story.verified &&
                            <CheckCircle className="h-4 w-4 text-white" />
                            }
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-white">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-sky-blue" />
                              <span className="drop-shadow-md">{story.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-sky-blue" />
                              <span className="drop-shadow-md">{story.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full text-xs font-medium group-hover:bg-sky-blue/20 group-hover:border-sky-blue/40 transition-all duration-300">
                          {getTypeBadge(story.type)}
                        </span>
                        <div className="flex items-center space-x-1">
                          {[...Array(story.rating)].map((_, i) =>
                          <Star key={i} className="h-4 w-4 fill-coral-orange text-coral-orange" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div
                        className="p-6 rounded-xl relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                        
                        <Quote className="h-5 w-5 text-white mb-3 drop-shadow-md" />
                        <p className="text-white leading-relaxed italic drop-shadow-md group-hover:text-white transition-colors duration-300">
                          "{story.story}"
                        </p>
                      </div>
                      
                      <p className="text-white leading-relaxed drop-shadow-md group-hover:text-white transition-colors duration-300">
                        {story.details}
                      </p>

                      <div
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-xl relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                        
                        <div>
                          <div className="text-sm text-white mb-1 drop-shadow-md">Outcome</div>
                          <div className="text-white drop-shadow-md">{story.outcome}</div>
                        </div>
                        <div>
                          <div className="text-sm text-white mb-1 drop-shadow-md">Value</div>
                          <div className="text-white drop-shadow-md">{story.savings}</div>
                        </div>
                        <div>
                          <div className="text-sm text-white mb-1 drop-shadow-md">Timeframe</div>
                          <div className="text-white drop-shadow-md">{story.timeframe}</div>
                        </div>
                      </div>

                      <span
                        className="inline-block px-4 py-2 rounded-full text-xs font-medium"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: 'white'
                        }}>
                        
                        {story.category}
                      </span>
                    </div>
                  </div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                </div>);

            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div
            className="rounded-2xl p-12 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(0,137,225,0.2), rgba(255,107,53,0.2))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            
            <h2 className="text-3xl mb-3 text-white drop-shadow-lg">
              Ready to Create Your Success Story?
            </h2>
            <p className="text-lg mb-6 text-white drop-shadow-md">
              Join thousands of satisfied users who have found success on ReproServe
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('register')}
                className="px-8 py-3 rounded-xl bg-white text-white transition-all duration-300 hover:bg-white/90 hover:scale-105 font-semibold shadow-lg">
                
                Get Started Today
              </button>
              <button
                onClick={() => navigate('find-providers')}
                className="px-8 py-3 rounded-xl border-2 bg-coral-orange border-white text-black transition-all duration-300 hover:bg-coral-orange/90 hover:text-black hover:scale-105 font-semibold backdrop-blur-sm">
                
                Find Professionals
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Share Your Story */}
      <section className="py-10 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div
            className="rounded-2xl p-12 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            
            <h2 className="text-3xl mb-3 text-white drop-shadow-lg">
              Share Your Success Story
            </h2>
            <p className="text-lg mb-6 text-white drop-shadow-md">
              Have a great experience with ReproServe? We'd love to hear from you!
            </p>
            <button
              onClick={() => navigate('contact')}
              className="px-8 py-3 rounded-xl bg-sky-blue text-white transition-all duration-300 hover:bg-sky-blue/90 hover:scale-105 font-semibold shadow-lg">
              
              Submit Your Story
            </button>
          </div>
        </div>
      </section>
    </div>);

}