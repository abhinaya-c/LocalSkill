import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ShieldAlert, BadgeCheck, ShieldCheck, Mail, Calendar, Trash2, MessageSquare, PlusCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { apiFetch } from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

const categoriesList = ['Electrical', 'Plumbing', 'Smart Home', 'Carpentry', 'Gardening', 'AC & Heating'];

export const ProviderProfile: React.FC = () => {
  const { userId } = useParams();
  const currentUser = useAuthStore((state) => state.user);
  const { setActivePartner, setWidgetOpen } = useChatStore();

  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'services' | 'reviews' | 'availability' | 'credentials'>('services');
  const [isLoading, setIsLoading] = useState(true);

  // Booking Modal States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Provider Editing Form States
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({ title: '', category: 'Electrical', description: '', pricingModel: 'HOURLY', price: 20 });
  const [isCreatingService, setIsCreatingService] = useState(false);

  // Slots Form States
  const [slotStart, setSlotStart] = useState('');
  const [slotEnd, setSlotEnd] = useState('');
  const [isCreatingSlot, setIsCreatingSlot] = useState(false);

  // Verification & Portfolio Input States
  const [verificationDocUrl, setVerificationDocUrl] = useState('');
  const [portfolioItemUrl, setPortfolioItemUrl] = useState('');
  const [isSubmittingDocs, setIsSubmittingDocs] = useState(false);

  const isOwnProfile = currentUser?.id === userId;

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Profile
      const profileData = await apiFetch(`/api/profiles/provider/${userId}`);
      setProfile(profileData);

      // 2. Fetch Listings
      const listingsData = await apiFetch(`/api/services/search?category=`);
      const providerListings = listingsData.filter((l: any) => l.providerId === profileData.id);
      setListings(providerListings);

      // 3. Fetch Reviews
      const reviewsData = await apiFetch(`/api/reviews/provider/${profileData.id}`);
      setReviews(reviewsData);

      // 4. Fetch Slots
      const slotsData = await apiFetch(`/api/bookings/slots/provider/${profileData.id}?includeBooked=true`);
      setSlots(slotsData);

    } catch (err) {
      console.error('Failed to load profile details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  // Booking requests
  const handleOpenBookingModal = (slot: any) => {
    setSelectedSlot(slot);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !listings[0]) return;
    setIsSubmittingBooking(true);
    try {
      await apiFetch('/api/bookings', {
        method: 'POST',
        json: {
          serviceId: listings[0].id, // Automatically select their main/first listing
          slotId: selectedSlot.id,
          notes: bookingNotes,
        },
      });
      alert('Booking request submitted successfully!');
      setIsBookingModalOpen(false);
      setBookingNotes('');
      loadProfileData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit booking.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Add Service Listing
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingService(true);
    try {
      await apiFetch('/api/services', {
        method: 'POST',
        json: serviceForm,
      });
      setIsServiceModalOpen(false);
      loadProfileData();
    } catch (err: any) {
      alert(err.message || 'Failed to list service.');
    } finally {
      setIsCreatingService(false);
    }
  };

  // Delete Service
  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to remove this service listing?')) return;
    try {
      await apiFetch(`/api/services/${id}`, { method: 'DELETE' });
      loadProfileData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove service.');
    }
  };

  // Add Availability Slot
  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotStart || !slotEnd) return;
    setIsCreatingSlot(true);
    try {
      await apiFetch('/api/bookings/slots', {
        method: 'POST',
        json: {
          startTime: new Date(slotStart).toISOString(),
          endTime: new Date(slotEnd).toISOString(),
        },
      });
      setSlotStart('');
      setSlotEnd('');
      loadProfileData();
    } catch (err: any) {
      alert(err.message || 'Failed to create slot.');
    } finally {
      setIsCreatingSlot(false);
    }
  };

  // Delete Slot
  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Are you sure you want to remove this availability slot?')) return;
    try {
      await apiFetch(`/api/bookings/slots/${id}`, { method: 'DELETE' });
      loadProfileData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove slot.');
    }
  };

  // Chat redirect trigger
  const handleInitiateChat = () => {
    if (userId) {
      setActivePartner(userId);
      setWidgetOpen(true);
    }
  };

  // Verification document submit
  const handleVerificationDocs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationDocUrl) return;
    setIsSubmittingDocs(true);
    try {
      await apiFetch('/api/profiles/provider/verify', {
        method: 'POST',
        json: { documentUrls: [verificationDocUrl] },
      });
      alert('Verification documents uploaded. Pending review.');
      setVerificationDocUrl('');
      loadProfileData();
    } catch (err: any) {
      alert(err.message || 'Upload failed.');
    } finally {
      setIsSubmittingDocs(false);
    }
  };

  // Portfolio items submit
  const handlePortfolioItems = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioItemUrl) return;
    setIsSubmittingDocs(true);
    try {
      const updatedPortfolio = [...profile.portfolio, portfolioItemUrl];
      await apiFetch('/api/profiles/provider/portfolio', {
        method: 'POST',
        json: { portfolioUrls: updatedPortfolio },
      });
      alert('Portfolio successfully updated.');
      setPortfolioItemUrl('');
      loadProfileData();
    } catch (err: any) {
      alert(err.message || 'Portfolio update failed.');
    } finally {
      setIsSubmittingDocs(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-300">Profile Not Found</h2>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile Header Card */}
      <Card className="mb-8">
        <CardBody className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start justify-between">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left w-full">
            <img
              src={profile.user?.avatarUrl}
              alt={profile.user?.name}
              className="h-24 w-24 rounded-full object-cover border-2 border-indigo-500/20"
            />
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{profile.user?.name}</h1>
                <div className="flex gap-1.5 justify-center mt-1 md:mt-0">
                  {profile.verificationTier === 'VERIFIED' && (
                    <Badge variant="success" className="gap-1 flex items-center py-0.5">
                      <ShieldCheck className="h-3.5 w-3.5" /> Verified
                    </Badge>
                  )}
                  {profile.verificationTier === 'BASIC' && (
                    <Badge variant="info" className="gap-1 flex items-center py-0.5">
                      <BadgeCheck className="h-3.5 w-3.5" /> Basic Verified
                    </Badge>
                  )}
                  {profile.verificationTier === 'UNVERIFIED' && (
                    <Badge variant="secondary" className="gap-1 flex items-center py-0.5">
                      <ShieldAlert className="h-3.5 w-3.5" /> Unverified
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium flex items-center gap-1.5 justify-center md:justify-start">
                <Mail className="h-3.5 w-3.5 text-slate-500" /> {profile.user?.email}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-medium justify-center md:justify-start">
                📍 Coordinate location: Pokhara ({profile.latitude.toFixed(4)}, {profile.longitude.toFixed(4)})
              </p>
              <div className="flex items-center gap-1 mt-4 text-sm text-amber-400 font-bold justify-center md:justify-start">
                <Star className="h-4.5 w-4.5 fill-current" />
                {profile.averageRating > 0
                  ? `${profile.averageRating.toFixed(1)} rating (${profile.reviewCount} reviews)`
                  : 'New Provider'}
              </div>
            </div>
          </div>

          {!isOwnProfile && currentUser?.role === 'CUSTOMER' && (
            <Button className="flex items-center gap-2 w-full md:w-auto shadow-md" onClick={handleInitiateChat}>
              <MessageSquare className="h-4.5 w-4.5" /> Message Provider
            </Button>
          )}
        </CardBody>
      </Card>

      {/* Main Tabs Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="flex flex-col gap-2 bg-slate-900/40 border border-slate-800 p-4 rounded-xl h-fit">
          <button
            onClick={() => setActiveTab('services')}
            className={`w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider rounded-lg text-left transition-colors ${
              activeTab === 'services' ? 'bg-indigo-650/15 text-indigo-400 border border-indigo-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Service Listings ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider rounded-lg text-left transition-colors ${
              activeTab === 'reviews' ? 'bg-indigo-650/15 text-indigo-400 border border-indigo-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider rounded-lg text-left transition-colors ${
              activeTab === 'availability' ? 'bg-indigo-650/15 text-indigo-400 border border-indigo-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Availability Scheduler
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('credentials')}
              className={`w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider rounded-lg text-left transition-colors ${
                activeTab === 'credentials' ? 'bg-indigo-650/15 text-indigo-400 border border-indigo-500/25' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Verify Credentials
            </button>
          )}
        </div>

        {/* Tab Contents Pane */}
        <div className="lg:col-span-3">
          {/* 1. Services Tab */}
          {activeTab === 'services' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-white uppercase tracking-wider">Service Listings</h2>
                {isOwnProfile && (
                  <Button size="sm" className="flex items-center gap-1.5" onClick={() => setIsServiceModalOpen(true)}>
                    <PlusCircle className="h-4 w-4" /> Add Listing
                  </Button>
                )}
              </div>

              {listings.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/10 border border-slate-800/60 rounded-xl">
                  <p className="text-slate-500 text-xs">No active service listings found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {listings.map((l) => (
                    <Card key={l.id}>
                      <CardBody className="p-5 flex flex-col justify-between h-full gap-4">
                        <div>
                          <div className="flex justify-between items-start">
                            <Badge variant="primary">{l.category}</Badge>
                            {isOwnProfile && (
                              <button onClick={() => handleDeleteService(l.id)} className="text-slate-500 hover:text-rose-400 transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <h3 className="font-bold text-white text-base mt-2">{l.title}</h3>
                          <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">{l.description}</p>
                        </div>
                        <div className="border-t border-slate-800/80 pt-3 flex justify-between items-center">
                          <span className="text-slate-400 text-xs font-semibold">Pricing Structure</span>
                          <span className="text-sm font-extrabold text-white">
                            Rs. {l.price}/{l.pricingModel === 'HOURLY' ? 'hr' : 'fixed'}
                          </span>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="flex flex-col gap-6">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">Feedback & Reviews</h2>

              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/10 border border-slate-800/60 rounded-xl">
                  <p className="text-slate-500 text-xs">No reviews submitted yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {reviews.map((r) => (
                    <Card key={r.id}>
                      <CardBody className="p-5 flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-1">
                          <div className="flex items-center gap-2">
                            <img
                              src={r.customer?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                              alt={r.customer?.name}
                              className="h-7 w-7 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-200">{r.customer?.name || 'Anonymous Client'}</p>
                              <span className="text-[10px] text-slate-500">
                                Reviewed on {new Date(r.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 text-amber-400 text-xs font-bold">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            {r.rating.toFixed(1)}
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 leading-normal bg-slate-950/20 rounded-lg p-3 border border-slate-850/60">
                          "{r.comment}"
                        </p>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Availability Tab */}
          {activeTab === 'availability' && (
            <div className="flex flex-col gap-6">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">Appointment Scheduler</h2>

              {/* Provider availability creation form */}
              {isOwnProfile && (
                <Card className="mb-4">
                  <CardHeader className="py-3">
                    <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Add Open Time Slot</span>
                  </CardHeader>
                  <CardBody className="p-5">
                    <form onSubmit={handleCreateSlot} className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="flex-1 w-full">
                        <Input
                          type="datetime-local"
                          label="Start Time"
                          value={slotStart}
                          onChange={(e) => setSlotStart(e.target.value)}
                        />
                      </div>
                      <div className="flex-1 w-full">
                        <Input
                          type="datetime-local"
                          label="End Time"
                          value={slotEnd}
                          onChange={(e) => setSlotEnd(e.target.value)}
                        />
                      </div>
                      <Button type="submit" isLoading={isCreatingSlot} className="w-full sm:w-auto h-auto py-3">
                        Add Slot
                      </Button>
                    </form>
                  </CardBody>
                </Card>
              )}

              {/* Time Slots List */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Slots</span>
                {slots.length === 0 ? (
                  <div className="text-center py-12 bg-slate-900/10 border border-slate-800/60 rounded-xl">
                    <p className="text-slate-500 text-xs">No time slots allocated.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {slots.map((s) => (
                      <Card key={s.id} className={`${s.isBooked ? 'opacity-60 bg-slate-950/20' : ''}`}>
                        <CardBody className="p-4 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-indigo-400" />
                            <div>
                              <p className="text-xs font-bold text-slate-200">
                                {new Date(s.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                                {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>

                          {s.isBooked ? (
                            <Badge variant="secondary">Booked</Badge>
                          ) : isOwnProfile ? (
                            <button onClick={() => handleDeleteSlot(s.id)} className="text-slate-500 hover:text-rose-400 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : currentUser?.role === 'CUSTOMER' ? (
                            <Button size="sm" className="text-xs py-1.5" onClick={() => handleOpenBookingModal(s)}>
                              Book Slot
                            </Button>
                          ) : null}
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Credentials & Verification Tab */}
          {activeTab === 'credentials' && isOwnProfile && (
            <div className="flex flex-col gap-6">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">Professional Credentials</h2>

              {/* Bio & Skills Review */}
              <Card>
                <CardHeader className="py-3">
                  <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Professional Profile Bio</span>
                </CardHeader>
                <CardBody className="p-5 flex flex-col gap-3">
                  <p className="text-xs text-slate-400 leading-normal">
                    {profile.bio || 'Your bio is currently empty. Update it in profile settings.'}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Submit Verification Docs */}
              <Card>
                <CardHeader className="py-3">
                  <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Upload Verification Documents</span>
                </CardHeader>
                <CardBody className="p-5">
                  <form onSubmit={handleVerificationDocs} className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <Input
                        type="text"
                        label="Credentials URL"
                        placeholder="https://example.com/license.pdf"
                        value={verificationDocUrl}
                        onChange={(e) => setVerificationDocUrl(e.target.value)}
                      />
                    </div>
                    <Button type="submit" isLoading={isSubmittingDocs} className="w-full sm:w-auto h-auto py-3">
                      Submit Docs
                    </Button>
                  </form>
                  {profile.verificationDocs.length > 0 && (
                    <div className="mt-4 flex flex-col gap-1.5">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Submitted Credentials</span>
                      {profile.verificationDocs.map((doc: string) => (
                        <a key={doc} href={doc} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline line-clamp-1">
                          {doc}
                        </a>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Submit Portfolio Links */}
              <Card>
                <CardHeader className="py-3">
                  <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Manage Portfolio Gallery</span>
                </CardHeader>
                <CardBody className="p-5">
                  <form onSubmit={handlePortfolioItems} className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <Input
                        type="text"
                        label="Portfolio Image/Doc URL"
                        placeholder="https://images.unsplash.com/..."
                        value={portfolioItemUrl}
                        onChange={(e) => setPortfolioItemUrl(e.target.value)}
                      />
                    </div>
                    <Button type="submit" isLoading={isSubmittingDocs} className="w-full sm:w-auto h-auto py-3">
                      Add to Portfolio
                    </Button>
                  </form>
                  {profile.portfolio.length > 0 && (
                    <div className="mt-6">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-3">Portfolio Galleries</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {profile.portfolio.map((img: string) => (
                          <div key={img} className="relative rounded-lg overflow-hidden border border-slate-800 h-24">
                            <img src={img} alt="Portfolio Item" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Booking Confirmation Dialog (Customer) */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="Confirm Booking Appointment"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsBookingModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmBooking} isLoading={isSubmittingBooking}>
              Request Booking
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs text-slate-400 leading-normal">
            You are requesting a booking with <strong className="text-slate-200">{profile.user?.name}</strong>.
          </p>
          {selectedSlot && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Selected Slot</span>
              <p className="text-xs font-bold text-slate-300 mt-1">
                {new Date(selectedSlot.startTime).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                {new Date(selectedSlot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
          <Input
            type="text"
            label="Additional Notes / Tasks"
            placeholder="Describe the tasks you need completed..."
            value={bookingNotes}
            onChange={(e) => setBookingNotes(e.target.value)}
          />
        </div>
      </Modal>

      {/* Create Listing Modal (Provider) */}
      <Modal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        title="Create Service Listing"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsServiceModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateService} isLoading={isCreatingService}>
              Create Listing
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4">
          <Input
            type="text"
            label="Listing Title"
            placeholder="e.g. Electrical breaker repairs"
            value={serviceForm.title}
            onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
          />
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Category</label>
            <select
              value={serviceForm.category}
              onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <Input
            type="text"
            label="Listing Description"
            placeholder="Describe your qualifications, skills and tasks covered..."
            value={serviceForm.description}
            onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Pricing Model</label>
              <select
                value={serviceForm.pricingModel}
                onChange={(e) => setServiceForm({ ...serviceForm, pricingModel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="HOURLY">Hourly (Rs./hr)</option>
                <option value="FIXED">Fixed Rate (Rs.)</option>
              </select>
            </div>
            <Input
              type="number"
              label="Price (Rs.)"
              value={serviceForm.price}
              onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
