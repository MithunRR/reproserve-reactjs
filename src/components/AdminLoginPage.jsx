import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { loginStart, logout } from '../Store/Features/Authentication/authslice';
import { currentUserStorage } from '../utils/localStorage';

// Admin-only sign-in. Rejects non-admin accounts so this page can never be used
// as a side door into a regular user session. On success, routes to /admin.
export function AdminLoginPage({ navigate, setCurrentUser }) {
  const dispatch = useDispatch();
  const { loginData, isLoggedIn, loading, error, message } = useSelector(
    (s) => s.AuthReducer
  );

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

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

      if (account?.role !== 'admin') {
        if (token) localStorage.removeItem('auth_token');
        currentUserStorage.clear?.();
        dispatch(logout());
        const msg = 'This page is for administrators only. Please use the regular Login page.';
        toast.error(msg);
        setErrors({ submit: msg });
        setHasSubmitted(false);
        return;
      }

      if (token) localStorage.setItem('auth_token', token);

      const user = {
        id: account?.id || null,
        name:
          account?.firstName && account?.lastName
            ? `${account.firstName} ${account.lastName}`
            : account?.name || 'Admin',
        email: account?.email || '',
        role: 'admin',
        verified: true,
      };

      setCurrentUser(user);
      toast.success(message || 'Welcome, admin');
      setHasSubmitted(false);
      navigate('/admin');
      return;
    }

    if (error) {
      const errorMessage =
        typeof error === 'string' ? error : error?.message || 'Login failed';
      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
      setHasSubmitted(false);
    }
  }, [hasSubmitted, isLoggedIn, loginData, error, message, navigate, setCurrentUser, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setErrors({});
    setHasSubmitted(true);
    dispatch(loginStart({ email: formData.email, password: formData.password }));
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
        marginTop: '-65px',
      }}>
      <div className="container mx-auto max-w-2xl">
        <div
          className="rounded-2xl shadow-xl p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}>
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-full flex items-center justify-center bg-white/15 mx-auto mb-4 border border-white/30">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl text-white mb-2 drop-shadow-lg">Admin Login</h1>
            <p className="text-white drop-shadow-md">Sign in to the ReproServe admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm text-white mb-2 drop-shadow-md">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-md border-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none transition-colors ${
                    errors.email ? 'border-coral-orange' : 'border-white/30 focus:border-white/60'
                  }`}
                  placeholder="admin@example.com"
                />
              </div>
              {errors.email && <p className="text-coral-orange text-sm mt-1 drop-shadow-md">{errors.email}</p>}
            </div>

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
                  className={`w-full pl-10 pr-12 py-3 rounded-md border-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none transition-colors ${
                    errors.password ? 'border-coral-orange' : 'border-white/30 focus:border-white/60'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-coral-orange text-sm mt-1 drop-shadow-md">{errors.password}</p>
              )}
            </div>

            {errors.submit && (
              <div className="p-3 rounded-md bg-coral-orange/15 border border-coral-orange/40">
                <p className="text-white text-sm drop-shadow-md">{errors.submit}</p>
              </div>
            )}

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={loading}
                className="py-4 px-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white text-lg transition-all duration-300 hover:bg-white/30 hover:border-white/50 hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2">
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                {loading ? 'Signing In…' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-white/80 hover:text-white text-sm transition-colors drop-shadow-md hover:underline">
              ← Not an admin? Go to user login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
