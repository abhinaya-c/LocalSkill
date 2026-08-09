import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Calendar, 
  Plus, 
  Trash2, 
  Clock, 
  Award, 
  Settings, 
  Sparkles,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Image as ImageIcon,
  ShieldCheck
} from 'lucide-react';
import { apiFetch } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const ProviderDashboard: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);
  
  // Dashboard view state
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'slots' | 'wallet' | 'portfolio' | 'analytics' | 'profile'>('overview');
  
  // Provider details state
  const [providerId, setProviderId] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [latitude, setLatitude] = useState(28.2096);
  const [longitude, setLongitude] = useState(83.9856);
  const [verificationTier, setVerificationTier] = useState('UNVERIFIED');
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  
  // Listings state
  const [listings, setListings] = useState<any[]>([]);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [listingTitle, setListingTitle] = useState('');
  const [listingCategory, setListingCategory] = useState('Electrical');
  const [listingDesc, setListingDesc] = useState('');
  const [pricingModel, setPricingModel] = useState<'HOURLY' | 'FIXED'>('HOURLY');
  const [listingPrice, setListingPrice] = useState<number>(500);
  const [isSubmittingListing, setIsSubmittingListing] = useState(false);
  const [listingError, setListingError] = useState<string | null>(null);

  // Slots state
  const [slots, setSlots] = useState<any[]>([]);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotStart, setNewSlotStart] = useState('09:00');
  const [newSlotEnd, setNewSlotEnd] = useState('17:00');
  const [isSubmittingSlot, setIsSubmittingSlot] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  // Weekly Templated Slot Planner states
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Wednesday', 'Friday']);
  const [batchStart, setBatchStart] = useState('09:00');
  const [batchEnd, setBatchEnd] = useState('17:00');
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchMessage, setBatchMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Bookings queue state (Overview tab)
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  // Wallet states
  const [walletBalance, setWalletBalance] = useState<number>(24500);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('5000');
  const [withdrawMethod, setWithdrawMethod] = useState<string>('eSewa');
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Portfolio states
  const [portfolioProjects, setPortfolioProjects] = useState<any[]>([
    {
      id: '1',
      title: 'Complete Kitchen Pipe Replacement',
      category: 'Plumbing',
      beforeUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
      afterUrl: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: '2',
      title: 'LED Ceiling Ambient Lighting Set',
      category: 'Electrical',
      beforeUrl: 'https://images.unsplash.com/photo-1565538810844-1e119ba81b20?auto=format&fit=crop&w=400&q=80',
      afterUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80'
    }
  ]);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectCategory, setNewProjectCategory] = useState('Plumbing');
  const [newProjectBefore, setNewProjectBefore] = useState('');
  const [newProjectAfter, setNewProjectAfter] = useState('');
  
  // Loading & Saving states
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Categories helper
  const availableCategories = ['Electrical', 'Plumbing', 'Smart Home', 'Carpentry', 'Gardening', 'AC & Heating'];

  // Load Profile Details
  const loadProviderProfile = async () => {
    try {
      const data = await apiFetch('/api/profiles/me');
      if (data.providerProfile) {
        const profile = data.providerProfile;
        setProviderId(profile.id);
        setBio(profile.bio || '');
        setSkills(profile.skills || []);
        setContactInfo(profile.contactInfo || '');
        setLatitude(profile.latitude || 28.2096);
        setLongitude(profile.longitude || 83.9856);
        setVerificationTier(profile.verificationTier || 'UNVERIFIED');
        setAverageRating(profile.averageRating || 0);
        setReviewCount(profile.reviewCount || 0);
      }
    } catch (err) {
      console.error('Failed to load provider profile settings:', err);
    }
  };

  // Load Listings
  const loadProviderListings = async () => {
    setIsLoadingListings(true);
    try {
      const data = await apiFetch('/api/services/provider');
      setListings(data);
    } catch (err) {
      console.error('Failed to load service listings:', err);
    } finally {
      setIsLoadingListings(false);
    }
  };

  // Load Slots
  const loadProviderSlots = async () => {
    if (!providerId) return;
    setIsLoadingSlots(true);
    try {
      const data = await apiFetch(`/api/bookings/slots/provider/${providerId}?includeBooked=true`);
      setSlots(data);
    } catch (err) {
      console.error('Failed to load availability slots:', err);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Load Bookings
  const loadBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const data = await apiFetch('/api/bookings/provider');
      setBookings(data);
    } catch (err) {
      console.error('Failed to load provider bookings:', err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Load data sequentially
  useEffect(() => {
    loadProviderProfile();
    loadProviderListings();
    loadBookings();
  }, []);

  // Reload slots when providerId resolves
  useEffect(() => {
    if (providerId) {
      loadProviderSlots();
    }
  }, [providerId]);

  // Profile update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage(null);
    try {
      await apiFetch('/api/profiles/provider', {
        method: 'PUT',
        json: {
          bio,
          skills,
          contactInfo,
          latitude: parseFloat(latitude.toString()),
          longitude: parseFloat(longitude.toString()),
        },
      });
      setProfileMessage({ type: 'success', text: 'Business profile updated successfully!' });
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update business details.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Skills tag helpers
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Listing handlers
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingListing(true);
    setListingError(null);
    try {
      await apiFetch('/api/services', {
        method: 'POST',
        json: {
          title: listingTitle,
          category: listingCategory,
          description: listingDesc,
          pricingModel,
          price: parseFloat(listingPrice.toString()),
        },
      });
      setIsListingModalOpen(false);
      setListingTitle('');
      setListingDesc('');
      loadProviderListings();
    } catch (err: any) {
      setListingError(err.message || 'Failed to save listing.');
    } finally {
      setIsSubmittingListing(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing? All historical associations will remain in bookings.')) return;
    try {
      await apiFetch(`/api/services/${id}`, { method: 'DELETE' });
      loadProviderListings();
    } catch (err: any) {
      alert(err.message || 'Failed to delete listing.');
    }
  };

  // Slots handlers
  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotDate) {
      setSlotError('Please select a valid date.');
      return;
    }
    setIsSubmittingSlot(true);
    setSlotError(null);
    try {
      const startTime = new Date(`${newSlotDate}T${newSlotStart}:00`);
      const endTime = new Date(`${newSlotDate}T${newSlotEnd}:00`);
      
      if (startTime >= endTime) {
        throw new Error('Start time must be strictly before End time.');
      }

      await apiFetch('/api/bookings/slots', {
        method: 'POST',
        json: {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        },
      });
      
      setNewSlotDate('');
      loadProviderSlots();
    } catch (err: any) {
      setSlotError(err.message || 'Failed to register availability slot.');
    } finally {
      setIsSubmittingSlot(false);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this availability slot?')) return;
    try {
      await apiFetch(`/api/bookings/slots/${id}`, { method: 'DELETE' });
      loadProviderSlots();
    } catch (err: any) {
      alert(err.message || 'Failed to delete slot. Booked slots cannot be deleted.');
    }
  };

  // Accept/Decline bookings inside Overview Tab
  const handleBookingAction = async (id: string, action: 'accept' | 'decline') => {
    try {
      const endpoint = action === 'accept' ? `/api/bookings/${id}/accept` : `/api/bookings/${id}/decline`;
      await apiFetch(endpoint, { method: 'POST' });
      loadBookings();
      loadProviderSlots(); // reload slot status
    } catch (err: any) {
      alert(err.message || `Failed to ${action} booking.`);
    }
  };

  // Batch Availability Slot Creator
  const handleBatchGenerateSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      setBatchMessage({ type: 'error', text: 'Select at least one weekday.' });
      return;
    }
    setIsBatchGenerating(true);
    setBatchMessage(null);
    
    try {
      let generatedCount = 0;
      // Loop over next 7 days and match selected weekdays
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        
        if (selectedDays.includes(dayName)) {
          const dateStr = date.toISOString().split('T')[0];
          const startTime = new Date(`${dateStr}T${batchStart}:00`);
          const endTime = new Date(`${dateStr}T${batchEnd}:00`);
          
          await apiFetch('/api/bookings/slots', {
            method: 'POST',
            json: {
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
            },
          });
          generatedCount++;
        }
      }
      
      setBatchMessage({ type: 'success', text: `Successfully batch created ${generatedCount} availability slots!` });
      loadProviderSlots();
    } catch (err: any) {
      setBatchMessage({ type: 'error', text: err.message || 'Batch generation failed.' });
    } finally {
      setIsBatchGenerating(false);
    }
  };

  // Toggle day selection
  const handleToggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Simulate withdrawal
  const handleWithdrawFunds = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    setWithdrawError(null);
    setWithdrawSuccess(null);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawError('Please enter a valid amount.');
      return;
    }
    if (amountNum > walletBalance) {
      setWithdrawError('Insufficient funds in your studio wallet.');
      return;
    }

    setWalletBalance(prev => prev - amountNum);
    setWithdrawSuccess(`Success! Rs. ${amountNum.toLocaleString()} has been queued for transfer to your ${withdrawMethod} account.`);
    setTimeout(() => {
      setIsWithdrawModalOpen(false);
      setWithdrawSuccess(null);
    }, 4000);
  };

  // Add Portfolio item
  const handleAddPortfolioProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    
    const newProj = {
      id: Date.now().toString(),
      title: newProjectTitle,
      category: newProjectCategory,
      beforeUrl: newProjectBefore || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
      afterUrl: newProjectAfter || 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=400&q=80'
    };

    setPortfolioProjects([newProj, ...portfolioProjects]);
    setNewProjectTitle('');
    setNewProjectBefore('');
    setNewProjectAfter('');
    alert('Project showcase added successfully!');
  };

  // Get active queue length
  const pendingRequests = bookings.filter(b => b.status === 'REQUESTED');
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Top Header Studio Banner */}
      <div className="relative glass-royal border border-gold-royal/35 rounded-3xl p-6 md:p-8 mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img 
                src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
                alt={currentUser?.name}
                className="h-16 w-16 rounded-2xl object-cover border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
              />
              {verificationTier === 'VERIFIED' && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border border-slate-950">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2.5 mb-1.5">
                <Badge variant={verificationTier === 'VERIFIED' ? 'success' : 'warning'} className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider">
                  {verificationTier} Partner
                </Badge>
                {reviewCount > 0 ? (
                  <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1 bg-slate-950/40 px-2 py-0.5 rounded border border-slate-800">
                    ★ {averageRating.toFixed(1)} ({reviewCount} Reviews)
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 bg-slate-950/40 px-2 py-0.5 rounded border border-slate-800">
                    ★ New Provider
                  </span>
                )}
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white leading-tight">
                {currentUser?.name || 'Expert'}'s Provider Hub
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-md">
                {contactInfo || 'Pokhara, Nepal'} • Registered Specialist
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/50 p-2 rounded-2xl border border-slate-900 shrink-0">
            <div className="text-right px-3">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Studio Wallet</p>
              <p className="text-sm font-black text-emerald-400 mt-0.5">Rs. {walletBalance.toLocaleString()}</p>
            </div>
            <Button 
              size="sm" 
              variant="primary" 
              onClick={() => setIsWithdrawModalOpen(true)}
              className="font-bold text-[10px] uppercase px-3 py-1.5 h-auto rounded-xl"
            >
              Withdraw
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar Panel */}
        <div className="lg:col-span-3 flex flex-col gap-1.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-primary/10 border border-primary/20 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Activity className="h-4.5 w-4.5" />
              Overview & Queue
            </span>
            {pendingRequests.length > 0 && (
              <span className="h-5 w-5 text-[9px] font-bold bg-primary text-white rounded-full flex items-center justify-center animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'listings'
                ? 'bg-primary/10 border border-primary/20 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            <Briefcase className="h-4.5 w-4.5" />
            Service Offerings ({listings.length})
          </button>

          <button
            onClick={() => setActiveTab('slots')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'slots'
                ? 'bg-primary/10 border border-primary/20 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            <Calendar className="h-4.5 w-4.5" />
            Calendar & Scheduler
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'wallet'
                ? 'bg-primary/10 border border-primary/20 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            <DollarSign className="h-4.5 w-4.5" />
            Wallet & Earnings
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'portfolio'
                ? 'bg-primary/10 border border-primary/20 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            <ImageIcon className="h-4.5 w-4.5" />
            Portfolio Highlights
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-primary/10 border border-primary/20 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            <TrendingUp className="h-4.5 w-4.5" />
            Analytics Dashboard
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-primary/10 border border-primary/20 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            <Settings className="h-4.5 w-4.5" />
            Studio Profile Settings
          </button>
        </div>

        {/* Dashboard Tab Panels Content Area */}
        <div className="lg:col-span-9">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Stats Overview Panel */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-royal p-4 rounded-2xl border border-slate-900 space-y-1">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Listings</p>
                  <p className="text-xl font-extrabold text-white">{listings.length}</p>
                </div>
                <div className="glass-royal p-4 rounded-2xl border border-slate-900 space-y-1">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Pending Tasks</p>
                  <p className="text-xl font-extrabold text-white">{pendingRequests.length}</p>
                </div>
                <div className="glass-royal p-4 rounded-2xl border border-slate-900 space-y-1">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Active Bookings</p>
                  <p className="text-xl font-extrabold text-white">{confirmedBookings.length}</p>
                </div>
                <div className="glass-royal p-4 rounded-2xl border border-slate-900 space-y-1">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Average Rating</p>
                  <p className="text-xl font-extrabold text-amber-400">★ {averageRating.toFixed(1)}</p>
                </div>
              </div>

              {/* Booking Request Queue */}
              <div className="glass-royal rounded-3xl p-6 border border-slate-900 space-y-5">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-900/60">
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Client Request Queue</h2>
                    <p className="text-[10px] text-slate-500 mt-0.5">Respond instantly to confirm or reject new job request tickets.</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-950 border border-slate-850 px-2.5 py-1 rounded-full shrink-0">
                    {pendingRequests.length} Pending
                  </span>
                </div>

                {isLoadingBookings ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-primary" />
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No pending booking requests. All caught up!
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {pendingRequests.map((b) => (
                      <div 
                        key={b.id} 
                        className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-4 rounded-2xl bg-slate-950/40 border border-slate-900/80 hover:border-slate-850 transition-all"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-indigo-400 bg-indigo-950/30 border border-indigo-900/40 px-2 py-0.5 rounded">
                              {b.service?.category || 'Service Request'}
                            </span>
                            <span className="text-[9px] font-bold text-slate-500">ID: {b.id.substring(b.id.length - 8)}</span>
                          </div>
                          
                          <h4 className="text-sm font-bold text-white leading-tight">{b.service?.title}</h4>
                          
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span>Client:</span>
                            <img 
                              src={b.customer?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                              className="h-5 w-5 rounded-full object-cover" 
                            />
                            <span className="text-slate-200 font-bold">{b.customer?.name}</span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                            <span className="flex items-center gap-1 text-[11px] font-semibold">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              {new Date(b.slot?.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-semibold">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              {new Date(b.slot?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {b.notes && (
                            <p className="text-[11px] text-slate-500 italic bg-slate-950/80 p-2 rounded-lg border border-slate-900 mt-1.5">
                              "{b.notes}"
                            </p>
                          )}
                        </div>

                        <div className="flex md:flex-col items-stretch justify-center gap-2 shrink-0 border-t border-slate-900/60 pt-3 md:pt-0 md:border-t-0">
                          <div className="text-right hidden md:block mb-2">
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest">Client Bid</p>
                            <p className="text-sm font-extrabold text-white">Rs. {b.service?.price}</p>
                          </div>
                          
                          <div className="flex gap-2 w-full">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleBookingAction(b.id, 'decline')}
                              className="px-4 py-2 border-slate-800 hover:bg-rose-500/10 hover:text-rose-400 text-xs font-bold"
                            >
                              Decline
                            </Button>
                            <Button 
                              size="sm" 
                              variant="primary"
                              onClick={() => handleBookingAction(b.id, 'accept')}
                              className="px-5 py-2 text-xs font-bold"
                            >
                              Accept Job
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SERVICE OFFERINGS (LISTINGS) */}
          {activeTab === 'listings' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-400" /> Active Service Listings
                </h2>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsListingModalOpen(true)}
                  className="font-bold flex items-center gap-1 px-4"
                >
                  <Plus className="h-4 w-4" /> Create Listing
                </Button>
              </div>

              {isLoadingListings ? (
                <div className="flex items-center justify-center min-h-[30vh]">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500" />
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/10 border border-slate-800/40 rounded-3xl">
                  <Briefcase className="h-10 w-10 text-slate-650 mx-auto" />
                  <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mt-4">No Services Published</h3>
                  <p className="text-slate-500 text-xs mt-1">Publish services in catalog categories to allow customer booking requests.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((item) => (
                    <Card key={item.id} className="border border-slate-900 hover:border-emerald-500/25 transition-all flex flex-col h-full justify-between overflow-hidden bg-slate-950/20">
                      <CardBody className="p-5 flex flex-col justify-between flex-grow gap-4">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className="text-[9px] font-bold text-emerald-450 uppercase tracking-widest bg-emerald-950/40 border border-emerald-800/30 px-2 py-0.5 rounded-md">
                              {item.category}
                            </span>
                            <span className="text-xs font-bold text-emerald-400">
                              Rs. {item.price} {item.pricingModel === 'HOURLY' ? '/ hr' : 'fixed'}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-slate-200 text-sm leading-snug mb-2 truncate">
                            {item.title}
                          </h3>
                          <p className="text-[11px] text-slate-450 line-clamp-3 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-900/60 flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteListing(item.id)}
                            className="text-rose-450 hover:bg-rose-500/10 px-3 flex items-center gap-1.5 text-xs font-bold"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CALENDAR & SCHEDULER */}
          {activeTab === 'slots' && (
            <div className="space-y-8">
              
              {/* Single slot + Batch planner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Single Slot Creator */}
                <form onSubmit={handleCreateSlot} className="glass-royal rounded-3xl p-5 border border-slate-900 space-y-4">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-900">
                    <Plus className="h-4 w-4 text-emerald-500" /> Create Single Slot
                  </h3>

                  {slotError && (
                    <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg p-2.5 text-xs font-semibold">
                      {slotError}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Date</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={newSlotDate}
                        onChange={(e) => setNewSlotDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Start Time</label>
                        <input
                          type="time"
                          required
                          value={newSlotStart}
                          onChange={(e) => setNewSlotStart(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">End Time</label>
                        <input
                          type="time"
                          required
                          value={newSlotEnd}
                          onChange={(e) => setNewSlotEnd(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmittingSlot}
                    className="w-full font-bold py-2.5"
                  >
                    {isSubmittingSlot ? 'Creating Slot...' : 'Add Availability Slot'}
                  </Button>
                </form>

                {/* Batch Week Templating */}
                <form onSubmit={handleBatchGenerateSlots} className="glass-royal rounded-3xl p-5 border border-slate-900 space-y-4">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-900">
                    <Calendar className="h-4 w-4 text-emerald-500" /> Weekly Availability Template
                  </h3>

                  {batchMessage && (
                    <div className={`p-2.5 rounded-lg text-xs font-semibold border ${
                      batchMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}>
                      {batchMessage.text}
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Standard Workdays</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleToggleDay(day)}
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all border ${
                            selectedDays.includes(day)
                              ? 'bg-primary/20 border-primary text-white'
                              : 'bg-slate-900/60 border-slate-800 text-slate-500'
                          }`}
                        >
                          {day.substring(0, 3)}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Batch Start</label>
                        <input
                          type="time"
                          value={batchStart}
                          onChange={(e) => setBatchStart(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Batch End</label>
                        <input
                          type="time"
                          value={batchEnd}
                          onChange={(e) => setBatchEnd(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={isBatchGenerating}
                    className="w-full font-bold py-2.5 border-slate-850 hover:bg-slate-900"
                  >
                    {isBatchGenerating ? 'Generating...' : 'Batch Create Slots'}
                  </Button>
                </form>

              </div>

              {/* Slots Listing View */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Configured Availability Slots
                </h3>

                {isLoadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary" />
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-12 bg-slate-900/10 border border-slate-900 rounded-3xl text-slate-500 text-xs">
                    No availability slots registered. Create slots using the creators above.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-2.5">
                    {slots.map((slot) => {
                      const start = new Date(slot.startTime);
                      const end = new Date(slot.endTime);
                      return (
                        <div key={slot.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-900">
                          <div className="flex items-center gap-3">
                            <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${slot.isBooked ? 'bg-primary' : 'bg-emerald-500'}`} />
                            <div className="text-xs">
                              <p className="font-bold text-white">
                                {start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                              </p>
                              <p className="text-slate-400 mt-0.5">
                                {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant={slot.isBooked ? 'info' : 'success'} className="px-2 py-0.5 rounded text-[8px] font-bold">
                              {slot.isBooked ? 'Booked' : 'Available'}
                            </Badge>
                            {!slot.isBooked && (
                              <button
                                onClick={() => handleDeleteSlot(slot.id)}
                                className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                                title="Delete Slot"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: WALLET & EARNINGS */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              
              {/* Wallet Summary Card */}
              <div className="glass-royal rounded-3xl p-6 border border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950 border border-slate-850 px-3 py-1 rounded-full">Available Studio Balance</span>
                  <h3 className="text-3xl font-black text-white pt-2">Rs. {walletBalance.toLocaleString()}</h3>
                  <p className="text-[11px] text-slate-400">Zero commission platform. Keep 100% of your earnings.</p>
                </div>
                <Button 
                  onClick={() => setIsWithdrawModalOpen(true)}
                  variant="primary" 
                  className="font-bold w-full md:w-auto px-6 py-3"
                >
                  Withdraw Studio Funds
                </Button>
              </div>

              {/* Earnings Breakdown */}
              <div className="glass-royal rounded-3xl p-6 border border-slate-900 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Earnings Timeframe Performance</h4>
                  <p className="text-[10px] text-slate-550 mt-0.5">Summary of platform earnings aggregated by dates.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900/80">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Today</p>
                    <p className="text-base font-extrabold text-white mt-1">Rs. 1,500</p>
                    <span className="text-[8px] font-bold text-emerald-450 flex items-center gap-0.5 mt-1">
                      <ArrowUpRight className="h-3 w-3" /> +15% vs yesterday
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900/80">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">This Week</p>
                    <p className="text-base font-extrabold text-white mt-1">Rs. 8,200</p>
                    <span className="text-[8px] font-bold text-emerald-450 flex items-center gap-0.5 mt-1">
                      <ArrowUpRight className="h-3 w-3" /> +8% vs last week
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900/80">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">This Month</p>
                    <p className="text-base font-extrabold text-white mt-1">Rs. 24,500</p>
                    <span className="text-[8px] font-bold text-emerald-450 flex items-center gap-0.5 mt-1">
                      <ArrowUpRight className="h-3 w-3" /> +24% vs last month
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900/80">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">All-Time Revenue</p>
                    <p className="text-base font-extrabold text-white mt-1">Rs. 142,000</p>
                    <span className="text-[8px] font-bold text-slate-500 flex items-center gap-0.5 mt-1">
                      No service fees deducted
                    </span>
                  </div>
                </div>

                {/* Simulated Chart breakdown */}
                <div className="space-y-3">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue Allocation by Services</h5>
                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-300">Electrical Services</span>
                        <span className="text-white">Rs. 14,700 (60%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '60%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-300">Plumbing & Pipelines</span>
                        <span className="text-white">Rs. 9,800 (40%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: '40%' }} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: PORTFOLIO & CREDENTIALS */}
          {activeTab === 'portfolio' && (
            <div className="space-y-8">
              
              {/* Profile Credentials Verification block */}
              <div className="glass-royal rounded-3xl p-6 border border-slate-900 flex flex-col sm:flex-row items-center gap-5">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-450 shrink-0 shadow-lg">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-200">Licensing and Credentials Verification</h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Submit verified qualifications (e.g. electrical certificates, plumbing trade permits) to receive the verified partner badge. All uploads are audited by administrators.
                  </p>
                </div>
                <div className="w-full sm:w-auto shrink-0 mt-3 sm:mt-0">
                  <Button variant="outline" size="sm" className="w-full border-slate-800 hover:bg-slate-900 font-bold text-xs">
                    Upload License Document
                  </Button>
                </div>
              </div>

              {/* Add portfolio work card */}
              <form onSubmit={handleAddPortfolioProject} className="glass-royal rounded-3xl p-5 border border-slate-900 space-y-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-900">
                  <Plus className="h-4 w-4 text-emerald-500" /> Showcase Completed Task / Project
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Project Title</label>
                    <Input 
                      type="text" 
                      placeholder="e.g. Kitchen Water Line Rerouting" 
                      required
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                    <select 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 h-10"
                      value={newProjectCategory}
                      onChange={(e) => setNewProjectCategory(e.target.value)}
                    >
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Smart Home">Smart Home</option>
                      <option value="Carpentry">Carpentry</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Before Image URL</label>
                    <Input 
                      type="text" 
                      placeholder="https://unsplash.com/..." 
                      value={newProjectBefore}
                      onChange={(e) => setNewProjectBefore(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">After Image URL</label>
                    <Input 
                      type="text" 
                      placeholder="https://unsplash.com/..." 
                      value={newProjectAfter}
                      onChange={(e) => setNewProjectAfter(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="primary" size="sm" className="font-bold px-5">
                    Add Project to Showcase
                  </Button>
                </div>
              </form>

              {/* Showcase list */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Portfolio Project Highlights</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {portfolioProjects.map((p) => (
                    <div key={p.id} className="p-4 rounded-2xl bg-slate-950/40 border border-slate-900 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-white truncate max-w-[180px]">{p.title}</h4>
                        <span className="text-[8px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded">
                          {p.category}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider text-center">Before</p>
                          <img src={p.beforeUrl} className="h-28 w-full object-cover rounded-xl border border-slate-900" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider text-center">After</p>
                          <img src={p.afterUrl} className="h-28 w-full object-cover rounded-xl border border-slate-900" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: ANALYTICS HUB */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              {/* Top Row metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-royal p-4 rounded-2xl border border-slate-900 space-y-1 text-center">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Completion Rate</p>
                  <p className="text-xl font-extrabold text-white">96%</p>
                </div>
                <div className="glass-royal p-4 rounded-2xl border border-slate-900 space-y-1 text-center">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Repeat Customer Rate</p>
                  <p className="text-xl font-extrabold text-white">22%</p>
                </div>
                <div className="glass-royal p-4 rounded-2xl border border-slate-900 space-y-1 text-center">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Profile Views (30d)</p>
                  <p className="text-xl font-extrabold text-white">184</p>
                </div>
                <div className="glass-royal p-4 rounded-2xl border border-slate-900 space-y-1 text-center">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Avg Response Time</p>
                  <p className="text-xl font-extrabold text-emerald-400">12 min</p>
                </div>
              </div>

              {/* Booking completion graphs simulated */}
              <div className="glass-royal rounded-3xl p-6 border border-slate-900 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Weekly Bookings Completion Volume</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Overview of closed appointments per calendar week.</p>
                </div>

                <div className="flex items-end justify-between gap-2.5 h-36 px-4 pt-4 border-b border-slate-900">
                  <div className="flex flex-col items-center gap-2 w-1/5">
                    <div className="w-full bg-slate-900/60 rounded-t-lg h-12 relative flex items-end">
                      <div className="w-full bg-primary/40 rounded-t-lg h-[40%]" />
                    </div>
                    <span className="text-[9px] text-slate-500 font-semibold">Wk 28</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-1/5">
                    <div className="w-full bg-slate-900/60 rounded-t-lg h-24 relative flex items-end">
                      <div className="w-full bg-primary/60 rounded-t-lg h-[70%]" />
                    </div>
                    <span className="text-[9px] text-slate-500 font-semibold">Wk 29</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-1/5">
                    <div className="w-full bg-slate-900/60 rounded-t-lg h-28 relative flex items-end">
                      <div className="w-full bg-primary rounded-t-lg h-[90%]" />
                    </div>
                    <span className="text-[9px] text-slate-500 font-semibold">Wk 30</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-1/5">
                    <div className="w-full bg-slate-900/60 rounded-t-lg h-16 relative flex items-end">
                      <div className="w-full bg-primary/50 rounded-t-lg h-[55%]" />
                    </div>
                    <span className="text-[9px] text-slate-500 font-semibold">Wk 31</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-1/5">
                    <div className="w-full bg-slate-900/60 rounded-t-lg h-32 relative flex items-end animate-pulse">
                      <div className="w-full bg-primary rounded-t-lg h-full" />
                    </div>
                    <span className="text-[9px] text-slate-500 font-semibold">Current</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-950/60 border border-slate-900 rounded-2xl">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-xl">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-white">Performance Insights</h5>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Your bookings completion volume has increased by 18% this month due to updated slots templates. Keeping standard weekday hours helps customers book services directly.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <div className="lg:col-span-12">
              <form onSubmit={handleSaveProfile} className="glass-royal rounded-3xl p-6 md:p-8 border border-slate-900 space-y-6">
                <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-900/60 uppercase tracking-wider">
                  <Sparkles className="h-5 w-5 text-emerald-500" /> Business Profile & Geo-Coordinates
                </h2>

                {profileMessage && (
                  <div className={`p-4 rounded-xl border text-xs font-semibold ${
                    profileMessage.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                    {profileMessage.text}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bio text area */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">
                      Professional Bio
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe your skills, years of expertise, specialized categories, and typical responses..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-555 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all leading-relaxed"
                    />
                  </div>

                  {/* Contact info */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">
                      Contact Address / Local Directions
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Near Chipledhunga, Pokhara"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                    />
                  </div>

                  {/* Geo-coords */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-355 uppercase tracking-wider">
                        Latitude
                      </label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={latitude}
                        onChange={(e) => setLatitude(parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-355 uppercase tracking-wider">
                        Longitude
                      </label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={longitude}
                        onChange={(e) => setLongitude(parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Skills tags list */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">
                      Offered Skill Tags
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-900/40 border border-slate-850 rounded-xl min-h-[48px]">
                      {skills.length === 0 ? (
                        <span className="text-slate-500 text-xs self-center">No skill tags registered. Add below.</span>
                      ) : (
                        skills.map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-800/40 text-[9px] font-bold text-emerald-300">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(tag)}
                              className="text-emerald-400 hover:text-rose-450 transition-colors ml-1 font-bold text-xs"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                    
                    {/* Skill Tag form */}
                    <div className="flex gap-2 max-w-sm mt-2">
                      <input
                        type="text"
                        placeholder="e.g. Wiring, Leak repair"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="bg-slate-900 border border-slate-850 rounded-xl px-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 flex-grow"
                      />
                      <Button onClick={handleAddSkill} size="sm" type="button" className="px-4">
                        Add Tag
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-900/60 flex justify-end">
                  <Button type="submit" variant="primary" disabled={isSavingProfile} className="px-6 font-bold shadow-xl shadow-emerald-500/10">
                    {isSavingProfile ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* CREATE SERVICE LISTING MODAL */}
      <Modal
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
        title="Publish Service Listing"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsListingModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={handleCreateListing} isLoading={isSubmittingListing}>
              Publish Listing
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateListing} className="space-y-4">
          <p className="text-xs text-slate-400 leading-normal">
            Detail your pricing model, listing categories, and task limits to attract Pokhara client requests.
          </p>

          {listingError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg p-2.5 text-xs font-semibold">
              {listingError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service Title</label>
            <Input
              type="text"
              required
              placeholder="e.g. Professional Smart Home Installation"
              value={listingTitle}
              onChange={(e) => setListingTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
              <select
                value={listingCategory}
                onChange={(e) => setListingCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 h-10"
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pricing Model</label>
              <select
                value={pricingModel}
                onChange={(e) => setPricingModel(e.target.value as 'HOURLY' | 'FIXED')}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 h-10"
              >
                <option value="HOURLY">Hourly (Rs. / hr)</option>
                <option value="FIXED">Fixed (Rs. / job)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price (Rs.)</label>
            <Input
              type="number"
              required
              min={10}
              placeholder="e.g. 500"
              value={listingPrice}
              onChange={(e) => setListingPrice(parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
            <textarea
              rows={3}
              required
              placeholder="Provide a detailed description of what is included, tools used, and safety guarantees..."
              value={listingDesc}
              onChange={(e) => setListingDesc(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-555"
            />
          </div>
        </form>
      </Modal>

      {/* WALLET SIMULATED WITHDRAWAL MODAL */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Simulated Bank / digital Wallet Withdrawal"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsWithdrawModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={handleWithdrawFunds}>
              Confirm Withdrawal
            </Button>
          </div>
        }
      >
        <form onSubmit={handleWithdrawFunds} className="space-y-4">
          <p className="text-xs text-slate-400 leading-normal">
            Transfer direct funds from your LocalSkill studio wallet directly to Nepalese local accounts. No transaction service cut.
          </p>

          {withdrawError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-450 rounded-lg p-2.5 text-xs font-semibold">
              {withdrawError}
            </div>
          )}

          {withdrawSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-450 rounded-lg p-2.5 text-xs font-semibold">
              {withdrawSuccess}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Withdrawal Amount (Rs.)</label>
            <Input
              type="number"
              required
              min={100}
              placeholder="e.g. 5000"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <p className="text-[9px] text-slate-500 mt-1">Available balance: Rs. {walletBalance.toLocaleString()}</p>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Withdrawal Method</label>
            <select
              value={withdrawMethod}
              onChange={(e) => setWithdrawMethod(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 h-10"
            >
              <option value="eSewa">eSewa Mobile Wallet</option>
              <option value="Khalti">Khalti Digital Wallet</option>
              <option value="Nepal Bank Limited">Nepal Bank Limited (NBL)</option>
              <option value="Nabil Bank">Nabil Bank PLC</option>
            </select>
          </div>
        </form>
      </Modal>

    </div>
  );
};
