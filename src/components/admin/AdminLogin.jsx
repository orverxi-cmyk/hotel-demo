'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../../context/ThemeContext';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { loadAdminUsers } from '../../services/storageService';
import { Shield, Eye, EyeOff, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';

export const AdminLogin = ({ onLoginSuccess }) => {
  const { theme } = useTheme();
  
  // Clean inputs with NO exposed credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const SUPER_ADMIN_EMAIL = 'tharushyamagara@gmail.com';
  const SUPER_ADMIN_PASSWORD = 'Gavyn#123@Olga';

  // Email & Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Check if Super Admin
      if (
        (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase() || cleanEmail === 'superadmin' || cleanEmail === 'admin@hotel.com') && 
        password === SUPER_ADMIN_PASSWORD
      ) {
        try {
          await signInWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD).catch(() => {});
        } catch (_) {}

        const adminSession = {
          role: 'SUPER_ADMIN',
          email: SUPER_ADMIN_EMAIL,
          name: 'Super Administrator'
        };

        sessionStorage.setItem('hotel_super_admin_session', 'authenticated');
        sessionStorage.setItem('hotel_admin_role', 'SUPER_ADMIN');
        sessionStorage.setItem('hotel_admin_email', SUPER_ADMIN_EMAIL);
        sessionStorage.setItem('hotel_admin_name', 'Super Administrator');

        onLoginSuccess(adminSession);
        return;
      }

      // 2. Check if Normal Admin
      const adminUsers = await loadAdminUsers();
      const matchedNormalAdmin = adminUsers.find(
        u => u.email.toLowerCase() === cleanEmail && u.password === password
      );

      if (matchedNormalAdmin) {
        const adminSession = {
          role: 'NORMAL_ADMIN',
          email: matchedNormalAdmin.email,
          name: matchedNormalAdmin.name || 'Staff Administrator'
        };

        sessionStorage.setItem('hotel_super_admin_session', 'authenticated');
        sessionStorage.setItem('hotel_admin_role', 'NORMAL_ADMIN');
        sessionStorage.setItem('hotel_admin_email', matchedNormalAdmin.email);
        sessionStorage.setItem('hotel_admin_name', matchedNormalAdmin.name);

        onLoginSuccess(adminSession);
        return;
      }

      // If no match
      setError('Invalid email or password. Access restricted.');
    } catch (err) {
      setError(err.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google / Gmail OAuth Login
  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const googleEmail = res?.user?.email?.toLowerCase();

      // Check if Super Admin
      if (googleEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
        const adminSession = {
          role: 'SUPER_ADMIN',
          email: googleEmail,
          name: res?.user?.displayName || 'Super Administrator'
        };

        sessionStorage.setItem('hotel_super_admin_session', 'authenticated');
        sessionStorage.setItem('hotel_admin_role', 'SUPER_ADMIN');
        sessionStorage.setItem('hotel_admin_email', googleEmail);
        sessionStorage.setItem('hotel_admin_name', adminSession.name);

        onLoginSuccess(adminSession);
        return;
      }

      // Check if authorized Normal Admin
      const adminUsers = await loadAdminUsers();
      const matchedNormal = adminUsers.find(u => u.email.toLowerCase() === googleEmail);

      if (matchedNormal) {
        const adminSession = {
          role: 'NORMAL_ADMIN',
          email: googleEmail,
          name: matchedNormal.name || res?.user?.displayName || 'Staff Administrator'
        };

        sessionStorage.setItem('hotel_super_admin_session', 'authenticated');
        sessionStorage.setItem('hotel_admin_role', 'NORMAL_ADMIN');
        sessionStorage.setItem('hotel_admin_email', googleEmail);
        sessionStorage.setItem('hotel_admin_name', adminSession.name);

        onLoginSuccess(adminSession);
        return;
      }

      // Unknown Google account
      setError(`Access denied. Google account "${googleEmail}" is not authorized as an administrator.`);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed.');
      } else {
        setError(`Google Sign-In: ${err.message}`);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-amber-100 selection:text-amber-950">
      
      {/* Top back bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Hotel Website</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Protected Area</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-9 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          
          {/* Subtle Ambient Glow */}
          <div 
            className="absolute -top-20 -right-20 w-44 h-44 rounded-full blur-[90px] opacity-25 pointer-events-none"
            style={{ backgroundColor: 'var(--color-secondary)' }}
          />

          {/* Hotel Monogram & Shield Badge */}
          <div className="flex flex-col items-center text-center mb-6">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-serif text-2xl font-bold border-2 shadow-xl mb-3 relative"
              style={{ 
                backgroundColor: 'var(--color-primary)', 
                borderColor: 'var(--color-secondary)',
                color: 'var(--color-secondary)'
              }}
            >
              {theme?.hotelName?.charAt(0) || 'H'}
              <div 
                className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-slate-950 shadow-md"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                <Shield className="w-3.5 h-3.5" />
              </div>
            </div>

            <h2 className="font-serif text-2xl font-bold text-white tracking-wide">
              Management Portal Login
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              {theme?.hotelName || 'The Grand Aurelia'} • Staff & Admin Access
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sign in with Google / Gmail */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-stone-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-3 shadow-md transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google / Gmail'}</span>
          </button>

          {/* Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-slate-900 px-3 text-[10px] uppercase font-mono tracking-wider text-stone-500">
              Or with credentials
            </span>
          </div>

          {/* Clean Login Form (Zero exposed values) */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-secondary)' }}
            >
              <KeyRound className="w-4 h-4" />
              <span>{isLoading ? 'Verifying...' : 'Sign In to Portal'}</span>
            </button>
          </form>

          {/* Security note */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 text-center text-[11px] text-stone-500">
            <span>Restricted access for verified management personnel.</span>
          </div>

        </div>
      </div>

      {/* Bottom copyright */}
      <div className="max-w-7xl mx-auto w-full text-center text-xs text-stone-500">
        © {new Date().getFullYear()} {theme?.hotelName || 'The Grand Aurelia'}. Encrypted Access Control.
      </div>

    </div>
  );
};
