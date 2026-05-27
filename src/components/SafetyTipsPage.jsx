import React from 'react';
import { Shield, CheckCircle, AlertTriangle, Users, FileText, Eye, Phone, Home, DollarSign, Clock, Star, Handshake, MessageSquare, Calendar } from 'lucide-react';


export function SafetyTipsPage({ navigate }) {
  const serviceProviderTips = [
  {
    id: 1,
    icon: Shield,
    title: "Verify Licensing and Insurance",
    description: "Always check that service providers have valid licenses for your area and carry liability insurance. Ask to see documentation and verify with local licensing boards.",
    details: "Request certificate numbers and contact insurance companies directly to confirm coverage is current and adequate for your project size."
  },
  {
    id: 2,
    icon: FileText,
    title: "Get Everything in Writing",
    description: "Ensure all agreements, quotes, timelines, and specifications are documented in a detailed written contract before work begins.",
    details: "Include materials specifications, labor costs, cleanup responsibilities, and change order procedures. Never accept verbal agreements alone."
  },
  {
    id: 3,
    icon: DollarSign,
    title: "Avoid Large Upfront Payments",
    description: "Never pay large sums upfront. Legitimate contractors typically ask for a small deposit (10-15%) with progress payments tied to completed milestones.",
    details: "Be wary of contractors demanding full payment upfront or asking for cash only. Use payment schedules that protect your interests."
  },
  {
    id: 4,
    icon: Users,
    title: "Check References and Reviews",
    description: "Contact previous customers and check online reviews. Ask to see examples of similar completed projects and verify the quality of work.",
    details: "Look for patterns in reviews, both positive and negative. Ask references about timeliness, cleanliness, and how issues were resolved."
  },
  {
    id: 5,
    icon: Eye,
    title: "Be Present During Key Phases",
    description: "Stay involved throughout the project. Be present during important milestones and don't hesitate to ask questions about the work being performed.",
    details: "Schedule regular check-ins and walkthroughs. Take photos of work progress for your records and to document any concerns."
  },
  {
    id: 6,
    icon: AlertTriangle,
    title: "Trust Your Instincts",
    description: "If something feels off about a contractor's approach, pricing, or communication, don't ignore those feelings. Take time to research further.",
    details: "Red flags include door-to-door sales, pressure tactics, prices significantly below market rate, or reluctance to provide documentation."
  },
  {
    id: 7,
    icon: Phone,
    title: "Maintain Open Communication",
    description: "Establish clear communication channels and expectations for updates. Regular communication helps prevent misunderstandings and ensures project success.",
    details: "Set expectations for frequency of updates, preferred communication methods, and how to handle changes or concerns as they arise."
  }];


  const realtorTips = [
  {
    id: 8,
    icon: CheckCircle,
    title: "Verify Agent Credentials",
    description: "Confirm your realtor is licensed in your state and check their standing with the local real estate board. Look up any disciplinary actions or complaints.",
    details: "Use state licensing websites to verify credentials and check for any violations or sanctions against the agent or their brokerage."
  },
  {
    id: 9,
    icon: Star,
    title: "Research Track Record",
    description: "Review the agent's recent sales history, average days on market, and client testimonials. Look for experience in your specific market and price range.",
    details: "Ask for statistics on their last 20 transactions, including sale price vs. listing price ratios and how long properties stayed on market."
  },
  {
    id: 10,
    icon: Handshake,
    title: "Understand the Agreement",
    description: "Carefully review all contracts and agreements before signing. Understand commission structures, exclusive periods, and termination clauses.",
    details: "Know your rights to terminate the agreement if you're unsatisfied. Ask about dual agency situations and how conflicts of interest are handled."
  },
  {
    id: 11,
    icon: MessageSquare,
    title: "Establish Communication Expectations",
    description: "Set clear expectations for how often you'll receive updates and through what channels. Ensure your agent is responsive to your preferred communication style.",
    details: "Discuss response time expectations, frequency of market updates, and how quickly you'll be notified of new listings or offers."
  },
  {
    id: 12,
    icon: Home,
    title: "Get Independent Market Analysis",
    description: "Don't rely solely on your agent's market analysis. Research comparable sales yourself and consider getting a second opinion on pricing strategies.",
    details: "Use online tools and public records to verify comparable sales. Consider consulting with another agent for a second market opinion."
  },
  {
    id: 13,
    icon: Calendar,
    title: "Set Realistic Timelines",
    description: "Work with your agent to establish realistic timelines for your buying or selling goals. Factor in market conditions and your specific circumstances.",
    details: "Understand current market conditions, typical time frames for your area, and build in buffer time for unexpected delays or complications."
  },
  {
    id: 14,
    icon: Clock,
    title: "Monitor Performance Regularly",
    description: "Regularly evaluate your agent's performance against agreed-upon metrics. Don't hesitate to address concerns or make changes if expectations aren't being met.",
    details: "Track showings, feedback quality, marketing efforts, and responsiveness. Schedule regular check-ins to discuss strategy and progress."
  }];


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
            Safety Tips
          </h1>
          <p className="text-lg mb-6 max-w-3xl mx-auto text-white drop-shadow-md">
            Essential guidelines for safely engaging with service providers and realtors to protect your interests and ensure successful outcomes
          </p>
        </div>
      </section>

      {/* Service Provider Tips */}
      <section className="py-10 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl mb-3 text-white drop-shadow-lg">
              Tips for Engaging Service Providers
            </h2>
            <p className="text-lg text-white max-w-3xl mx-auto drop-shadow-md">
              Protect yourself and ensure quality work with these essential safety guidelines when hiring contractors and service professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {serviceProviderTips.map((tip) => {
              const IconComponent = tip.icon;
              return (
                <div
                  key={tip.id}
                  className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2 h-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}>
                  
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-blue/10 via-transparent to-coral-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 mx-auto mb-3 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl text-white font-bold drop-shadow-md group-hover:text-white transition-colors duration-300">{tip.title}</h3>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <p className="text-white leading-relaxed text-sm drop-shadow-md group-hover:text-white transition-colors duration-300">
                        {tip.description}
                      </p>
                      <div
                        className="p-4 rounded-xl relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                        
                        <p className="text-xs text-white drop-shadow-md group-hover:text-white transition-colors duration-300">
                          <strong>Tip:</strong> {tip.details}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                </div>);

            })}
          </div>
        </div>
      </section>

      {/* Realtor Tips */}
      <section className="py-10 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl mb-3 text-white drop-shadow-lg">
              Tips for Engaging with Realtors
            </h2>
            <p className="text-lg text-white max-w-3xl mx-auto drop-shadow-md">
              Maximize your real estate experience and protect your interests with these important guidelines for working with real estate professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {realtorTips.map((tip) => {
              const IconComponent = tip.icon;
              return (
                <div
                  key={tip.id}
                  className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2 h-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}>
                  
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-coral-orange/0 via-transparent to-sky-blue/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 mx-auto mb-3 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl text-white font-bold drop-shadow-md group-hover:text-white transition-colors duration-300">{tip.title}</h3>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <p className="text-white leading-relaxed text-sm drop-shadow-md group-hover:text-white transition-colors duration-300">
                        {tip.description}
                      </p>
                      <div
                        className="p-4 rounded-xl relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                        
                        <p className="text-xs text-white drop-shadow-md group-hover:text-white transition-colors duration-300">
                          <strong>Tip:</strong> {tip.details}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                </div>);

            })}
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-10 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl mb-3 text-white drop-shadow-lg">Additional Resources</h2>
            <p className="text-lg text-white drop-shadow-md">
              More tools and information to help you make informed decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
              
              <div className="relative z-10">
                <Shield className="h-8 w-8 text-white mb-4 drop-shadow-md group-hover:text-white transition-colors duration-300" />
                <h3 className="text-xl text-white font-bold mb-3 drop-shadow-md group-hover:text-white transition-colors duration-300">Contractor Verification</h3>
                <p className="text-white drop-shadow-md group-hover:text-white transition-colors duration-300">
                  Learn how to verify licenses, insurance, and credentials for service providers
                </p>
              </div>
              {/* Shine effect */}
              <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
            </div>

            <div
              className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
              
              <div className="relative z-10">
                <FileText className="h-8 w-8 text-white mb-4 drop-shadow-md group-hover:text-white transition-colors duration-300" />
                <h3 className="text-xl text-white font-bold mb-3 drop-shadow-md group-hover:text-white transition-colors duration-300">Contract Templates</h3>
                <p className="text-white drop-shadow-md group-hover:text-white transition-colors duration-300">
                  Download sample contracts and checklists for home improvement projects
                </p>
              </div>
              {/* Shine effect */}
              <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
            </div>

            <div
              className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
              
              <div className="relative z-10">
                <AlertTriangle className="h-8 w-8 text-white mb-4 drop-shadow-md group-hover:text-white transition-colors duration-300" />
                <h3 className="text-xl text-white font-bold mb-3 drop-shadow-md group-hover:text-white transition-colors duration-300">Scam Prevention</h3>
                <p className="text-white drop-shadow-md group-hover:text-white transition-colors duration-300">
                  Recognize common scams and fraudulent practices in home services and real estate
                </p>
              </div>
              {/* Shine effect */}
              <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 px-4">
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
              Ready to Find Trusted Professionals?
            </h2>
            <p className="text-lg mb-6 text-white drop-shadow-md">
              Use our platform to connect with verified, highly-rated service providers and realtors
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('find-providers')}
                className="px-8 py-3 rounded-xl bg-coral-orange text-black transition-all duration-300 hover:bg-coral-orange/90 hover:scale-105 font-semibold shadow-lg">
                
                Find Service Providers
              </button>
              <button
                onClick={() => navigate('realtors')}
                className="px-8 py-3 rounded-xl border-2 border-white text-white transition-all duration-300 hover:bg-white hover:text-coral-orange hover:scale-105 font-semibold backdrop-blur-sm">
                
                Find Realtors
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>);

}