'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '../../context/ThemeContext';
import { useBooking } from '../../context/BookingContext';
import { 
  Palette, 
  CalendarDays, 
  BedDouble, 
  BarChart3, 
  X, 
  Check, 
  RefreshCw, 
  Save, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  ShieldCheck, 
  DollarSign, 
  Eye, 
  ArrowLeft,
  CloudCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  UploadCloud,
  LogOut,
  Database,
  Lock,
  Users,
  UserPlus,
  Shield,
  KeyRound,
  Info,
  Film,
  Upload,
  Play,
  Mail,
  RotateCw
} from 'lucide-react';
import { 
  syncAllContentToFirestore, 
  loadAdminUsers, 
  saveAdminUsers, 
  initialAdminUsers,
  loadSliderSlides,
  saveSliderSlide,
  initialSliderSlides,
  uploadMediaFile
} from '../../services/storageService';

export const AdminPortal = ({ 
  onClose, 
  onLogout,
  role = 'SUPER_ADMIN',
  userEmail = 'tharushyamagara@gmail.com',
  userName = 'Super Administrator'
}) => {
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const { theme, updateTheme, applyPreset, presets, resetTheme, isSaving, syncStatus } = useTheme();
  const { 
    bookings, 
    rooms, 
    changeBookingStatus, 
    addRoom, 
    updateRoom, 
    deleteRoom, 
    resetDemo, 
    showNotification,
    getBookingEmailLogs,
    resendBookingEmail
  } = useBooking();

  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // Folio email logs & preview state
  const [folioEmailLogs, setFolioEmailLogs] = useState([]);
  const [previewingEmail, setPreviewingEmail] = useState(null);
  const [isResendingFolioEmail, setIsResendingFolioEmail] = useState(false);

  // Admin users state (for Admins & Roles tab)
  const [adminUsers, setAdminUsers] = useState(initialAdminUsers);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [adminError, setAdminError] = useState('');

  // Slider slides state & media uploads
  const [sliderSlides, setSliderSlides] = useState(initialSliderSlides);
  const [uploadingSlideId, setUploadingSlideId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchSlider = async () => {
      const data = await loadSliderSlides();
      if (data && data.length > 0) {
        setSliderSlides(data);
      }
    };
    fetchSlider();
  }, []);

  const handleSlideUpload = async (slideId, file) => {
    if (!isSuperAdmin) {
      showNotification("Upload restricted to Super Administrator.");
      return;
    }
    if (!file) return;

    try {
      setUploadingSlideId(slideId);
      setUploadProgress(0);

      const result = await uploadMediaFile(file, 'slider', (p) => {
        setUploadProgress(p);
      });

      if (result.success) {
        const slideToUpdate = sliderSlides.find(s => s.id === slideId);
        if (slideToUpdate) {
          const updatedSlide = {
            ...slideToUpdate,
            image: result.url,
            mediaType: result.mediaType
          };
          const newSlides = sliderSlides.map(s => s.id === slideId ? updatedSlide : s);
          setSliderSlides(newSlides);
          await saveSliderSlide(updatedSlide);
          showNotification(`Slide "${updatedSlide.title}" media uploaded successfully!`);
        }
      }
    } catch (err) {
      showNotification(`Upload failed: ${err.message}`);
    } finally {
      setUploadingSlideId(null);
      setUploadProgress(0);
    }
  };

  const handleUpdateSlideField = (slideId, field, value) => {
    if (!isSuperAdmin) return;
    const updated = sliderSlides.map(s => s.id === slideId ? { ...s, [field]: value } : s);
    setSliderSlides(updated);
  };

  const handleSaveSlide = async (slide) => {
    if (!isSuperAdmin) return;
    await saveSliderSlide(slide);
    showNotification(`Slide "${slide.title}" saved successfully!`);
  };

  useEffect(() => {
    const fetchAdmins = async () => {
      const users = await loadAdminUsers();
      if (users && users.length > 0) {
        setAdminUsers(users);
      }
    };
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminError('');

    const cleanEmail = adminFormData.email.trim().toLowerCase();
    const cleanName = adminFormData.name.trim();

    if (!cleanEmail || !cleanName || !adminFormData.password) {
      setAdminError('Please fill in all administrator credentials.');
      return;
    }

    if (adminFormData.password.length < 6) {
      setAdminError('Password must contain at least 6 characters.');
      return;
    }

    if (adminUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
      setAdminError(`An administrator with email "${cleanEmail}" already exists.`);
      return;
    }

    const newAdmin = {
      id: `admin-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: adminFormData.password,
      role: 'NORMAL_ADMIN',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [...adminUsers, newAdmin];
    setAdminUsers(updated);
    await saveAdminUsers(updated);

    showNotification(`Normal Administrator "${newAdmin.name}" provisioned successfully!`);
    setAdminFormData({ name: '', email: '', password: '' });
    setIsAddAdminOpen(false);
  };

  const handleRemoveAdmin = async (adminId, adminName) => {
    if (!isSuperAdmin) return;
    const target = adminUsers.find(u => u.id === adminId);
    if (!target) return;
    if (target.role === 'SUPER_ADMIN' || target.email.toLowerCase() === 'tharushyamagara@gmail.com') {
      alert('Security violation: Primary Super Administrator account cannot be removed.');
      return;
    }

    if (window.confirm(`Revoke administrator access for "${adminName || target.email}"?\n\nThey will immediately lose access to the management portal.`)) {
      const updated = adminUsers.filter(u => u.id !== adminId);
      setAdminUsers(updated);
      await saveAdminUsers(updated);
      showNotification(`Administrator access revoked for "${adminName || target.email}".`);
    }
  };

  const handleResetAdminPassword = async (adminId, adminName) => {
    if (!isSuperAdmin) return;
    const target = adminUsers.find(u => u.id === adminId);
    if (!target) return;

    const newPass = window.prompt(`Set new password for "${adminName || target.email}":\n(Must contain at least 6 characters)`);
    if (!newPass) return;

    if (newPass.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    const updated = adminUsers.map(u => u.id === adminId ? { ...u, password: newPass } : u);
    setAdminUsers(updated);
    await saveAdminUsers(updated);
    showNotification(`Password updated for "${adminName || target.email}"!`);
  };

  const handleSyncAll = async () => {
    if (!isSuperAdmin) {
      showNotification("Action restricted: Only Super Administrator can perform cloud synchronization.");
      return;
    }
    setIsSyncingAll(true);
    const res = await syncAllContentToFirestore();
    setIsSyncingAll(false);
    if (res.success) {
      showNotification("All site content (Theme, Rooms, Bookings, Amenities, Reviews) loaded to Firestore!");
    } else {
      showNotification(`Firestore sync: ${res.error || 'Check Firestore rules in Firebase Console'}`);
    }
  };

  const [activeTab, setActiveTab] = useState('theme'); // 'theme', 'bookings', 'rooms', 'analytics', 'users'
  
  // Local theme form state
  const [themeForm, setThemeForm] = useState({
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    hotelName: theme.hotelName,
    hotelSubtitle: theme.hotelSubtitle,
    location: theme.location,
    currency: theme.currency,
    phone: theme.phone,
    email: theme.email,
    checkInTime: theme.checkInTime || '15:00',
    checkOutTime: theme.checkOutTime || '11:00',
    heroImage: theme.heroImage,
    announcement: theme.announcement || ''
  });

  // Bookings filter
  const [bookingFilter, setBookingFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);

  // Sync folio email dispatch audit logs
  useEffect(() => {
    if (selectedBookingDetail) {
      const fetchLogs = async () => {
        if (getBookingEmailLogs) {
          const logs = await getBookingEmailLogs(selectedBookingDetail.id, selectedBookingDetail, theme);
          setFolioEmailLogs(logs || []);
        }
      };
      fetchLogs();
    } else {
      setFolioEmailLogs([]);
    }
  }, [selectedBookingDetail]);

  const handleResendFolioEmail = async (type = null) => {
    if (!selectedBookingDetail || !resendBookingEmail) return;
    setIsResendingFolioEmail(true);
    try {
      await resendBookingEmail(selectedBookingDetail.id, type);
      if (getBookingEmailLogs) {
        const logs = await getBookingEmailLogs(selectedBookingDetail.id, selectedBookingDetail, theme);
        setFolioEmailLogs(logs || []);
      }
    } finally {
      setIsResendingFolioEmail(false);
    }
  };

  // New room modal
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFormData, setRoomFormData] = useState({
    name: '',
    category: 'Suite',
    price: 350,
    size: '75 m² / 800 sq ft',
    guests: 2,
    beds: '1 King Bed',
    view: 'Ocean View',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    description: 'A beautiful luxury suite with bespoke modern amenities and private balcony.',
    amenities: ['Ocean View Balcony', 'Smart TV', 'Marble Bath', 'Espresso Machine', 'High-Speed Wi-Fi'],
    featured: false,
    available: true
  });

  // Handle color change in real time
  const handleColorChange = (field, color) => {
    setThemeForm(prev => ({ ...prev, [field]: color }));
    // Instantly update live DOM for instant client feedback
    updateTheme({ [field]: color });
  };

  const handleSaveTheme = async (e) => {
    e.preventDefault();
    await updateTheme(themeForm);
    showNotification("Branding & Theme saved to Firebase successfully!");
  };

  // Filtered bookings
  const filteredBookings = bookings.filter(b => {
    const matchesFilter = bookingFilter === 'all' || b.status.toLowerCase() === bookingFilter.toLowerCase();
    const matchesSearch = !bookingSearch || 
      b.guestName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.roomName.toLowerCase().includes(bookingSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Analytics KPIs
  const totalRevenue = bookings
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

  const activeBookingsCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Checked In').length;
  const occupancyRate = Math.min(100, Math.round((activeBookingsCount / (rooms.length || 1)) * 100));
  const averageDailyRate = Math.round(totalRevenue / Math.max(1, bookings.filter(b => b.status !== 'Cancelled').reduce((sum, b) => sum + (Number(b.nights) || 1), 0)));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-slate-100 flex flex-col overflow-hidden animate-fade-in font-sans">
      
      {/* CMS Top Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-stone-300 text-xs font-semibold transition-all"
            title="Return to the live hotel website"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">View Website</span>
          </button>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center font-serif text-sm font-bold text-slate-950 shadow-md"
              style={{ backgroundColor: 'var(--color-secondary)' }}
            >
              CMS
            </div>
            <div>
              <h1 className="font-bold text-sm text-white flex items-center gap-2 flex-wrap">
                <span>{theme.hotelName} Admin CMS</span>
                {isSuperAdmin ? (
                  <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Super Admin ({userEmail})</span>
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-sky-950/90 text-sky-300 border border-sky-500/40 flex items-center gap-1.5 shadow-sm">
                    <Lock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Normal Admin ({userEmail}) • View Only</span>
                  </span>
                )}
              </h1>
              <p className="text-[11px] text-slate-400">
                Centralized Reservation Engine & Brand Identity Manager
              </p>
            </div>
          </div>
        </div>

        {/* Sync status & Actions */}
        <div className="flex items-center gap-2">
          {/* Cloud Sync Button (Super Admin Only) */}
          {isSuperAdmin && (
            <button
              onClick={handleSyncAll}
              disabled={isSyncingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all disabled:opacity-50"
              title="Upload and seed all theme, rooms, bookings, and content directly to Firebase Firestore"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isSyncingAll ? 'Uploading...' : 'Sync All to Firestore'}</span>
            </button>
          )}

          {/* Reset Demo Button (Super Admin Only) */}
          {isSuperAdmin && (
            <button
              onClick={resetDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-stone-300 text-xs font-semibold border border-slate-700 transition-all"
              title="Reset all rooms, bookings and theme to initial demo state"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Reset Demo</span>
            </button>
          )}

          {/* Sign Out Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
              title="Sign out of Admin session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all ml-1"
            aria-label="Exit CMS"
            title="Return to website"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-slate-950/70 border-b border-slate-800 px-4 sm:px-8 flex items-center gap-2 overflow-x-auto shrink-0">
        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'theme'
              ? 'border-amber-400 text-amber-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Branding & Theme Colors</span>
        </button>

        <button
          onClick={() => setActiveTab('slider')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'slider'
              ? 'border-amber-400 text-amber-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Hero Slider & Media</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-stone-300">
            {sliderSlides.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap relative ${
            activeTab === 'bookings'
              ? 'border-amber-400 text-amber-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Bookings Manager</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-stone-300">
            {bookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'rooms'
              ? 'border-amber-400 text-amber-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BedDouble className="w-4 h-4" />
          <span>Suites & Inventory</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-stone-300">
            {rooms.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-amber-400 text-amber-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Revenue & Analytics</span>
        </button>

        {/* TAB 5: ADMINS & ROLES (SUPER ADMIN ONLY) */}
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-amber-400 text-amber-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Admins & Roles</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Super Admin
            </span>
          </button>
        )}
      </div>

      {/* Main CMS Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          
          {/* TAB 1: BRANDING & THEME STUDIO */}
          {activeTab === 'theme' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Introduction Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block mb-1">
                    Live Client Personalization Engine
                  </span>
                  <h3 className="text-xl font-bold text-white font-serif">
                    Dynamic Color & Identity Studio
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
                    Adjusting the Primary and Secondary colors immediately transforms the entire guest website in real-time. Changes are stored in Firebase Firestore and applied automatically across all devices.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 shrink-0"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview On Website</span>
                </button>
              </div>

              {/* Normal Admin Restricted Notice */}
              {!isSuperAdmin && (
                <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 text-sky-200 text-xs flex items-center gap-3">
                  <Lock className="w-5 h-5 text-sky-400 shrink-0" />
                  <div>
                    <span className="font-bold">Normal Administrator Mode (Read-Only): </span>
                    <span>Modifications to global branding, themes, and identity are locked to Super Administrator. Standard administrators cannot add, edit, or delete site styling.</span>
                  </div>
                </div>
              )}

              {/* Firestore Cloud Sync Status Banner */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">Firestore Database Registry</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-stone-300 border border-slate-700">
                          hotel-demo-8b71d
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Central cloud collections: <span className="text-amber-200 font-mono">settings/theme</span>, <span className="text-amber-200 font-mono">rooms</span> (6), <span className="text-amber-200 font-mono">bookings</span> (5), <span className="text-amber-200 font-mono">services</span> (5), <span className="text-amber-200 font-mono">amenities</span>, <span className="text-amber-200 font-mono">reviews</span>.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSyncAll}
                    disabled={isSyncingAll}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shrink-0"
                    style={{ backgroundColor: 'var(--color-secondary)' }}
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{isSyncingAll ? 'Writing to Firestore...' : 'Sync All Content to Cloud'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px] text-stone-400 leading-relaxed flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-300">Firestore Rules Note:</strong> If your Firebase project's Firestore rules are in default locked mode, navigate to <a href="https://console.firebase.google.com/project/hotel-demo-8b71d/firestore/rules" target="_blank" rel="noreferrer" className="text-amber-400 underline font-mono">Firebase Console → Firestore Database → Rules</a> and ensure write/read is enabled (e.g. <code className="text-stone-200 font-mono">allow read, write: if true;</code> or <code className="text-stone-200 font-mono">if request.auth != null;</code>).
                  </div>
                </div>
              </div>

              {/* 1-Click Luxury Theme Presets */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>1-Click Brand Themes (Instant Pitch Demo)</span>
                    </h4>
                    <p className="text-xs text-slate-400">Click any preset to instantly rebrand the website for your client.</p>
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">6 Curated Palettes</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {presets.map((preset) => {
                    const isActive = theme.primaryColor.toLowerCase() === preset.primary.toLowerCase() && 
                                     theme.secondaryColor.toLowerCase() === preset.secondary.toLowerCase();
                    return (
                      <div
                        key={preset.id}
                        onClick={() => {
                          applyPreset(preset.id);
                          setThemeForm(prev => ({
                            ...prev,
                            primaryColor: preset.primary,
                            secondaryColor: preset.secondary
                          }));
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isActive 
                            ? 'border-amber-400 bg-slate-900 shadow-md ring-1 ring-amber-400/50' 
                            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono text-stone-400 uppercase">{preset.category}</span>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] bg-amber-400 text-slate-950 font-bold">
                                Active
                              </span>
                            )}
                          </div>
                          <h5 className="font-bold text-sm text-white">{preset.name}</h5>
                          <p className="text-xs text-slate-400 mt-1 leading-snug">{preset.description}</p>
                        </div>

                        {/* Color Swatch Circles */}
                        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-800/80">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-5 h-5 rounded-full border border-white/20 shadow-inner"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <span className="text-[11px] font-mono text-stone-400">{preset.primary}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-5 h-5 rounded-full border border-white/20 shadow-inner"
                              style={{ backgroundColor: preset.secondary }}
                            />
                            <span className="text-[11px] font-mono text-stone-400">{preset.secondary}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Pickers & Live Values */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Main / Primary Color Picker */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center justify-between">
                      <span>Primary Color (Main Brand Color)</span>
                      <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: themeForm.primaryColor }} />
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Powers navigation bar, hero atmosphere, primary headers, suite badges, and main cards.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <input
                      type="color"
                      value={themeForm.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="w-14 h-14 rounded-xl cursor-pointer bg-slate-900 border border-slate-700 p-1"
                    />
                    <div className="flex-1">
                      <label className="text-[11px] uppercase font-mono text-slate-400 block mb-1">HEX Code</label>
                      <input
                        type="text"
                        value={themeForm.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Quick Color Swatches */}
                  <div className="pt-2">
                    <span className="text-[11px] text-slate-400 block mb-2 font-mono">Popular Main Swatches:</span>
                    <div className="flex gap-2">
                      {['#0f2b48', '#143d2b', '#481123', '#034a74', '#161a1d', '#1e293b', '#2c1810'].map((c) => (
                        <button
                          key={c}
                          onClick={() => handleColorChange('primaryColor', c)}
                          className="w-7 h-7 rounded-lg border border-white/20 transition-transform hover:scale-110"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Secondary Color Picker */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center justify-between">
                      <span>Secondary Color (Accent & Highlights)</span>
                      <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: themeForm.secondaryColor }} />
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Powers 'Book Now' CTAs, reservation buttons, star ratings, price tags, and seasonal highlights.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <input
                      type="color"
                      value={themeForm.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="w-14 h-14 rounded-xl cursor-pointer bg-slate-900 border border-slate-700 p-1"
                    />
                    <div className="flex-1">
                      <label className="text-[11px] uppercase font-mono text-slate-400 block mb-1">HEX Code</label>
                      <input
                        type="text"
                        value={themeForm.secondaryColor}
                        onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Quick Accent Swatches */}
                  <div className="pt-2">
                    <span className="text-[11px] text-slate-400 block mb-2 font-mono">Popular Accent Swatches:</span>
                    <div className="flex gap-2">
                      {['#c5a059', '#d4af37', '#e76f51', '#bf8a48', '#ba9e6e', '#10b981', '#f59e0b'].map((c) => (
                        <button
                          key={c}
                          onClick={() => handleColorChange('secondaryColor', c)}
                          className="w-7 h-7 rounded-lg border border-white/20 transition-transform hover:scale-110"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Hotel Information Form */}
              <form onSubmit={handleSaveTheme} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-white font-serif text-lg">Hotel Identity & Details</h4>
                  <p className="text-xs text-slate-400">Configure client property name, location, contact, and currency.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hotel Name</label>
                    <input
                      type="text"
                      value={themeForm.hotelName}
                      onChange={(e) => setThemeForm({ ...themeForm, hotelName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tagline / Subtitle</label>
                    <input
                      type="text"
                      value={themeForm.hotelSubtitle}
                      onChange={(e) => setThemeForm({ ...themeForm, hotelSubtitle: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Currency Symbol</label>
                    <select
                      value={themeForm.currency}
                      onChange={(e) => setThemeForm({ ...themeForm, currency: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="$">USD ($)</option>
                      <option value="€">EUR (€)</option>
                      <option value="£">GBP (£)</option>
                      <option value="¥">JPY (¥)</option>
                      <option value="CHF">CHF (CHF)</option>
                      <option value="AED">AED (AED)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Physical Location</label>
                    <input
                      type="text"
                      value={themeForm.location}
                      onChange={(e) => setThemeForm({ ...themeForm, location: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Concierge Phone</label>
                    <input
                      type="text"
                      value={themeForm.phone}
                      onChange={(e) => setThemeForm({ ...themeForm, phone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contact Email</label>
                    <input
                      type="email"
                      value={themeForm.email}
                      onChange={(e) => setThemeForm({ ...themeForm, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Seasonal Promotion / Announcement Banner</label>
                  <input
                    type="text"
                    value={themeForm.announcement}
                    placeholder="e.g. Complimentary Sunset Champagne Cruise with stays over 3 nights"
                    onChange={(e) => setThemeForm({ ...themeForm, announcement: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hero Background Photo URL</label>
                  <input
                    type="url"
                    value={themeForm.heroImage}
                    onChange={(e) => setThemeForm({ ...themeForm, heroImage: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono text-xs"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  {isSuperAdmin ? (
                    <button
                      type="button"
                      onClick={resetTheme}
                      className="text-xs text-stone-400 hover:text-white transition-colors"
                    >
                      Reset Colors to Default
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                      <Lock className="w-3.5 h-3.5 text-sky-400" />
                      <span>Read-Only Mode</span>
                    </span>
                  )}

                  {isSuperAdmin ? (
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
                      style={{ backgroundColor: 'var(--color-secondary)' }}
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Syncing...' : 'Save & Publish to Cloud'}</span>
                    </button>
                  ) : (
                    <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-mono flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Saving Disabled for Normal Admin</span>
                    </span>
                  )}
                </div>
              </form>

            </div>
          )}

          {/* TAB: HERO SLIDER & MEDIA (PHOTO & VIDEO UPLOADS) */}
          {activeTab === 'slider' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Header card */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                      Homepage Cinematography & Visual Assets
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-500/30">
                      Firebase Cloud Storage
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-serif">
                    Hero Slider Media & Video Manager
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
                    Upload high-definition photos or 4K video clips for the 5 full-width homepage experience slides. Media uploads directly to Firebase Cloud Storage (<code className="text-amber-300 font-mono">/slider</code>) and automatically syncs to the guest website.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 shrink-0"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview On Homepage</span>
                </button>
              </div>

              {/* Normal Admin Warning */}
              {!isSuperAdmin && (
                <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-200 text-xs flex items-center gap-2">
                  <Lock className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Normal Administrator: Slider media is view-only. Uploading videos/photos or modifying slides requires Super Admin privileges.</span>
                </div>
              )}

              {/* Slider Slides List */}
              <div className="space-y-6">
                {sliderSlides.map((slide) => {
                  const isUploading = uploadingSlideId === slide.id;
                  const isVideo = slide.mediaType === 'video' || (slide.image && (slide.image.endsWith('.mp4') || slide.image.endsWith('.webm') || slide.image.includes('/video/')));

                  return (
                    <div 
                      key={slide.id} 
                      className="bg-slate-950 rounded-2xl border border-slate-800 p-5 lg:p-6 space-y-5 shadow-xl"
                    >
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-mono font-bold text-xs">
                            {slide.number}
                          </span>
                          <div>
                            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 block font-semibold">
                              {slide.badge}
                            </span>
                            <h4 className="font-serif text-base font-bold text-white">
                              {slide.title}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold flex items-center gap-1.5 ${
                            isVideo ? 'bg-purple-950 text-purple-300 border border-purple-500/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {isVideo ? <Film className="w-3 h-3 text-purple-400" /> : <Sparkles className="w-3 h-3 text-emerald-400" />}
                            <span>{isVideo ? '4K Video Slide' : 'High-Res Photo Slide'}</span>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Media Preview Box */}
                        <div className="lg:col-span-5 relative h-56 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-inner group">
                          {isVideo ? (
                            <video
                              src={slide.videoUrl || slide.image}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={slide.image}
                              alt={slide.title}
                              className="w-full h-full object-cover"
                            />
                          )}

                          {/* Hover Overlay with Upload Action */}
                          {isSuperAdmin && !isUploading && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                              <label className="cursor-pointer px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all">
                                <Upload className="w-4 h-4" />
                                <span>Replace Media</span>
                                <input
                                  type="file"
                                  accept="image/*,video/mp4,video/webm"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleSlideUpload(slide.id, file);
                                  }}
                                />
                              </label>
                              <span className="text-[10px] text-stone-300 font-mono">
                                Photos (JPG/PNG) or Videos (MP4/WebM)
                              </span>
                            </div>
                          )}

                          {/* Live Upload Progress Overlay */}
                          {isUploading && (
                            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
                              <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                              <div className="w-full space-y-1">
                                <span className="text-xs font-semibold text-white">
                                  Uploading to Cloud Storage ({uploadProgress}%)
                                </span>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-amber-400 transition-all duration-300 rounded-full"
                                    style={{ width: `${uploadProgress}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Slide Metadata & Direct URL Editor */}
                        <div className="lg:col-span-7 space-y-4 text-xs">
                          <div>
                            <label className="block text-slate-300 mb-1 font-semibold">Slide Headline Title</label>
                            <input
                              type="text"
                              disabled={!isSuperAdmin}
                              value={slide.title}
                              onChange={(e) => handleUpdateSlideField(slide.id, 'title', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white disabled:opacity-60 focus:outline-none focus:border-amber-400 font-serif text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-300 mb-1 font-semibold">Editorial Subtitle</label>
                            <textarea
                              rows={2}
                              disabled={!isSuperAdmin}
                              value={slide.subtitle}
                              onChange={(e) => handleUpdateSlideField(slide.id, 'subtitle', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white disabled:opacity-60 focus:outline-none focus:border-amber-400 text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-slate-300 mb-1 font-semibold">Media Type</label>
                              <select
                                disabled={!isSuperAdmin}
                                value={isVideo ? 'video' : 'image'}
                                onChange={(e) => handleUpdateSlideField(slide.id, 'mediaType', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white disabled:opacity-60 focus:outline-none focus:border-amber-400"
                              >
                                <option value="image">High-Res Photography</option>
                                <option value="video">Cinematic Video (4K / MP4)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-slate-300 mb-1 font-semibold">Direct Media URL (CDN / Storage)</label>
                              <input
                                type="url"
                                disabled={!isSuperAdmin}
                                value={slide.image}
                                onChange={(e) => handleUpdateSlideField(slide.id, 'image', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white disabled:opacity-60 focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                                placeholder="https://..."
                              />
                            </div>
                          </div>

                          {/* Quick File Upload Trigger Button */}
                          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                            {isSuperAdmin ? (
                              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-stone-200 text-xs font-semibold border border-slate-700 transition-all">
                                <Upload className="w-3.5 h-3.5 text-amber-400" />
                                <span>Upload Video or Photo</span>
                                <input
                                  type="file"
                                  accept="image/*,video/mp4,video/webm"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleSlideUpload(slide.id, file);
                                  }}
                                />
                              </label>
                            ) : (
                              <span className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                                <Lock className="w-3.5 h-3.5 text-sky-400" />
                                <span>Upload Locked for Normal Admin</span>
                              </span>
                            )}

                            {isSuperAdmin && (
                              <button
                                type="button"
                                onClick={() => handleSaveSlide(slide)}
                                className="px-4 py-2 rounded-xl text-slate-950 font-bold uppercase tracking-wider text-xs shadow-md transition-all hover:scale-105 active:scale-95"
                                style={{ backgroundColor: 'var(--color-secondary)' }}
                              >
                                Save Slide
                              </button>
                            )}
                          </div>

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 2: BOOKINGS MANAGER */}
          {activeTab === 'bookings' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Header with Search and Filter */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by guest or reference..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {['all', 'confirmed', 'checked in', 'completed', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setBookingFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                        bookingFilter === status
                          ? 'bg-amber-400 text-slate-950 shadow'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bookings Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-4">Guest Information</th>
                        <th className="py-3 px-4">Suite Reserved</th>
                        <th className="py-3 px-4">Stay Dates</th>
                        <th className="py-3 px-4">Total Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-amber-300">
                            {b.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-white block">{b.guestName}</span>
                            <span className="text-[11px] text-slate-400">{b.guestEmail}</span>
                          </td>
                          <td className="py-3.5 px-4 font-medium">
                            {b.roomName}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="block font-medium">{b.checkIn} → {b.checkOut}</span>
                            <span className="text-[10px] text-slate-400">{b.nights} nights • {b.guests} guests</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-white">
                            {theme.currency}{b.totalAmount}
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={b.status}
                              onChange={(e) => changeBookingStatus(b.id, e.target.value)}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                                b.status === 'Confirmed' 
                                  ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40' 
                                  : b.status === 'Checked In'
                                  ? 'bg-blue-950/50 text-blue-300 border-blue-500/40'
                                  : b.status === 'Completed'
                                  ? 'bg-stone-800 text-stone-300 border-stone-600'
                                  : b.status === 'Cancelled'
                                  ? 'bg-rose-950/50 text-rose-300 border-rose-500/40'
                                  : 'bg-amber-950/50 text-amber-300 border-amber-500/40'
                              }`}
                            >
                              <option value="Confirmed" className="bg-slate-900 text-white">Confirmed</option>
                              <option value="Checked In" className="bg-slate-900 text-white">Checked In</option>
                              <option value="Completed" className="bg-slate-900 text-white">Completed</option>
                              <option value="Pending" className="bg-slate-900 text-white">Pending</option>
                              <option value="Cancelled" className="bg-slate-900 text-white">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedBookingDetail(b)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-stone-200 text-[11px] font-semibold transition-all"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredBookings.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No reservations match the selected filter or query.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: SUITES & INVENTORY */}
          {activeTab === 'rooms' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white font-serif">Suite & Residence Portfolio</h3>
                  <p className="text-xs text-slate-400">Manage room prices, photography, guest capacity, and amenities.</p>
                </div>

                {isSuperAdmin && (
                  <button
                    onClick={() => {
                      setEditingRoom(null);
                      setRoomFormData({
                        name: '',
                        category: 'Suite',
                        price: 350,
                        size: '75 m² / 800 sq ft',
                        guests: 2,
                        beds: '1 King Bed',
                        view: 'Ocean View',
                        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
                        description: 'A beautiful luxury suite with bespoke modern amenities and private balcony.',
                        amenities: ['Ocean View Balcony', 'Smart TV', 'Marble Bath', 'Espresso Machine'],
                        featured: false,
                        available: true
                      });
                      setIsAddRoomOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all"
                    style={{ backgroundColor: 'var(--color-secondary)' }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Suite</span>
                  </button>
                )}
              </div>

              {/* Normal Admin Restricted Notice */}
              {!isSuperAdmin && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                  <Lock className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Normal Administrator: Inventory is view-only. Adding, modifying rates, or deleting suites is restricted to Super Administrator.</span>
                </div>
              )}

              {/* Suites Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <div key={room.id} className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="relative h-44">
                        <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span 
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase text-white shadow"
                            style={{ backgroundColor: 'var(--color-primary)' }}
                          >
                            {room.category}
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-white font-mono text-xs font-bold">
                          {theme.currency}{room.price} / night
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <h4 className="font-serif text-base font-bold text-white line-clamp-1">{room.name}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{room.description}</p>
                        
                        <div className="pt-2 flex items-center gap-3 text-[11px] text-slate-400">
                          <span>{room.size}</span>
                          <span>•</span>
                          <span>{room.guests} Guests</span>
                          <span>•</span>
                          <span>{room.beds}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          disabled={!isSuperAdmin}
                          value={room.price}
                          onChange={(e) => isSuperAdmin && updateRoom({ ...room, price: Number(e.target.value) })}
                          className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white disabled:opacity-60"
                          title={isSuperAdmin ? "Instant price editor" : "Price editing locked to Super Admin"}
                        />
                        <span className="text-[10px] text-slate-500">Rate</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingRoom(room);
                            setRoomFormData(room);
                            setIsAddRoomOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-stone-300 transition-all"
                          title={isSuperAdmin ? "Edit Suite" : "View Suite Details"}
                        >
                          {isSuperAdmin ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ${room.name}?`)) {
                                deleteRoom(room.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-400 transition-all"
                            title="Delete Suite"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: REVENUE & ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Top Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs uppercase font-mono text-slate-400 block mb-1">Total Gross Revenue</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-3xl font-bold text-white">
                      {theme.currency}{totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 mt-2 block flex items-center gap-1">
                    <span>↑ +18.4%</span>
                    <span className="text-slate-500">vs previous month</span>
                  </span>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs uppercase font-mono text-slate-400 block mb-1">Active Bookings</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-3xl font-bold text-white">{activeBookingsCount}</span>
                    <span className="text-xs text-slate-400">/ {bookings.length} Total</span>
                  </div>
                  <span className="text-[10px] text-stone-400 mt-2 block">
                    Confirmed & In-house guests
                  </span>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs uppercase font-mono text-slate-400 block mb-1">Resort Occupancy</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-3xl font-bold text-white">{occupancyRate}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${occupancyRate}%`, backgroundColor: 'var(--color-secondary)' }}
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs uppercase font-mono text-slate-400 block mb-1">Average Daily Rate (ADR)</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-3xl font-bold text-white">
                      {theme.currency}{averageDailyRate}
                    </span>
                    <span className="text-xs text-slate-400">/ night</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 mt-2 block">
                    High luxury index performance
                  </span>
                </div>
              </div>

              {/* Status Breakdown & Revenue by Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Category Revenue Breakdown */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="font-serif text-base font-bold text-white">Revenue by Accommodation Tier</h4>
                  <div className="space-y-3">
                    {['Villa', 'Suite', 'Deluxe'].map((cat) => {
                      const catTotal = bookings
                        .filter(b => b.roomName?.toLowerCase().includes(cat.toLowerCase()))
                        .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
                      const percent = totalRevenue > 0 ? Math.round((catTotal / totalRevenue) * 100) : 0;

                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-stone-300 font-medium">{cat} Residences</span>
                            <span className="font-mono text-white">{theme.currency}{catTotal.toLocaleString()} ({percent}%)</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full"
                              style={{ width: `${percent}%`, backgroundColor: 'var(--color-primary-light)' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reservation Status Distribution */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="font-serif text-base font-bold text-white">Reservation Status Distribution</h4>
                  <div className="space-y-3">
                    {[
                      { status: 'Confirmed', color: 'bg-emerald-500' },
                      { status: 'Checked In', color: 'bg-blue-500' },
                      { status: 'Completed', color: 'bg-stone-500' },
                      { status: 'Cancelled', color: 'bg-rose-500' }
                    ].map((item) => {
                      const count = bookings.filter(b => b.status === item.status).length;
                      const percent = bookings.length > 0 ? Math.round((count / bookings.length) * 100) : 0;

                      return (
                        <div key={item.status} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/60">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                            <span className="text-slate-300 font-medium">{item.status}</span>
                          </div>
                          <span className="font-mono text-white font-bold">{count} bookings ({percent}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: ADMINS & ROLES (SUPER ADMIN ONLY) */}
          {activeTab === 'users' && isSuperAdmin && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Header Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                      Privileged Access Control
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Super Admin Authority
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-serif">
                    Administrator Management & Access Roles
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
                    As Super Administrator, you have full authority to create and revoke operational administrative accounts. Standard administrators are strictly restricted from adding, editing, or deleting suites, reservations, or system settings.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setAdminError('');
                    setAdminFormData({ name: '', email: '', password: '' });
                    setIsAddAdminOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Provision Normal Admin</span>
                </button>
              </div>

              {/* RBAC Policy Notice */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3 text-xs">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-slate-400">
                  <span className="text-white font-semibold block">Role Policy Enforcement (RBAC)</span>
                  <p>
                    <strong className="text-amber-300">Super Admin ({userEmail}):</strong> Full administrative ownership. Can configure branding, modify suites, sync to Firestore, and manage accounts.
                  </p>
                  <p>
                    <strong className="text-sky-300">Normal Admin:</strong> View-only operator. Barred from adding suites, deleting suites, editing nightly rates, or altering hotel branding.
                  </p>
                </div>
              </div>

              {/* Admins Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Active Administrators ({adminUsers.length})</span>
                  </h4>
                  <span className="text-xs text-slate-500 font-mono">
                    Secured by Firebase Auth & Dual Storage
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Administrator</th>
                        <th className="py-3 px-4">Assigned Role</th>
                        <th className="py-3 px-4">Privileges & Restrictions</th>
                        <th className="py-3 px-4">Created Date</th>
                        <th className="py-3 px-4 text-right">Access Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {adminUsers.map((admin) => {
                        const isSuper = admin.role === 'SUPER_ADMIN' || admin.email.toLowerCase() === 'tharushyamagara@gmail.com';
                        return (
                          <tr key={admin.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div 
                                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                                    isSuper ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'bg-sky-950 text-sky-300 border border-sky-500/30'
                                  }`}
                                >
                                  {admin.name?.charAt(0) || 'A'}
                                </div>
                                <div>
                                  <span className="font-semibold text-white block">{admin.name}</span>
                                  <span className="text-[11px] text-slate-400 font-mono">{admin.email}</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              {isSuper ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                                  SUPER_ADMIN
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-500/40">
                                  <Lock className="w-3 h-3 text-sky-400" />
                                  NORMAL_ADMIN
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              {isSuper ? (
                                <span className="text-emerald-300 text-[11px] flex items-center gap-1">
                                  <span>✓</span>
                                  <span>Full Control: Add/Delete Suites, Reset Data, Manage Users</span>
                                </span>
                              ) : (
                                <span className="text-stone-400 text-[11px] flex items-center gap-1">
                                  <span className="text-amber-400 font-bold">⛔</span>
                                  <span>Restricted: Cannot add, delete, or remove any assets</span>
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                              {admin.createdAt || 'Initial'}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              {isSuper ? (
                                <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-400/80">
                                  Protected Owner
                                </span>
                              ) : (
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    onClick={() => handleResetAdminPassword(admin.id, admin.name)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-stone-200 text-[11px] font-semibold border border-slate-700 transition-all"
                                    title={`Reset password for ${admin.name}`}
                                  >
                                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Reset Password</span>
                                  </button>
                                  <button
                                    onClick={() => handleRemoveAdmin(admin.id, admin.name)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-[11px] font-semibold transition-all"
                                    title={`Revoke access for ${admin.name}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Remove</span>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBookingDetail && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 my-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs text-slate-950"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  AUR
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-amber-400">Reservation Folio & Audit</span>
                  <h4 className="font-mono text-xl font-bold text-white">{selectedBookingDetail.id}</h4>
                </div>
              </div>
              <button 
                onClick={() => setSelectedBookingDetail(null)}
                className="p-1 rounded-lg bg-slate-800 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Guest Profile</span>
                  <strong className="text-white text-sm block mt-0.5">{selectedBookingDetail.guestName}</strong>
                  <span className="text-stone-300 font-mono text-[11px] block">{selectedBookingDetail.guestEmail}</span>
                  <span className="text-stone-400 text-[11px] block">{selectedBookingDetail.guestPhone}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Suite & Investment</span>
                  <strong className="text-white text-sm block mt-0.5">{selectedBookingDetail.roomName}</strong>
                  <span className="font-mono text-sm text-amber-400 font-bold block mt-0.5">
                    {theme.currency}{selectedBookingDetail.totalAmount}
                  </span>
                  <span className="text-stone-400 text-[11px] block">Status: <strong className="text-white">{selectedBookingDetail.status}</strong></span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">Stay Duration</span>
                <span className="text-stone-200 font-medium">
                  {selectedBookingDetail.checkIn} to {selectedBookingDetail.checkOut} ({selectedBookingDetail.nights} nights • {selectedBookingDetail.guests} guests)
                </span>
              </div>

              {selectedBookingDetail.addons && selectedBookingDetail.addons.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">Add-ons & Privileges:</span>
                  <p className="text-amber-200">{selectedBookingDetail.addons.join(', ')}</p>
                </div>
              )}

              {selectedBookingDetail.specialRequests && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">Guest Special Requests:</span>
                  <p className="text-stone-300 italic">
                    "{selectedBookingDetail.specialRequests}"
                  </p>
                </div>
              )}
            </div>

            {/* AUTOMATED STATUS EMAIL AUDIT TRAIL */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-xs text-white">Dispatched Status Email Audit Trail</span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-slate-900 text-stone-300 border border-slate-800">
                    {folioEmailLogs.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleResendFolioEmail()}
                  disabled={isResendingFolioEmail}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-stone-200 text-[11px] font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                  title="Resend current status email to guest"
                >
                  <RotateCw className={`w-3 h-3 ${isResendingFolioEmail ? 'animate-spin' : ''}`} />
                  <span>{isResendingFolioEmail ? 'Resending...' : 'Resend Email'}</span>
                </button>
              </div>

              {folioEmailLogs.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {folioEmailLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs gap-3"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                            log.type === 'BOOKING_CONFIRMED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : log.type === 'BOOKING_CANCELLED'
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          }`}>
                            {log.type}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono">
                            {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-white font-medium truncate text-[11px]">{log.subject}</p>
                        <p className="text-[10px] text-slate-400 truncate">To: {log.recipientEmail}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPreviewingEmail(log)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-stone-200 text-[10px] font-semibold shrink-0 flex items-center gap-1 border border-slate-700"
                      >
                        <Eye className="w-3 h-3 text-amber-400" />
                        <span>Preview HTML</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900 text-slate-400 text-[11px] text-center">
                  No previous email logs cached. Click "Resend Email" to dispatch one now.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedBookingDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Close Folio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN HTML EMAIL PREVIEW MODAL */}
      {previewingEmail && (
        <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-300 my-auto flex flex-col max-h-[92vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Guest Email Template Preview</h4>
                  <p className="text-[10px] text-stone-400 font-mono truncate max-w-md">
                    {previewingEmail.subject}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewingEmail(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-stone-100 border-b border-stone-200 px-6 py-2 text-[11px] text-stone-600 flex justify-between shrink-0">
              <span><strong>Recipient:</strong> {previewingEmail.recipientEmail}</span>
              <span className="font-mono text-stone-400">{new Date(previewingEmail.sentAt).toLocaleString()}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 flex justify-center">
              <iframe
                title="Admin Email Preview"
                srcDoc={previewingEmail.html}
                className="w-full max-w-[620px] h-[550px] bg-white rounded-2xl shadow-xl border-0"
              />
            </div>

            <div className="p-3 bg-stone-50 border-t border-stone-200 flex justify-end shrink-0">
              <button
                onClick={() => setPreviewingEmail(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Room Modal */}
      {isAddRoomOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 my-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <span>{editingRoom ? (isSuperAdmin ? 'Edit Suite Specifications' : 'Suite Specifications') : 'Add New Suite to Portfolio'}</span>
                {!isSuperAdmin && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/40">
                    Read-Only
                  </span>
                )}
              </h4>
              <button 
                onClick={() => setIsAddRoomOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-stone-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isSuperAdmin && (
              <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-200 text-xs flex items-center gap-2">
                <Lock className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Normal Admin: You can view suite details, but modifying specifications is restricted to Super Admin.</span>
              </div>
            )}

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!isSuperAdmin) {
                  setIsAddRoomOpen(false);
                  return;
                }
                if (editingRoom) {
                  updateRoom(roomFormData);
                } else {
                  addRoom(roomFormData);
                }
                setIsAddRoomOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Suite Name</label>
                  <input
                    type="text"
                    required
                    disabled={!isSuperAdmin}
                    value={roomFormData.name}
                    onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white disabled:opacity-60"
                    placeholder="e.g. Coral Horizon Villa"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Category</label>
                  <select
                    disabled={!isSuperAdmin}
                    value={roomFormData.category}
                    onChange={(e) => setRoomFormData({ ...roomFormData, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white disabled:opacity-60"
                  >
                    <option value="Villa">Villa</option>
                    <option value="Suite">Suite</option>
                    <option value="Deluxe">Deluxe</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Nightly Rate ({theme.currency})</label>
                  <input
                    type="number"
                    required
                    disabled={!isSuperAdmin}
                    value={roomFormData.price}
                    onChange={(e) => setRoomFormData({ ...roomFormData, price: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Max Guests</label>
                  <input
                    type="number"
                    required
                    disabled={!isSuperAdmin}
                    min={1}
                    value={roomFormData.guests}
                    onChange={(e) => setRoomFormData({ ...roomFormData, guests: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Size</label>
                  <input
                    type="text"
                    disabled={!isSuperAdmin}
                    value={roomFormData.size}
                    onChange={(e) => setRoomFormData({ ...roomFormData, size: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white disabled:opacity-60"
                    placeholder="90 m² / 970 sq ft"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Image URL</label>
                <input
                  type="url"
                  required
                  disabled={!isSuperAdmin}
                  value={roomFormData.image}
                  onChange={(e) => setRoomFormData({ ...roomFormData, image: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-[11px] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Description</label>
                <textarea
                  rows={3}
                  disabled={!isSuperAdmin}
                  value={roomFormData.description}
                  onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white disabled:opacity-60"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRoomOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-stone-400 hover:text-white transition-all"
                >
                  {isSuperAdmin ? 'Cancel' : 'Close'}
                </button>
                {isSuperAdmin && (
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-slate-950 font-bold uppercase tracking-wider text-xs shadow-md transition-all hover:scale-[1.02] active:scale-95"
                    style={{ backgroundColor: 'var(--color-secondary)' }}
                  >
                    {editingRoom ? 'Update Suite' : 'Create Suite'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Super Admin: Provision Normal Admin Modal */}
      {isAddAdminOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 my-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-950 text-sky-300 border border-sky-500/30 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-white">
                    Provision Normal Administrator
                  </h4>
                  <p className="text-[11px] text-slate-400">Restricted operator / staff credentials</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddAdminOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-stone-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {adminError && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{adminError}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-200 text-xs flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong className="text-white block font-semibold">Strict RBAC Constraint:</strong>
                Normal administrators can monitor bookings and review inventory, but <strong>CANNOT add, delete, or remove anything</strong>.
              </div>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Administrator Name</label>
                <input
                  type="text"
                  required
                  value={adminFormData.name}
                  onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
                  placeholder="e.g. Front Desk Operator"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Login Email</label>
                <input
                  type="email"
                  required
                  value={adminFormData.email}
                  onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                  placeholder="e.g. staff@hotel.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={adminFormData.password}
                  onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                  placeholder="•••••••••••• (min 6 characters)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAdminOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-stone-300 hover:text-white transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-slate-950 font-bold uppercase tracking-wider text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

