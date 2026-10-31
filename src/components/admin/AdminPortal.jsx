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
  RotateCw,
  Compass,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  EyeOff,
  UtensilsCrossed,
  Link2,
  BookOpen,
  Images,
  FileText
} from 'lucide-react';
import { 
  syncAllContentToFirestore, 
  loadAdminUsers, 
  saveAdminUsers, 
  initialAdminUsers,
  loadSliderSlides,
  saveSliderSlide,
  saveSliderSlides,
  deleteSliderSlide,
  resetSliderSlides,
  initialSliderSlides,
  uploadMediaFile,
  loadNavMenus,
  saveNavMenus,
  resetNavMenus,
  initialNavMenus,
  loadDiningVenues,
  saveDiningVenues,
  initialDiningVenues,
  loadArticles,
  saveArticles,
  saveArticle,
  deleteArticle,
  resetArticles,
  initialArticles,
  subscribeArticles
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

  const handleAddSlideHighlight = (slideId) => {
    if (!isSuperAdmin) return;
    const slide = sliderSlides.find(s => s.id === slideId);
    if (!slide) return;
    const currentHighlights = Array.isArray(slide.highlights) ? [...slide.highlights] : [];
    currentHighlights.push('New Experience Highlight');
    handleUpdateSlideField(slideId, 'highlights', currentHighlights);
  };

  const handleUpdateSlideHighlight = (slideId, index, text) => {
    if (!isSuperAdmin) return;
    const slide = sliderSlides.find(s => s.id === slideId);
    if (!slide) return;
    const currentHighlights = Array.isArray(slide.highlights) ? [...slide.highlights] : [];
    currentHighlights[index] = text;
    handleUpdateSlideField(slideId, 'highlights', currentHighlights);
  };

  const handleRemoveSlideHighlight = (slideId, index) => {
    if (!isSuperAdmin) return;
    const slide = sliderSlides.find(s => s.id === slideId);
    if (!slide) return;
    const currentHighlights = Array.isArray(slide.highlights) ? [...slide.highlights] : [];
    currentHighlights.splice(index, 1);
    handleUpdateSlideField(slideId, 'highlights', currentHighlights);
  };

  const handleResetSlider = async () => {
    if (!isSuperAdmin) return;
    if (window.confirm("Reset all 5 hero slider slides to factory defaults?")) {
      setSliderSlides(initialSliderSlides);
      await resetSliderSlides();
      showNotification("Slider reset to default luxury showcases.");
    }
  };

  // Discover Articles & Editorial Stories State
  const [articles, setArticles] = useState(initialArticles);
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articleFormData, setArticleFormData] = useState({
    title: '',
    subtitle: '',
    category: 'Haute Gastronomy',
    readTime: '4 min read',
    date: 'October 2026',
    author: '',
    coverImage: '',
    photos: [],
    content: '',
    highlights: [],
    visible: true
  });
  const [uploadingArticlePhoto, setUploadingArticlePhoto] = useState(false);
  const [newPhotoUrlInput, setNewPhotoUrlInput] = useState('');
  const [newArticleHighlightInput, setNewArticleHighlightInput] = useState('');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await loadArticles();
        if (data && data.length > 0) setArticles(data);
      } catch (err) {
        console.warn("Articles load note:", err?.message);
      }
    };
    fetchArticles();

    const unsubscribe = subscribeArticles((updated) => {
      if (updated && Array.isArray(updated) && updated.length > 0) {
        setArticles(updated);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleOpenAddArticle = () => {
    setEditingArticle(null);
    setArticleFormData({
      title: '',
      subtitle: '',
      category: 'Haute Gastronomy',
      readTime: '4 min read',
      date: 'October 2026',
      author: 'Estate Concierge & Sommelier',
      coverImage: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1600&q=80',
      photos: [
        'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80'
      ],
      content: '',
      highlights: [],
      visible: true
    });
    setNewPhotoUrlInput('');
    setNewArticleHighlightInput('');
    setIsAddingArticle(true);
  };

  const handleOpenEditArticle = (art) => {
    setEditingArticle(art);
    setArticleFormData({
      ...art,
      photos: Array.isArray(art.photos) ? [...art.photos] : (art.coverImage ? [art.coverImage] : []),
      highlights: Array.isArray(art.highlights) ? [...art.highlights] : []
    });
    setNewPhotoUrlInput('');
    setNewArticleHighlightInput('');
    setIsAddingArticle(true);
  };

  const handleSaveArticleForm = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    if (!articleFormData.title.trim()) {
      showNotification("Please provide an Article Title.");
      return;
    }

    const photosClean = (articleFormData.photos || []).filter(p => typeof p === 'string' && p.trim().length > 0);
    const cover = articleFormData.coverImage.trim() || (photosClean.length > 0 ? photosClean[0] : '');

    const articleToSave = {
      ...articleFormData,
      id: editingArticle ? editingArticle.id : `article-${Date.now()}-${articleFormData.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      title: articleFormData.title.trim(),
      subtitle: articleFormData.subtitle?.trim() || '',
      coverImage: cover,
      photos: photosClean.length > 0 ? photosClean : [cover],
      order: editingArticle ? editingArticle.order : (articles.length + 1),
      updatedAt: new Date().toISOString()
    };

    let updatedList;
    if (editingArticle) {
      updatedList = articles.map(a => a.id === editingArticle.id ? articleToSave : a);
    } else {
      updatedList = [...articles, articleToSave];
    }

    setArticles(updatedList);
    setIsAddingArticle(false);
    setEditingArticle(null);
    await saveArticles(updatedList);
    showNotification(`Article "${articleToSave.title}" saved successfully with ${articleToSave.photos.length} photos!`);
  };

  const handleDeleteArticle = async (articleId, articleTitle) => {
    if (!isSuperAdmin) return;
    if (window.confirm(`Delete article "${articleTitle}"? This cannot be undone.`)) {
      const updated = articles.filter(a => a.id !== articleId);
      setArticles(updated);
      await deleteArticle(articleId);
      showNotification(`Article "${articleTitle}" deleted.`);
    }
  };

  const handleToggleArticleVisibility = async (articleId) => {
    if (!isSuperAdmin) return;
    const target = articles.find(a => a.id === articleId);
    if (!target) return;
    const updated = articles.map(a => a.id === articleId ? { ...a, visible: a.visible === false ? true : false } : a);
    setArticles(updated);
    await saveArticles(updated);
  };

  const handleUploadArticlePhoto = async (file) => {
    if (!isSuperAdmin) return;
    if (!file) return;
    try {
      setUploadingArticlePhoto(true);
      const res = await uploadMediaFile(file, 'articles');
      if (res && res.url) {
        setArticleFormData(prev => ({
          ...prev,
          photos: [...(prev.photos || []), res.url],
          coverImage: prev.coverImage || res.url
        }));
        showNotification("Photo uploaded and added to article gallery!");
      }
    } catch (err) {
      showNotification(`Photo upload failed: ${err.message}`);
    } finally {
      setUploadingArticlePhoto(false);
    }
  };

  const handleAddPhotoUrl = () => {
    const url = newPhotoUrlInput.trim();
    if (!url) return;
    setArticleFormData(prev => ({
      ...prev,
      photos: [...(prev.photos || []), url],
      coverImage: prev.coverImage || url
    }));
    setNewPhotoUrlInput('');
  };

  const handleRemoveArticlePhoto = (index) => {
    setArticleFormData(prev => {
      const nextPhotos = [...(prev.photos || [])];
      nextPhotos.splice(index, 1);
      return {
        ...prev,
        photos: nextPhotos,
        coverImage: nextPhotos.length > 0 ? (prev.coverImage === prev.photos[index] ? nextPhotos[0] : prev.coverImage) : ''
      };
    });
  };

  const handleAddArticleHighlight = () => {
    const text = newArticleHighlightInput.trim();
    if (!text) return;
    setArticleFormData(prev => ({
      ...prev,
      highlights: [...(prev.highlights || []), text]
    }));
    setNewArticleHighlightInput('');
  };

  const handleRemoveArticleHighlight = (index) => {
    setArticleFormData(prev => {
      const nextH = [...(prev.highlights || [])];
      nextH.splice(index, 1);
      return { ...prev, highlights: nextH };
    });
  };

  const handleResetArticles = async () => {
    if (!isSuperAdmin) return;
    if (window.confirm("Reset all Discover articles to factory default editorial stories?")) {
      setArticles(initialArticles);
      await resetArticles();
      showNotification("Articles reset to default luxury showcases.");
    }
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

  const [activeTab, setActiveTab] = useState('theme'); // 'theme', 'slider', 'menus', 'bookings', 'rooms', 'analytics', 'users'

  // Navigation & Dining Menus State
  const [navMenus, setNavMenus] = useState(initialNavMenus);
  const [diningVenues, setDiningVenues] = useState(initialDiningVenues);
  const [menuSubTab, setMenuSubTab] = useState('navigation'); // 'navigation' or 'dining'
  const [isAddingNavMenu, setIsAddingNavMenu] = useState(false);
  const [newNavForm, setNewNavForm] = useState({
    label: '',
    href: '',
    targetId: '',
    isExternal: false,
    visible: true
  });
  const [isAddingDining, setIsAddingDining] = useState(false);
  const [newDiningForm, setNewDiningForm] = useState({
    name: '',
    accolade: '',
    type: '',
    hours: '',
    image: '',
    description: '',
    visible: true
  });

  useEffect(() => {
    const fetchAllMenus = async () => {
      try {
        const [m, d] = await Promise.all([
          loadNavMenus(),
          loadDiningVenues()
        ]);
        if (m && m.length > 0) setNavMenus(m);
        if (d && d.length > 0) setDiningVenues(d);
      } catch (err) {
        console.warn("Menus fetch note:", err?.message);
      }
    };
    fetchAllMenus();
  }, []);

  // Handlers for Navigation Menus
  const handleAddNavMenu = async (e) => {
    e.preventDefault();
    if (!newNavForm.label.trim() || !newNavForm.href.trim()) {
      showNotification("Please provide both a Menu Label and Destination Link.");
      return;
    }
    const cleanLabel = newNavForm.label.trim();
    const cleanHref = newNavForm.href.trim();
    const anchor = newNavForm.targetId.trim() || (cleanHref.startsWith('/#') ? cleanHref.replace('/#', '') : '');
    const newId = `nav-${Date.now()}-${cleanLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    
    const newItem = {
      id: newId,
      label: cleanLabel,
      href: cleanHref,
      targetId: anchor,
      isExternal: Boolean(newNavForm.isExternal),
      visible: true,
      order: navMenus.length + 1
    };

    const updated = [...navMenus, newItem];
    setNavMenus(updated);
    setIsAddingNavMenu(false);
    setNewNavForm({ label: '', href: '', targetId: '', isExternal: false, visible: true });
    await saveNavMenus(updated);
    showNotification(`Navigation menu "${cleanLabel}" added successfully!`);
  };

  const handleRemoveNavMenu = async (menuId) => {
    const target = navMenus.find(m => m.id === menuId);
    if (!target) return;
    if (navMenus.length <= 1) {
      showNotification("At least one navigation menu item must remain active.");
      return;
    }
    const updated = navMenus.filter(m => m.id !== menuId).map((item, idx) => ({ ...item, order: idx + 1 }));
    setNavMenus(updated);
    await saveNavMenus(updated);
    showNotification(`Menu item "${target.label}" removed from navbar.`);
  };

  const handleToggleNavVisibility = async (menuId) => {
    const updated = navMenus.map(m => m.id === menuId ? { ...m, visible: !m.visible } : m);
    setNavMenus(updated);
    await saveNavMenus(updated);
    const target = updated.find(m => m.id === menuId);
    showNotification(`Menu "${target.label}" is now ${target.visible ? 'visible' : 'hidden'}.`);
  };

  const handleMoveNavMenu = async (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= navMenus.length) return;
    const reordered = [...navMenus];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    const updated = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
    setNavMenus(updated);
    await saveNavMenus(updated);
    showNotification("Navigation menu order updated & synced!");
  };

  const handleUpdateNavField = (menuId, field, value) => {
    const updated = navMenus.map(m => m.id === menuId ? { ...m, [field]: value } : m);
    setNavMenus(updated);
  };

  const handleSaveAllNavMenus = async () => {
    await saveNavMenus(navMenus);
    showNotification("All navigation menus saved and synced live!");
  };

  const handleResetNavMenus = async () => {
    if (!window.confirm("Reset all navigation menus back to hotel luxury defaults?")) return;
    setNavMenus(initialNavMenus);
    await resetNavMenus();
    showNotification("Navigation menus reset to defaults.");
  };

  // Dining handlers
  const handleAddDiningVenue = async (e) => {
    e.preventDefault();
    if (!newDiningForm.name.trim()) {
      showNotification("Please provide a Venue / Menu name.");
      return;
    }
    const newId = `dining-${Date.now()}`;
    const newVenue = {
      id: newId,
      name: newDiningForm.name.trim(),
      accolade: newDiningForm.accolade.trim() || 'Signature Experience',
      type: newDiningForm.type.trim() || 'Tasting Menu & Gastronomy',
      hours: newDiningForm.hours.trim() || '18:00 - 23:00',
      image: newDiningForm.image.trim() || 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80',
      description: newDiningForm.description.trim() || 'Sensory culinary journey prepared with estate ingredients.',
      order: diningVenues.length + 1,
      visible: true
    };
    const updated = [...diningVenues, newVenue];
    setDiningVenues(updated);
    setIsAddingDining(false);
    setNewDiningForm({ name: '', accolade: '', type: '', hours: '', image: '', description: '', visible: true });
    await saveDiningVenues(updated);
    showNotification(`Dining menu "${newVenue.name}" added successfully!`);
  };

  const handleRemoveDiningVenue = async (venueId) => {
    const target = diningVenues.find(v => v.id === venueId);
    if (!target) return;
    const updated = diningVenues.filter(v => v.id !== venueId);
    setDiningVenues(updated);
    await saveDiningVenues(updated);
    showNotification(`Dining venue "${target.name}" removed.`);
  };

  const handleToggleDiningVisibility = async (venueId) => {
    const updated = diningVenues.map(v => v.id === venueId ? { ...v, visible: !v.visible } : v);
    setDiningVenues(updated);
    await saveDiningVenues(updated);
  };
  
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
          onClick={() => setActiveTab('menus')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'menus'
              ? 'border-amber-400 text-amber-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Navigation & Menus</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-stone-300">
            {navMenus.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('articles')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'articles'
              ? 'border-amber-400 text-amber-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Discover Articles</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-stone-300">
            {articles.length}
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

                <div className="flex items-center gap-2">
                  {isSuperAdmin && (
                    <button
                      onClick={handleResetSlider}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-stone-300 border border-slate-700 flex items-center gap-1.5 transition-all"
                      title="Reset slides to factory defaults"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Reset Defaults</span>
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 shrink-0"
                    style={{ backgroundColor: 'var(--color-secondary)' }}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview On Homepage</span>
                  </button>
                </div>
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

                        {/* Slide Metadata, Inclusions & Destination Links Editor */}
                        <div className="lg:col-span-7 space-y-4 text-xs">
                          
                          {/* Row 1: Badge / Category & Slide Number */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div className="sm:col-span-3">
                              <label className="block text-slate-300 mb-1 font-semibold">
                                Category Badge / Kicker (Top Tag)
                              </label>
                              <input
                                type="text"
                                disabled={!isSuperAdmin}
                                value={slide.badge || ''}
                                placeholder="e.g. MICHELIN GASTRONOMY & EATERY"
                                onChange={(e) => handleUpdateSlideField(slide.id, 'badge', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-amber-300 font-mono text-xs uppercase disabled:opacity-60 focus:outline-none focus:border-amber-400 font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-300 mb-1 font-semibold">
                                Slide Number
                              </label>
                              <input
                                type="text"
                                disabled={!isSuperAdmin}
                                value={slide.number || ''}
                                placeholder="02"
                                onChange={(e) => handleUpdateSlideField(slide.id, 'number', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-center disabled:opacity-60 focus:outline-none focus:border-amber-400 font-bold"
                              />
                            </div>
                          </div>

                          {/* Row 2: Headline Title */}
                          <div>
                            <label className="block text-slate-300 mb-1 font-semibold">Slide Headline Title</label>
                            <input
                              type="text"
                              disabled={!isSuperAdmin}
                              value={slide.title || ''}
                              onChange={(e) => handleUpdateSlideField(slide.id, 'title', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white disabled:opacity-60 focus:outline-none focus:border-amber-400 font-serif text-sm font-bold"
                            />
                          </div>

                          {/* Row 3: Editorial Subtitle */}
                          <div>
                            <label className="block text-slate-300 mb-1 font-semibold">Editorial Subtitle / Description</label>
                            <textarea
                              rows={2}
                              disabled={!isSuperAdmin}
                              value={slide.subtitle || ''}
                              onChange={(e) => handleUpdateSlideField(slide.id, 'subtitle', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white disabled:opacity-60 focus:outline-none focus:border-amber-400 text-xs"
                            />
                          </div>

                          {/* Row 4: Bespoke Inclusions / Bullet Highlights Editor */}
                          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-mono uppercase text-amber-300 font-semibold tracking-wider">
                                Bespoke Inclusions (Bullet Points)
                              </span>
                              {isSuperAdmin && (
                                <button
                                  type="button"
                                  onClick={() => handleAddSlideHighlight(slide.id)}
                                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add Inclusion</span>
                                </button>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              {(slide.highlights || []).map((highlight, hIdx) => (
                                <div key={hIdx} className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                  <input
                                    type="text"
                                    disabled={!isSuperAdmin}
                                    value={highlight}
                                    onChange={(e) => handleUpdateSlideHighlight(slide.id, hIdx, e.target.value)}
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white disabled:opacity-60 focus:outline-none focus:border-amber-400"
                                  />
                                  {isSuperAdmin && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSlideHighlight(slide.id, hIdx)}
                                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                                      title="Remove highlight"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              {(!slide.highlights || slide.highlights.length === 0) && (
                                <span className="text-[11px] text-slate-500 italic block">
                                  No bespoke inclusions added yet.
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Row 5: Action Destination Buttons (Primary & Secondary) */}
                          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                            <span className="text-[11px] font-mono uppercase text-amber-300 font-semibold tracking-wider block">
                              Slide Buttons & Destination Actions
                            </span>

                            {/* Primary Button */}
                            <div className="space-y-1.5 pt-1 border-t border-slate-800">
                              <span className="text-[11px] text-slate-300 font-semibold flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                <span>Primary Action Button (Gold Button)</span>
                              </span>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                <div className="sm:col-span-4">
                                  <input
                                    type="text"
                                    disabled={!isSuperAdmin}
                                    value={slide.ctaLabel || ''}
                                    placeholder="e.g. Book Tasting Table"
                                    onChange={(e) => handleUpdateSlideField(slide.id, 'ctaLabel', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white disabled:opacity-60 focus:outline-none focus:border-amber-400"
                                  />
                                </div>

                                <div className="sm:col-span-4">
                                  <select
                                    disabled={!isSuperAdmin}
                                    value={slide.ctaAction || 'booking'}
                                    onChange={(e) => handleUpdateSlideField(slide.id, 'ctaAction', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white disabled:opacity-60 focus:outline-none focus:border-amber-400"
                                  >
                                    <option value="booking">Open Booking Modal</option>
                                    <option value="article">Open Discover Article</option>
                                    <option value="url">Custom Website Link</option>
                                  </select>
                                </div>

                                <div className="sm:col-span-4">
                                  {slide.ctaAction === 'article' ? (
                                    <select
                                      disabled={!isSuperAdmin}
                                      value={slide.ctaArticleId || ''}
                                      onChange={(e) => handleUpdateSlideField(slide.id, 'ctaArticleId', e.target.value)}
                                      className="w-full bg-slate-950 border border-amber-400/40 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 disabled:opacity-60 focus:outline-none focus:border-amber-400"
                                    >
                                      <option value="">Select Discover Article...</option>
                                      {articles.map((art) => (
                                        <option key={art.id} value={art.id}>
                                          {art.title.slice(0, 32)}...
                                        </option>
                                      ))}
                                    </select>
                                  ) : slide.ctaAction === 'url' ? (
                                    <input
                                      type="text"
                                      disabled={!isSuperAdmin}
                                      value={slide.ctaUrl || ''}
                                      placeholder="https://... or /page"
                                      onChange={(e) => handleUpdateSlideField(slide.id, 'ctaUrl', e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white disabled:opacity-60 focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                                    />
                                  ) : (
                                    <span className="text-[11px] text-stone-400 italic flex items-center h-full px-1">
                                      Triggers reservation modal
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Secondary Button */}
                            <div className="space-y-1.5 pt-2 border-t border-slate-800">
                              <span className="text-[11px] text-slate-300 font-semibold flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-slate-500" />
                                <span>Secondary Action Button (Outlined Button)</span>
                              </span>

                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                <div className="sm:col-span-4">
                                  <input
                                    type="text"
                                    disabled={!isSuperAdmin}
                                    value={slide.actionLabel || ''}
                                    placeholder="e.g. Explore Dining Venues"
                                    onChange={(e) => handleUpdateSlideField(slide.id, 'actionLabel', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white disabled:opacity-60 focus:outline-none focus:border-amber-400"
                                  />
                                </div>

                                <div className="sm:col-span-4">
                                  <select
                                    disabled={!isSuperAdmin}
                                    value={slide.actionType || 'anchor'}
                                    onChange={(e) => handleUpdateSlideField(slide.id, 'actionType', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white disabled:opacity-60 focus:outline-none focus:border-amber-400"
                                  >
                                    <option value="anchor">Scroll to Page Section</option>
                                    <option value="article">Open Discover Article</option>
                                    <option value="url">Custom Website Link</option>
                                  </select>
                                </div>

                                <div className="sm:col-span-4">
                                  {slide.actionType === 'article' ? (
                                    <select
                                      disabled={!isSuperAdmin}
                                      value={slide.actionArticleId || (slide.actionTarget?.startsWith('article:') ? slide.actionTarget.replace('article:', '') : '')}
                                      onChange={(e) => {
                                        handleUpdateSlideField(slide.id, 'actionArticleId', e.target.value);
                                        handleUpdateSlideField(slide.id, 'actionTarget', `article:${e.target.value}`);
                                      }}
                                      className="w-full bg-slate-950 border border-amber-400/40 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 disabled:opacity-60 focus:outline-none focus:border-amber-400"
                                    >
                                      <option value="">Select Discover Article...</option>
                                      {articles.map((art) => (
                                        <option key={art.id} value={art.id}>
                                          {art.title.slice(0, 32)}...
                                        </option>
                                      ))}
                                    </select>
                                  ) : slide.actionType === 'url' ? (
                                    <input
                                      type="text"
                                      disabled={!isSuperAdmin}
                                      value={slide.actionTarget || ''}
                                      placeholder="https://..."
                                      onChange={(e) => handleUpdateSlideField(slide.id, 'actionTarget', e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white disabled:opacity-60 focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                                    />
                                  ) : (
                                    <select
                                      disabled={!isSuperAdmin}
                                      value={slide.actionTarget || '#rooms'}
                                      onChange={(e) => handleUpdateSlideField(slide.id, 'actionTarget', e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white disabled:opacity-60 focus:outline-none focus:border-amber-400"
                                    >
                                      <option value="#rooms">Rooms & Suites (#rooms)</option>
                                      <option value="#dining">Gastronomy & Dining (#dining)</option>
                                      <option value="#amenities">Experiences & Spa (#amenities)</option>
                                      <option value="#discover">Discover Articles (#discover)</option>
                                      <option value="#gallery">Gallery (#gallery)</option>
                                      <option value="#reviews">Testimonials (#reviews)</option>
                                      <option value="#contact">Location & Contact (#contact)</option>
                                    </select>
                                  )}
                                </div>
                              </div>
                            </div>

                          </div>

                          {/* Row 6: Media Type & Direct Media URL */}
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
                                className="px-5 py-2 rounded-xl text-slate-950 font-bold uppercase tracking-wider text-xs shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                                style={{ backgroundColor: 'var(--color-secondary)' }}
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Save Slide</span>
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

          {/* TAB: NAVIGATION & MENUS MANAGER */}
          {activeTab === 'menus' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Header card */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                      Website Navigation & Guest Architecture
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Live Dynamic Menus
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-serif">
                    Website Menus & Navigation Manager
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
                    Add, remove, reorder, and customize the main header and mobile drawer navigation menus. You can also configure Gastronomy dining venues and culinary tasting menus. Changes reflect on the guest website immediately in real-time.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleResetNavMenus}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-stone-300 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
                    title="Reset to hotel default luxury menus"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNavMenu(!isAddingNavMenu)}
                    className="px-4 py-2 rounded-xl text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: 'var(--color-secondary)' }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAddingNavMenu ? 'Close Creator' : 'Add Menu Item'}</span>
                  </button>
                </div>
              </div>

              {/* Sub-Tabs: Header Navigation vs Dining Menus */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setMenuSubTab('navigation')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    menuSubTab === 'navigation'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'text-slate-400 hover:text-white bg-slate-900/40'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Website Header & Mobile Navigation ({navMenus.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMenuSubTab('dining')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    menuSubTab === 'dining'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'text-slate-400 hover:text-white bg-slate-900/40'
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Gastronomy Venues & Tasting Menus ({diningVenues.length})</span>
                </button>
              </div>

              {/* SUBTAB 1: HEADER NAVIGATION MENUS */}
              {menuSubTab === 'navigation' && (
                <div className="space-y-6">

                  {/* Add New Menu Item Inline Creator */}
                  {isAddingNavMenu && (
                    <form 
                      onSubmit={handleAddNavMenu}
                      className="p-5 rounded-2xl bg-slate-950 border-2 border-amber-400/40 shadow-2xl space-y-4 animate-fade-in"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4 text-amber-400" />
                          <h4 className="text-sm font-bold text-white">Create New Navigation Menu Item</h4>
                        </div>
                        <span className="text-[11px] font-mono text-stone-400">Position #{navMenus.length + 1}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block text-slate-300 mb-1 font-semibold">
                            Menu Label <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Special Offers, Villas, Track Booking"
                            value={newNavForm.label}
                            onChange={(e) => setNewNavForm({ ...newNavForm, label: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 mb-1 font-semibold">
                            Destination Link / URL <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. /#rooms, /rooms/room-1, or https://..."
                            value={newNavForm.href}
                            onChange={(e) => setNewNavForm({ ...newNavForm, href: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 mb-1 font-semibold">
                            Scroll Anchor ID (optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. rooms, dining, amenities"
                            value={newNavForm.targetId}
                            onChange={(e) => setNewNavForm({ ...newNavForm, targetId: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-stone-300">
                          <input
                            type="checkbox"
                            checked={newNavForm.isExternal}
                            onChange={(e) => setNewNavForm({ ...newNavForm, isExternal: e.target.checked })}
                            className="rounded border-slate-700 text-amber-400 focus:ring-0"
                          />
                          <span>Open in new tab (external link)</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsAddingNavMenu(false)}
                            className="px-4 py-2 rounded-xl bg-slate-800 text-stone-300 text-xs font-semibold hover:bg-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl text-slate-950 text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all"
                            style={{ backgroundColor: 'var(--color-secondary)' }}
                          >
                            Add to Navigation
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Navigation Items List */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                    <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Active Navigation Menu Roster ({navMenus.length} Items)
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-400">
                        Items appear in the exact order shown below
                      </span>
                    </div>

                    <div className="divide-y divide-slate-800/80">
                      {navMenus.map((menu, idx) => (
                        <div 
                          key={menu.id}
                          className={`p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all ${
                            menu.visible ? 'bg-slate-950/40 hover:bg-slate-900/30' : 'bg-slate-950/90 opacity-60'
                          }`}
                        >
                          {/* Left: Reorder & Number */}
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveNavMenu(idx, 'up')}
                                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 flex items-center justify-center text-stone-300 transition-all"
                                title="Move up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === navMenus.length - 1}
                                onClick={() => handleMoveNavMenu(idx, 'down')}
                                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 flex items-center justify-center text-stone-300 transition-all"
                                title="Move down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <span className="w-8 h-8 rounded-xl bg-slate-900 text-stone-300 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                          </div>

                          {/* Middle: In-line editable details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 flex-1 w-full text-xs">
                            <div className="lg:col-span-4">
                              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                                Menu Title / Label
                              </label>
                              <input
                                type="text"
                                value={menu.label}
                                onChange={(e) => handleUpdateNavField(menu.id, 'label', e.target.value)}
                                onBlur={handleSaveAllNavMenus}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none focus:border-amber-400"
                              />
                            </div>

                            <div className="lg:col-span-5">
                              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                                Destination Link (href)
                              </label>
                              <input
                                type="text"
                                value={menu.href}
                                onChange={(e) => handleUpdateNavField(menu.id, 'href', e.target.value)}
                                onBlur={handleSaveAllNavMenus}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-amber-200 font-mono text-[11px] focus:outline-none focus:border-amber-400"
                              />
                            </div>

                            <div className="lg:col-span-3 flex items-center gap-2 pt-4 lg:pt-0">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold ${
                                menu.visible 
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' 
                                  : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                              }`}>
                                {menu.visible ? 'Visible' : 'Hidden'}
                              </span>

                              {menu.isExternal && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-500/30">
                                  External
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right: Actions (Toggle & Remove) */}
                          <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleNavVisibility(menu.id)}
                              className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                                menu.visible
                                  ? 'bg-slate-800 text-stone-200 hover:bg-slate-700 border-slate-700'
                                  : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border-emerald-600/40'
                              }`}
                              title={menu.visible ? 'Hide from navbar' : 'Show in navbar'}
                            >
                              {menu.visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              <span>{menu.visible ? 'Hide' : 'Show'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveNavMenu(menu.id)}
                              className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1.5 text-xs font-semibold"
                              title="Delete menu item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live Navbar Preview Box */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 space-y-3">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 block font-semibold">
                      Live Guest Navbar Preview
                    </span>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between overflow-x-auto gap-4">
                      <div className="font-serif font-bold text-white text-xs whitespace-nowrap">
                        {theme?.hotelName || 'The Grand Aurelia'}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/80 whitespace-nowrap overflow-x-auto">
                        {navMenus.filter(m => m.visible).map(m => (
                          <span key={m.id} className="px-2 py-0.5 rounded hover:text-amber-300 font-medium">
                            {m.label}
                          </span>
                        ))}
                      </div>
                      <div 
                        className="px-3 py-1 rounded-full text-[10px] font-bold text-slate-950 uppercase shrink-0"
                        style={{ backgroundColor: 'var(--color-secondary)' }}
                      >
                        Book Stay
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* SUBTAB 2: DINING & TASTING MENUS */}
              {menuSubTab === 'dining' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white font-serif">
                        Gastronomy Venues & Culinary Menus
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Manage dining locations, Michelin tasting experiences, and operating hours in the Gastronomy section.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddingDining(!isAddingDining)}
                      className="px-4 py-2 rounded-xl text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-all hover:scale-105 active:scale-95"
                      style={{ backgroundColor: 'var(--color-secondary)' }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAddingDining ? 'Close' : 'Add Dining Menu'}</span>
                    </button>
                  </div>

                  {isAddingDining && (
                    <form 
                      onSubmit={handleAddDiningVenue}
                      className="p-5 rounded-2xl bg-slate-950 border-2 border-amber-400/40 shadow-2xl space-y-4 animate-fade-in"
                    >
                      <h4 className="text-sm font-bold text-white">Create Dining Venue / Tasting Menu</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-slate-300 mb-1 font-semibold">Restaurant / Venue Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. La Terrazza Sul Mare"
                            value={newDiningForm.name}
                            onChange={(e) => setNewDiningForm({ ...newDiningForm, name: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 mb-1 font-semibold">Accolade / Distinction</label>
                          <input
                            type="text"
                            placeholder="e.g. 2 Michelin Stars, Oceanfront Vista"
                            value={newDiningForm.accolade}
                            onChange={(e) => setNewDiningForm({ ...newDiningForm, accolade: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 mb-1 font-semibold">Cuisine & Menu Type</label>
                          <input
                            type="text"
                            placeholder="e.g. Haute Cuisine & Degustation"
                            value={newDiningForm.type}
                            onChange={(e) => setNewDiningForm({ ...newDiningForm, type: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 mb-1 font-semibold">Operating Hours</label>
                          <input
                            type="text"
                            placeholder="e.g. 19:00 - 23:30"
                            value={newDiningForm.hours}
                            onChange={(e) => setNewDiningForm({ ...newDiningForm, hours: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-slate-300 mb-1 font-semibold">Image URL</label>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/..."
                            value={newDiningForm.image}
                            onChange={(e) => setNewDiningForm({ ...newDiningForm, image: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-slate-300 mb-1 font-semibold">Editorial Description</label>
                          <textarea
                            rows={2}
                            placeholder="Sensory tasting experience guided by Master Sommelier..."
                            value={newDiningForm.description}
                            onChange={(e) => setNewDiningForm({ ...newDiningForm, description: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingDining(false)}
                          className="px-4 py-2 rounded-xl bg-slate-800 text-stone-300 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl text-slate-950 text-xs font-bold uppercase tracking-wider"
                          style={{ backgroundColor: 'var(--color-secondary)' }}
                        >
                          Save Dining Venue
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {diningVenues.map((venue) => (
                      <div key={venue.id} className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col">
                        <div className="relative h-44 overflow-hidden">
                          <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleDiningVisibility(venue.id)}
                              className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black text-xs"
                              title={venue.visible ? 'Hide' : 'Show'}
                            >
                              {venue.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-stone-400" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveDiningVenue(venue.id)}
                              className="p-1.5 rounded-lg bg-rose-950/80 text-rose-300 hover:bg-rose-900 text-xs border border-rose-500/30"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-2 text-xs">
                          <div>
                            <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">{venue.accolade}</span>
                            <h5 className="font-serif font-bold text-white text-sm">{venue.name}</h5>
                            <span className="text-stone-400 text-[11px] block">{venue.type}</span>
                            <span className="text-stone-500 text-[10px] block mt-0.5">{venue.hours}</span>
                          </div>
                          <p className="text-stone-300 text-[11px] line-clamp-2">{venue.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB: DISCOVER ARTICLES & MULTI-PHOTO EDITORIAL STORIES */}
          {activeTab === 'articles' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Header card */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                      Editorial Storytelling & Curated Chronicles
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Multi-Photo Galleries
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-serif">
                    Discover Articles & Editorial Manager
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
                    Create and manage rich luxury articles for the Discover section. Each article supports a multi-photo gallery view and can be directly linked to from hero slider buttons.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {isSuperAdmin && (
                    <button
                      onClick={handleResetArticles}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-stone-300 border border-slate-700 flex items-center gap-1.5 transition-all"
                      title="Reset articles to factory defaults"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Reset Articles</span>
                    </button>
                  )}

                  {isSuperAdmin && (
                    <button
                      onClick={handleOpenAddArticle}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95"
                      style={{ backgroundColor: 'var(--color-secondary)' }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Article</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Normal Admin Warning */}
              {!isSuperAdmin && (
                <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-200 text-xs flex items-center gap-2">
                  <Lock className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Normal Administrator: Discover articles are view-only. Adding, editing, or uploading photos requires Super Admin privileges.</span>
                </div>
              )}

              {/* Add / Edit Article Form Modal */}
              {isAddingArticle && (
                <div className="bg-slate-950 p-6 rounded-2xl border border-amber-400/30 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-amber-400" />
                      <h4 className="font-serif text-lg font-bold text-white">
                        {editingArticle ? `Edit Article: "${editingArticle.title}"` : 'Create New Discover Article'}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingArticle(false)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-stone-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveArticleForm} className="space-y-5 text-xs">
                    
                    {/* Title & Subtitle */}
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-slate-300 mb-1.5 font-semibold">Article Headline Title *</label>
                        <input
                          type="text"
                          required
                          value={articleFormData.title}
                          onChange={(e) => setArticleFormData({ ...articleFormData, title: e.target.value })}
                          placeholder="e.g. Inside L'Orangerie: Chef Marco Valenti's 2-Star Michelin Philosophy"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-serif font-bold focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1.5 font-semibold">Subtitle / Editorial Hook</label>
                        <textarea
                          rows={2}
                          value={articleFormData.subtitle}
                          onChange={(e) => setArticleFormData({ ...articleFormData, subtitle: e.target.value })}
                          placeholder="An insider's captained journey through secret granite sea grottos..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {/* Metadata: Category, Author, Date, Read Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-slate-300 mb-1.5 font-semibold">Category Badge</label>
                        <input
                          type="text"
                          value={articleFormData.category}
                          onChange={(e) => setArticleFormData({ ...articleFormData, category: e.target.value })}
                          placeholder="e.g. Haute Gastronomy"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono uppercase text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1.5 font-semibold">Author / Byline</label>
                        <input
                          type="text"
                          value={articleFormData.author}
                          onChange={(e) => setArticleFormData({ ...articleFormData, author: e.target.value })}
                          placeholder="Chef Marco Valenti"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1.5 font-semibold">Date</label>
                        <input
                          type="text"
                          value={articleFormData.date}
                          onChange={(e) => setArticleFormData({ ...articleFormData, date: e.target.value })}
                          placeholder="October 2026"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1.5 font-semibold">Estimated Read Time</label>
                        <input
                          type="text"
                          value={articleFormData.readTime}
                          onChange={(e) => setArticleFormData({ ...articleFormData, readTime: e.target.value })}
                          placeholder="4 min read"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* MULTI-PHOTO GALLERY MANAGER */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Images className="w-4 h-4 text-amber-400" />
                            <h5 className="font-semibold text-white text-sm">
                              Multi-Photo Gallery & Visual Assets ({articleFormData.photos?.length || 0} photos)
                            </h5>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Add multiple photos. Guests will be able to cycle through the high-resolution photo viewer in the article modal.
                          </p>
                        </div>

                        {/* Direct File Upload to Cloud Storage */}
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingArticlePhoto ? 'Uploading Photo...' : 'Upload Photo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingArticlePhoto}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadArticlePhoto(file);
                            }}
                          />
                        </label>
                      </div>

                      {/* Add Photo by Direct URL */}
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={newPhotoUrlInput}
                          placeholder="Or paste high-resolution photo URL (https://images.unsplash.com/...)"
                          onChange={(e) => setNewPhotoUrlInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPhotoUrl(); }}}
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddPhotoUrl}
                          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-stone-200 font-semibold text-xs border border-slate-700"
                        >
                          Add URL
                        </button>
                      </div>

                      {/* Photo Grid Preview & Reorder/Delete */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                        {(articleFormData.photos || []).map((photoUrl, pIdx) => (
                          <div 
                            key={pIdx} 
                            className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group"
                          >
                            <img
                              src={photoUrl}
                              alt={`Photo ${pIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/75 text-amber-300">
                              #{pIdx + 1}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveArticlePhoto(pIdx)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove photo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {(!articleFormData.photos || articleFormData.photos.length === 0) && (
                          <div className="col-span-full py-6 text-center text-slate-500 italic border border-dashed border-slate-800 rounded-xl">
                            No photos added yet. Upload or enter a photo URL above.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Full Article Content */}
                    <div>
                      <label className="block text-slate-300 mb-1.5 font-semibold">
                        Full Story Body (Separate paragraphs with double enter)
                      </label>
                      <textarea
                        rows={7}
                        value={articleFormData.content}
                        onChange={(e) => setArticleFormData({ ...articleFormData, content: e.target.value })}
                        placeholder="Write the luxury chronicle of this experience..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-white font-light text-xs leading-relaxed focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Article Highlights / Key Features */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                      <span className="text-[11px] font-mono uppercase text-amber-300 font-semibold tracking-wider block">
                        Featured Highlights & Inclusions (Optional)
                      </span>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newArticleHighlightInput}
                          placeholder="e.g. Private Sommelier Wine Pairings"
                          onChange={(e) => setNewArticleHighlightInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddArticleHighlight(); }}}
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddArticleHighlight}
                          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-stone-200 font-semibold text-xs border border-slate-700"
                        >
                          Add
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {(articleFormData.highlights || []).map((h, hIdx) => (
                          <span
                            key={hIdx}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-stone-300 text-xs"
                          >
                            <span>{h}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveArticleHighlight(hIdx)}
                              className="text-slate-500 hover:text-rose-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Form Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setIsAddingArticle(false)}
                        className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-stone-300 font-semibold text-xs transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl text-slate-950 font-bold uppercase tracking-wider text-xs shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        style={{ backgroundColor: 'var(--color-secondary)' }}
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Article & Gallery</span>
                      </button>
                    </div>

                  </form>
                </div>
              )}

              {/* Articles Grid List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((art) => {
                  const photosCount = Array.isArray(art.photos) ? art.photos.length : 1;

                  return (
                    <div 
                      key={art.id} 
                      className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between group hover:border-amber-400/40 transition-all"
                    >
                      {/* Cover Photo & Badges */}
                      <div className="relative h-48 bg-slate-900 overflow-hidden">
                        <img
                          src={art.coverImage || (art.photos && art.photos[0])}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-slate-950/80 backdrop-blur-md text-amber-300 border border-white/10">
                            {art.category || 'Curated Story'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {photosCount > 1 && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-950/80 backdrop-blur-md text-stone-200 border border-white/10">
                                <Images className="w-3 h-3 text-amber-400" />
                                <span>{photosCount}</span>
                              </span>
                            )}

                            {isSuperAdmin && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleToggleArticleVisibility(art.id)}
                                  className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black text-xs"
                                  title={art.visible !== false ? 'Visible on website' : 'Hidden from website'}
                                >
                                  {art.visible !== false ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-stone-400" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteArticle(art.id, art.title)}
                                  className="p-1.5 rounded-lg bg-rose-950/80 text-rose-300 hover:bg-rose-900 text-xs border border-rose-500/30"
                                  title="Delete article"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Bottom Meta */}
                        <div className="absolute bottom-2 left-3 right-3 text-[11px] text-stone-300 font-mono">
                          {art.date} • {art.readTime}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <h4 className="font-serif font-bold text-white text-base line-clamp-2">
                            {art.title}
                          </h4>
                          <p className="text-stone-400 text-xs font-light line-clamp-3">
                            {art.subtitle}
                          </p>
                        </div>

                        {/* Footer & Edit Button */}
                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[11px] text-stone-400 truncate max-w-[150px]">
                            {art.author || 'Editorial'}
                          </span>

                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => handleOpenEditArticle(art)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs flex items-center gap-1.5 border border-slate-700"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Article</span>
                            </button>
                          )}
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

