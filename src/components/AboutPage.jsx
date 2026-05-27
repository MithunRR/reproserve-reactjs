import React from 'react';
import { Users, Target, Award, Heart, MapPin, Mail, Linkedin } from 'lucide-react';

export function AboutPage({ navigate }) {
  const teamMembers = [
  {
    name: 'Sarah Martinez',
    position: 'CEO & Founder',
    bio: 'Former real estate agent with 15+ years experience connecting users with trusted professionals.',
    image: 'https://images.unsplash.com/photo-1652471949169-9c587e8898cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHdvbWFufGVufDF8fHx8MTc1OTE1MjIwMHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    name: 'Michael Chen',
    position: 'CTO',
    bio: 'Technology leader with expertise in marketplace platforms and customer matching algorithms.',
    image: 'https://images.unsplash.com/photo-1719257751404-1dea075324bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMG1hbnxlbnwxfHx8fDE3NTkxMjI4MDN8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    name: 'Jennifer Davis',
    position: 'VP of Operations',
    bio: 'Operations expert ensuring quality service delivery and customer satisfaction.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMG1hbnxlbnwxfHx8fDE3NTkxMjI4MDN8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    name: 'David Wilson',
    position: 'Head of Business Development',
    bio: 'Building partnerships with service providers and expanding our network nationwide.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMG1hbnxlbnwxfHx8fDE3NTkxMjI4MDN8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    name: 'Lisa Thompson',
    position: 'Customer Success Manager',
    bio: 'Dedicated to ensuring both users and service providers have exceptional experiences.',
    image: 'https://images.unsplash.com/photo-1652471949169-9c587e8898cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHdvbWFufGVufDF8fHx8MTc1OTE1MjIwMHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    name: 'Robert Johnson',
    position: 'Quality Assurance Director',
    bio: 'Overseeing our verification process to maintain the highest standards of service quality.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMG1hbnxlbnwxfHx8fDE3NTkxMjI4MDN8MA&ixlib=rb-4.1.0&q=80&w=1080'
  }];


  const values = [
  {
    icon: Heart,
    title: 'Trust & Transparency',
    description: 'We believe in building trust through verified professionals and transparent reviews.'
  },
  {
    icon: Award,
    title: 'Quality First',
    description: 'Every service provider on our platform is vetted for quality and reliability.'
  },
  {
    icon: Users,
    title: 'Community Focus',
    description: 'Supporting local businesses and users in building stronger communities.'
  },
  {
    icon: Target,
    title: 'Customer Success',
    description: 'Your success is our success. We\'re committed to exceptional outcomes for all.'
  }];


  const milestones = [
  { year: '2020', event: 'ReproServe founded with a vision to transform home services' },
  { year: '2021', event: 'Reached 1,000 verified service providers across 5 states' },
  { year: '2022', event: 'Launched mobile app and expanded to 15 states' },
  { year: '2023', event: 'Achieved 50,000+ completed projects and nationwide coverage' },
  { year: '2024', event: 'Introduced AI-powered matching and expanded service categories' }];


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
      
      <div className="container mx-auto max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl mb-6 text-white drop-shadow-lg">About ReproServe</h1>
          <p className="text-xl text-white drop-shadow-md max-w-3xl mx-auto leading-relaxed">
            We're on a mission to connect users with trusted service professionals, 
            making home improvement projects easier, more reliable, and stress-free.
          </p>
        </div>

        {/* Company Story */}
        <div
          className="rounded-2xl p-8 mb-16 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            <div>
              <h2 className="text-3xl text-white mb-6 drop-shadow-lg">Our Story</h2>
              <div className="space-y-4 text-white leading-relaxed drop-shadow-md">
                <p>
                  ReproServe was born out of frustration with the traditional way of finding reliable home service providers. 
                  Our founder, Sarah Martinez, spent years in real estate and witnessed countless users struggling to 
                  find trustworthy contractors for their projects.
                </p>
                <p>
                  In 2020, we set out to solve this problem by creating a platform that thoroughly vets service providers, 
                  provides transparent reviews, and makes it easy for users to connect with the right professionals 
                  for their needs.
                </p>
                <p>
                  Today, we're proud to serve users nationwide, connecting them with over 50,000 verified professionals 
                  across all home service categories. Our commitment to quality, transparency, and customer success remains 
                  at the heart of everything we do.
                </p>
              </div>
            </div>
            <div className="text-center">
              <div
                className="rounded-2xl p-8 text-white relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,137,225,0.2), rgba(0,69,113,0.2))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                }}>
                
                <div className="text-4xl font-bold mb-2 drop-shadow-lg">50,000+</div>
                <div className="text-lg mb-4 drop-shadow-md">Verified Professionals</div>
                <div className="text-4xl font-bold mb-2 drop-shadow-lg">1M+</div>
                <div className="text-lg mb-4 drop-shadow-md">Projects Completed</div>
                <div className="text-4xl font-bold mb-2 drop-shadow-lg">4.8/5</div>
                <div className="text-lg drop-shadow-md">Average Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <h2 className="text-3xl text-white text-center mb-12 drop-shadow-lg">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-sky-blue rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-snow-white" />
                  </div>
                  <h3 className="text-xl text-white mb-3 drop-shadow-md">{value.title}</h3>
                  <p className="text-white leading-relaxed drop-shadow-md">{value.description}</p>
                </div>);

            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2 className="text-3xl text-white text-center mb-12 drop-shadow-lg">Our Journey</h2>
          <div className="space-y-8">
            {milestones.map((milestone, index) =>
            <div key={index} className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-sky-blue rounded-full flex items-center justify-center text-snow-white font-bold text-lg flex-shrink-0">
                  {milestone.year}
                </div>
                <div className="flex-1 bg-powder-blue/20 rounded-lg p-6">
                  <p className="text-white leading-relaxed drop-shadow-md">{milestone.event}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl text-white text-center mb-12 drop-shadow-lg">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) =>
            <div
              key={index}
              className="group relative rounded-2xl p-8 cursor-pointer overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2 text-center"
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
                  <div className="w-28 h-28 rounded-full mx-auto mb-6 overflow-hidden ring-4 ring-white/20 group-hover:ring-sky-blue/30 transition-all duration-300">
                    <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300"
                    style={{ aspectRatio: '1/1', objectPosition: 'center top' }} />
                  
                  </div>
                  
                  <h3 className="text-2xl text-white mb-2 group-hover:text-white transition-colors duration-300 font-bold drop-shadow-md">
                    {member.name}
                  </h3>
                  
                  <p className="text-white mb-4 font-semibold group-hover:text-white transition-colors duration-300">
                    {member.position}
                  </p>
                  
                  <p className="text-white leading-relaxed mb-6 group-hover:text-white transition-colors duration-300 drop-shadow-md">
                    {member.bio}
                  </p>
                  
                  <div className="flex justify-center space-x-4">
                    <button className="p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-sky-blue/30 hover:border-sky-blue/40 hover:scale-110 transition-all duration-300 group-hover:shadow-lg">
                      <Mail className="h-5 w-5" />
                    </button>
                    <button className="p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-sky-blue/30 hover:border-sky-blue/40 hover:scale-110 transition-all duration-300 group-hover:shadow-lg">
                      <Linkedin className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
              </div>
            )}
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-sky-blue rounded-lg p-8 text-center text-snow-white mb-16">
          <h2 className="text-3xl mb-6">Our Mission</h2>
          <p className="text-xl leading-relaxed max-w-4xl mx-auto">
            To revolutionize the home services industry by creating a trusted marketplace where users can 
            confidently connect with verified professionals, ensuring every project is completed with excellence, 
            transparency, and peace of mind.
          </p>
        </div>

        {/* Contact CTA */}
        <div className="text-center bg-powder-blue/20 rounded-lg p-8">
          <h2 className="text-3xl text-white mb-4">Get in Touch</h2>
          <p className="text-white mb-6">
            Have questions about ReproServe? We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('contact')}
              className="px-6 py-3 bg-sky-blue text-snow-white rounded-md hover:opacity-90">
              
              Contact Us
            </button>
            <button
              onClick={() => navigate('careers')}
              className="px-6 py-3 border-2 border-sky-blue text-white rounded-md hover:bg-sky-blue hover:text-snow-white">
              
              Join Our Team
            </button>
          </div>
        </div>

        {/* Office Location */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl text-white mb-6">Our Headquarters</h3>
          <div className="flex items-center justify-center space-x-2 text-white mb-4">
            <MapPin className="h-5 w-5" />
            <span>123 Innovation Drive, Tech Park, Phoenix, AZ 85001</span>
          </div>
          <p className="text-white">
            While we serve customers nationwide, our headquarters in Phoenix reflects our commitment 
            to the communities we serve.
          </p>
        </div>
      </div>
    </div>);

}