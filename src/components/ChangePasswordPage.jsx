import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Loader2, X, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { changePasswordStart, resetChangePasswordFlag } from '../Store/Features/Authentication/authslice';

export function ChangePasswordPage({ navigate }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    password: '',
    passwordConfirmation: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogData, setDialogData] = useState(


    null);
  const [isClosingDialog, setIsClosingDialog] = useState(false);

  const dispatch = useDispatch();
  const changePasswordLoading = useSelector((state) => state.AuthReducer.changePasswordLoading);
  const changePasswordError = useSelector((state) => state.AuthReducer.changePasswordError);
  const changePasswordSuccess = useSelector((state) => state.AuthReducer.changePasswordSuccess);

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

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'New password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.passwordConfirmation.trim()) {
      newErrors.passwordConfirmation = 'Please confirm your new password';
    } else if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!authToken) {
      setDialogData({
        title: 'Authentication Error',
        message: 'You must be logged in to change your password. Please log in again.'
      });
      setShowErrorDialog(true);
      return;
    }

    setErrors({});
    setShowErrorDialog(false);
    setShowSuccessDialog(false);
    dispatch(changePasswordStart({
      current_password: formData.currentPassword,
      password: formData.password,
      password_confirmation: formData.passwordConfirmation
    }));
  };

  // Show the success dialog once the change-password saga succeeds.
  useEffect(() => {
    if (changePasswordSuccess) {
      setDialogData({ title: 'Password Changed', message: 'Password changed successfully.' });
      setShowSuccessDialog(true);
      setFormData({ currentPassword: '', password: '', passwordConfirmation: '' });
      dispatch(resetChangePasswordFlag());
      const timer = setTimeout(() => {
        handleCloseSuccessDialog();
        navigate('/profile');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [changePasswordSuccess, dispatch]);

  // Show the error dialog if the saga failed.
  useEffect(() => {
    if (changePasswordError) {
      setDialogData({
        title: 'Error',
        message: typeof changePasswordError === 'string'
          ? changePasswordError
          : 'Failed to change password. Please try again.'
      });
      setShowErrorDialog(true);
      dispatch(resetChangePasswordFlag());
    }
  }, [changePasswordError, dispatch]);

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
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors mb-6 drop-shadow-md">
            
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Profile</span>
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-full flex items-center justify-center bg-white/10 mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl text-white mb-2 drop-shadow-lg font-bold">Change Password</h1>
            <p className="text-white drop-shadow-md text-sm">
              Enter your current password and choose a new one.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password Field */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-white mb-2 drop-shadow-md">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white pointer-events-none" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  value={formData.currentPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, currentPassword: e.target.value });
                    if (errors.currentPassword) {
                      setErrors({ ...errors, currentPassword: '' });
                    }
                  }}
                  placeholder="Enter your current password"
                  className={`w-full pl-12 pr-12 py-3 rounded-md border-2 ${
                  errors.currentPassword ?
                  'border-coral-orange focus:border-coral-orange' :
                  'border-white/30 focus:border-white/60'} bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 focus:outline-none transition-colors`
                  } />
                
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-white/80 transition-colors">
                  
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.currentPassword &&
              <p className="mt-2 text-sm text-coral-orange drop-shadow-md">{errors.currentPassword}</p>
              }
            </div>

            {/* New Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2 drop-shadow-md">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) {
                      setErrors({ ...errors, password: '' });
                    }
                  }}
                  placeholder="Enter your new password"
                  className={`w-full pl-12 pr-12 py-3 rounded-md border-2 ${
                  errors.password ?
                  'border-coral-orange focus:border-coral-orange' :
                  'border-white/30 focus:border-white/60'} bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 focus:outline-none transition-colors`
                  } />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-white/80 transition-colors">
                  
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password &&
              <p className="mt-2 text-sm text-coral-orange drop-shadow-md">{errors.password}</p>
              }
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-white mb-2 drop-shadow-md">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white pointer-events-none" />
                <input
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  id="passwordConfirmation"
                  value={formData.passwordConfirmation}
                  onChange={(e) => {
                    setFormData({ ...formData, passwordConfirmation: e.target.value });
                    if (errors.passwordConfirmation) {
                      setErrors({ ...errors, passwordConfirmation: '' });
                    }
                  }}
                  placeholder="Confirm your new password"
                  className={`w-full pl-12 pr-12 py-3 rounded-md border-2 ${
                  errors.passwordConfirmation ?
                  'border-coral-orange focus:border-coral-orange' :
                  'border-white/30 focus:border-white/60'} bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 focus:outline-none transition-colors`
                  } />
                
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-white/80 transition-colors">
                  
                  {showPasswordConfirmation ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.passwordConfirmation &&
              <p className="mt-2 text-sm text-coral-orange drop-shadow-md">{errors.passwordConfirmation}</p>
              }
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={changePasswordLoading}
                className="py-4 px-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white text-lg transition-all duration-300 hover:bg-white/30 hover:border-white/50 hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2">
                
                {changePasswordLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                {changePasswordLoading ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </form>
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