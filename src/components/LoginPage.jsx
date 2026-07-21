import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Loader2, X, AlertCircle } from 'lucide-react';
import apiClient from '../utils/api';
import { createPortal } from 'react-dom';
import { loginStart } from "../Store/Features/Authentication/authslice";
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
export function LoginPage({ navigate, setCurrentUser }) {

  const dispatch = useDispatch();
  const { loginData, isLoggedIn, loading, error, message } = useSelector((state) => state.AuthReducer);

  // Single login for everyone: the backend returns the role, and we route each
  // role to its own dashboard. Admins log in here too (no separate admin page).
  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin';
      // Realtors and service providers both land on their dashboard (/profile).
      default:
        return '/profile';
    }
  };

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogData, setErrorDialogData] = useState(null);
  const [isClosingDialog, setIsClosingDialog] = useState(false);

  const isSubmitting = loading;

  useEffect(() => {
    if (!hasSubmitted) return;

    if (isLoggedIn && loginData && Object.keys(loginData).length > 0) {
      const account =
        loginData?.data?.account ||
        loginData?.user ||
        loginData?.account ||
        loginData;

      const token =
        loginData?.data?.accessToken ||
        loginData?.accessToken ||
        loginData?.token;

      if (token) {
        localStorage.setItem("auth_token", token);
      }

      const role =
        account?.role === "service_provider"
          ? "provider"
          : account?.role || "user";

      const user = {
        id: account?.id || null,
        name:
          account?.firstName && account?.lastName
            ? `${account.firstName} ${account.lastName}`
            : account?.name || "User",
        firstName: account?.firstName || "",
        lastName: account?.lastName || "",
        phone: account?.phone || "",
        email: account?.email || "",
        role,
        verified: account?.verified !== undefined ? account.verified : true,
        location:
          account?.city && account?.state
            ? `${account.city}, ${account.state}`
            : ""
      };

      setCurrentUser(user);
      toast.success(message || "Login successful");
      setHasSubmitted(false);

      const pendingRedirect = localStorage.getItem("pendingRedirect");
      if (pendingRedirect) {
        localStorage.removeItem("pendingRedirect");
        navigate(pendingRedirect);
        return;
      }

      navigate(getDashboardPath(role));
      return;
    }

    if (error) {
      const errorMessage =
        typeof error === "string" ? error : error?.message || "Login failed";

      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
      setErrorDialogData({
        title: "Login Failed",
        message: errorMessage
      });
      setShowErrorDialog(true);
      setHasSubmitted(false);
    }
  }, [hasSubmitted, isLoggedIn, loginData, error, message, navigate, setCurrentUser]);

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

      /* ===== PHONE-ONLY layout (laptops/desktops never match this) ===== */
      @media (max-width: 767px) {
        .login-card { padding: 1.5rem; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    setErrors({});

    const payload = {
      email: formData.email,
      password: formData.password
    };

    setHasSubmitted(true);
    dispatch(loginStart(payload));
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

      <div className="container mx-auto max-w-4xl">
        <div
          className="login-card rounded-2xl shadow-xl p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>

          {/* Header */}
          <div className="text-center mb-8">
            {/* <div className="h-16 w-16 rounded-full flex items-center justify-center bg-white mx-auto mb-4">
               <span className="font-bold text-white text-2xl">RS</span>
              </div> */}
            <h1 className="text-2xl text-white mb-2 drop-shadow-lg">Welcome Back</h1>
            <p className="text-white drop-shadow-md">Sign in to your ReproServe account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm text-white mb-2 drop-shadow-md">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-md border-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none transition-colors ${errors.email ? 'border-coral-orange' : 'border-white/30 focus:border-white/60'}`
                  }
                  placeholder="Enter your email address" />

              </div>
              {errors.email &&
                <p className="text-coral-orange text-sm mt-1 drop-shadow-md">{errors.email}</p>
              }
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm text-white mb-2 drop-shadow-md">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 rounded-md border-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none transition-colors ${errors.password ? 'border-coral-orange' : 'border-white/30 focus:border-white/60'}`
                  }
                  placeholder="Enter your password" />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-white transition-colors duration-300">

                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password &&
                <p className="text-coral-orange text-sm mt-1 drop-shadow-md">{errors.password}</p>
              }
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-white/30 bg-white/10 backdrop-blur-sm" />
                <span className="text-sm text-white drop-shadow-md">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-white hover:text-white transition-colors duration-300 hover:underline drop-shadow-md">

                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-4 px-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white text-lg transition-all duration-300 hover:bg-white/30 hover:border-white/50 hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2">

                {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
                {isSubmitting ? 'Logging In...' : 'Login'}
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-white drop-shadow-md">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('register')}
                className="text-white hover:text-white transition-colors duration-300 hover:underline drop-shadow-md">

                Sign up here
              </button>
            </p>
          </div>

          {/* Additional Links */}
          <div className="mt-6 pt-6 border-t border-white/30">
            <div className="flex justify-center space-x-6 text-sm">
              <button
                onClick={() => navigate('contact')}
                className="text-white hover:text-white transition-colors duration-300 drop-shadow-md">

                Need Help?
              </button>
              <button
                onClick={() => navigate('about')}
                className="text-white hover:text-white transition-colors duration-300 drop-shadow-md">

                About ReproServe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Dialog */}
      {showErrorDialog && errorDialogData && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            background: isClosingDialog ? 'rgba(0, 69, 113, 0)' : 'rgba(0, 69, 113, 0.75)',
            backdropFilter: 'blur(4px)',
            animation: isClosingDialog ? 'fadeOut 0.15s ease-out' : 'fadeIn 0.3s ease-out'
          }}
          onClick={() => {
            setIsClosingDialog(true);
            setTimeout(() => {
              setShowErrorDialog(false);
              setIsClosingDialog(false);
            }, 150);
          }}>

          <div
            className="relative w-full max-w-md rounded-2xl p-6 overflow-y-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              animation: isClosingDialog ? 'modalPopOut 0.15s ease-out' : 'modalPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onClick={(e) => e.stopPropagation()}>

            {/* Close Button */}
            <button
              onClick={() => {
                setIsClosingDialog(true);
                setTimeout(() => {
                  setShowErrorDialog(false);
                  setIsClosingDialog(false);
                }, 150);
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/20 transition-all duration-300">

              <X className="h-4 w-4 text-white" />
            </button>

            {/* Error Icon */}
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-coral-orange/20 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-coral-orange" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl text-white drop-shadow-lg mb-2 text-center font-semibold">
              {errorDialogData.title}
            </h2>

            {/* Message */}
            <p className="text-white drop-shadow-md mb-4 text-center">
              {errorDialogData.message}
            </p>

            {/* Field Errors List */}
            {errorDialogData.fieldErrors && Object.keys(errorDialogData.fieldErrors).length > 0 &&
              <div className="mt-4 space-y-2">
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-sm text-white/80 mb-2 font-medium">Please fix the following:</p>
                  <ul className="space-y-2">
                    {Object.entries(errorDialogData.fieldErrors).map(([field, error]) =>
                      <li key={field} className="flex items-start gap-2">
                        <span className="text-coral-orange mt-0.5">•</span>
                        <span className="text-white text-sm">
                          <span className="font-medium capitalize">{field}:</span> {error}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            }

            {/* Close Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  setIsClosingDialog(true);
                  setTimeout(() => {
                    setShowErrorDialog(false);
                    setIsClosingDialog(false);
                  }, 150);
                }}
                className="py-3 px-8 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white text-base transition-all duration-300 hover:bg-white/30 hover:border-white/50 hover:scale-105 font-medium">

                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>);

}