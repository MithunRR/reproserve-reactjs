import React, { useState, useRef, useEffect } from 'react';
import { useDispatch,useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  Eye, EyeOff, User, Building, UserCheck, ChevronDown,
  HardHat, Home, Grid3X3, Wrench, Zap, Droplets, Thermometer, Trees,
  Paintbrush, Shield, Key, Palette, Calculator, Search as SearchIcon,
  ShieldCheck, ScrollText, Loader2, X, AlertCircle
} from
  'lucide-react';
import { Tabs } from './app-tabs';
import apiClient from '../utils/api';
import { createPortal } from 'react-dom';
import {
  signupStart, resetSignupFlag, resendVerificationStart
} from "../Store/Features/Authentication/authslice";

export function RegisterPage({ navigate, setCurrentUser }) {
  const dispatch = useDispatch();
  const {
    userCreate, loading, error, message, loginData,
    requiresEmailVerification, pendingVerificationEmail,
    resendVerificationLoading
  } = useSelector((state) => state.AuthReducer);
  const [showVerifyEmailDialog, setShowVerifyEmailDialog] = useState(false);
  const [verifyEmailAddress, setVerifyEmailAddress] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    registerAs: 'individual', // 'individual' | 'business'
    userType: 'user',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '', 

    // Address Info
    address: '',
    city: '',
    state: '',
    zipCode: '',

    // Service Provider Specific
    businessName: '',
    serviceType: '',
    businessDescription: '',
    licenseNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const isSubmitting = loading;
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogData, setErrorDialogData] = useState(



    null);
  const [isClosingDialog, setIsClosingDialog] = useState(false);
  const serviceDropdownRef = useRef(null);

  // Account type tabs configuration
  const accountTypeTabs = [
    { value: 'user', label: 'User', icon: User },
    { value: 'provider', label: 'Service Provider', icon: Building },
    { value: 'realtor', label: 'Realtor', icon: UserCheck }];


  // Service types for Providers
  const providerServiceTypes = [
    { value: 'General Contractor', label: 'General Contractor', icon: HardHat },
    { value: 'Roofer', label: 'Roofer', icon: Home },
    { value: 'Flooring / Tile Installer', label: 'Flooring / Tile Installer', icon: Grid3X3 },
    { value: 'Window / Door Contractor', label: 'Window / Door Contractor', icon: Building },
    { value: 'Siding Contractor', label: 'Siding Contractor', icon: Building },
    { value: 'Foundation / Structural Contractor', label: 'Foundation / Structural Contractor', icon: Wrench },
    { value: 'Pool / Spa Contractor', label: 'Pool / Spa Contractor', icon: Droplets },
    { value: 'Handyman', label: 'Handyman', icon: Wrench },
    { value: 'Electrician', label: 'Electrician', icon: Zap },
    { value: 'Plumber', label: 'Plumber', icon: Droplets },
    { value: 'HVAC Technician', label: 'HVAC Technician', icon: Thermometer },
    { value: 'Gutter / Drainage Specialist', label: 'Gutter / Drainage Specialist', icon: Droplets },
    { value: 'Septic / Wastewater Contractor', label: 'Septic / Wastewater Contractor', icon: Droplets },
    { value: 'Pest Control Technician', label: 'Pest Control Technician', icon: Shield },
    { value: 'Cleaning Service Provider', label: 'Cleaning Service Provider', icon: Paintbrush },
    { value: 'Tree Service Contractor', label: 'Tree Service Contractor', icon: Trees },
    { value: 'Landscaper / Hardscaper', label: 'Landscaper / Hardscaper', icon: Trees },
    { value: 'Painter', label: 'Painter', icon: Paintbrush },
    { value: 'Home Security Installer', label: 'Home Security Installer', icon: Shield },
    { value: 'Locksmith', label: 'Locksmith', icon: Key },
    { value: 'Interior Designer / Stager', label: 'Interior Designer / Stager', icon: Palette }];


  // Service types for Realtors
  const realtorServiceTypes = [
    { value: 'Real Estate Agents & Brokers', label: 'Real Estate Agents & Brokers', icon: UserCheck },
    { value: 'Mortgage Lenders / Loan Officers', label: 'Mortgage Lenders / Loan Officers', icon: Calculator },
    { value: 'Inspectors', label: 'Inspectors', icon: SearchIcon },
    { value: 'Insurance & Warranty Agents', label: 'Insurance & Warranty Agents', icon: ShieldCheck },
    { value: 'Title Companies', label: 'Title Companies', icon: ScrollText }];


  // Get current service types based on user type
  const getServiceTypes = () => {
    return formData.userType === 'realtor' ? realtorServiceTypes : providerServiceTypes;
  };

  // Get selected service type object
  const getSelectedServiceType = () => {
    const allTypes = getServiceTypes();
    return allTypes.find((type) => type.value === formData.serviceType) || null;
  };

  // Hide scrollbar but keep scrolling functionality
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .service-dropdown-scroll::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
      }
      .service-dropdown-scroll {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
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
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isServiceDropdownOpen && serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target)) {
        setIsServiceDropdownOpen(false);
      }
    };

    if (isServiceDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isServiceDropdownOpen]);



  const selectType = (type) => {
    // Handle both string and Key types from react-aria-components
    const typeValue = typeof type === 'string' ? type : String(type);

    // Don't do anything if clicking the same type
    if (formData.userType === typeValue) return;

    // Close service dropdown if open
    setIsServiceDropdownOpen(false);

    // Update immediately without loading delay
    setFormData((prev) => ({
      ...prev,
      userType: typeValue,
      serviceType: '' // Clear service type when switching user types
    }));
  };

 

const handleInputChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value
  }));

  // Clear field error
  if (errors[name]) {
    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));
  }
};

// ================= VALIDATE FORM =================

const validateForm = () => {
  const newErrors = {};

  if (!formData.firstName.trim()) {
    newErrors.firstName = "First name is required";
  }

  if (!formData.lastName.trim()) {
    newErrors.lastName = "Last name is required";
  }

  if (!formData.email.trim()) {
    newErrors.email = "Email is required";
  }

  if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = "Invalid email";
  }

  if (!formData.phone.trim()) {
    newErrors.phone = "Phone number is required";
  }

  if (!formData.password) {
    newErrors.password = "Password is required";
  }

  if (formData.password.length < 6) {
    newErrors.password = "Password must be at least 6 characters";
  }

  if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = "Passwords do not match";
  }

  if (!formData.address.trim()) {
    newErrors.address = "Street address is required";
  }

  if (!formData.city.trim()) {
    newErrors.city = "City is required";
  }

  if (!formData.state.trim()) {
    newErrors.state = "State is required";
  }

  if (!formData.zipCode.trim()) {
    newErrors.zipCode = "Zip code is required";
  }

  // Provider / Realtor Validation
  if (
    formData.userType === "provider" ||
    formData.userType === "realtor"
  ) {
    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }

    if (!formData.serviceType.trim()) {
      newErrors.serviceType = "Service type is required";
    }

    if (!formData.businessDescription.trim()) {
      newErrors.businessDescription =
        "Business description is required";
    }
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

// ================= HANDLE SUBMIT =================

const handleSubmit = (e) => {
  e.preventDefault();

  const isValid = validateForm();
  if (!isValid) return;

  let payload = {
    role:
      formData.userType === "provider"
        ? "service_provider"
        : formData.userType,
    registerAs: formData.registerAs,

    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    password: formData.password,
    confirmPassword: formData.confirmPassword,

    streetAddress: formData.address,
    city: formData.city,
    state: formData.state,
    zipCode: formData.zipCode
  };

  if (
    formData.userType === "provider" ||
    formData.userType === "realtor"
  ) {
    payload = {
      ...payload,
      businessName: formData.businessName,
      serviceType: formData.serviceType,
      businessDesc: formData.businessDescription,
      licenseNumber: formData.licenseNumber.trim() || null
    };
  }

  setHasSubmitted(true);
  dispatch(signupStart(payload));
};

useEffect(() => {
  if (!hasSubmitted) return;

  if (userCreate) {
    // Email-link verification branch: the backend returned no JWT — show
    // the "check your email" dialog and let the user click the link in
    // their inbox. They will be logged in from VerifyEmailPage.
    if (requiresEmailVerification) {
      setVerifyEmailAddress(pendingVerificationEmail || formData.email);
      setShowVerifyEmailDialog(true);
      setHasSubmitted(false);
      return;
    }

    // Legacy direct-login branch (kept for forward compatibility — current
    // backend never hits this).
    if (loginData && Object.keys(loginData).length > 0) {
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
      toast.success(message || "Account created successfully");
      setHasSubmitted(false);
      dispatch(resetSignupFlag());
      navigate("/profile");
      return;
    }
  }

  if (error) {
    const errorMessage =
      typeof error === "string" ? error : error?.message || "Signup failed";
    toast.error(errorMessage);
    setErrorDialogData({
      title: "Registration Failed",
      message: errorMessage
    });
    setShowErrorDialog(true);
    setHasSubmitted(false);
  }
}, [hasSubmitted, userCreate, requiresEmailVerification, pendingVerificationEmail, loginData, error, message, navigate, setCurrentUser, dispatch, formData.email]);

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

      <div className="container mx-auto max-w-4xl">
        <div
          className="rounded-2xl shadow-xl p-8 relative overflow-hidden"
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
            <h1 className="text-2xl text-white mb-2 drop-shadow-lg">Join ReproServe</h1>
            <p className="text-white drop-shadow-md"></p>
          </div>

          {/* Register as — Individual or Business */}
          <div className="mb-6">
            <label className="block text-sm text-white mb-2 drop-shadow-md">Register as -</label>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="registerAs"
                  value="individual"
                  checked={formData.registerAs === 'individual'}
                  onChange={handleInputChange}
                  className="w-4 h-4 accent-coral-orange cursor-pointer" />
                <span className="text-white drop-shadow-md">Individual</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="registerAs"
                  value="business"
                  checked={formData.registerAs === 'business'}
                  onChange={handleInputChange}
                  className="w-4 h-4 accent-coral-orange cursor-pointer" />
                <span className="text-white drop-shadow-md">Business</span>
              </label>
            </div>
          </div>

          {/* Account Type Selection */}
          <div className="mb-6">
            <label className="block text-sm text-white mb-2 drop-shadow-md">I am a:</label>
            <div className="flex justify-center">
              <Tabs
                selectedKey={formData.userType}
                onSelectionChange={(key) => selectType(key)}
                className="w-auto">

                <Tabs.List
                  type="button-brand"
                  size="md"
                  items={accountTypeTabs}
                  className="grid grid-cols-3 gap-3 bg-transparent p-0 h-auto !gap-3 w-auto">

                  {(tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <Tabs.Item
                        id={tab.value}
                        className={(state) => {
                          const baseClasses = "relative p-4 rounded-xl border-2 transition-all duration-75 overflow-hidden backdrop-blur-sm flex flex-col items-center";
                          const selectedClasses = state.isSelected ?
                            'border-white shadow-xl shadow-white/20 scale-[1.02]' :
                            'border-white/30 bg-white/10 text-white hover:border-white/50 hover:bg-white/15 hover:scale-[1.01]';
                          return `${baseClasses} ${selectedClasses}`;
                        }}>

                        {(state) =>
                          <>
                            <div
                              className="absolute inset-0 rounded-xl pointer-events-none"
                              style={state.isSelected ? {
                                background: '#ffd200',
                                boxShadow: 'rgba(255, 255, 255, 0.3) 0px 0px 0px 2px, rgba(0, 0, 0, 0.2) 0px 8px 24px, rgba(255, 255, 255, 0.2) 0px 1px 0px inset'
                              } : {}} />

                            {state.isSelected &&
                              <div
                                className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-xl" />

                            }
                            <div className="relative z-10 flex flex-col items-center w-full">
                              <IconComponent className={`mx-auto mb-2 transition-all duration-75 ${state.isSelected ? 'h-7 w-7 text-slate-900' : 'h-5 w-5 text-white'}`
                              } />
                              <span className={`font-medium transition-all duration-75 ${state.isSelected ? 'text-base text-slate-900' : 'text-sm text-white'}`
                              }>{tab.label}</span>
                            </div>
                          </>
                        }
                      </Tabs.Item>);

                  }}
                </Tabs.List>
              </Tabs>
            </div>
          </div>

          {/* Form */}
          <div className="relative">
            <form
              onSubmit={handleSubmit}
              className="space-y-6">

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm text-white mb-2 drop-shadow-md">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-md border-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none transition-colors ${errors.firstName ? 'border-coral-orange' : 'border-white/30 focus:border-white/60'}`
                    }
                    placeholder="Enter first name" />

                  {errors.firstName &&
                    <p className="text-coral-orange text-sm mt-1 drop-shadow-md">{errors.firstName}</p>
                  }
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm text-white mb-2 drop-shadow-md">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-md border-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none transition-colors ${errors.lastName ? 'border-coral-orange' : 'border-white/30 focus:border-white/60'}`
                    }
                    placeholder="Enter last name" />

                  {errors.lastName &&
                    <p className="text-coral-orange text-sm mt-1 drop-shadow-md">{errors.lastName}</p>
                  }
                </div>
              </div>

              {/* Email and Phone Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm text-white mb-2 drop-shadow-md">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-md border-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none transition-colors ${errors.email ? 'border-coral-orange' : 'border-white/30 focus:border-white/60'}`
                    }
                    placeholder="Enter your email address" />

                  {errors.email &&
                    <p className="text-coral-orange text-sm mt-1 drop-shadow-md">{errors.email}</p>
                  }
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm text-white mb-2 drop-shadow-md">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-md border-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none transition-colors ${errors.phone ? 'border-coral-orange' : 'border-white/30 focus:border-white/60'}`
                    }
                    placeholder="Enter your phone number" />

                  {errors.phone &&
                    <p className="text-coral-orange text-sm mt-1 drop-shadow-md">{errors.phone}</p>
                  }
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm text-white mb-2 drop-shadow-md">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 pr-12 py-3 rounded-md border-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none transition-colors ${errors.password ? 'border-coral-orange' : 'border-white/30 focus:border-white/60'}`
                      }
                      placeholder="Create password" />

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
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm text-white mb-2 drop-shadow-md">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 pr-12 py-3 rounded-md border-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none transition-colors ${errors.confirmPassword ? 'border-coral-orange' : 'border-white/30 focus:border-white/60'}`
                      }
                      placeholder="Confirm password" />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-white transition-colors duration-300">

                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword &&
                    <p className="text-coral-orange text-sm mt-1 drop-shadow-md">{errors.confirmPassword}</p>
                  }
                </div>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm text-white mb-2 drop-shadow-md">
                  Street Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-md border-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none transition-colors resize-none ${errors.address ? 'border-coral-orange' : 'border-white/30 focus:border-white/60'}`
                  }
                  placeholder="Enter street address" />

                {errors.address &&
                  <p className="text-coral-orange text-sm mt-1 drop-shadow-md">{errors.address}</p>
                }
              </div>

              {/* City, State, Zip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="city" className="block text-sm text-white mb-2 drop-shadow-md">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-md border-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none transition-colors ${errors.city ? 'border-coral-orange' : 'border-white/30 focus:border-white/60'}`
                    }
                    placeholder="City" />

                  {errors.city &&
                    <p className="text-coral-orange text-sm mt-1 drop-shadow-md">{errors.city}</p>
                  }
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm text-white mb-2 drop-shadow-md">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-md border-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none transition-colors ${errors.state ? 'border-coral-orange' : 'border-white/30 focus:border-white/60'}`
                    }
                    placeholder="State" />

                  {errors.state &&
                    <p className="text-coral-orange text-sm mt-1 drop-shadow-md">{errors.state}</p>
                  }
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-sm text-white mb-2 drop-shadow-md">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-md border-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none transition-colors ${errors.zipCode ? 'border-coral-orange' : 'border-white/30 focus:border-white/60'}`
                    }
                    placeholder="ZIP Code" />

                  {errors.zipCode &&
                    <p className="text-coral-orange text-sm mt-1 drop-shadow-md">{errors.zipCode}</p>
                  }
                </div>
              </div>

              {/* Business Fields (Provider and Realtor) */}
              {(formData.userType === 'provider' || formData.userType === 'realtor') &&
                <div className="space-y-6">
                  <div>
                    <label htmlFor="businessName" className="block text-sm text-white mb-2 drop-shadow-md">
                      Business Name
                    </label>
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-md border-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none transition-colors ${errors.businessName ? 'border-coral-orange' : 'border-white/30 focus:border-white/60'}`
                      }
                      placeholder="Enter your business name" />

                    {errors.businessName &&
                      <p className="text-coral-orange text-sm mt-1 drop-shadow-md">{errors.businessName}</p>
                    }
                  </div>
                  <div>
                    <label htmlFor="serviceType" className="block text-sm text-white mb-2 drop-shadow-md">
                      Service Type
                    </label>
                    <div className="relative" ref={serviceDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-md border-2 bg-white/10 backdrop-blur-sm text-white focus:outline-none transition-colors ${errors.serviceType ? 'border-coral-orange' : 'border-white/30 focus:border-white/60'}`
                        }>

                        <div className="flex items-center space-x-2">
                          {getSelectedServiceType() ? (() => {
                            const selected = getSelectedServiceType();
                            return (
                              <>
                                {React.createElement(selected.icon, { className: "h-4 w-4" })}
                                <span>{selected.label}</span>
                              </>);

                          })() :
                            <span className="text-white/70">Select Service</span>
                          }
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isServiceDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isServiceDropdownOpen &&
                        <div
                          className="absolute z-50 mt-2 w-full rounded-2xl shadow-lg max-h-[300px] overflow-y-auto service-dropdown-scroll"
                          style={{
                            background: 'linear-gradient(135deg, rgba(0, 69, 113, 0.95), rgba(0, 69, 113, 0.95))',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                          }}>

                          {getServiceTypes().map((service, index) => {
                            const IconComponent = service.icon;
                            const isFirst = index === 0;
                            const isLast = index === getServiceTypes().length - 1;
                            return (
                              <button
                                key={service.value}
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, serviceType: service.value }));
                                  setIsServiceDropdownOpen(false);
                                  // Clear error when selecting
                                  if (errors.serviceType) {
                                    setErrors((prev) => ({
                                      ...prev,
                                      serviceType: ''
                                    }));
                                  }
                                }}
                                className={`group block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-all duration-300 drop-shadow-md flex items-center space-x-2 ${isFirst ? 'rounded-t-2xl' : ''} ${isLast ? 'rounded-b-2xl' : ''} hover:scale-[1.05] hover:translate-x-1 hover:shadow-lg ${formData.serviceType === service.value ? 'bg-white/10' : ''}`
                                }>

                                <IconComponent className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:text-sky-blue flex-shrink-0" />
                                <span className="transition-all duration-300 group-hover:font-medium">{service.label}</span>
                              </button>);

                          })}
                        </div>
                      }
                    </div>
                    {errors.serviceType &&
                      <p className="text-coral-orange text-sm mt-1 drop-shadow-md">{errors.serviceType}</p>
                    }
                  </div>
                  <div>
                    <label htmlFor="businessDescription" className="block text-sm text-white mb-2 drop-shadow-md">
                      Business Description
                    </label>
                    <textarea
                      id="businessDescription"
                      name="businessDescription"
                      value={formData.businessDescription}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-4 py-3 rounded-md border-2 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none transition-colors resize-none ${errors.businessDescription ? 'border-coral-orange' : 'border-white/30 focus:border-white/60'}`
                      }
                      placeholder="Describe your business and services..." />

                    {errors.businessDescription &&
                      <p className="text-coral-orange text-sm mt-1 drop-shadow-md">{errors.businessDescription}</p>
                    }
                  </div>

                  {/* License Number — optional, shown for both providers and realtors. */}
                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm text-white mb-2 drop-shadow-md">
                      License Number <span className="text-white/60 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="licenseNumber"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-md border-2 border-white/30 focus:border-white/60 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none transition-colors"
                      placeholder="e.g. TX-12345 (leave blank if not applicable)" />
                  </div>
                </div>
              }

              {/* Error Message */}
              {errors.submit &&
                <div className="text-center">
                  <p className="text-coral-orange text-sm drop-shadow-md">{errors.submit}</p>
                </div>
              }

              {/* Submit Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-4 px-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white text-lg transition-all duration-300 hover:bg-white/30 hover:border-white/50 hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2">

                  {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-white drop-shadow-md">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('login')}
                className="text-white hover:text-white transition-colors duration-300 hover:underline drop-shadow-md">

                Login here
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* "Check your email" dialog — shown after a successful register that
          requires email-link verification. */}
      {showVerifyEmailDialog && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 69, 113, 0.75)',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
          <div
            className="relative w-full max-w-md rounded-2xl p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              animation: 'modalPopIn 0.25s ease-out'
            }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
              background: 'rgba(255, 210, 0, 0.18)', border: '2px solid #ffd200',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32
            }}>
              📧
            </div>
            <h2 className="text-2xl text-white drop-shadow-lg mb-2">Check your email</h2>
            <p className="text-white drop-shadow-md mb-1">
              We've sent a verification link to
            </p>
            <p className="text-white font-semibold mb-4">{verifyEmailAddress}</p>
            <p className="text-sm text-white/80 drop-shadow-md mb-6 leading-relaxed">
              Click the link in the email to activate your account.
              The link expires in <strong>24 hours</strong>.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  if (!verifyEmailAddress) return;
                  dispatch(resendVerificationStart({ email: verifyEmailAddress }));
                  toast.success('Verification link re-sent. Check your inbox.');
                }}
                disabled={resendVerificationLoading}
                className="px-5 py-2 rounded-xl border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 font-semibold backdrop-blur-sm disabled:opacity-60">
                {resendVerificationLoading ? 'Sending…' : 'Resend Email'}
              </button>
              <button
                onClick={() => {
                  setShowVerifyEmailDialog(false);
                  dispatch(resetSignupFlag());
                  navigate('login');
                }}
                className="px-5 py-2 rounded-xl bg-coral-orange text-black hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg">
                Back to Login
              </button>
            </div>
            <p className="text-xs text-white/60 mt-5">
              Didn't get it? Check your spam folder, or wait a minute and try Resend.
            </p>
          </div>
        </div>,
        document.body
      )}

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
                <div className="bg-white rounded-lg p-4 border border-white">
                  <p className="text-sm text-white mb-2 font-medium">Please fix the following:</p>
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



