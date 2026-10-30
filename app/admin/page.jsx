'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPortal } from '../../src/components/admin/AdminPortal';
import { AdminLogin } from '../../src/components/admin/AdminLogin';

export default function AdminPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminRole, setAdminRole] = useState('SUPER_ADMIN');
  const [adminEmail, setAdminEmail] = useState('tharushyamagara@gmail.com');
  const [adminName, setAdminName] = useState('Super Administrator');

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const isAuth = sessionStorage.getItem('hotel_super_admin_session') === 'authenticated';
      setIsAuthenticated(isAuth);
      if (isAuth) {
        setAdminRole(sessionStorage.getItem('hotel_admin_role') || 'SUPER_ADMIN');
        setAdminEmail(sessionStorage.getItem('hotel_admin_email') || 'tharushyamagara@gmail.com');
        setAdminName(sessionStorage.getItem('hotel_admin_name') || 'Super Administrator');
      }
    }
  }, []);

  const handleLoginSuccess = (session) => {
    if (session) {
      setAdminRole(session.role || 'SUPER_ADMIN');
      setAdminEmail(session.email || 'tharushyamagara@gmail.com');
      setAdminName(session.name || 'Administrator');
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('hotel_super_admin_session');
      sessionStorage.removeItem('hotel_admin_role');
      sessionStorage.removeItem('hotel_admin_email');
      sessionStorage.removeItem('hotel_admin_name');
      localStorage.removeItem('hotel_super_admin_logged_in');
    }
    setIsAuthenticated(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mb-3" />
        <span className="text-xs uppercase font-mono tracking-widest text-stone-400">Loading Management Portal...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLogin onLoginSuccess={handleLoginSuccess} />
    );
  }

  return (
    <AdminPortal 
      onClose={() => router.push('/')}
      onLogout={handleLogout}
      role={adminRole}
      userEmail={adminEmail}
      userName={adminName}
    />
  );
}
