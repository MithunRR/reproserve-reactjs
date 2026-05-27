import React, { useState, useEffect } from 'react';
import { Mail, Loader2, X, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPasswordStart, resetForgotPasswordFlag } from '../Store/Features/Authentication/authslice';

export function ForgotPasswordPage({ navigate }) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const dispatch = useDispatch();
  const forgotPasswordLoading = useSelector((state) => state.AuthReducer.forgotPasswordLoading);
  const forgotPasswordError = useSelector((state) => state.AuthReducer.forgotPasswordError);
  const forgotPasswordSuccess = useSelector((state) => state.AuthReducer.forgotPasswordSuccess);
  const forgotPasswordMessage = useSelector((state) => state.AuthReducer.forgotPasswordMessage);
  const [dialogData, setDialogData] = useState(


    null);
  const [isClosingDialog, setIsClosingDialog] = useState(false);

  // Add modal animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
      @keyframes modalPopIn {
        from {
          opacity: 0;
          transform: scale(0.9) translateY(-10px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      @keyframes modalPopOut {
        from {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        to {
          opacity: 0;
          transform: scale(0.9) translateY(-10px);
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setErrors({});
    setShowErrorDialog(false);
    setShowSuccessDialog(false);
    dispatch(forgotPasswordStart({ email }));
  };

  // Show the success dialog once the forgot-password saga succeeds.
  useEffect(() => {
    if (forgotPasswordSuccess) {
      setDialogData({
        title: 'Email Sent',
        message: forgotPasswordMessage || 'A new password has been sent to your email.'
      });
      setShowSuccessDialog(true);
      setEmail('');
      dispatch(resetForgotPasswordFlag());
      const timer = setTimeout(() => {
        handleCloseSuccessDialog();
        navigate('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [forgotPasswordSuccess, forgotPasswordMessage, dispatch]);

  // Show the error dialog if the saga failed.
  useEffect(() => {
    if (forgotPasswordError) {
      setDialogData({
        title: 'Error',
        message: typeof forgotPasswordError === 'string'
          ? forgotPasswordError
          : 'Failed to send password reset email. Please try again.'
      });
      setShowErrorDialog(true);
      dispatch(resetForgotPasswordFlag());
    }
  }, [forgotPasswordError, dispatch]);

  const handleCloseSuccessDialog = () => {
    setIsClosingDialog(true);
    setTimeout(() => {
      setShowSuccessDialog(false);
      setIsClosingDialog(false);
    }, 150);
  };

  const handleCloseErrorDialog = () => {
    setIsClosingDialog(true);
    setTimeout(() => {
      setShowErrorDialog(false);
      setIsClosingDialog(false);
    }, 150);
  };

  return (
    <div
      className="min-h-screen py-12 px-4"
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
      
      <div className="container mx-auto max-w-md">
        <div
          className="rounded-2xl shadow-xl p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
          
          {/* Back Button */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors mb-6 drop-shadow-md">
            
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Login</span>
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl text-white mb-2 drop-shadow-lg font-bold">Forgot Password</h1>
            <p className="text-white drop-shadow-md text-sm">
              Enter your email address and we'll send you a new password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2 drop-shadow-md">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white pointer-events-none" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors({ ...errors, email: '' });
                    }
                  }}
                  placeholder="Enter your email address"
                  className={`w-full pl-12 pr-4 py-3 rounded-md border-2 ${
                  errors.email ?
                  'border-coral-orange focus:border-coral-orange' :
                  'border-white/30 focus:border-white/60'} bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 focus:outline-none transition-colors`
                  } />
                
              </div>
              {errors.email &&
              <p className="mt-2 text-sm text-coral-orange drop-shadow-md">{errors.email}</p>
              }
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={forgotPasswordLoading}
                className="py-4 px-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white text-lg transition-all duration-300 hover:bg-white/30 hover:border-white/50 hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2">
                
                {forgotPasswordLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                {forgotPasswordLoading ? 'Sending...' : 'Send New Password'}
              </button>
            </div>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <p className="text-white drop-shadow-md text-sm">
              Remember your password?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-white hover:text-white transition-colors duration-300 hover:underline drop-shadow-md">
                
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      {showSuccessDialog && dialogData && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            background: isClosingDialog ? 'rgba(0, 69, 113, 0)' : 'rgba(0, 69, 113, 0.75)',
            backdropFilter: 'blur(4px)',
            animation: isClosingDialog ? 'fadeOut 0.15s ease-out' : 'fadeIn 0.3s ease-out'
          }}
          onClick={handleCloseSuccessDialog}>
          
          <div
            className="relative w-full max-w-md rounded-2xl p-6 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              animation: isClosingDialog ? 'modalPopOut 0.15s ease-out' : 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onClick={(e) => e.stopPropagation()}>
            
            <button
              onClick={handleCloseSuccessDialog}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-all duration-300">
              
              <X className="h-4 w-4 text-white" />
            </button>
            <div className="mb-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle className="h-6 w-6" style={{ color: '#28a745' }} />
              </div>
              <h3 className="text-xl font-bold text-white drop-shadow-md mb-2">
                {dialogData.title}
              </h3>
              <p className="text-sm text-white drop-shadow-md">{dialogData.message}</p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleCloseSuccessDialog}
                className="px-4 py-2 rounded-md text-white transition-colors drop-shadow-md border-0"
                style={{
                  backgroundColor: 'transparent',
                  onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#33a1e8',
                  onMouseLeave: (e) => e.currentTarget.style.backgroundColor = 'transparent'
                }}>
                
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Error Dialog */}
      {showErrorDialog && dialogData && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            background: isClosingDialog ? 'rgba(0, 69, 113, 0)' : 'rgba(0, 69, 113, 0.75)',
            backdropFilter: 'blur(4px)',
            animation: isClosingDialog ? 'fadeOut 0.15s ease-out' : 'fadeIn 0.3s ease-out'
          }}
          onClick={handleCloseErrorDialog}>
          
          <div
            className="relative w-full max-w-md rounded-2xl p-6 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              animation: isClosingDialog ? 'modalPopOut 0.15s ease-out' : 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onClick={(e) => e.stopPropagation()}>
            
            <button
              onClick={handleCloseErrorDialog}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-all duration-300">
              
              <X className="h-4 w-4 text-white" />
            </button>
            <div className="mb-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-coral-orange/20">
                <AlertCircle className="h-6 w-6 text-coral-orange" />
              </div>
              <h3 className="text-xl font-bold text-white drop-shadow-md mb-2">
                {dialogData.title}
              </h3>
              <p className="text-sm text-white drop-shadow-md">{dialogData.message}</p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleCloseErrorDialog}
                className="px-4 py-2 rounded-md text-white transition-colors drop-shadow-md border-0"
                style={{
                  backgroundColor: 'transparent',
                  onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#33a1e8',
                  onMouseLeave: (e) => e.currentTarget.style.backgroundColor = 'transparent'
                }}>
                
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>);

}