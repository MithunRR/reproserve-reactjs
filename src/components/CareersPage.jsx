import React, { useState } from 'react';
import { MapPin, Clock, DollarSign, Users, Heart, Award, Target, TrendingUp, Send } from 'lucide-react';

export function CareersPage({ navigate }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    coverLetter: '',
    resume: null
  });

  const jobOpenings = [
  {
    id: 1,
    title: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'Phoenix, AZ / Remote',
    type: 'Full-time',
    salary: '$120,000 - $160,000',
    experience: '5+ years',
    description: 'Join our engineering team to build scalable marketplace solutions that connect homeowners with trusted service providers.',
    responsibilities: [
    'Develop and maintain React-based web applications',
    'Design and implement RESTful APIs and microservices',
    'Collaborate with product and design teams on new features',
    'Mentor junior developers and contribute to code reviews',
    'Optimize application performance and scalability'],

    requirements: [
    'Bachelor\'s degree in Computer Science or related field',
    '5+ years of experience with React, Node.js, and TypeScript',
    'Experience with cloud platforms (AWS, Azure, or GCP)',
    'Strong understanding of database design and optimization',
    'Excellent problem-solving and communication skills'],

    benefits: ['Health, dental, and vision insurance', 'Flexible work arrangements', '$5,000 professional development budget', 'Stock options']
  },
  {
    id: 2,
    title: 'Product Manager',
    department: 'Product',
    location: 'Phoenix, AZ',
    type: 'Full-time',
    salary: '$100,000 - $130,000',
    experience: '3-5 years',
    description: 'Lead product strategy and development for our marketplace platform, focusing on user experience and business growth.',
    responsibilities: [
    'Define product roadmap and strategy',
    'Work closely with engineering and design teams',
    'Conduct user research and market analysis',
    'Manage product launches and feature rollouts',
    'Analyze product metrics and user feedback'],

    requirements: [
    'Bachelor\'s degree in Business, Engineering, or related field',
    '3-5 years of product management experience',
    'Experience with marketplace or two-sided platforms',
    'Strong analytical and data-driven decision-making skills',
    'Excellent communication and leadership abilities'],

    benefits: ['Comprehensive health benefits', 'Flexible PTO policy', 'Home office stipend', 'Performance bonuses']
  },
  {
    id: 3,
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Phoenix, AZ / Remote',
    type: 'Full-time',
    salary: '$65,000 - $85,000',
    experience: '2-4 years',
    description: 'Ensure customer satisfaction and success by building relationships with homeowners and service providers on our platform.',
    responsibilities: [
    'Manage customer onboarding and training',
    'Provide ongoing support and account management',
    'Identify opportunities for account growth',
    'Collaborate with sales and product teams',
    'Develop customer success processes and materials'],

    requirements: [
    'Bachelor\'s degree preferred',
    '2-4 years of customer success or account management experience',
    'Strong interpersonal and communication skills',
    'Experience with CRM systems and customer analytics',
    'Problem-solving mindset and attention to detail'],

    benefits: ['Health and wellness benefits', 'Work from home options', 'Professional development opportunities', 'Team building events']
  },
  {
    id: 4,
    title: 'Marketing Specialist',
    department: 'Marketing',
    location: 'Phoenix, AZ',
    type: 'Full-time',
    salary: '$55,000 - $70,000',
    experience: '2-3 years',
    description: 'Drive marketing initiatives to attract homeowners and service providers to our platform through digital campaigns and content marketing.',
    responsibilities: [
    'Develop and execute digital marketing campaigns',
    'Create content for blog, social media, and email marketing',
    'Manage SEO and SEM strategies',
    'Analyze campaign performance and optimize for ROI',
    'Coordinate with design team on marketing materials'],

    requirements: [
    'Bachelor\'s degree in Marketing, Communications, or related field',
    '2-3 years of digital marketing experience',
    'Experience with Google Ads, Facebook Ads, and analytics tools',
    'Strong writing and content creation skills',
    'Knowledge of SEO best practices'],

    benefits: ['Health benefits package', 'Flexible schedule', 'Marketing conferences and training', 'Creative freedom']
  },
  {
    id: 5,
    title: 'UX/UI Designer',
    department: 'Design',
    location: 'Phoenix, AZ / Remote',
    type: 'Full-time',
    salary: '$80,000 - $105,000',
    experience: '3-5 years',
    description: 'Design intuitive and engaging user experiences for our web and mobile platforms, focusing on both homeowner and service provider workflows.',
    responsibilities: [
    'Create user-centered design solutions',
    'Develop wireframes, prototypes, and high-fidelity mockups',
    'Conduct user research and usability testing',
    'Collaborate with product and engineering teams',
    'Maintain and evolve our design system'],

    requirements: [
    'Bachelor\'s degree in Design, HCI, or related field',
    '3-5 years of UX/UI design experience',
    'Proficiency in Figma, Sketch, or similar design tools',
    'Experience with user research and testing methodologies',
    'Strong portfolio demonstrating design process and outcomes'],

    benefits: ['Premium health coverage', 'Design tool subscriptions', 'Conference attendance', 'Flexible work environment']
  },
  {
    id: 6,
    title: 'Business Development Representative',
    department: 'Sales',
    location: 'Phoenix, AZ',
    type: 'Full-time',
    salary: '$45,000 - $65,000 + Commission',
    experience: '1-2 years',
    description: 'Generate new business opportunities by prospecting and qualifying leads for our service provider marketplace.',
    responsibilities: [
    'Prospect and qualify potential service provider partners',
    'Conduct outbound sales calls and emails',
    'Schedule meetings for senior sales team',
    'Maintain accurate records in CRM system',
    'Collaborate with marketing on lead generation'],

    requirements: [
    'Bachelor\'s degree preferred',
    '1-2 years of sales or business development experience',
    'Strong communication and interpersonal skills',
    'Self-motivated with a results-driven approach',
    'Experience with Salesforce or similar CRM platforms'],

    benefits: ['Base salary plus commission', 'Health benefits', 'Sales training and development', 'Growth opportunities']
  }];


  const companyValues = [
  {
    icon: Heart,
    title: 'Customer Obsession',
    description: 'We put our customers first in everything we do'
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'We strive for excellence in our work and continuous improvement'
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'We work together as one team to achieve our goals'
  },
  {
    icon: Target,
    title: 'Innovation',
    description: 'We embrace new ideas and creative solutions'
  }];


  const benefits = [
  'Comprehensive health, dental, and vision insurance',
  'Flexible work arrangements and remote work options',
  'Generous PTO and holiday policy',
  'Professional development budget ($5,000/year)',
  'Stock options and equity participation',
  'Home office setup stipend',
  'Team building events and company retreats',
  'Wellness programs and gym membership reimbursement'];


  const handleApplicationSubmit = (e) => {
    e.preventDefault();
    // Mock application submission
    alert('Application submitted successfully! We\'ll be in touch soon.');
    setApplicationForm({
      name: '',
      email: '',
      phone: '',
      position: '',
      experience: '',
      coverLetter: '',
      resume: null
    });
    setSelectedJob(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setApplicationForm((prev) => ({
      ...prev,
      resume: e.target.files[0]
    }));
  };

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
          <h1 className="text-4xl md:text-5xl mb-6 text-white drop-shadow-lg">Join Our Team</h1>
          <p className="text-xl text-white drop-shadow-md max-w-3xl mx-auto mb-8">
            Help us transform the home services industry while building a career you love
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl text-white mb-2 drop-shadow-lg">50+</div>
              <p className="text-white drop-shadow-md">Team Members</p>
            </div>
            <div className="text-center">
              <div className="text-3xl text-white mb-2 drop-shadow-lg">100%</div>
              <p className="text-white drop-shadow-md">Remote Friendly</p>
            </div>
            <div className="text-center">
              <div className="text-3xl text-white mb-2 drop-shadow-lg">4.9★</div>
              <p className="text-white drop-shadow-md">Employee Rating</p>
            </div>
          </div>
        </div>

        {/* Company Values */}
        <div className="mb-16">
          <h2 className="text-3xl text-white text-center mb-12 drop-shadow-lg">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {companyValues.map((value, index) => {
              const IconComponent = value.icon;
              return (
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
                    <div className="w-20 h-20 bg-sky-blue/20 backdrop-blur-sm border border-white rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-sky-blue/30 group-hover:border-white/50 transition-all duration-300">
                      <IconComponent className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="text-2xl text-white mb-4 group-hover:text-white transition-colors duration-300 font-bold drop-shadow-md">
                      {value.title}
                    </h3>
                    <p className="text-white leading-relaxed group-hover:text-gray-200 transition-colors duration-300 drop-shadow-md">
                      {value.description}
                    </p>
                  </div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                </div>);

            })}
          </div>
        </div>

        {/* Benefits */}
        <div
          className="mb-16 rounded-2xl p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          
          <h2 className="text-3xl text-white text-center mb-8 drop-shadow-lg">Why Work With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {benefits.map((benefit, index) =>
            <div key={index} className="flex items-center space-x-3 group">
                <div className="w-3 h-3 bg-sky-blue rounded-full flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
                <span className="text-white group-hover:text-gray-200 transition-colors duration-300 drop-shadow-md">{benefit}</span>
              </div>
            )}
          </div>
        </div>

        {/* Job Openings */}
        <div>
          <h2 className="text-3xl text-white text-center mb-12 drop-shadow-lg">Open Positions</h2>

          {selectedJob ?
          <div
            className="rounded-2xl shadow-lg relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
            
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl text-white mb-2 drop-shadow-md">{selectedJob.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-white">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {selectedJob.location}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {selectedJob.type}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {selectedJob.salary}
                      </span>
                      <span className="px-3 py-1 bg-sky-blue/20 backdrop-blur-sm border border-sky-blue/30 text-white rounded-full">
                        {selectedJob.department}
                      </span>
                    </div>
                  </div>
                  <button
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-3 text-white rounded-lg hover:scale-105 transition-all duration-300 font-semibold cursor-pointer shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  }}>
                  
                    Back to Jobs
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <div>
                      <h4 className="text-xl text-white mb-4 drop-shadow-md">Job Description</h4>
                      <p className="text-white leading-relaxed drop-shadow-md">{selectedJob.description}</p>
                    </div>

                    <div>
                      <h4 className="text-xl text-white mb-4 drop-shadow-md">Responsibilities</h4>
                      <ul className="space-y-2">
                        {selectedJob.responsibilities.map((responsibility, index) =>
                      <li key={index} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-sky-blue rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-white drop-shadow-md">{responsibility}</span>
                          </li>
                      )}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xl text-white mb-4 drop-shadow-md">Requirements</h4>
                      <ul className="space-y-2">
                        {selectedJob.requirements.map((requirement, index) =>
                      <li key={index} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-coral-orange rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-white drop-shadow-md">{requirement}</span>
                          </li>
                      )}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xl text-white mb-4 drop-shadow-md">Benefits</h4>
                      <ul className="space-y-2">
                        {selectedJob.benefits.map((benefit, index) =>
                      <li key={index} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-white drop-shadow-md">{benefit}</span>
                          </li>
                      )}
                      </ul>
                    </div>
                  </div>

                  {/* Application Form */}
                  <div className="lg:col-span-1">
                    <div
                    className="rounded-2xl p-6 sticky top-8"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}>
                    
                      <h4 className="text-xl text-white mb-6 drop-shadow-md">Apply for this Position</h4>
                      <form onSubmit={handleApplicationSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm text-white mb-1 drop-shadow-md">Full Name *</label>
                          <input
                          type="text"
                          name="name"
                          value={applicationForm.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 rounded border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                          placeholder="Enter your full name" />
                        
                        </div>
                        <div>
                          <label className="block text-sm text-white mb-1 drop-shadow-md">Email *</label>
                          <input
                          type="email"
                          name="email"
                          value={applicationForm.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 rounded border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                          placeholder="Enter your email" />
                        
                        </div>
                        <div>
                          <label className="block text-sm text-white mb-1 drop-shadow-md">Phone</label>
                          <input
                          type="tel"
                          name="phone"
                          value={applicationForm.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                          placeholder="Enter your phone number" />
                        
                        </div>
                        <div>
                          <label className="block text-sm text-white mb-1 drop-shadow-md">Years of Experience *</label>
                          <select
                          name="experience"
                          value={applicationForm.experience}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 rounded border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:border-white/60">
                          
                            <option value="" className="text-gray-800">Select experience</option>
                            <option value="0-1" className="text-gray-800">0-1 years</option>
                            <option value="2-3" className="text-gray-800">2-3 years</option>
                            <option value="4-5" className="text-gray-800">4-5 years</option>
                            <option value="6-10" className="text-gray-800">6-10 years</option>
                            <option value="10+" className="text-gray-800">10+ years</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-white mb-1 drop-shadow-md">Cover Letter *</label>
                          <textarea
                          name="coverLetter"
                          value={applicationForm.coverLetter}
                          onChange={handleInputChange}
                          required
                          rows="4"
                          className="w-full px-3 py-2 rounded border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                          placeholder="Tell us why you're interested in this role..." />
                        
                        </div>
                        <div>
                          <label className="block text-sm text-white mb-1 drop-shadow-md">Resume *</label>
                          <input
                          type="file"
                          onChange={handleFileChange}
                          required
                          accept=".pdf,.doc,.docx"
                          className="w-full px-3 py-2 rounded border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:border-white/60" />
                        
                        </div>
                        <button
                        type="submit"
                        className="w-full py-3 text-white rounded-lg hover:scale-105 transition-all duration-300 font-semibold cursor-pointer shadow-lg flex items-center justify-center space-x-2"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(255, 255, 255, 0.4)',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        }}>
                        
                          <Send className="h-4 w-4" />
                          <span>Submit Application</span>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div> :

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobOpenings.map((job) =>
            <div
              key={job.id}
              className="group relative rounded-2xl p-8 cursor-pointer overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2"
              onClick={() => setSelectedJob(job)}
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
                    <div className="mb-6">
                      <h3 className="text-2xl text-white mb-3 group-hover:text-white transition-colors duration-300 font-bold drop-shadow-md">
                        {job.title}
                      </h3>
                      <span className="px-4 py-2 bg-sky-blue/20 backdrop-blur-sm border border-sky-blue/30 text-white rounded-full text-sm font-medium group-hover:bg-sky-blue/30 group-hover:border-sky-blue/50 transition-all duration-300">
                        {job.department}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6 text-sm text-white">
                      <div className="flex items-center group-hover:text-gray-200 transition-colors duration-300">
                        <MapPin className="h-4 w-4 mr-4 text-white" />
                        {job.location}
                      </div>
                      <div className="flex items-center group-hover:text-gray-200 transition-colors duration-300">
                        <Clock className="h-4 w-4 mr-4 text-sky-blue" />
                        {job.type}
                      </div>
                      <div className="flex items-center group-hover:text-gray-200 transition-colors duration-300">
                        <DollarSign className="h-4 w-4 mr-4 text-sky-blue" />
                        {job.salary.replace(/\$/g, '')}
                      </div>
                      <div className="flex items-center group-hover:text-gray-200 transition-colors duration-300">
                        <TrendingUp className="h-4 w-4 mr-4 text-sky-blue" />
                        {job.experience} experience
                      </div>
                    </div>

                    <p className="text-white text-sm mb-6 leading-relaxed group-hover:text-gray-200 transition-colors duration-300 drop-shadow-md">
                      {job.description}
                    </p>

                    <button
                  onClick={() => setSelectedJob(job)}
                  className="w-full px-4 py-2 text-white rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  }}>
                  
                      View Details
                    </button>
                  </div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                </div>
            )}
            </div>
          }
        </div>

        {/* Contact for General Inquiries */}
        <div
          className="mt-16 text-center rounded-2xl p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          
          <h2 className="text-2xl text-white mb-4 drop-shadow-lg">Don't See a Perfect Fit?</h2>
          <p className="text-white mb-6 max-w-2xl mx-auto drop-shadow-md">
            We're always looking for talented individuals to join our team. Send us your resume and tell us how you'd like to contribute to ReproServe's mission.
          </p>
          <button
            onClick={() => navigate('contact')}
            className="px-4 py-3 text-white rounded-lg hover:scale-105 transition-all duration-300 font-semibold cursor-pointer shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            }}>
            
            Get in Touch
          </button>
        </div>
      </div>
    </div>);

}