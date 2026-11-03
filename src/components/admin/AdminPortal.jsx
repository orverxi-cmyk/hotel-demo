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
  Menu,
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
  FileText,
  LayoutTemplate,
  RotateCcw,
  MapPin,
  Star,
  Phone,
  Plane,
  Send,
  MessageSquare
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
  subscribeArticles,
  initialSectionHeaders,
  getCachedSectionHeaders,
  subscribeSectionHeaders,
  saveSectionHeaders,
  resetSectionHeaders,
  getRelatedSectionKey,
  isSectionHiddenByMenu
} from '../../services/storageService';
import { adjustLightness } from '../../utils/colorUtils';

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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [navMenuFilter, setNavMenuFilter] = useState('all'); // 'all', 'visible', 'hidden'
  const [contactSubTab, setContactSubTab] = useState('contact'); // 'contact', 'arrival', 'form'

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

  // Hero section background upload state
  const [uploadingHeroBg, setUploadingHeroBg] = useState(false);
  const [heroBgUploadProgress, setHeroBgUploadProgress] = useState(0);

  const handleHeroBgUpload = async (file) => {
    if (!isSuperAdmin) {
      showNotification("Upload restricted to Super Administrator.");
      return;
    }
    if (!file) return;

    try {
      setUploadingHeroBg(true);
      setHeroBgUploadProgress(0);
      const res = await uploadMediaFile(file, 'hero-bg', (p) => {
        setHeroBgUploadProgress(p);
      });
      if (res && res.url) {
        setThemeForm(prev => ({
          ...prev,
          heroImage: res.url
        }));
        await updateTheme({ heroImage: res.url });
        showNotification("Hero background photo uploaded and published!");
      }
    } catch (err) {
      showNotification(`Upload failed: ${err.message}`);
    } finally {
      setUploadingHeroBg(false);
      setHeroBgUploadProgress(0);
    }
  };

  const handleSaveHeroBackground = async () => {
    if (!isSuperAdmin) return;
    try {
      await updateTheme({
        heroImage: themeForm.heroImage,
        heroBgColor: themeForm.heroBgColor,
        heroOverlayOpacity: themeForm.heroOverlayOpacity,
        heroBgBlur: themeForm.heroBgBlur
      });
      showNotification("Hero background settings published successfully!");
    } catch (err) {
      showNotification(`Save notice: ${err.message || 'Saved locally'}`);
    }
  };

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
  const [isSavingArticle, setIsSavingArticle] = useState(false);
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
    const photos = Array.isArray(art.photos) && art.photos.length > 0
      ? [...art.photos]
      : (art.coverImage ? [art.coverImage] : []);
    const cover = art.coverImage || (photos.length > 0 ? photos[0] : '');

    setArticleFormData({
      title: art.title || '',
      subtitle: art.subtitle || '',
      category: art.category || 'Haute Gastronomy',
      readTime: art.readTime || '4 min read',
      date: art.date || 'October 2026',
      author: art.author || '',
      content: art.content || '',
      highlights: Array.isArray(art.highlights) ? [...art.highlights] : [],
      linkedSlideId: art.linkedSlideId || '',
      visible: art.visible !== false,
      ...art,
      coverImage: cover,
      photos: photos
    });
    setNewPhotoUrlInput('');
    setNewArticleHighlightInput('');
    setIsAddingArticle(true);
  };

  const handleSaveArticleForm = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!isSuperAdmin) {
      showNotification("Permission restricted: Only Super Administrators can save Discover articles.");
      return;
    }

    const titleClean = (articleFormData.title || '').trim();
    if (!titleClean) {
      showNotification("Please provide an Article Headline Title.");
      return;
    }

    setIsSavingArticle(true);
    try {
      const photosClean = (articleFormData.photos || [])
        .filter(p => typeof p === 'string' && p.trim().length > 0)
        .map(p => p.trim());

      const rawCover = typeof articleFormData.coverImage === 'string' ? articleFormData.coverImage.trim() : '';
      const cover = rawCover || (photosClean.length > 0 ? photosClean[0] : 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1600&q=80');

      const finalPhotos = photosClean.length > 0 
        ? (photosClean.includes(cover) ? photosClean : [cover, ...photosClean])
        : [cover];

      const articleToSave = {
        ...articleFormData,
        id: editingArticle?.id || `article-${Date.now()}-${titleClean.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        title: titleClean,
        subtitle: (articleFormData.subtitle || '').trim(),
        category: (articleFormData.category || 'Haute Gastronomy').trim(),
        author: (articleFormData.author || 'Estate Concierge & Sommelier').trim(),
        date: (articleFormData.date || 'October 2026').trim(),
        readTime: (articleFormData.readTime || '4 min read').trim(),
        coverImage: cover,
        photos: finalPhotos,
        content: (articleFormData.content || '').trim(),
        highlights: (articleFormData.highlights || []).filter(h => typeof h === 'string' && h.trim().length > 0),
        linkedSlideId: articleFormData.linkedSlideId || '',
        visible: articleFormData.visible !== false,
        order: editingArticle?.order !== undefined ? editingArticle.order : (articles.length + 1),
        updatedAt: new Date().toISOString()
      };

      let updatedList;
      if (editingArticle) {
        updatedList = articles.map(a => a.id === editingArticle.id ? articleToSave : a);
      } else {
        updatedList = [articleToSave, ...articles];
      }

      setArticles(updatedList);
      setIsAddingArticle(false);
      setEditingArticle(null);

      await saveArticles(updatedList);
      showNotification(`Article "${articleToSave.title}" saved successfully with ${articleToSave.photos.length} photos!`);
    } catch (err) {
      console.error("Failed to save article:", err);
      showNotification(`Save notice: ${err.message || 'Article saved to local session'}`);
    } finally {
      setIsSavingArticle(false);
    }
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
    let target = null;
    let nextVisibility = true;

    const updated = navMenus.map(m => {
      if (m.id === menuId) {
        const isCurrentlyVisible = m.visible !== false;
        nextVisibility = !isCurrentlyVisible;
        target = { ...m, visible: nextVisibility };
        return target;
      }
      return m;
    });

    setNavMenus(updated);
    await saveNavMenus(updated);

    // If a menu is hidden or shown, automatically sync its related section too!
    const relatedSecKey = getRelatedSectionKey(target);
    if (relatedSecKey) {
      const updatedHeaders = {
        ...sectionHeadersData,
        [relatedSecKey]: {
          ...(sectionHeadersData?.[relatedSecKey] || {}),
          visible: nextVisibility
        }
      };
      setSectionHeadersData(updatedHeaders);
      await saveSectionHeaders(updatedHeaders);

      const secConfig = SECTION_CONFIGS.find(c => c.key === relatedSecKey);
      showNotification(
        `Menu "${target?.label || 'Item'}" and related section "${secConfig?.name || 'Section'}" are now ${nextVisibility ? 'visible' : 'hidden'} on the website.`
      );
    } else {
      showNotification(`Menu "${target?.label || 'Item'}" is now ${nextVisibility ? 'visible' : 'hidden'} on the website.`);
    }
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
    primaryColor: theme.primaryColor || '#0f2b48',
    primaryHoverColor: theme.primaryHoverColor || '#091b2e',
    secondaryColor: theme.secondaryColor || '#c5a059',
    secondaryHoverColor: theme.secondaryHoverColor || '#a68442',
    backgroundColor: theme.backgroundColor || '#fdfbf7',
    surfaceColor: theme.surfaceColor || '#ffffff',
    activeColor: theme.activeColor || '#8e6f33',
    hotelName: theme.hotelName || '',
    hotelSubtitle: theme.hotelSubtitle || '',
    location: theme.location || '',
    currency: theme.currency || '$',
    phone: theme.phone || '',
    email: theme.email || '',
    checkInTime: theme.checkInTime || '15:00',
    checkOutTime: theme.checkOutTime || '11:00',
    heroImage: theme.heroImage || '',
    heroBgColor: theme.heroBgColor || '#020617',
    heroOverlayOpacity: theme.heroOverlayOpacity !== undefined ? Number(theme.heroOverlayOpacity) : 0.65,
    heroBgBlur: theme.heroBgBlur !== undefined ? Number(theme.heroBgBlur) : 0,
    announcement: theme.announcement || ''
  });

  useEffect(() => {
    if (theme) {
      setThemeForm(prev => ({
        ...prev,
        primaryColor: theme.primaryColor || prev.primaryColor || '#0f2b48',
        primaryHoverColor: theme.primaryHoverColor || prev.primaryHoverColor || '#091b2e',
        secondaryColor: theme.secondaryColor || prev.secondaryColor || '#c5a059',
        secondaryHoverColor: theme.secondaryHoverColor || prev.secondaryHoverColor || '#a68442',
        backgroundColor: theme.backgroundColor || prev.backgroundColor || '#fdfbf7',
        surfaceColor: theme.surfaceColor || prev.surfaceColor || '#ffffff',
        activeColor: theme.activeColor || prev.activeColor || '#8e6f33',
        hotelName: theme.hotelName !== undefined ? theme.hotelName : prev.hotelName,
        hotelSubtitle: theme.hotelSubtitle !== undefined ? theme.hotelSubtitle : prev.hotelSubtitle,
        location: theme.location !== undefined ? theme.location : prev.location,
        currency: theme.currency !== undefined ? theme.currency : prev.currency,
        phone: theme.phone !== undefined ? theme.phone : prev.phone,
        email: theme.email !== undefined ? theme.email : prev.email,
        checkInTime: theme.checkInTime || prev.checkInTime,
        checkOutTime: theme.checkOutTime || prev.checkOutTime,
        heroImage: theme.heroImage !== undefined ? theme.heroImage : prev.heroImage,
        heroBgColor: theme.heroBgColor || prev.heroBgColor || '#020617',
        heroOverlayOpacity: theme.heroOverlayOpacity !== undefined ? Number(theme.heroOverlayOpacity) : (prev.heroOverlayOpacity !== undefined ? Number(prev.heroOverlayOpacity) : 0.65),
        heroBgBlur: theme.heroBgBlur !== undefined ? Number(theme.heroBgBlur) : (prev.heroBgBlur !== undefined ? Number(prev.heroBgBlur) : 0),
        announcement: theme.announcement !== undefined ? theme.announcement : prev.announcement
      }));
    }
  }, [theme]);

  // Bookings filter
  const [bookingFilter, setBookingFilter] = useState('all');
  const [bookingTypeFilter, setBookingTypeFilter] = useState('all'); // 'all', 'stay', 'dining'
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
    quantity: 2,
    location: 'North Cliffside Wing — Oceanfront Promontory',
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

  const autoDerivePrimaryHover = () => {
    const derived = adjustLightness(themeForm.primaryColor || '#0f2b48', -15);
    handleColorChange('primaryHoverColor', derived);
  };

  const autoDeriveSecondaryHover = () => {
    const derived = adjustLightness(themeForm.secondaryColor || '#c5a059', -15);
    handleColorChange('secondaryHoverColor', derived);
  };

  const autoDeriveActive = () => {
    const derived = adjustLightness(themeForm.secondaryColor || '#c5a059', -25);
    handleColorChange('activeColor', derived);
  };

  const handleSaveTheme = async (e) => {
    e.preventDefault();
    await updateTheme(themeForm);
    showNotification("Branding & Theme saved to Firebase successfully!");
  };

  // Filtered bookings
  const filteredBookings = bookings.filter(b => {
    const isDining = b.bookingType === 'dining' || b.type === 'dining';
    const matchesType = bookingTypeFilter === 'all' 
      ? true 
      : bookingTypeFilter === 'dining' 
      ? isDining 
      : !isDining;

    const matchesStatus = bookingFilter === 'all' || (b.status && b.status.toLowerCase() === bookingFilter.toLowerCase());

    const searchLower = bookingSearch ? bookingSearch.toLowerCase() : '';
    const guestMatch = b.guestName && b.guestName.toLowerCase().includes(searchLower);
    const idMatch = b.id && b.id.toLowerCase().includes(searchLower);
    const nameMatch = (b.roomName && b.roomName.toLowerCase().includes(searchLower)) ||
                      (b.venueName && b.venueName.toLowerCase().includes(searchLower)) ||
                      (b.tableName && b.tableName.toLowerCase().includes(searchLower));

    const matchesSearch = !searchLower || guestMatch || idMatch || nameMatch;
    return matchesType && matchesStatus && matchesSearch;
  });

  // Analytics KPIs
  const totalRevenue = bookings
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

  const activeBookingsCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Checked In').length;
  const occupancyRate = Math.min(100, Math.round((activeBookingsCount / (rooms.length || 1)) * 100));
  const averageDailyRate = Math.round(totalRevenue / Math.max(1, bookings.filter(b => b.status !== 'Cancelled').reduce((sum, b) => sum + (Number(b.nights) || 1), 0)));

  // Section Titles & Editorial Copy state
  const [sectionHeadersData, setSectionHeadersData] = useState(() => getCachedSectionHeaders());
  const [isSavingHeaders, setIsSavingHeaders] = useState(false);
  const [selectedHeaderSectionFilter, setSelectedHeaderSectionFilter] = useState('all');

  useEffect(() => {
    const unsubscribe = subscribeSectionHeaders((headers) => {
      if (headers && typeof headers === 'object') {
        setSectionHeadersData(headers);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleHeaderFieldChange = (sectionKey, field, value) => {
    setSectionHeadersData(prev => ({
      ...prev,
      [sectionKey]: {
        ...(prev?.[sectionKey] || {}),
        [field]: value
      }
    }));
  };

  const handleSaveAllHeaders = async () => {
    try {
      setIsSavingHeaders(true);
      await saveSectionHeaders(sectionHeadersData);
      showNotification("All 7 section titles & copy saved and synced successfully!");
    } catch (err) {
      console.error("Save section headers error:", err);
      showNotification(`Save notice: ${err?.message || 'Section headers saved locally'}`);
    } finally {
      setIsSavingHeaders(false);
    }
  };

  const handleSaveSingleHeaderSection = async (sectionKey, sectionLabel) => {
    try {
      setIsSavingHeaders(true);
      await saveSectionHeaders(sectionHeadersData);
      showNotification(`"${sectionLabel}" section title and copy saved!`);
    } catch (err) {
      console.error("Save single section error:", err);
      showNotification(`Save notice: ${err?.message || 'Section saved locally'}`);
    } finally {
      setIsSavingHeaders(false);
    }
  };

  const handleResetHeaders = async () => {
    if (!isSuperAdmin) {
      showNotification("Reset restricted to Super Administrator.");
      return;
    }
    if (window.confirm("Reset all 7 section titles and copy to default Mediterranean luxury text?")) {
      setSectionHeadersData(initialSectionHeaders);
      await resetSectionHeaders();
      showNotification("Section titles & copy reset to defaults!");
    }
  };

  const handleResetSingleSectionHeader = async (sectionKey, sectionLabel) => {
    if (!isSuperAdmin) {
      showNotification("Reset restricted to Super Administrator.");
      return;
    }
    if (window.confirm(`Reset "${sectionLabel}" title and copy to factory default?`)) {
      const defaultSec = initialSectionHeaders[sectionKey] || {};
      const updated = {
        ...sectionHeadersData,
        [sectionKey]: { ...defaultSec }
      };
      setSectionHeadersData(updated);
      await saveSectionHeaders(updated);
      showNotification(`"${sectionLabel}" reset to factory default!`);
    }
  };

  const SECTION_CONFIGS = [
    {
      key: 'rooms',
      name: 'Accommodations',
      fullTitle: 'Bespoke Accommodations',
      badge: 'Suites & Private Villas',
      anchor: '#rooms',
      icon: BedDouble,
      defaultEyebrow: 'Bespoke Accommodations',
      defaultTitle: 'Sanctuaries of Refined Elegance',
      defaultSubtitle: 'Each residence is individually curated with natural materials, handcrafted Italian furnishings, and unobstructed Mediterranean vistas.'
    },
    {
      key: 'amenities',
      name: 'Curated Amenities',
      fullTitle: 'Curated Hotel Experiences',
      badge: 'Resort Amenities',
      anchor: '#amenities',
      icon: Sparkles,
      defaultEyebrow: 'Curated Hotel Experiences',
      defaultTitle: 'Unrivaled World-Class Amenities',
      defaultSubtitle: 'Every moment at our resort is tailored to exceed imagination — from thermal spa rituals to private yacht expeditions across the turquoise Mediterranean.'
    },
    {
      key: 'dining',
      name: 'Gastronomy & Libations',
      fullTitle: 'Gastronomy & Libations',
      badge: 'Michelin Dining & Cellar',
      anchor: '#dining',
      icon: UtensilsCrossed,
      defaultEyebrow: 'Gastronomy & Libations',
      defaultTitle: 'A Symphony of Epicurean Artistry',
      defaultSubtitle: 'Embark on an unforgettable gastronomic journey guided by award-winning culinary masters and international sommeliers.'
    },
    {
      key: 'discover',
      name: 'Discover & Stories',
      fullTitle: 'Discover & Editorial Stories',
      badge: 'Chronicles & Heritage',
      anchor: '#discover',
      icon: BookOpen,
      defaultEyebrow: 'Discover & Editorial Stories',
      defaultTitle: 'Curated Chronicles of Mediterranean Living',
      defaultSubtitle: 'Unveil the secrets of our estate: Michelin-starred culinary artistry, Riva yacht charters, ancient subterranean cellars, and holistic botanical wellness.'
    },
    {
      key: 'gallery',
      name: 'Visual Story',
      fullTitle: 'Visual Story',
      badge: 'Resort Imagery & Moments',
      anchor: '#gallery',
      icon: Images,
      defaultEyebrow: 'Visual Story',
      defaultTitle: 'Moments of Sublime Beauty',
      defaultSubtitle: 'Immerse yourself in snapshots of idyllic afternoons, sunset champagne toasts, and serene botanical spaces.'
    },
    {
      key: 'reviews',
      name: 'Guest Acclaim',
      fullTitle: 'Guest Acclaim',
      badge: 'Verified Residencies & Acclaim',
      anchor: '#reviews',
      icon: ShieldCheck,
      isReview: true,
      defaultEyebrow: 'Guest Acclaim',
      defaultTitle: 'Praised by Discerning Travelers',
      defaultRatingScore: '4.98 / 5.0',
      defaultRatingCount: '(420+ Verified Residencies)',
      defaultStars: 5,
      defaultSubtitle: 'Read authentic feedback and impressions from our esteemed international guests.'
    },
    {
      key: 'location',
      name: 'Location & Concierge',
      fullTitle: 'Location & Concierge',
      badge: 'Arrival, Transfers & Concierge',
      anchor: '#contact',
      icon: Compass,
      isLocation: true,
      defaultEyebrow: 'Location & Concierge',
      defaultTitle: 'Arrive in Absolute Tranquility',
      defaultSubtitle: 'Nestled along the emerald coast, easily reachable by helicopter transfer, private yacht dock, or luxury chauffeur.'
    }
  ];

  const adminTabs = [
    { id: 'theme', label: 'Branding & Colors', icon: Palette, description: 'Hotel identity, palette & typography' },
    { id: 'headers', label: 'Section Titles & Copy', icon: LayoutTemplate, count: 7, description: 'Eyebrow tags, titles & descriptions across 7 sections' },
    { id: 'slider', label: 'Hero Slider & Media', icon: Film, count: sliderSlides.length, description: 'Homepage showcase & discovery links' },
    { id: 'menus', label: 'Navigation & Menus', icon: Compass, count: navMenus.length, description: 'Header navigation items' },
    { id: 'articles', label: 'Discover Articles', icon: BookOpen, count: articles.length, description: 'Editorial stories & multi-photo articles' },
    { id: 'bookings', label: 'Bookings Manager', icon: CalendarDays, count: bookings.length, description: 'Guest reservations & booking folios' },
    { id: 'rooms', label: 'Suites & Inventory', icon: BedDouble, count: rooms.length, description: 'Room specifications & night rates' },
    { id: 'analytics', label: 'Revenue & Analytics', icon: BarChart3, description: 'Financial metrics & occupancy KPIs' },
    ...(isSuperAdmin ? [{ id: 'users', label: 'Admins & Roles', icon: Users, badge: 'Super Admin', description: 'RBAC administrator credentials' }] : [])
  ];

  const currentTab = adminTabs.find(t => t.id === activeTab) || adminTabs[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-slate-100 flex overflow-hidden animate-fade-in font-sans">
      
      {/* Mobile Sidebar Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 ${
          isSidebarCollapsed ? 'md:w-20' : 'md:w-72 lg:w-76'
        } bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 shadow-2xl md:shadow-none transition-all duration-300 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & Identity */}
        <div className={`p-4 sm:p-5 border-b border-slate-800/80 ${isSidebarCollapsed ? 'md:p-3 md:flex md:flex-col md:items-center' : ''}`}>
          <div className={`flex items-center justify-between ${isSidebarCollapsed ? 'md:justify-center w-full' : ''}`}>
            <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'md:justify-center' : ''}`}>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center font-serif text-base font-bold text-slate-950 shadow-md ring-1 ring-white/10 shrink-0"
                style={{ backgroundColor: 'var(--color-secondary)' }}
                title={theme.hotelName || 'Luxury Hotel'}
              >
                {theme.hotelName ? theme.hotelName.substring(0, 2).toUpperCase() : 'CMS'}
              </div>
              <div className={`min-w-0 ${isSidebarCollapsed ? 'md:hidden' : 'block'}`}>
                <h1 className="font-bold text-sm text-white tracking-wide truncate">
                  {theme.hotelName || 'Luxury Hotel'}
                </h1>
                <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Admin CMS</span>
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Role Status Badge */}
          <div className={`mt-4 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 ${isSidebarCollapsed ? 'md:hidden' : 'block'}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {isSuperAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-sky-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block">
                    {isSuperAdmin ? 'Super Administrator' : 'Normal Admin'}
                  </span>
                  <span className="text-xs text-stone-300 font-mono truncate block" title={userEmail}>
                    {userEmail}
                  </span>
                </div>
              </div>
              {isSuperAdmin ? (
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                  Root
                </span>
              ) : (
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30 shrink-0">
                  Staff
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Vertical Nav Tab List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className={`px-3 pb-2 text-[10px] font-mono tracking-widest uppercase text-slate-500 font-semibold ${isSidebarCollapsed ? 'md:hidden' : 'block'}`}>
            Management & Studio
          </div>

          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileSidebarOpen(false);
                }}
                title={isSidebarCollapsed ? tab.label : undefined}
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? 'md:justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
                } rounded-xl text-xs transition-all group relative ${
                  isActive
                    ? 'bg-amber-400/15 text-amber-300 font-semibold shadow-sm border border-amber-400/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-300'
                  }`} />
                  <span className={`truncate ${isSidebarCollapsed ? 'md:hidden' : 'inline'}`}>{tab.label}</span>
                </div>

                <div className={`items-center gap-1.5 shrink-0 ml-2 ${isSidebarCollapsed ? 'md:hidden flex' : 'flex'}`}>
                  {tab.count !== undefined && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                      isActive
                        ? 'bg-amber-400/25 text-amber-200'
                        : 'bg-slate-800/80 text-slate-400 group-hover:text-stone-300'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && (
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {tab.badge}
                    </span>
                  )}
                </div>

                {/* Collapsed dot indicator when active */}
                {isSidebarCollapsed && isActive && (
                  <span className="hidden md:block absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer Actions */}
        <div className={`p-3 sm:p-4 border-t border-slate-800/80 space-y-2 bg-slate-950/80 ${isSidebarCollapsed ? 'md:p-2 md:space-y-2' : ''}`}>
          <button
            onClick={onClose}
            className={`w-full flex items-center ${
              isSidebarCollapsed ? 'md:justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
            } rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all group shadow-sm`}
            title="Return to the live hotel website"
          >
            <div className="flex items-center gap-2.5">
              <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
              <span className={isSidebarCollapsed ? 'md:hidden' : 'inline'}>View Website</span>
            </div>
            <ExternalLink className={`w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 ${isSidebarCollapsed ? 'md:hidden' : 'inline'}`} />
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'md:justify-center p-2' : 'gap-2.5 px-3.5 py-2'
              } rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/20 transition-all group`}
              title="Sign out of Admin session"
            >
              <LogOut className="w-4 h-4 text-rose-400 group-hover:text-rose-300" />
              <span className={isSidebarCollapsed ? 'md:hidden' : 'inline'}>Sign Out</span>
            </button>
          )}
        </div>
      </aside>

      {/* Right Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">
        
        {/* Top Action & Breadcrumb Header */}
        <header className="bg-slate-950 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-stone-300 transition-all border border-slate-700 shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Show / Hide Admin Menu Button */}
            <button
              onClick={() => setIsSidebarCollapsed(prev => !prev)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-stone-300 hover:text-white text-xs font-medium border border-slate-700/80 transition-all shadow-sm group shrink-0"
              title={isSidebarCollapsed ? "Show Admin Menu Sidebar" : "Hide Admin Menu Sidebar"}
            >
              <Menu className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>{isSidebarCollapsed ? "Show Admin Menu" : "Hide Admin Menu"}</span>
            </button>

            {/* Breadcrumb Display */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-slate-500 font-mono hidden sm:inline">CMS</span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <div className="flex items-center gap-2 min-w-0">
                <currentTab.icon className="w-4 h-4 text-amber-400 shrink-0" />
                <h2 className="font-bold text-sm text-white truncate">{currentTab.label}</h2>
              </div>
              <span className="text-xs text-slate-400 hidden xl:inline truncate border-l border-slate-800 pl-2 ml-1">
                {currentTab.description}
              </span>
            </div>
          </div>

          {/* Sync status & Actions */}
          <div className="flex items-center gap-2 shrink-0">
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

            {/* Close CMS */}
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

        {/* Main CMS Viewport */}
        <div className="admin-main-content flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/70 text-slate-900">
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
                                     theme.secondaryColor.toLowerCase() === preset.secondary.toLowerCase() &&
                                     (!preset.backgroundColor || (theme.backgroundColor || '').toLowerCase() === preset.backgroundColor.toLowerCase());
                    return (
                      <div
                        key={preset.id}
                        onClick={() => {
                          applyPreset(preset.id);
                          setThemeForm(prev => ({
                            ...prev,
                            primaryColor: preset.primary,
                            primaryHoverColor: preset.primaryHover || adjustLightness(preset.primary, -15),
                            secondaryColor: preset.secondary,
                            secondaryHoverColor: preset.secondaryHover || adjustLightness(preset.secondary, -15),
                            backgroundColor: preset.backgroundColor || '#fdfbf7',
                            surfaceColor: preset.surfaceColor || '#ffffff',
                            activeColor: preset.activeColor || adjustLightness(preset.secondary, -25)
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
                        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-[10px] font-mono text-stone-400">
                          <div className="flex items-center gap-1.5 truncate">
                            <div 
                              className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 shadow-inner"
                              style={{ backgroundColor: preset.primary }}
                              title="Primary Brand"
                            />
                            <span className="truncate">Main: {preset.primary}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <div 
                              className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 shadow-inner"
                              style={{ backgroundColor: preset.secondary }}
                              title="Accent / CTA"
                            />
                            <span className="truncate">CTA: {preset.secondary}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <div 
                              className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 shadow-inner"
                              style={{ backgroundColor: preset.backgroundColor || '#fdfbf7' }}
                              title="Background"
                            />
                            <span className="truncate">BG: {preset.backgroundColor || '#fdfbf7'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <div 
                              className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 shadow-inner"
                              style={{ backgroundColor: preset.secondaryHover || preset.activeColor || '#a68442' }}
                              title="Hover & Active"
                            />
                            <span className="truncate">Hover: {preset.secondaryHover || '#a68442'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Pickers & Live Values */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Main & Primary Brand Colors */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
                  <div className="border-b border-slate-800 pb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block mb-0.5">Brand Identity</span>
                    <h4 className="text-sm font-bold text-white flex items-center justify-between">
                      <span>Primary & Header Colors</span>
                      <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: themeForm.primaryColor }} />
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Powers navigation bar, headers, suite badges, and primary brand cards.
                    </p>
                  </div>

                  {/* Primary Color Picker */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white">Primary Brand Color</label>
                      <span className="text-[11px] font-mono text-slate-400">{themeForm.primaryColor}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeForm.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        className="w-12 h-12 rounded-xl cursor-pointer bg-slate-900 border border-slate-700 p-1 shrink-0"
                      />
                      <input
                        type="text"
                        value={themeForm.primaryColor}
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                        placeholder="#0f2b48"
                      />
                    </div>
                    {/* Primary Swatches */}
                    <div className="flex gap-1.5 pt-1">
                      {['#0f2b48', '#143d2b', '#481123', '#034a74', '#161a1d', '#1e293b', '#2c1810'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleColorChange('primaryColor', c)}
                          className="w-6 h-6 rounded-lg border border-white/20 transition-transform hover:scale-110 shrink-0"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Primary Hover / Active Color Picker */}
                  <div className="space-y-2 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <span>Primary Hover / Active</span>
                          <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: themeForm.primaryHoverColor }} />
                        </label>
                        <span className="text-[10px] text-slate-400">Pressed and hover state</span>
                      </div>
                      <button
                        type="button"
                        onClick={autoDerivePrimaryHover}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-mono transition-colors"
                        title="Auto-derive darker shade from Primary"
                      >
                        Auto-Derive
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeForm.primaryHoverColor}
                        onChange={(e) => handleColorChange('primaryHoverColor', e.target.value)}
                        className="w-12 h-12 rounded-xl cursor-pointer bg-slate-900 border border-slate-700 p-1 shrink-0"
                      />
                      <input
                        type="text"
                        value={themeForm.primaryHoverColor}
                        onChange={(e) => handleColorChange('primaryHoverColor', e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                        placeholder="#091b2e"
                      />
                    </div>
                    {/* Primary Hover Swatches */}
                    <div className="flex gap-1.5 pt-1">
                      {['#091b2e', '#0d291d', '#300a16', '#023350', '#0b0d0e', '#0f172a', '#1a0e08'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleColorChange('primaryHoverColor', c)}
                          className="w-6 h-6 rounded-lg border border-white/20 transition-transform hover:scale-110 shrink-0"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Secondary, Hover & Active Action Colors */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
                  <div className="border-b border-slate-800 pb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block mb-0.5">Interactive & CTAs</span>
                    <h4 className="text-sm font-bold text-white flex items-center justify-between">
                      <span>Secondary, Hover & Active</span>
                      <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: themeForm.secondaryColor }} />
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Powers 'Book Now' CTAs, reservation buttons, star badges, and interactive click states.
                    </p>
                  </div>

                  {/* Secondary Color Picker */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white">Secondary / Accent Color</label>
                      <span className="text-[11px] font-mono text-slate-400">{themeForm.secondaryColor}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeForm.secondaryColor}
                        onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                        className="w-12 h-12 rounded-xl cursor-pointer bg-slate-900 border border-slate-700 p-1 shrink-0"
                      />
                      <input
                        type="text"
                        value={themeForm.secondaryColor}
                        onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                        placeholder="#c5a059"
                      />
                    </div>
                    {/* Secondary Swatches */}
                    <div className="flex gap-1.5 pt-1">
                      {['#c5a059', '#d4af37', '#e76f51', '#bf8a48', '#ba9e6e', '#10b981', '#f59e0b'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleColorChange('secondaryColor', c)}
                          className="w-6 h-6 rounded-lg border border-white/20 transition-transform hover:scale-110 shrink-0"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Secondary Hover Color Picker */}
                  <div className="space-y-2 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <span>Button Hover Color</span>
                          <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: themeForm.secondaryHoverColor }} />
                        </label>
                        <span className="text-[10px] text-slate-400">Mouse-over hover state</span>
                      </div>
                      <button
                        type="button"
                        onClick={autoDeriveSecondaryHover}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-mono transition-colors"
                        title="Auto-derive shade from Secondary"
                      >
                        Auto-Derive
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeForm.secondaryHoverColor}
                        onChange={(e) => handleColorChange('secondaryHoverColor', e.target.value)}
                        className="w-12 h-12 rounded-xl cursor-pointer bg-slate-900 border border-slate-700 p-1 shrink-0"
                      />
                      <input
                        type="text"
                        value={themeForm.secondaryHoverColor}
                        onChange={(e) => handleColorChange('secondaryHoverColor', e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                        placeholder="#a68442"
                      />
                    </div>
                  </div>

                  {/* Active / Pressed Color Picker */}
                  <div className="space-y-2 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <span>Active / Clicked Color</span>
                          <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: themeForm.activeColor }} />
                        </label>
                        <span className="text-[10px] text-slate-400">Active click & tab selection</span>
                      </div>
                      <button
                        type="button"
                        onClick={autoDeriveActive}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-mono transition-colors"
                        title="Auto-derive active shade from Secondary"
                      >
                        Auto-Derive
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeForm.activeColor}
                        onChange={(e) => handleColorChange('activeColor', e.target.value)}
                        className="w-12 h-12 rounded-xl cursor-pointer bg-slate-900 border border-slate-700 p-1 shrink-0"
                      />
                      <input
                        type="text"
                        value={themeForm.activeColor}
                        onChange={(e) => handleColorChange('activeColor', e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                        placeholder="#8e6f33"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Site Background & Surface Atmosphere */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
                  <div className="border-b border-slate-800 pb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block mb-0.5">Atmosphere & Canvas</span>
                    <h4 className="text-sm font-bold text-white flex items-center justify-between">
                      <span>Background & Surface</span>
                      <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: themeForm.backgroundColor }} />
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Controls global page backdrop, section canvases, and guest reading backgrounds.
                    </p>
                  </div>

                  {/* Site Background Color Picker */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white">Global Background Color</label>
                      <span className="text-[11px] font-mono text-slate-400">{themeForm.backgroundColor}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeForm.backgroundColor}
                        onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                        className="w-12 h-12 rounded-xl cursor-pointer bg-slate-900 border border-slate-700 p-1 shrink-0"
                      />
                      <input
                        type="text"
                        value={themeForm.backgroundColor}
                        onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                        placeholder="#fdfbf7"
                      />
                    </div>
                    {/* Background Preset Swatches */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-slate-500 font-mono">Atmosphere Swatches:</span>
                      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                        {[
                          { name: 'Warm Ivory', hex: '#fdfbf7' },
                          { name: 'Pure White', hex: '#ffffff' },
                          { name: 'Pearl Frost', hex: '#f8fafc' },
                          { name: 'Linen Sand', hex: '#f5f0eb' },
                          { name: 'Midnight', hex: '#0f172a' },
                          { name: 'Obsidian', hex: '#090d16' }
                        ].map((bg) => (
                          <button
                            key={bg.hex}
                            type="button"
                            onClick={() => handleColorChange('backgroundColor', bg.hex)}
                            className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-stone-300 text-left transition-all"
                          >
                            <span className="w-3 h-3 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: bg.hex }} />
                            <span className="truncate text-[10px]">{bg.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Surface / Card Color */}
                  <div className="space-y-2 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <span>Card Surface Color</span>
                        <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: themeForm.surfaceColor }} />
                      </label>
                      <span className="text-[11px] font-mono text-slate-400">{themeForm.surfaceColor}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeForm.surfaceColor}
                        onChange={(e) => handleColorChange('surfaceColor', e.target.value)}
                        className="w-12 h-12 rounded-xl cursor-pointer bg-slate-900 border border-slate-700 p-1 shrink-0"
                      />
                      <input
                        type="text"
                        value={themeForm.surfaceColor}
                        onChange={(e) => handleColorChange('surfaceColor', e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* 4. Live Interactive Component State Sandbox */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block mb-0.5">Interactive Preview</span>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Live State Sandbox (Hover & Click Tester)</span>
                    </h4>
                    <p className="text-xs text-slate-400">Test how your custom primary, secondary, hover, active, and background colors behave together in real time.</p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Responsive</span>
                  </span>
                </div>

                {/* Interactive Demo Surface Box */}
                <div 
                  className="p-6 rounded-2xl border border-slate-700/60 transition-all duration-300 shadow-inner"
                  style={{ backgroundColor: themeForm.backgroundColor }}
                >
                  <div className="max-w-2xl mx-auto space-y-4">
                    {/* Simulated Card on the Background */}
                    <div 
                      className="p-5 rounded-2xl shadow-lg border transition-all"
                      style={{ 
                        backgroundColor: themeForm.surfaceColor,
                        borderColor: 'rgba(0,0,0,0.08)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span 
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold"
                          style={{ 
                            backgroundColor: themeForm.primaryColor,
                            color: '#ffffff'
                          }}
                        >
                          Luxury Suite Demo
                        </span>
                        <span 
                          className="text-xs font-serif font-bold"
                          style={{ color: themeForm.primaryColor }}
                        >
                          {themeForm.currency}890 / night
                        </span>
                      </div>

                      <h5 
                        className="font-serif text-lg font-bold mb-1"
                        style={{ color: themeForm.primaryColor }}
                      >
                        Presidential Plunge Pool Villa
                      </h5>
                      <p className="text-xs text-stone-500 mb-4">
                        Experience the exact hover and active feedback configured above. Try hovering and clicking each button below.
                      </p>

                      {/* Interactive Buttons Container */}
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Secondary CTA Button */}
                        <button
                          type="button"
                          className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 transition-all shadow-md active:scale-95"
                          style={{ backgroundColor: themeForm.secondaryColor }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeForm.secondaryHoverColor}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeForm.secondaryColor}
                          onMouseDown={(e) => e.currentTarget.style.backgroundColor = themeForm.activeColor}
                          onMouseUp={(e) => e.currentTarget.style.backgroundColor = themeForm.secondaryHoverColor}
                        >
                          Book Suite Now (CTA)
                        </button>

                        {/* Primary Button */}
                        <button
                          type="button"
                          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all shadow-md active:scale-95"
                          style={{ backgroundColor: themeForm.primaryColor }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeForm.primaryHoverColor}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeForm.primaryColor}
                        >
                          Explore Floorplan (Primary)
                        </button>

                        {/* Active Selection Badge */}
                        <div 
                          className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5"
                          style={{ 
                            backgroundColor: `${themeForm.activeColor}22`,
                            color: themeForm.activeColor,
                            border: `1px solid ${themeForm.activeColor}55`
                          }}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeForm.activeColor }} />
                          <span>Active Filter Pill</span>
                        </div>
                      </div>
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

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-white flex items-center gap-2">
                        <span>Hero Section Background Backdrop</span>
                        {themeForm.heroImage && (
                          <span className="text-[10px] font-mono text-emerald-400">● Photo Active</span>
                        )}
                      </label>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Controls the backdrop image & canvas color behind the homepage hero slider and booking search bar.
                      </p>
                    </div>
                    {themeForm.heroImage && isSuperAdmin && (
                      <button
                        type="button"
                        onClick={async () => {
                          setThemeForm(prev => ({ ...prev, heroImage: '' }));
                          await updateTheme({ heroImage: '' });
                          showNotification("Hero background photo cleared.");
                        }}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-mono transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove Photo</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <label className={`px-4 py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      uploadingHeroBg
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 cursor-wait'
                        : 'bg-slate-800 hover:bg-slate-700 text-stone-200 border-slate-700 hover:border-amber-400/40'
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingHeroBg || !isSuperAdmin}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleHeroBgUpload(file);
                        }}
                      />
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>{uploadingHeroBg ? `Uploading ${heroBgUploadProgress}%...` : 'Upload Background Photo'}</span>
                    </label>

                    <input
                      type="url"
                      value={themeForm.heroImage}
                      onChange={(e) => {
                        const val = e.target.value;
                        setThemeForm(prev => ({ ...prev, heroImage: val }));
                        updateTheme({ heroImage: val });
                      }}
                      placeholder="Or enter photo URL (https://images.unsplash.com/...)"
                      className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
                    />
                  </div>

                  {/* Darkness Overlay & Hero Color */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-300">Darkness Overlay</label>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {Math.round((themeForm.heroOverlayOpacity !== undefined ? Number(themeForm.heroOverlayOpacity) : 0.65) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.95"
                        step="0.05"
                        value={themeForm.heroOverlayOpacity !== undefined ? Number(themeForm.heroOverlayOpacity) : 0.65}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setThemeForm(prev => ({ ...prev, heroOverlayOpacity: val }));
                          updateTheme({ heroOverlayOpacity: val });
                        }}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-300">Canvas Base Color</label>
                        <span className="text-xs font-mono text-amber-300 font-bold">{themeForm.heroBgColor || '#020617'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeForm.heroBgColor || '#020617'}
                          onChange={(e) => {
                            const color = e.target.value;
                            setThemeForm(prev => ({ ...prev, heroBgColor: color }));
                            updateTheme({ heroBgColor: color });
                          }}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-slate-950 border border-slate-700 p-0.5 shrink-0"
                        />
                        <span className="text-xs font-mono text-slate-400">Tint behind photo / solid canvas</span>
                      </div>
                    </div>
                  </div>
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

          {/* TAB: SECTION TITLES & EDITORIAL COPY */}
          {activeTab === 'headers' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header card */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                      Homepage Presentation & Content Architecture
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-500/30">
                      7 Landing Sections
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-serif">
                    Section Titles & Editorial Copy
                  </h3>
                  <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
                    Customise the luxury eyebrow tags, primary serif headlines, and editorial descriptions for all 7 homepage sections. Changes update instantly across all guest visits through real-time Firestore sync and local caching.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {isSuperAdmin && (
                    <button
                      onClick={handleResetHeaders}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-stone-300 border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                      title="Reset all 7 section titles & copy to default Mediterranean luxury text"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reset All Defaults</span>
                    </button>
                  )}
                  <button
                    onClick={handleSaveAllHeaders}
                    disabled={isSavingHeaders}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 shrink-0 disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-secondary)' }}
                  >
                    {isSavingHeaders ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isSavingHeaders ? 'Saving...' : 'Save All Section Headers'}</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-stone-200 border border-slate-700 flex items-center gap-1.5 transition-all"
                    title="View updates on live hotel website"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Live Site</span>
                  </button>
                </div>
              </div>

              {/* Quick Navigation Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedHeaderSectionFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    selectedHeaderSectionFilter === 'all'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  All Sections (7)
                </button>
                {SECTION_CONFIGS.map((cfg) => {
                  const IconComp = cfg.icon;
                  const isSelected = selectedHeaderSectionFilter === cfg.key;
                  return (
                    <button
                      key={cfg.key}
                      type="button"
                      onClick={() => setSelectedHeaderSectionFilter(cfg.key)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5 opacity-80" />
                      <span>{cfg.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* 7 Section Cards List */}
              <div className="space-y-6">
                {SECTION_CONFIGS.filter(cfg => selectedHeaderSectionFilter === 'all' || cfg.key === selectedHeaderSectionFilter).map((cfg) => {
                  const IconComp = cfg.icon;
                  const secData = sectionHeadersData?.[cfg.key] || {};
                  const currentEyebrow = secData.eyebrow ?? cfg.defaultEyebrow;
                  const currentTitle = secData.title ?? cfg.defaultTitle;
                  const currentSubtitle = secData.subtitle ?? cfg.defaultSubtitle;
                  const currentRatingScore = secData.ratingScore ?? cfg.defaultRatingScore ?? '4.98 / 5.0';
                  const currentRatingCount = secData.ratingCount ?? cfg.defaultRatingCount ?? '(420+ Verified Residencies)';
                  const currentStars = secData.stars !== undefined 
                    ? Number(secData.stars) 
                    : (parseFloat(currentRatingScore) || (cfg.defaultStars ?? 5));

                  // Contact section elements
                  const addressTitle = secData.addressTitle !== undefined ? secData.addressTitle : "Resort Sanctuary Address";
                  const addressValue = secData.addressValue !== undefined ? secData.addressValue : (theme.location || "Your Location");
                  const phoneTitle = secData.phoneTitle !== undefined ? secData.phoneTitle : "24/7 Royal Concierge";
                  const phoneValue = secData.phoneValue !== undefined ? secData.phoneValue : (theme.phone || "+250 788 000 000");
                  const emailTitle = secData.emailTitle !== undefined ? secData.emailTitle : "Direct Inquiries";
                  const emailValue = secData.emailValue !== undefined ? secData.emailValue : (theme.email || "youremail@yourdomain.rw");
                  const checkInCheckOutTitle = secData.checkInCheckOutTitle !== undefined ? secData.checkInCheckOutTitle : "Check-in / Check-out Times";
                  const checkInTime = secData.checkInTime !== undefined ? secData.checkInTime : (theme.checkInTime || "15:00");
                  const checkOutTime = secData.checkOutTime !== undefined ? secData.checkOutTime : (theme.checkOutTime || "11:00");

                  const arrivalOption1Title = secData.arrivalOption1Title !== undefined ? secData.arrivalOption1Title : "Private Helipad";
                  const arrivalOption1Subtitle = secData.arrivalOption1Subtitle !== undefined ? secData.arrivalOption1Subtitle : "Coordinates: 41°08'N 9°32'E";
                  const arrivalOption2Title = secData.arrivalOption2Title !== undefined ? secData.arrivalOption2Title : "Deepwater Berth";
                  const arrivalOption2Subtitle = secData.arrivalOption2Subtitle !== undefined ? secData.arrivalOption2Subtitle : "Accommodates yachts up to 65m";

                  const formTitle = secData.formTitle !== undefined ? secData.formTitle : "Speak with the Royal Concierge";
                  const formSubtitle = secData.formSubtitle !== undefined ? secData.formSubtitle : "Have specific travel requirements, yacht charter inquiries, or bespoke dining requests? Our concierge team will respond within 60 minutes.";
                  const fieldNameLabel = secData.fieldNameLabel !== undefined ? secData.fieldNameLabel : "Your Full Name";
                  const fieldNamePlaceholder = secData.fieldNamePlaceholder !== undefined ? secData.fieldNamePlaceholder : "e.g. Lady Vivienne Montgomery";
                  const fieldEmailLabel = secData.fieldEmailLabel !== undefined ? secData.fieldEmailLabel : "Email Address";
                  const fieldEmailPlaceholder = secData.fieldEmailPlaceholder !== undefined ? secData.fieldEmailPlaceholder : "name@domain.com";
                  const fieldMessageLabel = secData.fieldMessageLabel !== undefined ? secData.fieldMessageLabel : "Bespoke Request or Inquiry";
                  const fieldMessagePlaceholder = secData.fieldMessagePlaceholder !== undefined ? secData.fieldMessagePlaceholder : "Tell us about your upcoming stay, private event, dietary restrictions, or transport needs...";
                  const buttonText = secData.buttonText !== undefined ? secData.buttonText : "Transmit Inquiry to Concierge";
                  const successTitle = secData.successTitle !== undefined ? secData.successTitle : "Inquiry Received";
                  const successMessage = secData.successMessage !== undefined ? secData.successMessage : "Thank you! Our head concierge has received your request and will contact you promptly.";

                  return (
                    <div 
                      key={cfg.key}
                      className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700/80 transition-all shadow-xl space-y-6"
                    >
                      {/* Section Card Top Header */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-bold text-white font-serif">
                                {cfg.fullTitle}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-amber-300 border border-slate-700">
                                {cfg.badge}
                              </span>
                              {(secData.visible === false || isSectionHiddenByMenu(cfg.key, navMenus)) && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                                  <EyeOff className="w-3 h-3 text-rose-400" />
                                  <span>Hidden {isSectionHiddenByMenu(cfg.key, navMenus) ? '(via Menu)' : 'from Site'}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                              Anchor: <span className="text-amber-400">{cfg.anchor}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                          {/* Show / Hide Section Toggle Button */}
                          <button
                            type="button"
                            onClick={async () => {
                              const isVis = secData.visible !== false && !isSectionHiddenByMenu(cfg.key, navMenus);
                              const updatedVisible = !isVis;
                              handleHeaderFieldChange(cfg.key, 'visible', updatedVisible);
                              const updated = {
                                ...sectionHeadersData,
                                [cfg.key]: {
                                  ...(sectionHeadersData?.[cfg.key] || {}),
                                  visible: updatedVisible
                                }
                              };
                              setSectionHeadersData(updated);
                              await saveSectionHeaders(updated);

                              // Also synchronize related navbar menu!
                              let matchedMenu = null;
                              const updatedNav = navMenus.map(m => {
                                if (getRelatedSectionKey(m) === cfg.key) {
                                  matchedMenu = m;
                                  return { ...m, visible: updatedVisible };
                                }
                                return m;
                              });

                              if (matchedMenu) {
                                setNavMenus(updatedNav);
                                await saveNavMenus(updatedNav);
                                showNotification(
                                  `Section "${cfg.name}" and navbar menu "${matchedMenu.label}" are now ${updatedVisible ? 'visible' : 'hidden'} on the website.`
                                );
                              } else {
                                showNotification(`Section "${cfg.name}" is now ${updatedVisible ? 'visible' : 'hidden'} on the website.`);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all shadow-sm ${
                              (secData.visible !== false && !isSectionHiddenByMenu(cfg.key, navMenus))
                                ? 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border-emerald-500/40'
                                : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border-rose-500/40'
                            }`}
                            title={(secData.visible !== false && !isSectionHiddenByMenu(cfg.key, navMenus)) ? "Click to hide this entire section on the live website" : "Click to display this section on the live website"}
                          >
                            {(secData.visible !== false && !isSectionHiddenByMenu(cfg.key, navMenus)) ? (
                              <>
                                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Visible on Site</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                                <span>Hidden on Site</span>
                              </>
                            )}
                          </button>

                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => handleResetSingleSectionHeader(cfg.key, cfg.name)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-stone-300 border border-slate-700 flex items-center gap-1.5 transition-all"
                              title="Reset this section to factory default copy"
                            >
                              <RotateCcw className="w-3 h-3 text-amber-400" />
                              <span>Revert</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSaveSingleHeaderSection(cfg.key, cfg.name)}
                            disabled={isSavingHeaders}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Section</span>
                          </button>
                        </div>
                      </div>

                      {/* Main Grid: Form Inputs (Left) & Real-time Live Preview (Right) */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left Side: Inputs */}
                        <div className="lg:col-span-7 space-y-4">
                          {/* Eyebrow Input */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs font-semibold text-slate-200">
                                Eyebrow Tag / Category Badge
                              </label>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Uppercase luxury label
                              </span>
                            </div>
                            <input
                              type="text"
                              value={currentEyebrow}
                              onChange={(e) => handleHeaderFieldChange(cfg.key, 'eyebrow', e.target.value)}
                              placeholder={`e.g. ${cfg.defaultEyebrow}`}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm font-medium focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-600"
                            />
                          </div>

                          {/* Title Input */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs font-semibold text-slate-200">
                                Main Section Headline / Title
                              </label>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Serif display headline
                              </span>
                            </div>
                            <input
                              type="text"
                              value={currentTitle}
                              onChange={(e) => handleHeaderFieldChange(cfg.key, 'title', e.target.value)}
                              placeholder={`e.g. ${cfg.defaultTitle}`}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm font-serif font-semibold focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-600"
                            />
                          </div>

                          {/* For Reviews: Rating inputs & Star Rating Editor */}
                          {cfg.isReview && (
                            <div className="space-y-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                                    Rating Score
                                  </label>
                                  <input
                                    type="text"
                                    value={currentRatingScore}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      handleHeaderFieldChange(cfg.key, 'ratingScore', val);
                                      const parsed = parseFloat(val);
                                      if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 5 && secData.stars === undefined) {
                                        handleHeaderFieldChange(cfg.key, 'stars', parsed);
                                      }
                                    }}
                                    placeholder="4.98 / 5.0"
                                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold focus:outline-none focus:border-amber-400"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                                    Verified Reviews Count
                                  </label>
                                  <input
                                    type="text"
                                    value={currentRatingCount}
                                    onChange={(e) => handleHeaderFieldChange(cfg.key, 'ratingCount', e.target.value)}
                                    placeholder="(420+ Verified Residencies)"
                                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                                  />
                                </div>
                              </div>

                              {/* Interactive Star Rating Selector */}
                              <div className="pt-3 border-t border-slate-800/80">
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                                    <span>Star Rating Display</span>
                                    <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                                      {currentStars} / 5 Stars
                                    </span>
                                  </label>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    Click stars to select
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                  {/* Interactive 5-star clickable row */}
                                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
                                    {[1, 2, 3, 4, 5].map((starNum) => {
                                      const isFilled = starNum <= Math.floor(currentStars);
                                      const isHalf = !isFilled && starNum <= Math.ceil(currentStars) && currentStars % 1 !== 0;

                                      return (
                                        <button
                                          key={starNum}
                                          type="button"
                                          onClick={() => handleHeaderFieldChange(cfg.key, 'stars', starNum)}
                                          className="p-1 hover:scale-125 active:scale-95 transition-all cursor-pointer group"
                                          title={`Set to ${starNum} star${starNum > 1 ? 's' : ''}`}
                                        >
                                          <Star 
                                            className={`w-6 h-6 transition-colors ${
                                              isFilled 
                                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
                                                : isHalf
                                                  ? 'text-amber-400 fill-amber-400/50'
                                                  : 'text-slate-600 fill-slate-800 group-hover:text-amber-400/50'
                                            }`}
                                          />
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {/* Quick Preset Buttons */}
                                  <div className="flex items-center gap-1.5">
                                    {[5, 4.5, 4, 3, 2, 1].map((sVal) => (
                                      <button
                                        key={sVal}
                                        type="button"
                                        onClick={() => handleHeaderFieldChange(cfg.key, 'stars', sVal)}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                                          currentStars === sVal
                                            ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                                        }`}
                                      >
                                        {sVal}★
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Subtitle Textarea */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs font-semibold text-slate-200">
                                Section Introductory Narrative / Subtitle
                              </label>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Editorial summary paragraph
                              </span>
                            </div>
                            <textarea
                              rows={3}
                              value={currentSubtitle}
                              onChange={(e) => handleHeaderFieldChange(cfg.key, 'subtitle', e.target.value)}
                              placeholder={`e.g. ${cfg.defaultSubtitle}`}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs leading-relaxed focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all placeholder:text-slate-600 resize-y"
                            />
                          </div>

                          {/* Contact Section Special Element Editors */}
                          {cfg.isLocation && (
                            <div className="space-y-4 pt-3 border-t border-slate-800">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Compass className="w-4 h-4 text-amber-400" />
                                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                                    Contact & Concierge Elements
                                  </span>
                                </div>
                                <span className="text-[10px] text-amber-300 font-mono bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                                  All Cards, Arrival & Form
                                </span>
                              </div>

                              {/* Sub-tab selection bar */}
                              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium">
                                <button
                                  type="button"
                                  onClick={() => setContactSubTab('contact')}
                                  className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                                    contactSubTab === 'contact'
                                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                  }`}
                                >
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span className="truncate">1. Contact Cards</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setContactSubTab('arrival')}
                                  className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                                    contactSubTab === 'arrival'
                                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                  }`}
                                >
                                  <Plane className="w-3.5 h-3.5" />
                                  <span className="truncate">2. Arrival Badges</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setContactSubTab('form')}
                                  className={`py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                                    contactSubTab === 'form'
                                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                  }`}
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span className="truncate">3. Concierge Form</span>
                                </button>
                              </div>

                              {/* SUB-PANEL 1: CONTACT CARDS & TIMINGS */}
                              {contactSubTab === 'contact' && (
                                <div className="space-y-4 p-4 rounded-xl bg-slate-900/70 border border-slate-800 animate-fade-in text-xs">
                                  {/* Item 1: Address */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-800/60">
                                    <div>
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                        Address Card Headline
                                      </label>
                                      <input
                                        type="text"
                                        value={addressTitle}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'addressTitle', e.target.value)}
                                        placeholder="Resort Sanctuary Address"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                        Resort Physical Location
                                      </label>
                                      <input
                                        type="text"
                                        value={addressValue}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'addressValue', e.target.value)}
                                        placeholder="Your Location"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                  </div>

                                  {/* Item 2: Phone */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-800/60">
                                    <div>
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                        Concierge Phone Headline
                                      </label>
                                      <input
                                        type="text"
                                        value={phoneTitle}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'phoneTitle', e.target.value)}
                                        placeholder="24/7 Royal Concierge"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                        Concierge Phone Number
                                      </label>
                                      <input
                                        type="text"
                                        value={phoneValue}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'phoneValue', e.target.value)}
                                        placeholder="+250 788 000 000"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                  </div>

                                  {/* Item 3: Email */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-800/60">
                                    <div>
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                        Email Card Headline
                                      </label>
                                      <input
                                        type="text"
                                        value={emailTitle}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'emailTitle', e.target.value)}
                                        placeholder="Direct Inquiries"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                        Direct Contact Email
                                      </label>
                                      <input
                                        type="email"
                                        value={emailValue}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'emailValue', e.target.value)}
                                        placeholder="youremail@yourdomain.rw"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                  </div>

                                  {/* Item 4: Check-in & Check-out */}
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="sm:col-span-1">
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                        Hours Headline
                                      </label>
                                      <input
                                        type="text"
                                        value={checkInCheckOutTitle}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'checkInCheckOutTitle', e.target.value)}
                                        placeholder="Check-in / Check-out Times"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                        Check-in Time
                                      </label>
                                      <input
                                        type="text"
                                        value={checkInTime}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'checkInTime', e.target.value)}
                                        placeholder="15:00"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                        Check-out Time
                                      </label>
                                      <input
                                        type="text"
                                        value={checkOutTime}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'checkOutTime', e.target.value)}
                                        placeholder="11:00"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* SUB-PANEL 2: ARRIVAL OPTIONS BADGES */}
                              {contactSubTab === 'arrival' && (
                                <div className="space-y-4 p-4 rounded-xl bg-slate-900/70 border border-slate-800 animate-fade-in text-xs">
                                  {/* Helipad */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-800/60">
                                    <div>
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                                        <Plane className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Arrival Option 1 Title</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={arrivalOption1Title}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'arrivalOption1Title', e.target.value)}
                                        placeholder="Private Helipad"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                        Coordinates / Transfer Specs
                                      </label>
                                      <input
                                        type="text"
                                        value={arrivalOption1Subtitle}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'arrivalOption1Subtitle', e.target.value)}
                                        placeholder="Coordinates: 41°08'N 9°32'E"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                  </div>

                                  {/* Deepwater Berth */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                                        <Compass className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Arrival Option 2 Title</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={arrivalOption2Title}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'arrivalOption2Title', e.target.value)}
                                        placeholder="Deepwater Berth"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                        Berth Capacity / Details
                                      </label>
                                      <input
                                        type="text"
                                        value={arrivalOption2Subtitle}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'arrivalOption2Subtitle', e.target.value)}
                                        placeholder="Accommodates yachts up to 65m"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* SUB-PANEL 3: CONCIERGE INQUIRY FORM */}
                              {contactSubTab === 'form' && (
                                <div className="space-y-4 p-4 rounded-xl bg-slate-900/70 border border-slate-800 animate-fade-in text-xs">
                                  <div>
                                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                      Form Main Headline
                                    </label>
                                    <input
                                      type="text"
                                      value={formTitle}
                                      onChange={(e) => handleHeaderFieldChange(cfg.key, 'formTitle', e.target.value)}
                                      placeholder="Speak with the Royal Concierge"
                                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-serif font-bold text-sm focus:outline-none focus:border-amber-400"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                      Form Subtitle / Response Commitment
                                    </label>
                                    <textarea
                                      rows={2}
                                      value={formSubtitle}
                                      onChange={(e) => handleHeaderFieldChange(cfg.key, 'formSubtitle', e.target.value)}
                                      placeholder="Have specific travel requirements, yacht charter inquiries, or bespoke dining requests? Our concierge team will respond within 60 minutes."
                                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 resize-y"
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
                                    <div>
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                        Name Field Label
                                      </label>
                                      <input
                                        type="text"
                                        value={fieldNameLabel}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'fieldNameLabel', e.target.value)}
                                        placeholder="Your Full Name"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                        Name Field Placeholder
                                      </label>
                                      <input
                                        type="text"
                                        value={fieldNamePlaceholder}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'fieldNamePlaceholder', e.target.value)}
                                        placeholder="e.g. Lady Vivienne Montgomery"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                        Email Field Label
                                      </label>
                                      <input
                                        type="text"
                                        value={fieldEmailLabel}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'fieldEmailLabel', e.target.value)}
                                        placeholder="Email Address"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                        Email Field Placeholder
                                      </label>
                                      <input
                                        type="text"
                                        value={fieldEmailPlaceholder}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'fieldEmailPlaceholder', e.target.value)}
                                        placeholder="name@domain.com"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                        Inquiry Message Label
                                      </label>
                                      <input
                                        type="text"
                                        value={fieldMessageLabel}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'fieldMessageLabel', e.target.value)}
                                        placeholder="Bespoke Request or Inquiry"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                        Inquiry Message Placeholder
                                      </label>
                                      <input
                                        type="text"
                                        value={fieldMessagePlaceholder}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'fieldMessagePlaceholder', e.target.value)}
                                        placeholder="Tell us about your upcoming stay, private event, dietary restrictions, or transport needs..."
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/60">
                                    <div>
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                        Submit Button Text
                                      </label>
                                      <input
                                        type="text"
                                        value={buttonText}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'buttonText', e.target.value)}
                                        placeholder="Transmit Inquiry to Concierge"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                        Success Alert Title
                                      </label>
                                      <input
                                        type="text"
                                        value={successTitle}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'successTitle', e.target.value)}
                                        placeholder="Inquiry Received"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                        Success Alert Message
                                      </label>
                                      <input
                                        type="text"
                                        value={successMessage}
                                        onChange={(e) => handleHeaderFieldChange(cfg.key, 'successMessage', e.target.value)}
                                        placeholder="Thank you! Our head concierge has received your request..."
                                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Right Side: Live Website Preview */}
                        <div className="lg:col-span-5">
                          <div className="rounded-xl p-5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-500/20 shadow-inner relative flex flex-col justify-between min-h-[220px]">
                            {/* Live Preview Header Pill */}
                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                              <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                <span>Guest View Preview</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                                {cfg.anchor}
                              </span>
                            </div>

                            {/* Section Header Live Preview Content */}
                            <div className="space-y-2.5">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-semibold">
                                  {currentEyebrow || 'Section Eyebrow'}
                                </span>
                              </div>

                              <h3 className="text-xl md:text-2xl font-serif text-white tracking-wide leading-tight font-normal">
                                {currentTitle || 'Section Headline'}
                              </h3>

                              {cfg.isReview && (
                                <div className="flex items-center gap-3 py-1">
                                  <div className="flex text-amber-400 gap-0.5 items-center">
                                    {[1, 2, 3, 4, 5].map((starIndex) => {
                                      const isFilled = starIndex <= Math.floor(currentStars);
                                      const isHalf = !isFilled && starIndex <= Math.ceil(currentStars) && currentStars % 1 !== 0;
                                      return (
                                        <Star 
                                          key={starIndex} 
                                          className={`w-4 h-4 ${
                                            isFilled 
                                              ? 'text-amber-400 fill-amber-400' 
                                              : isHalf
                                                ? 'text-amber-400 fill-amber-400/50'
                                                : 'text-slate-700 fill-slate-800'
                                          }`} 
                                        />
                                      );
                                    })}
                                  </div>
                                  <span className="text-xs font-mono font-bold text-amber-300">
                                    {currentRatingScore}
                                  </span>
                                  <span className="text-xs text-slate-400 font-mono">
                                    {currentRatingCount}
                                  </span>
                                </div>
                              )}

                              <p className="text-xs text-stone-300 font-light leading-relaxed max-w-md pt-1">
                                {currentSubtitle || 'Section introductory copy text goes here...'}
                              </p>

                              {/* Special Location & Concierge Preview Card */}
                              {cfg.isLocation && (
                                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5">
                                  {/* Contact Cards Preview */}
                                  <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5 text-[11px]">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                      <span className="font-bold text-white truncate">{addressTitle}:</span>
                                      <span className="text-slate-400 truncate">{addressValue}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                      <span className="font-bold text-white truncate">{phoneTitle}:</span>
                                      <span className="text-amber-300 font-mono text-[10px]">{phoneValue}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                      <span className="font-bold text-white truncate">{emailTitle}:</span>
                                      <span className="text-slate-400 text-[10px] truncate">{emailValue}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                      <span className="text-slate-300 text-[10px]">
                                        {checkInCheckOutTitle}: In {checkInTime} • Out {checkOutTime}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Arrival Badges Preview */}
                                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-1.5">
                                      <Plane className="w-3 h-3 text-amber-400 shrink-0" />
                                      <div className="min-w-0">
                                        <span className="font-bold text-white block truncate">{arrivalOption1Title}</span>
                                        <span className="text-slate-400 block truncate font-mono text-[9px]">{arrivalOption1Subtitle}</span>
                                      </div>
                                    </div>
                                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-1.5">
                                      <Compass className="w-3 h-3 text-amber-400 shrink-0" />
                                      <div className="min-w-0">
                                        <span className="font-bold text-white block truncate">{arrivalOption2Title}</span>
                                        <span className="text-slate-400 block truncate text-[9px]">{arrivalOption2Subtitle}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Inquiry Form Preview Card */}
                                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                                    <span className="font-serif font-bold text-white block truncate">{formTitle}</span>
                                    <p className="text-slate-400 text-[10px] line-clamp-1">{formSubtitle}</p>
                                    <div className="pt-1 flex items-center justify-between gap-2">
                                      <span className="text-[9px] font-mono text-slate-500 uppercase truncate">
                                        {fieldNameLabel} • {fieldEmailLabel}
                                      </span>
                                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[9px] flex items-center gap-1 shadow-sm shrink-0">
                                        <Send className="w-2.5 h-2.5" />
                                        <span>{buttonText}</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Footer helper */}
                            <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                              <span>Synced to Firestore</span>
                              <span className="text-emerald-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Live Reactive
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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

              {/* Hero Showcase Canvas & Background Backdrop Studio */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                        Section Canvas & Backdrop
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {themeForm.heroImage ? 'Custom Photo Backdrop' : 'Solid Luxury Canvas'}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white font-serif flex items-center gap-2">
                      <Images className="w-4 h-4 text-amber-400" />
                      <span>Hero Section Background</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Set the background photo or luxury color that sits behind the hero slider, right-side cards, and availability bar.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveHeroBackground}
                      disabled={!isSuperAdmin}
                      className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                      style={{ backgroundColor: 'var(--color-secondary)' }}
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Background</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Background Controls (8 cols) */}
                  <div className="lg:col-span-8 space-y-5">
                    
                    {/* 1. Background Photo Upload & URL */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-white flex items-center gap-2">
                          <span>Hero Background Photo</span>
                          {themeForm.heroImage && (
                            <span className="text-[10px] font-mono text-emerald-400">● Active</span>
                          )}
                        </label>
                        {themeForm.heroImage && isSuperAdmin && (
                          <button
                            type="button"
                            onClick={async () => {
                              setThemeForm(prev => ({ ...prev, heroImage: '' }));
                              await updateTheme({ heroImage: '' });
                              showNotification("Background photo cleared. Now using solid background color.");
                            }}
                            className="text-[10px] text-rose-400 hover:text-rose-300 font-mono transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove Photo (Use Color Only)</span>
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* Direct File Upload Button */}
                        <label className={`px-4 py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          uploadingHeroBg
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 cursor-wait'
                            : 'bg-slate-800 hover:bg-slate-700 text-stone-200 border-slate-700 hover:border-amber-400/40'
                        }`}>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingHeroBg || !isSuperAdmin}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleHeroBgUpload(file);
                            }}
                          />
                          <Upload className="w-4 h-4 text-amber-400" />
                          <span>{uploadingHeroBg ? `Uploading ${heroBgUploadProgress}%...` : 'Upload Photo'}</span>
                        </label>

                        {/* Or URL input */}
                        <div className="flex-1 relative">
                          <input
                            type="url"
                            value={themeForm.heroImage}
                            onChange={(e) => {
                              const val = e.target.value;
                              setThemeForm(prev => ({ ...prev, heroImage: val }));
                              updateTheme({ heroImage: val });
                            }}
                            placeholder="Or paste image URL (https://images.unsplash.com/...)"
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
                          />
                        </div>
                      </div>

                      {/* Photo Preset Recommendations */}
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] text-slate-500 font-mono block mb-1.5">Curated Luxury Backdrops:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                          {[
                            { name: 'Mediterranean Estate', url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80' },
                            { name: 'Cliffside Infinity Pool', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=80' },
                            { name: 'Sunset Ocean Terrace', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80' },
                            { name: 'Alpine Botanical Haven', url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2000&q=80' }
                          ].map((rec) => (
                            <button
                              key={rec.name}
                              type="button"
                              onClick={async () => {
                                setThemeForm(prev => ({ ...prev, heroImage: rec.url }));
                                await updateTheme({ heroImage: rec.url });
                                showNotification(`Background set to "${rec.name}"!`);
                              }}
                              className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-stone-300 text-left truncate transition-all"
                            >
                              {rec.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 2. Darkness Overlay Opacity & Blur Sliders */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Darkness Overlay */}
                      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-white">Darkness Overlay</label>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {Math.round((themeForm.heroOverlayOpacity !== undefined ? Number(themeForm.heroOverlayOpacity) : 0.65) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="0.95"
                          step="0.05"
                          value={themeForm.heroOverlayOpacity !== undefined ? Number(themeForm.heroOverlayOpacity) : 0.65}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setThemeForm(prev => ({ ...prev, heroOverlayOpacity: val }));
                            updateTheme({ heroOverlayOpacity: val });
                          }}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-400">
                          {themeForm.heroOverlayOpacity >= 0.65 ? 'Optimal contrast for white text & cards' : 'Lighter backdrop (photo more visible)'}
                        </p>
                      </div>

                      {/* Backdrop Blur */}
                      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-white">Backdrop Softness / Blur</label>
                          <span className="text-xs font-mono text-slate-400">
                            {(themeForm.heroBgBlur || 0) === 0 ? 'Sharp (0px)' : `${themeForm.heroBgBlur}px`}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          {[
                            { label: 'Sharp', val: 0 },
                            { label: 'Subtle', val: 3 },
                            { label: 'Soft', val: 8 }
                          ].map((opt) => (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() => {
                                setThemeForm(prev => ({ ...prev, heroBgBlur: opt.val }));
                                updateTheme({ heroBgBlur: opt.val });
                              }}
                              className={`py-1.5 rounded-lg text-xs font-mono transition-all border ${
                                (themeForm.heroBgBlur || 0) === opt.val
                                  ? 'bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-sm'
                                  : 'bg-slate-950 text-slate-300 border-slate-700/80 hover:bg-slate-800'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 3. Solid Canvas / Fallback Color */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-semibold text-white">Canvas Color (Base / Fallback)</label>
                          <p className="text-[10px] text-slate-400">Color shown when no photo is set, or used as the overlay tint</p>
                        </div>
                        <span className="text-xs font-mono text-amber-300 font-bold">{themeForm.heroBgColor || '#020617'}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={themeForm.heroBgColor || '#020617'}
                          onChange={(e) => {
                            const color = e.target.value;
                            setThemeForm(prev => ({ ...prev, heroBgColor: color }));
                            updateTheme({ heroBgColor: color });
                          }}
                          className="w-10 h-10 rounded-xl cursor-pointer bg-slate-950 border border-slate-700 p-0.5 shrink-0"
                        />
                        <div className="flex-1 grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                          {[
                            { name: 'Slate', hex: '#020617' },
                            { name: 'Midnight', hex: '#0b132b' },
                            { name: 'Obsidian', hex: '#090d16' },
                            { name: 'Forest', hex: '#081b15' },
                            { name: 'Bordeaux', hex: '#1a0a10' },
                            { name: 'Espresso', hex: '#19120e' }
                          ].map((p) => (
                            <button
                              key={p.hex}
                              type="button"
                              onClick={() => {
                                setThemeForm(prev => ({ ...prev, heroBgColor: p.hex }));
                                updateTheme({ heroBgColor: p.hex });
                              }}
                              className={`p-1.5 rounded-lg border text-[10px] flex items-center gap-1.5 transition-all ${
                                (themeForm.heroBgColor || '#020617').toLowerCase() === p.hex.toLowerCase()
                                  ? 'border-amber-400 bg-slate-800 text-white'
                                  : 'border-slate-800 bg-slate-950 hover:bg-slate-800 text-stone-400'
                              }`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: p.hex }} />
                              <span className="truncate">{p.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Live In-Context Mini Preview (4 cols) */}
                  <div className="lg:col-span-4">
                    <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/20 shadow-xl space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Backdrop Preview</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">Live Reaction</span>
                      </div>

                      {/* Simulated Hero Section Window */}
                      <div 
                        className="h-48 rounded-xl overflow-hidden relative border border-white/10 flex flex-col justify-between p-3"
                        style={{ backgroundColor: themeForm.heroBgColor || '#020617' }}
                      >
                        {/* Background Image layer in preview */}
                        {themeForm.heroImage && (
                          <div 
                            className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                            style={{ 
                              backgroundImage: `url(${themeForm.heroImage})`,
                              filter: themeForm.heroBgBlur ? `blur(${themeForm.heroBgBlur}px)` : undefined
                            }}
                          />
                        )}

                        {/* Overlay layer in preview */}
                        <div 
                          className="absolute inset-0 transition-opacity"
                          style={{ 
                            backgroundColor: themeForm.heroBgColor || '#020617',
                            opacity: themeForm.heroImage ? (themeForm.heroOverlayOpacity !== undefined ? Number(themeForm.heroOverlayOpacity) : 0.65) : 0
                          }}
                        />

                        {/* Simulated Top Navbar */}
                        <div className="relative z-10 flex items-center justify-between pb-2 border-b border-white/10">
                          <span className="text-[9px] font-serif font-bold text-white tracking-wider">
                            {themeForm.hotelName || 'THE GRAND AURELIA'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[8px] font-bold text-slate-950 uppercase" style={{ backgroundColor: 'var(--color-secondary)' }}>
                            Book
                          </span>
                        </div>

                        {/* Simulated Slider & Right Card Layout */}
                        <div className="relative z-10 grid grid-cols-12 gap-2 my-auto">
                          <div className="col-span-8 h-16 rounded-lg bg-black/40 border border-white/20 flex items-center justify-center text-[8px] text-white/80 font-mono">
                            <span>Main Slide Showcase</span>
                          </div>
                          <div className="col-span-4 h-16 rounded-lg bg-slate-900/80 border border-white/20 p-1.5 flex flex-col justify-between">
                            <span className="text-[7px] text-amber-300 font-serif font-bold line-clamp-1">Luxury Suite</span>
                            <span className="w-full h-3 rounded bg-amber-400 text-[6px] font-bold text-slate-950 flex items-center justify-center uppercase">Reserve</span>
                          </div>
                        </div>

                        {/* Simulated Availability Bar */}
                        <div className="relative z-10 h-6 rounded-lg bg-slate-950/90 border border-white/20 px-2 flex items-center justify-between text-[7px] text-stone-300">
                          <span>Check-In / Out</span>
                          <span className="text-amber-400 font-bold">Search</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                        This preview simulates how your background photo, darkness overlay, and canvas color blend with the homepage hero.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

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

                        {/* Slide Headline, Inclusions & Destination Link Editor */}
                        <div className="lg:col-span-7 space-y-4 text-xs">
                          
                          {/* Headline Title */}
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

                          {/* Editorial Subtitle */}
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

                          {/* Bespoke Inclusions / Bullet Highlights Editor */}
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

                          {/* Slide Destination Link (Direct Link to Discover Article) */}
                          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-400/30 space-y-3">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-mono uppercase text-amber-300 font-semibold tracking-wider flex items-center gap-1.5">
                                  <Link2 className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Destination Link (Slider Links to Discover / Articles)</span>
                                </span>
                                <span className="text-[10px] text-amber-400/80 font-mono">
                                  Links directly to /discover
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Enter the destination URL or pick a Discover article from the dropdown to link this slide directly.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                              <div className="sm:col-span-7">
                                <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                                  Destination URL Link
                                </label>
                                <input
                                  type="text"
                                  disabled={!isSuperAdmin}
                                  value={slide.destinationLink || ''}
                                  placeholder="/discover?article=article-michelin-story"
                                  onChange={(e) => handleUpdateSlideField(slide.id, 'destinationLink', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-300 font-mono disabled:opacity-60 focus:outline-none focus:border-amber-400"
                                />
                              </div>

                              <div className="sm:col-span-5">
                                <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                                  Quick-Select Discover Article
                                </label>
                                <select
                                  disabled={!isSuperAdmin}
                                  value={slide.destinationLink || ''}
                                  onChange={(e) => handleUpdateSlideField(slide.id, 'destinationLink', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white disabled:opacity-60 focus:outline-none focus:border-amber-400"
                                >
                                  <option value="/discover">Overview: /discover</option>
                                  {articles.map((art) => (
                                    <option key={art.id} value={`/discover?article=${art.id}`}>
                                      {art.title.slice(0, 35)}...
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                              <div>
                                <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                                  Primary Button Label
                                </label>
                                <input
                                  type="text"
                                  disabled={!isSuperAdmin}
                                  value={slide.ctaLabel || ''}
                                  placeholder="e.g. Read Discover Story"
                                  onChange={(e) => handleUpdateSlideField(slide.id, 'ctaLabel', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white disabled:opacity-60 focus:outline-none focus:border-amber-400"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                                  Secondary Button Label & Target
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    disabled={!isSuperAdmin}
                                    value={slide.actionLabel || ''}
                                    placeholder="e.g. Explore More"
                                    onChange={(e) => handleUpdateSlideField(slide.id, 'actionLabel', e.target.value)}
                                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white disabled:opacity-60 focus:outline-none focus:border-amber-400"
                                  />
                                  <input
                                    type="text"
                                    disabled={!isSuperAdmin}
                                    value={slide.actionTarget || ''}
                                    placeholder="/discover or /#dining"
                                    onChange={(e) => handleUpdateSlideField(slide.id, 'actionTarget', e.target.value)}
                                    className="w-32 bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs text-stone-300 font-mono disabled:opacity-60 focus:outline-none focus:border-amber-400"
                                  />
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
                    <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Active Navigation Menu Roster ({navMenus.length} Items)
                        </span>
                      </div>
                      
                      {/* Filter Pills: All, Visible, Hidden */}
                      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setNavMenuFilter('all')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            navMenuFilter === 'all'
                              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          All ({navMenus.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setNavMenuFilter('visible')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            navMenuFilter === 'visible'
                              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                              : 'text-slate-400 hover:text-emerald-400'
                          }`}
                        >
                          Visible ({navMenus.filter(m => m.visible !== false).length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setNavMenuFilter('hidden')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            navMenuFilter === 'hidden'
                              ? 'bg-rose-500 text-white font-bold shadow-sm'
                              : 'text-slate-400 hover:text-rose-400'
                          }`}
                        >
                          Hidden ({navMenus.filter(m => m.visible === false).length})
                        </button>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-800/80">
                      {navMenus
                        .map((menu, originalIdx) => ({ menu, originalIdx }))
                        .filter(({ menu }) => {
                          if (navMenuFilter === 'visible') return menu.visible !== false;
                          if (navMenuFilter === 'hidden') return menu.visible === false;
                          return true;
                        })
                        .map(({ menu, originalIdx: idx }) => {
                          const isVisible = menu.visible !== false;
                          return (
                            <div 
                              key={menu.id}
                              className={`p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all ${
                                isVisible 
                                  ? 'bg-slate-950/40 hover:bg-slate-900/30' 
                                  : 'bg-slate-950/90 border-l-4 border-l-rose-500/80 opacity-75 hover:opacity-100'
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
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold flex items-center gap-1.5 ${
                                    isVisible 
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' 
                                      : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isVisible ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                    {isVisible ? 'Visible in Navbar' : 'Hidden from Navbar'}
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
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 shadow-sm ${
                                    isVisible
                                      ? 'bg-slate-800 text-stone-200 hover:bg-slate-700 hover:text-white border-slate-700'
                                      : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 hover:text-emerald-100 border-emerald-500/40'
                                  }`}
                                  title={isVisible ? 'Click to hide this menu from the website navbar' : 'Click to show this menu on the website navbar'}
                                >
                                  {isVisible ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                                  <span>{isVisible ? 'Hide Menu' : 'Show Menu'}</span>
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
                          );
                        })}

                      {navMenus.filter(m => {
                        if (navMenuFilter === 'visible') return m.visible !== false;
                        if (navMenuFilter === 'hidden') return m.visible === false;
                        return true;
                      }).length === 0 && (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          No navigation items match the <span className="font-semibold text-white">"{navMenuFilter}"</span> filter.
                        </div>
                      )}
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
                        {navMenus.filter(m => m.visible !== false).map(m => (
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

                  <form onSubmit={handleSaveArticleForm} noValidate className="space-y-5 text-xs">
                    
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

                      {/* Main Cover Image Display & Direct Input */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                        {articleFormData.coverImage ? (
                          <img 
                            src={articleFormData.coverImage} 
                            alt="Cover preview" 
                            className="w-16 h-12 object-cover rounded-lg border border-amber-400 shrink-0" 
                          />
                        ) : (
                          <div className="w-16 h-12 rounded-lg bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center text-[10px] text-slate-500 shrink-0">
                            No Cover
                          </div>
                        )}
                        <div className="flex-1 w-full min-w-0">
                          <label className="text-[10px] font-mono uppercase text-amber-300 font-semibold block mb-1">
                            Primary Cover Image URL
                          </label>
                          <input
                            type="text"
                            value={articleFormData.coverImage || ''}
                            placeholder="Primary cover photo URL (auto-set from gallery or paste custom URL)"
                            onChange={(e) => setArticleFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-400 font-mono text-xs"
                          />
                        </div>
                      </div>

                      {/* Add Photo by Direct URL */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newPhotoUrlInput}
                          placeholder="Or paste high-resolution photo URL (https://images.unsplash.com/...)"
                          onChange={(e) => setNewPhotoUrlInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPhotoUrl(); }}}
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddPhotoUrl}
                          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-stone-200 font-semibold text-xs border border-slate-700 shrink-0"
                        >
                          Add URL
                        </button>
                      </div>

                      {/* Photo Grid Preview & Reorder/Delete */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                        {(articleFormData.photos || []).map((photoUrl, pIdx) => {
                          const isCover = (articleFormData.coverImage || articleFormData.photos[0]) === photoUrl;
                          return (
                            <div 
                              key={pIdx} 
                              className={`relative aspect-video rounded-xl overflow-hidden border bg-slate-950 group transition-all ${
                                isCover ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-slate-700'
                              }`}
                            >
                              <img
                                src={photoUrl}
                                alt={`Photo ${pIdx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/80 text-amber-300">
                                #{pIdx + 1}
                              </div>

                              {/* Primary Cover Badge / Selector */}
                              {isCover ? (
                                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-amber-400 text-slate-950 shadow-md">
                                  Primary Cover
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setArticleFormData(prev => ({ ...prev, coverImage: photoUrl }))}
                                  className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-mono bg-black/80 hover:bg-amber-400 hover:text-slate-950 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Set as main cover photo"
                                >
                                  Make Cover
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveArticlePhoto(pIdx)}
                                className="absolute top-1 right-1 p-1 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove photo"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
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
                        disabled={isSavingArticle}
                        onClick={() => setIsAddingArticle(false)}
                        className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-stone-300 font-semibold text-xs transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingArticle}
                        className="px-6 py-2.5 rounded-xl text-slate-950 font-bold uppercase tracking-wider text-xs shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                        style={{ backgroundColor: 'var(--color-secondary)' }}
                      >
                        {isSavingArticle ? (
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>{isSavingArticle ? 'Saving Article...' : 'Save Article & Gallery'}</span>
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
              
              {/* Header with Search and Dual Filters */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 w-full lg:w-auto">
                  <div className="relative flex-1 lg:w-64">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search guest, folio code, or table..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Type Filter */}
                  <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setBookingTypeFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        bookingTypeFilter === 'all'
                          ? 'bg-amber-400 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All Folios ({bookings.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingTypeFilter('stay')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        bookingTypeFilter === 'stay'
                          ? 'bg-amber-400 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Suites & Villas
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingTypeFilter('dining')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        bookingTypeFilter === 'dining'
                          ? 'bg-amber-400 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Dining Tables
                    </button>
                  </div>

                  {/* Status Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
                    {['all', 'confirmed', 'checked in', 'completed', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setBookingFilter(status)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
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
              </div>

              {/* Bookings Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-4">Guest Information</th>
                        <th className="py-3 px-4">Reservation Category & Units</th>
                        <th className="py-3 px-4">Schedule / Dates</th>
                        <th className="py-3 px-4">Total Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {filteredBookings.map((b) => {
                        const isDining = b.bookingType === 'dining' || b.type === 'dining';
                        return (
                          <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-amber-300">
                              <span className="block">{b.id}</span>
                              <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] uppercase font-mono mt-0.5 ${
                                isDining ? 'bg-amber-950 text-amber-400 border border-amber-500/30' : 'bg-blue-950 text-blue-300 border border-blue-500/30'
                              }`}>
                                {isDining ? 'Dining' : 'Stay'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-white block">{b.guestName}</span>
                              <span className="text-[11px] text-slate-400">{b.guestEmail}</span>
                            </td>
                            <td className="py-3.5 px-4 font-medium">
                              {isDining ? (
                                <div>
                                  <span className="font-semibold text-white block">{b.venueName}</span>
                                  <span className="text-[11px] text-amber-300 font-mono">
                                    Table {b.tableNumber} • {b.tableName}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block truncate">{b.tableLocation}</span>
                                </div>
                              ) : (
                                <div>
                                  <span className="font-semibold text-white block">{b.roomName}</span>
                                  <span className="text-[11px] text-amber-300 font-semibold">
                                    {b.quantity || 1} {b.quantity === 1 ? 'Suite' : 'Suites'} Reserved
                                  </span>
                                  <span className="text-[10px] text-slate-400 block truncate">{b.roomLocation}</span>
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {isDining ? (
                                <div>
                                  <span className="block font-medium text-white">{b.date} at {b.timeSlot}</span>
                                  <span className="text-[10px] text-slate-400">{b.guests} guests</span>
                                </div>
                              ) : (
                                <div>
                                  <span className="block font-medium text-white">{b.checkIn} → {b.checkOut}</span>
                                  <span className="text-[10px] text-slate-400">{b.nights} nights • {b.guests} guests</span>
                                </div>
                              )}
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
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-stone-200 text-[11px] font-semibold transition-all cursor-pointer"
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
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
                        quantity: 2,
                        location: 'North Cliffside Wing — Oceanfront Promontory',
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
                        
                        <div className="pt-1 flex items-center gap-1.5 text-[11px] text-amber-300">
                          <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate">{room.location || "North Cliffside Wing — Oceanfront Promontory"}</span>
                        </div>

                        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{room.size}</span>
                          <span>•</span>
                          <span>{room.guests} Guests</span>
                          <span>•</span>
                          <span className="text-amber-400 font-semibold">{room.quantity || 2} Units Inventory</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            disabled={!isSuperAdmin}
                            value={room.price}
                            onChange={(e) => isSuperAdmin && updateRoom({ ...room, price: Number(e.target.value) })}
                            className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white disabled:opacity-60"
                            title={isSuperAdmin ? "Instant price editor" : "Price editing locked to Super Admin"}
                          />
                          <span className="text-[10px] text-slate-500">Rate</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={1}
                            disabled={!isSuperAdmin}
                            value={room.quantity || 2}
                            onChange={(e) => isSuperAdmin && updateRoom({ ...room, quantity: Math.max(1, Number(e.target.value)) })}
                            className="w-12 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white disabled:opacity-60"
                            title={isSuperAdmin ? "Instant inventory units editor" : "Inventory editing locked to Super Admin"}
                          />
                          <span className="text-[10px] text-slate-500">Units</span>
                        </div>
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
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    {selectedBookingDetail.bookingType === 'dining' ? 'Dining Venue & Table' : 'Suite & Quantity'}
                  </span>
                  <strong className="text-white text-sm block mt-0.5">
                    {selectedBookingDetail.bookingType === 'dining' 
                      ? `${selectedBookingDetail.venueName} • Table ${selectedBookingDetail.tableNumber}` 
                      : `${selectedBookingDetail.roomName} (${selectedBookingDetail.quantity || 1} Suite${(selectedBookingDetail.quantity || 1) > 1 ? 's' : ''})`}
                  </strong>
                  <span className="font-mono text-sm text-amber-400 font-bold block mt-0.5">
                    {theme.currency}{selectedBookingDetail.totalAmount}
                  </span>
                  <span className="text-stone-400 text-[11px] block">Status: <strong className="text-white">{selectedBookingDetail.status}</strong></span>
                </div>
              </div>

              {selectedBookingDetail.bookingType === 'dining' ? (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Table & Venue Location</span>
                  <p className="text-stone-200 font-medium">
                    Table {selectedBookingDetail.tableNumber} ({selectedBookingDetail.tableName}) • <em>{selectedBookingDetail.tableLocation}</em>
                  </p>
                  <p className="text-[11px] text-amber-300">
                    Seating: <strong>{selectedBookingDetail.date} at {selectedBookingDetail.timeSlot}</strong> • {selectedBookingDetail.guests} Guests
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Stay Duration & Location</span>
                  <span className="text-stone-200 font-medium block">
                    {selectedBookingDetail.checkIn} to {selectedBookingDetail.checkOut} ({selectedBookingDetail.nights} nights • {selectedBookingDetail.guests} guests)
                  </span>
                  {selectedBookingDetail.roomLocation && (
                    <span className="text-[11px] text-amber-300 block">
                      <strong>Resort Location:</strong> {selectedBookingDetail.roomLocation}
                    </span>
                  )}
                </div>
              )}

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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Total Inventory Units (Quantity)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    disabled={!isSuperAdmin}
                    value={roomFormData.quantity || 2}
                    onChange={(e) => setRoomFormData({ ...roomFormData, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono disabled:opacity-60"
                    placeholder="e.g. 2"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Resort Wing & Location</label>
                  <input
                    type="text"
                    required
                    disabled={!isSuperAdmin}
                    value={roomFormData.location || ''}
                    onChange={(e) => setRoomFormData({ ...roomFormData, location: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white disabled:opacity-60"
                    placeholder="e.g. North Cliffside Wing — Oceanfront Promontory"
                  />
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

