import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MessageCircle, Star } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { apiFetch } from '../api/client';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardBody } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

// ----------------------------------------------------
// STEP PROGRESS TRACKER COMPONENT
// ----------------------------------------------------
const BookingProgressBar: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="w-full mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold">
        This booking has been cancelled.
      </div>
    );
  }

  const steps = [
    { label: 'Requested', description: 'Awaiting provider approval' },
    { label: 'Confirmed', description: 'Provider approved task' },
    { label: 'In Progress', description: 'Service is underway' },
    { label: 'Completed', description: 'Service completed successfully' }
  ];

  let activeIndex = 0;
  if (status === 'REQUESTED') activeIndex = 0;
  else if (status === 'CONFIRMED') activeIndex = 2; // Confirmed & In Progress
  else if (status === 'COMPLETED') activeIndex = 3;

  return (
    <div className="w-full mt-4 bg-slate-950/40 border border-slate-900/60 rounded-xl p-4">
      <div className="relative flex justify-between items-start">
        {/* Connecting line */}
        <div className="absolute top-3 left-[12.5%] right-[12.5%] h-[2px] bg-slate-900 -z-0">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, idx) => {
          const isDone = activeIndex >= idx;
          const isCurrent = activeIndex === idx;

          return (
            <div key={idx} className="flex flex-col items-center text-center w-1/4 z-10">
              <div 
                className={`h-6 w-6 rounded-full flex items-center justify-center border text-[9px] font-bold transition-all duration-300 ${
                  isDone 
                    ? 'bg-primary border-primary text-white shadow-md shadow-primary/20 scale-105' 
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                } ${isCurrent ? 'ring-2 ring-primary/45 ring-offset-1 ring-offset-slate-950' : ''}`}
              >
                {isDone && idx < activeIndex ? '✓' : idx + 1}
              </div>
              <span className={`text-[9px] font-bold mt-1.5 ${isDone ? 'text-slate-200' : 'text-slate-550'}`}>
                {step.label}
              </span>
              <p className="text-[7px] text-slate-500 mt-0.5 leading-tight hidden sm:block max-w-[80px] mx-auto">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Bookings: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);
  const { setActivePartner, setWidgetOpen } = useChatStore();

  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal States
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      let data: any[] = [];
      if (currentUser?.role === 'CUSTOMER') {
        data = await apiFetch('/api/bookings/customer');
      } else if (currentUser?.role === 'PROVIDER') {
        data = await apiFetch('/api/bookings/provider');
      }
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadBookings();
    }
  }, [currentUser]);

  // Update Status
  const handleUpdateStatus = async (id: string, action: 'accept' | 'decline' | 'complete' | 'cancel') => {
    if (action === 'cancel' && !confirm('Are you sure you want to cancel this booking?')) return;
    try {
      let url = `/api/bookings/${id}/decline`;
      if (action === 'accept') url = `/api/bookings/${id}/accept`;
      if (action === 'complete') url = `/api/bookings/${id}/complete`;
      if (action === 'cancel') url = `/api/bookings/${id}/cancel`;

      await apiFetch(url, { method: 'POST' });
      loadBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to update booking status.');
    }
  };

  // Open Review Dialog
  const handleOpenReview = (bookingId: string) => {
    setReviewBookingId(bookingId);
    setReviewError(null);
    setIsReviewModalOpen(true);
  };

  // Submit Review
  const handleSubmitReview = async () => {
    if (!reviewBookingId) return;
    setIsSubmittingReview(true);
    setReviewError(null);
    try {
      await apiFetch('/api/reviews', {
        method: 'POST',
        json: {
          bookingId: reviewBookingId,
          rating,
          comment,
        },
      });
      alert('Thank you! Review submitted successfully.');
      setIsReviewModalOpen(false);
      setComment('');
      loadBookings();
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review. Review fraud checks failed.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return <Badge variant="warning">Pending Approval</Badge>;
      case 'CONFIRMED':
        return <Badge variant="info">Confirmed</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">Appointments & Bookings</h1>
        <p className="text-slate-400 text-xs mt-1">Review coordinates, service agreements, and slot statuses.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/10 border border-slate-800/60 rounded-xl">
          <CalendarIcon className="h-10 w-10 text-slate-650 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mt-4">No Bookings Yet</h3>
          <p className="text-slate-500 text-xs mt-1">All booking requests you coordinate will be listed here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {bookings.map((b) => {
            const isCustomer = currentUser?.role === 'CUSTOMER';
            const partnerName = isCustomer ? b.provider?.user?.name : b.customer?.name;
            const partnerAvatar = isCustomer ? b.provider?.user?.avatarUrl : b.customer?.avatarUrl;
            
            return (
              <Card key={b.id} className="border-l-4 border-l-primary overflow-hidden">
                <div className="flex flex-col">
                  <CardBody className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Left Section */}
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex justify-between md:justify-start items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Booking ID: {b.id.substring(b.id.length - 8)}
                        </span>
                        {getStatusBadge(b.status)}
                      </div>

                      <div>
                        <h3 className="font-extrabold text-white text-base">
                          {b.service?.title || 'Service Listing'}
                        </h3>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                          <span>Partner:</span>
                          <img src={partnerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} className="h-5 w-5 rounded-full object-cover" />
                          <span className="text-slate-200">{partnerName}</span>
                        </div>
                      </div>

                      {/* Schedule Time info */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4 text-primary" />
                          {new Date(b.slot?.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-primary" />
                          {new Date(b.slot?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(b.slot?.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {b.notes && (
                        <div className="text-xs text-slate-500 mt-1.5 bg-slate-950/20 rounded-lg p-2.5 border border-slate-850/60 leading-normal">
                          <strong>Client Notes:</strong> "{b.notes}"
                        </div>
                      )}
                    </div>

                    {/* Actions Section */}
                    <div className="flex items-center gap-2 flex-wrap md:flex-nowrap border-t border-slate-800 md:border-t-0 pt-4 md:pt-0">
                      {/* Send message link */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="p-2.5 h-auto border-slate-800 text-slate-400 hover:text-white"
                        onClick={() => {
                          setActivePartner(isCustomer ? b.provider?.userId : b.customerId);
                          setWidgetOpen(true);
                        }}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>

                      {/* Provider PENDING controls */}
                      {!isCustomer && b.status === 'REQUESTED' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(b.id, 'decline')}
                            className="border-slate-800 hover:bg-slate-850"
                          >
                            Decline
                          </Button>
                          <Button size="sm" variant="primary" onClick={() => handleUpdateStatus(b.id, 'accept')}>
                            Accept
                          </Button>
                        </>
                      )}

                      {/* Provider CONFIRMED controls */}
                      {!isCustomer && b.status === 'CONFIRMED' && (
                        <Button size="sm" variant="primary" onClick={() => handleUpdateStatus(b.id, 'complete')}>
                          Complete Service
                        </Button>
                      )}

                      {/* Customer COMPLETED controls (Leave Review) */}
                      {isCustomer && b.status === 'COMPLETED' && (
                        <Button size="sm" variant="primary" onClick={() => handleOpenReview(b.id)}>
                          Submit Review
                        </Button>
                      )}

                      {/* Cancel controls (PENDING or CONFIRMED) */}
                      {(b.status === 'REQUESTED' || b.status === 'CONFIRMED') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdateStatus(b.id, 'cancel')}
                          className="text-rose-450 hover:bg-rose-500/10"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardBody>
                  
                  {/* Step-by-step progress tracking */}
                  <div className="px-5 pb-5 border-t border-slate-900/40">
                    <BookingProgressBar status={b.status} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Modal Dialog */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Write Booking Review"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsReviewModalOpen(false)}>
              Close
            </Button>
            <Button size="sm" onClick={handleSubmitReview} isLoading={isSubmittingReview}>
              Submit Review
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs text-slate-400 leading-normal">
            Your feedback validates other users' choices. Ensure rating is accurate.
          </p>

          {reviewError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg p-2.5 text-xs font-semibold">
              {reviewError}
            </div>
          )}

          {/* Stars input */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rating Score</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl transition-transform active:scale-95"
                >
                  <Star className={`h-6 w-6 ${star <= rating ? 'text-amber-400 fill-current' : 'text-slate-700'}`} />
                </button>
              ))}
            </div>
          </div>

          <Input
            type="text"
            label="Comments"
            placeholder="Share your experience working with this provider..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
