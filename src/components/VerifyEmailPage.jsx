import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, CheckCircle2, XCircle, MailWarning } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  verifyEmailStart,
  resetVerifyEmailFlag,
  resendVerificationStart,
  resetResendVerificationFlag
} from '../Store/Features/Authentication/authslice';

// Target of the email verification link:  /verify-email?token=<token>
// On mount the page calls GET /api/auth/verify-email/:token. On success the
// API returns an accessToken + account; we store both and redirect to /profile.
export function VerifyEmailPage({ navigate, setCurrentUser }) {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const dispatch = useDispatch();
  const [resendEmail, setResendEmail] = useState('');
  const hasDispatchedRef = useRef(false);
  const hasRedirectedRef = useRef(false);

  const {
    verifyEmailLoading,
    verifyEmailSuccess,
    verifyEmailError,
    verifyEmailExpired,
    loginData,
    pendingVerificationEmail,
    resendVerificationLoading,
    resendVerificationSuccess
  } = useSelector((s) => s.AuthReducer);

  // Fire the verify request exactly once on mount. StrictMode would otherwise
  // double-dispatch and the second call gets "invalid or already used".
  useEffect(() => {
    if (!token) return;
    if (hasDispatchedRef.current) return;
    hasDispatchedRef.current = true;
    dispatch(verifyEmailStart({ token }));
    return () => dispatch(resetVerifyEmailFlag());
  }, [token, dispatch]);

  // On success: store the token + user and redirect to /profile.
  useEffect(() => {
    if (!verifyEmailSuccess || hasRedirectedRef.current) return;
    const account = loginData?.data?.account || loginData?.account;
    const accessToken = loginData?.data?.accessToken || loginData?.accessToken;
    if (!account || !accessToken) return;

    hasRedirectedRef.current = true;
    localStorage.setItem('auth_token', accessToken);

    const role = account.role === 'service_provider' ? 'provider' : account.role || 'user';
    const user = {
      id: account.id,
      name: [account.firstName, account.lastName].filter(Boolean).join(' ') || account.email,
      email: account.email,
      role,
      verified: true,
      location: [account.city, account.state].filter(Boolean).join(', ')
    };
    setCurrentUser(user);
    toast.success('Email verified! Welcome to ReproServe.');
    // Small delay so the success card is visible to the user.
    setTimeout(() => navigate('/profile'), 1200);
  }, [verifyEmailSuccess, loginData, navigate, setCurrentUser]);

  // Surface resend toasts.
  useEffect(() => {
    if (resendVerificationSuccess) {
      toast.success('A new verification link is on its way.');
      dispatch(resetResendVerificationFlag());
    }
  }, [resendVerificationSuccess, dispatch]);

  const requestResend = () => {
    const email = (resendEmail || pendingVerificationEmail || '').trim();
    if (!email) {
      toast.error('Enter the email you signed up with.');
      return;
    }
    dispatch(resendVerificationStart({ email }));
  };

  // ── Render branches ──
  let body;
  if (!token) {
    body = (
      <Card icon={<XCircle className="h-10 w-10 text-red-300" />}
            title="Missing token"
            message="The verification link is missing or malformed. Please use the link in your email."
            primary={{ label: 'Back to Login', onClick: () => navigate('login') }} />
    );
  } else if (verifyEmailLoading || (!verifyEmailSuccess && !verifyEmailError)) {
    body = (
      <Card icon={<Loader2 className="h-10 w-10 text-white animate-spin" />}
            title="Verifying your email…"
            message="One moment while we activate your account." />
    );
  } else if (verifyEmailSuccess) {
    body = (
      <Card icon={<CheckCircle2 className="h-10 w-10 text-green-300" />}
            title="Email verified"
            message="Your account is now active. Redirecting you to your profile…" />
    );
  } else if (verifyEmailExpired) {
    body = (
      <Card icon={<MailWarning className="h-10 w-10 text-orange-300" />}
            title="Link expired"
            message="This verification link is no longer valid. Enter your email and we'll send a fresh one.">
        <ResendBlock
          email={resendEmail || pendingVerificationEmail || ''}
          onChange={setResendEmail}
          loading={resendVerificationLoading}
          onResend={requestResend} />
      </Card>
    );
  } else {
    body = (
      <Card icon={<XCircle className="h-10 w-10 text-red-300" />}
            title="Verification failed"
            message={verifyEmailError || 'This verification link is invalid or has already been used.'}>
        <ResendBlock
          email={resendEmail || pendingVerificationEmail || ''}
          onChange={setResendEmail}
          loading={resendVerificationLoading}
          onResend={requestResend} />
      </Card>
    );
  }

  return (
    <div
      className="px-4 min-h-screen flex items-center justify-center"
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
      {body}
    </div>);
}

// Reusable status card — same glass styling as the rest of the app.
function Card({ icon, title, message, primary, children }) {
  return (
    <div
      className="relative w-full max-w-md rounded-2xl p-8 text-center"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {icon}
      </div>
      <h2 className="text-2xl text-white drop-shadow-lg mb-2">{title}</h2>
      <p className="text-white/90 drop-shadow-md mb-4">{message}</p>
      {children}
      {primary &&
        <button
          onClick={primary.onClick}
          className="mt-4 px-5 py-2 rounded-xl bg-coral-orange text-black hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg">
          {primary.label}
        </button>
      }
    </div>);
}

function ResendBlock({ email, onChange, loading, onResend }) {
  return (
    <div className="mt-4 text-left">
      <label className="block text-sm text-white mb-2 drop-shadow-md">Your email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => onChange(e.target.value)}
        placeholder="you@example.com"
        className="w-full px-4 py-3 mb-3 rounded-md border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white/60" />
      <button
        onClick={onResend}
        disabled={loading}
        className="w-full px-5 py-2 rounded-xl bg-coral-orange text-black hover:bg-coral-orange/90 hover:scale-105 transition-all duration-300 font-semibold shadow-lg disabled:opacity-60">
        {loading ? 'Sending…' : 'Send a new verification link'}
      </button>
    </div>);
}
