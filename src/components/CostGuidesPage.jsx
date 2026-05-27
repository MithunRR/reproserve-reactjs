import React, { useState } from 'react';
import { Calculator, DollarSign, Home, TrendingUp, Info, PieChart } from 'lucide-react';



export function CostGuidesPage({ navigate }) {
  const [activeCalculator, setActiveCalculator] = useState('affordability');

  // Affordability Calculator State
  const [income, setIncome] = useState('');
  const [monthlyDebts, setMonthlyDebts] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [interestRate, setInterestRate] = useState('6.5');
  const [loanTerm, setLoanTerm] = useState('30');

  // Payment Calculator State
  const [loanAmount, setLoanAmount] = useState('');
  const [paymentInterestRate, setPaymentInterestRate] = useState('6.5');
  const [paymentLoanTerm, setPaymentLoanTerm] = useState('30');
  const [propertyTax, setPropertyTax] = useState('');
  const [insurance, setInsurance] = useState('');
  const [pmi, setPmi] = useState('');

  const calculateAffordability = () => {
    const monthlyIncome = parseFloat(income) / 12;
    const monthlyDebt = parseFloat(monthlyDebts) || 0;
    const rate = parseFloat(interestRate) / 100 / 12;
    const months = parseFloat(loanTerm) * 12;
    const down = parseFloat(downPayment) || 0;

    // Using 28% debt-to-income ratio for housing
    const maxMonthlyPayment = monthlyIncome * 0.28 - monthlyDebt;

    if (maxMonthlyPayment <= 0) {
      return { affordablePrice: 0, monthlyPayment: 0, error: 'Monthly debts too high relative to income' };
    }

    // Calculate affordable loan amount
    const affordableLoan = maxMonthlyPayment * ((1 - Math.pow(1 + rate, -months)) / rate);
    const affordablePrice = affordableLoan + down;

    return {
      affordablePrice: Math.max(0, affordablePrice),
      monthlyPayment: maxMonthlyPayment,
      error: null
    };
  };

  const calculatePayment = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(paymentInterestRate) / 100 / 12;
    const months = parseFloat(paymentLoanTerm) * 12;
    const tax = parseFloat(propertyTax) / 12 || 0;
    const insurancePayment = parseFloat(insurance) / 12 || 0;
    const pmiPayment = parseFloat(pmi) || 0;

    if (!principal || principal <= 0) {
      return { monthlyPayment: 0, principalInterest: 0, totalPayment: 0, error: 'Please enter a valid loan amount' };
    }

    // Calculate principal and interest payment
    const principalInterest = principal * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    const totalPayment = principalInterest + tax + insurancePayment + pmiPayment;

    return {
      principalInterest: isNaN(principalInterest) ? 0 : principalInterest,
      monthlyPayment: totalPayment,
      totalPayment: totalPayment * months,
      error: null
    };
  };

  const affordabilityResult = calculateAffordability();
  const paymentResult = calculatePayment();

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
            Cost Guides & Calculators
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-white drop-shadow-md">
            Plan your home purchase with our comprehensive mortgage calculators and cost estimation tools
          </p>
        </div>
      </section>

      {/* Calculator Selection */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <button
              onClick={() => setActiveCalculator('affordability')}
              className={`group relative flex-1 p-6 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
              activeCalculator === 'affordability' ?
              'border-2 border-white' :
              'border-2 border-white/30'}`
              }
              style={{
                background: activeCalculator === 'affordability' ?
                'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))' :
                'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
              
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-blue/10 via-transparent to-coral-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-4">
                  <Home className="h-8 w-8 text-white group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl mb-2 text-white drop-shadow-md group-hover:text-white transition-colors duration-300">Home Affordability Calculator</h3>
                <p className="text-white drop-shadow-md group-hover:text-white transition-colors duration-300">Calculate how much house you can afford based on your income and expenses</p>
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
            </button>

            <button
              onClick={() => setActiveCalculator('payment')}
              className={`group relative flex-1 p-6 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
              activeCalculator === 'payment' ?
              'border-2 border-white' :
              'border-2 border-white/30'}`
              }
              style={{
                background: activeCalculator === 'payment' ?
                'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))' :
                'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
              
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-blue/10 via-transparent to-coral-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-4">
                  <Calculator className="h-8 w-8 text-white group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl mb-2 text-white drop-shadow-md group-hover:text-white transition-colors duration-300">Mortgage Payment Calculator</h3>
                <p className="text-white drop-shadow-md group-hover:text-white transition-colors duration-300">Calculate your monthly mortgage payment including taxes and insurance</p>
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
            </button>
          </div>

          {/* Calculator Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div
              className="rounded-2xl p-8 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
              
              <div className="mb-6">
                <h3 className="flex items-center space-x-2 text-2xl text-white font-bold mb-2 drop-shadow-lg">
                  {activeCalculator === 'affordability' ?
                  <>
                      <Home className="h-6 w-6 text-white" />
                      <span>Affordability Calculator</span>
                    </> :

                  <>
                      <Calculator className="h-6 w-6 text-white" />
                      <span>Payment Calculator</span>
                    </>
                  }
                </h3>
                <p className="text-white drop-shadow-md">
                  {activeCalculator === 'affordability' ?
                  'Enter your financial information to see what you can afford' :
                  'Enter loan details to calculate your monthly payment'
                  }
                </p>
              </div>
              <div className="space-y-4">
                {activeCalculator === 'affordability' ?
                <>
                    <div>
                      <label className="block text-sm text-white mb-2 drop-shadow-md">Annual Gross Income</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                        <input
                        type="number"
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                        placeholder="75,000" />
                      
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-white mb-2 drop-shadow-md">Monthly Debt Payments</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                        <input
                        type="number"
                        value={monthlyDebts}
                        onChange={(e) => setMonthlyDebts(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                        placeholder="500" />
                      
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-white mb-2 drop-shadow-md">Down Payment</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                        <input
                        type="number"
                        value={downPayment}
                        onChange={(e) => setDownPayment(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                        placeholder="50,000" />
                      
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white mb-2 drop-shadow-md">Interest Rate (%)</label>
                        <input
                        type="number"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        className="w-full px-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                        placeholder="6.5" />
                      
                      </div>
                      <div>
                        <label className="block text-sm text-white mb-2 drop-shadow-md">Loan Term (years)</label>
                        <select
                        value={loanTerm}
                        onChange={(e) => setLoanTerm(e.target.value)}
                        className="w-full px-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:border-white/60">
                        
                          <option value="15" className="text-gray-800">15 years</option>
                          <option value="20" className="text-gray-800">20 years</option>
                          <option value="30" className="text-gray-800">30 years</option>
                        </select>
                      </div>
                    </div>
                  </> :

                <>
                    <div>
                      <label className="block text-sm text-white mb-2 drop-shadow-md">Loan Amount</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                        <input
                        type="number"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                        placeholder="350,000" />
                      
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white mb-2 drop-shadow-md">Interest Rate (%)</label>
                        <input
                        type="number"
                        step="0.1"
                        value={paymentInterestRate}
                        onChange={(e) => setPaymentInterestRate(e.target.value)}
                        className="w-full px-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                        placeholder="6.5" />
                      
                      </div>
                      <div>
                        <label className="block text-sm text-white mb-2 drop-shadow-md">Loan Term (years)</label>
                        <select
                        value={paymentLoanTerm}
                        onChange={(e) => setPaymentLoanTerm(e.target.value)}
                        className="w-full px-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:border-white/60">
                        
                          <option value="15" className="text-gray-800">15 years</option>
                          <option value="20" className="text-gray-800">20 years</option>
                          <option value="30" className="text-gray-800">30 years</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-white mb-2 drop-shadow-md">Annual Property Tax</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                        <input
                        type="number"
                        value={propertyTax}
                        onChange={(e) => setPropertyTax(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                        placeholder="4,200" />
                      
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-white mb-2 drop-shadow-md">Annual Home Insurance</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                        <input
                        type="number"
                        value={insurance}
                        onChange={(e) => setInsurance(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                        placeholder="1,200" />
                      
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-white mb-2 drop-shadow-md">Monthly PMI</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                        <input
                        type="number"
                        value={pmi}
                        onChange={(e) => setPmi(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60"
                        placeholder="200" />
                      
                      </div>
                    </div>
                  </>
                }
              </div>
            </div>

            {/* Results */}
            <div
              className="rounded-2xl p-8 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
              
              <div className="mb-6">
                <h3 className="flex items-center space-x-2 text-2xl text-white font-bold mb-2 drop-shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                  <span>Results</span>
                </h3>
                <p className="text-white drop-shadow-md">
                  {activeCalculator === 'affordability' ?
                  'Based on your income and debt-to-income ratio' :
                  'Your estimated monthly mortgage payment breakdown'
                  }
                </p>
              </div>
              <div>
                {activeCalculator === 'affordability' ?
                <div className="space-y-6">
                    {affordabilityResult.error ?
                  <div className="text-center py-8">
                        <Info className="h-12 w-12 text-white mx-auto mb-4 drop-shadow-md" />
                        <p className="text-white drop-shadow-md">{affordabilityResult.error}</p>
                      </div> :

                  <>
                        <div className="text-center">
                          <div className="text-3xl text-white mb-2 drop-shadow-lg">
                            ${affordabilityResult.affordablePrice.toLocaleString()}
                          </div>
                          <p className="text-white drop-shadow-md">Maximum Home Price</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div
                        className="p-4 rounded-xl relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                        
                            <div className="text-lg text-white drop-shadow-md">
                              ${affordabilityResult.monthlyPayment.toLocaleString()}
                            </div>
                            <p className="text-sm text-white drop-shadow-md">Maximum Monthly Payment</p>
                          </div>
                        </div>

                        <div
                      className="p-4 rounded-xl relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}>
                      
                          <h4 className="text-white mb-2 drop-shadow-md">Key Assumptions:</h4>
                          <ul className="text-sm text-white space-y-1 drop-shadow-md">
                            <li>• 28% debt-to-income ratio</li>
                            <li>• {interestRate}% interest rate</li>
                            <li>• {loanTerm}-year loan term</li>
                            <li>• Property taxes and insurance additional</li>
                          </ul>
                        </div>
                      </>
                  }
                  </div> :

                <div className="space-y-6">
                    {paymentResult.error ?
                  <div className="text-center py-8">
                        <Info className="h-12 w-12 text-white mx-auto mb-4 drop-shadow-md" />
                        <p className="text-white drop-shadow-md">{paymentResult.error}</p>
                      </div> :

                  <>
                        <div className="text-center">
                          <div className="text-3xl text-white mb-2 drop-shadow-lg">
                            ${paymentResult.monthlyPayment.toLocaleString()}
                          </div>
                          <p className="text-white drop-shadow-md">Total Monthly Payment</p>
                        </div>

                        <div className="space-y-3">
                          <div
                        className="flex justify-between items-center p-3 rounded-xl relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                        
                            <span className="text-white drop-shadow-md">Principal & Interest</span>
                            <span className="text-white drop-shadow-md">${paymentResult.principalInterest.toLocaleString()}</span>
                          </div>
                          
                          {propertyTax &&
                      <div
                        className="flex justify-between items-center p-3 rounded-xl relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                        
                              <span className="text-white drop-shadow-md">Property Tax</span>
                              <span className="text-white drop-shadow-md">${(parseFloat(propertyTax) / 12).toLocaleString()}</span>
                            </div>
                      }
                          
                          {insurance &&
                      <div
                        className="flex justify-between items-center p-3 rounded-xl relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                        
                              <span className="text-white drop-shadow-md">Home Insurance</span>
                              <span className="text-white drop-shadow-md">${(parseFloat(insurance) / 12).toLocaleString()}</span>
                            </div>
                      }
                          
                          {pmi &&
                      <div
                        className="flex justify-between items-center p-3 rounded-xl relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                        
                              <span className="text-white drop-shadow-md">PMI</span>
                              <span className="text-white drop-shadow-md">${parseFloat(pmi).toLocaleString()}</span>
                            </div>
                      }
                        </div>

                        <div
                      className="p-4 rounded-xl relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}>
                      
                          <div className="text-lg text-white mb-2 drop-shadow-md">
                            Total Interest Paid: ${(paymentResult.totalPayment - parseFloat(loanAmount || 0)).toLocaleString()}
                          </div>
                          <p className="text-sm text-white drop-shadow-md">Over the life of the loan</p>
                        </div>
                      </>
                  }
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-4 text-white drop-shadow-lg">Additional Resources</h2>
            <p className="text-xl text-white drop-shadow-md">Helpful tools and guides for your home buying journey</p>
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
                <PieChart className="h-8 w-8 text-white mb-4 drop-shadow-md group-hover:text-white transition-colors duration-300" />
                <h3 className="text-xl text-white font-bold mb-3 drop-shadow-md group-hover:text-white transition-colors duration-300">Down Payment Guide</h3>
                <p className="text-white drop-shadow-md group-hover:text-white transition-colors duration-300">Learn about down payment options and assistance programs</p>
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
                <TrendingUp className="h-8 w-8 text-white mb-4 drop-shadow-md group-hover:text-white transition-colors duration-300" />
                <h3 className="text-xl text-white font-bold mb-3 drop-shadow-md group-hover:text-white transition-colors duration-300">Interest Rate Trends</h3>
                <p className="text-white drop-shadow-md group-hover:text-white transition-colors duration-300">Stay updated on current mortgage rates and market trends</p>
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
                <Home className="h-8 w-8 text-white mb-4 drop-shadow-md group-hover:text-white transition-colors duration-300" />
                <h3 className="text-xl text-white font-bold mb-3 drop-shadow-md group-hover:text-white transition-colors duration-300">First-Time Buyer Tips</h3>
                <p className="text-white drop-shadow-md group-hover:text-white transition-colors duration-300">Essential advice for first-time home buyers</p>
              </div>
              {/* Shine effect */}
              <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
            </div>
          </div>
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
            
            <h2 className="text-3xl mb-4 text-white drop-shadow-lg">Ready to Start Your Home Search?</h2>
            <p className="text-xl mb-8 text-white drop-shadow-md">
              Connect with our verified realtors and lenders to make your dream home a reality
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('realtors')}
                className="px-8 py-3 rounded-xl bg-coral-orange text-black transition-all duration-300 hover:bg-coral-orange/90 hover:scale-105 font-semibold shadow-lg">
                
                Find Realtors
              </button>
              <button
                onClick={() => navigate('find-providers')}
                className="px-8 py-3 rounded-xl border-2 border-white text-white transition-all duration-300 hover:bg-white hover:text-dark-blue hover:scale-105 font-semibold backdrop-blur-sm">
                
                Find Lenders
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>);

}