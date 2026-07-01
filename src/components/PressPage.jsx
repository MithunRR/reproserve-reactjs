import React from 'react';
import { Calendar, Download, ExternalLink, Mail, Phone, Award } from 'lucide-react';

export function PressPage({ navigate }) {
  const pressReleases = [
  {
    id: 1,
    title: 'ReproServe Raises $15M Series A to Expand Home Services Marketplace',
    date: '2024-01-20',
    summary: 'Funding will accelerate platform growth and enhance AI-powered contractor matching technology',
    content: 'ReproServe, the leading platform connecting homeowners with verified service providers, today announced the closing of its $15 million Series A funding round...',
    downloadUrl: '/press/reproserve-series-a-funding.pdf'
  },
  {
    id: 2,
    title: 'ReproServe Partners with Leading Insurance Companies to Offer Enhanced Protection',
    date: '2024-01-15',
    summary: 'New partnerships provide additional coverage and peace of mind for homeowners and contractors',
    content: 'ReproServe has announced strategic partnerships with major insurance providers to offer enhanced protection for home improvement projects...',
    downloadUrl: '/press/reproserve-insurance-partnerships.pdf'
  },
  {
    id: 3,
    title: 'ReproServe Launches AI-Powered Contractor Matching in 15 New Markets',
    date: '2024-01-10',
    summary: 'Advanced algorithm helps homeowners find the perfect contractor match based on project needs and preferences',
    content: 'ReproServe today announced the launch of its proprietary AI-powered matching technology in 15 additional metropolitan markets...',
    downloadUrl: '/press/reproserve-ai-matching-launch.pdf'
  },
  {
    id: 4,
    title: 'ReproServe CEO Sarah Martinez Named to Forbes 30 Under 30',
    date: '2024-01-05',
    summary: 'Recognition highlights leadership in transforming the home services industry',
    content: 'Sarah Martinez, founder and CEO of ReproServe, has been named to the prestigious Forbes 30 Under 30 list in the Consumer Technology category...',
    downloadUrl: '/press/ceo-forbes-recognition.pdf'
  },
  {
    id: 5,
    title: 'ReproServe Surpasses 1 Million Completed Projects Milestone',
    date: '2023-12-20',
    summary: 'Platform reaches major milestone with over 50,000 verified service providers nationwide',
    content: 'ReproServe announced today that it has facilitated over one million home improvement projects through its platform since launching in 2020...',
    downloadUrl: '/press/one-million-projects-milestone.pdf'
  },
  {
    id: 6,
    title: 'ReproServe Wins TechCrunch Disrupt Startup Battlefield',
    date: '2023-10-15',
    summary: 'Company recognized for innovative approach to home services marketplace',
    content: 'ReproServe was named the winner of TechCrunch Disrupt Startup Battlefield, competing against hundreds of early-stage companies...',
    downloadUrl: '/press/techcrunch-disrupt-winner.pdf'
  }];


  const awards = [
  {
    title: 'TechCrunch Disrupt Winner',
    year: '2023',
    organization: 'TechCrunch',
    description: 'Startup Battlefield Competition Winner'
  },
  {
    title: 'Forbes 30 Under 30',
    year: '2024',
    organization: 'Forbes',
    description: 'CEO Sarah Martinez - Consumer Technology'
  },
  {
    title: 'Best Home Services Platform',
    year: '2023',
    organization: 'HomeAdvisor Awards',
    description: 'Consumer Choice Award'
  },
  {
    title: 'Innovation in Marketplace Technology',
    year: '2023',
    organization: 'MarketplacePulse',
    description: 'Annual Industry Awards'
  }];





  const companyStats = [
  { metric: '50,000+', label: 'Verified Professionals' },
  { metric: '1M+', label: 'Projects Completed' },
  { metric: '4.8/5', label: 'Average Rating' },
  { metric: '30 States', label: 'Service Coverage' }];


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
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl mb-6 text-white drop-shadow-lg">Press & Media</h1>
          <p className="text-xl text-white drop-shadow-md max-w-3xl mx-auto">
            Latest news, announcements, and media resources for journalists and industry analysts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Latest News */}
            <div className="mb-12">
              <h2 className="text-3xl text-white mb-8 drop-shadow-lg">Latest News & Announcements</h2>
              <div className="space-y-6">
                {pressReleases.map((release) =>
                <div
                  key={release.id}
                  className="group relative rounded-2xl p-8 cursor-pointer overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}>
                  
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-blue/10 via-transparent to-coral-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-2xl text-white mb-3 group-hover:text-white transition-colors duration-300 font-bold drop-shadow-md cursor-pointer">
                            {release.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-white mb-4">
                            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30">
                              <Calendar className="h-4 w-4 text-sky-blue" />
                              <span className="font-medium text-white">{new Date(release.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <p className="text-white leading-relaxed group-hover:text-white transition-colors duration-300 drop-shadow-md">
                            {release.summary}
                          </p>
                        </div>
                        <div className="mt-4 md:mt-0 md:ml-6 flex space-x-3">
                          <button className="px-4 py-2 bg-sky-blue/20 backdrop-blur-sm border border-sky-blue/30 text-white rounded-xl hover:bg-sky-blue/30 hover:border-sky-blue/50 hover:scale-105 transition-all duration-300 flex items-center space-x-2">
                            <ExternalLink className="h-4 w-4" />
                            <span>Read More</span>
                          </button>
                          <button className="px-4 py-2 border-2 border-white/30 text-white rounded-xl hover:bg-white/20 hover:border-white/50 hover:scale-105 transition-all duration-300 flex items-center space-x-2">
                            <Download className="h-4 w-4" />
                            <span>PDF</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Shine effect */}
                    <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Awards & Recognition */}
            <div className="mb-12">
              <h2 className="text-3xl text-white mb-8 drop-shadow-lg">Awards & Recognition</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {awards.map((award, index) =>
                <div
                  key={index}
                  className="group relative rounded-2xl p-8 cursor-pointer overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}>
                  
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-blue/10 via-transparent to-coral-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-coral-orange/20 backdrop-blur-sm border border-coral-orange/30 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-coral-orange/30 group-hover:border-coral-orange/50 group-hover:scale-110 transition-all duration-300">
                          <Award className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div>
                          <h3 className="text-xl text-white mb-2 group-hover:text-white transition-colors duration-300 font-bold drop-shadow-md">
                            {award.title}
                          </h3>
                          <p className="text-white font-semibold group-hover:text-white transition-colors duration-300 drop-shadow-md">
                            {award.organization} • {award.year}
                          </p>
                          <p className="text-white mt-3 group-hover:text-white transition-colors duration-300 drop-shadow-md">
                            {award.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Shine effect */}
                    <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-8 sticky top-8">
              {/* Media Contact */}
              <div
                className="rounded-2xl p-8 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                
                <h3 className="text-xl text-white mb-6 drop-shadow-lg font-bold">Media Contact</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-white mb-1 drop-shadow-md">Jessica Williams</p>
                    <p className="text-sm text-white drop-shadow-md">Head of Communications</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                      <Mail className="h-4 w-4 text-white" />
                      <span className="text-sm text-white font-medium">press@reproserve.com</span>
                    </div>
                    <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                      <Phone className="h-4 w-4 text-white" />
                      <span className="text-sm text-white font-medium">(555) 123-PRESS</span>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-sky-blue/20 backdrop-blur-sm border border-sky-blue/30 text-white rounded-xl hover:bg-sky-blue/30 hover:border-sky-blue/50 hover:scale-105 transition-all duration-300 font-semibold mt-6">
                    Contact Media Team
                  </button>
                </div>
              </div>

              {/* Company Stats */}
              <div
                className="rounded-2xl p-8 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                
                <h3 className="text-xl text-white mb-6 drop-shadow-lg font-bold">Company at a Glance</h3>
                <div className="space-y-6">
                  {companyStats.map((stat, index) =>
                  <div key={index} className="text-center group">
                      <div className="text-3xl font-bold text-white group-hover:text-white transition-colors duration-300 drop-shadow-lg">
                        {stat.metric}
                      </div>
                      <div className="text-sm text-white group-hover:text-white transition-colors duration-300 drop-shadow-md">
                        {stat.label}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Links */}
              <div
                className="rounded-2xl p-8 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                
                <h3 className="text-xl text-white mb-6 drop-shadow-lg font-bold">Quick Links</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('about')}
                    className="block w-full text-left text-white hover:text-white transition-colors duration-300 py-2 px-3 rounded-xl hover:bg-white/10 group">
                    
                    About ReproServe
                  </button>
                  <button
                    onClick={() => navigate('careers')}
                    className="block w-full text-left text-white hover:text-white transition-colors duration-300 py-2 px-3 rounded-xl hover:bg-white/10 group">
                    
                    Careers
                  </button>
                  <button
                    onClick={() => navigate('blog')}
                    className="block w-full text-left text-white hover:text-white transition-colors duration-300 py-2 px-3 rounded-xl hover:bg-white/10 group">
                    
                    Company Blog
                  </button>
                  <button
                    onClick={() => navigate('contact')}
                    className="block w-full text-left text-white hover:text-white transition-colors duration-300 py-2 px-3 rounded-xl hover:bg-white/10 group">
                    
                    Contact Us
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div
          className="mt-16 rounded-2xl p-8 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          
          <h2 className="text-3xl text-white mb-4 drop-shadow-lg font-bold">Stay Informed</h2>
          <p className="mb-8 max-w-2xl mx-auto text-white drop-shadow-md">
            Subscribe to our press updates to receive the latest news and announcements from ReproServe
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60" />
            
            <button className="px-6 py-3 bg-sky-blue/20 backdrop-blur-sm border border-sky-blue/30 text-white rounded-xl hover:bg-sky-blue/30 hover:border-sky-blue/50 hover:scale-105 transition-all duration-300 font-semibold">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>);

}