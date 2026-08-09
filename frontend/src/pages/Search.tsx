import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, MapPin, SlidersHorizontal, Star, Navigation, Filter, ShieldCheck, MessageSquare } from 'lucide-react';
import { apiFetch } from '../api/client';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';

export const Search: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') || '';

  const currentUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { setActivePartner, setWidgetOpen } = useChatStore();

  // Search filter states
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState(urlCategory);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [verificationTier, setVerificationTier] = useState('');
  
  // Geolocation states (default to Pokhara center)
  const [latitude, setLatitude] = useState<number | null>(28.2096);
  const [longitude, setLongitude] = useState<number | null>(83.9856);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const categoriesList = ['Electrical', 'Plumbing', 'Smart Home', 'Carpentry', 'Gardening', 'AC & Heating'];

  const categoryDescriptions: Record<string, { desc: string; icon: string; color: string }> = {
    'Electrical': {
      desc: 'Quality electrical inspections, smart home integrations, house wiring, and circuit board setups in Pokhara valley. (बिजुली मर्मत, वायरिङ, र उपकरण जडान)',
      icon: '⚡',
      color: 'from-amber-400 to-orange-500'
    },
    'Plumbing': {
      desc: 'Expert leak detections, emergency drainage cleanups, bathroom fittings, and pipe installations. (धारा मर्मत, पाइपलाइन जडान, र ढल निकास)',
      icon: '🚰',
      color: 'from-blue-400 to-sky-500'
    },
    'Smart Home': {
      desc: 'Setup and configuration of security cameras, smart locks, voice assistants, and Wi-Fi configurations. (स्मार्ट डोरबेल, क्यामेरा र गृह स्वचालितकरण)',
      icon: '🏠',
      color: 'from-indigo-400 to-violet-500'
    },
    'Carpentry': {
      desc: 'Custom wood carving, cabinet fixtures, modular kitchen setups, and structural carpentry. (काठका सामान मर्मत, फर्निचर डिजाइन र मर्मत)',
      icon: '🪵',
      color: 'from-yellow-500 to-amber-700'
    },
    'Gardening': {
      desc: 'Weekly lawn care, soil fertilizations, landscape architecture, organic pest control, and hedge trimmings. (बगैंचा हेरचाह, दुबो काट्ने, र वृक्षारोपण)',
      icon: '🌱',
      color: 'from-emerald-400 to-green-500'
    },
    'AC & Heating': {
      desc: 'Certified ventilation systems, deep duct sanitizations, air conditioner servicing, and thermostat setups. (एसी तथा हिटर मर्मत र सर्भिसिङ)',
      icon: '❄️',
      color: 'from-cyan-400 to-teal-500'
    }
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'Electrical': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Plumbing': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Smart Home': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'Carpentry': return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
      case 'Gardening': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'AC & Heating': return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (category) params.append('category', category);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minRating) params.append('minRating', minRating);
      if (verificationTier) params.append('verificationTier', verificationTier);
      
      // Inject geolocation coordinates
      if (latitude !== null) params.append('lat', String(latitude));
      if (longitude !== null) params.append('lng', String(longitude));

      const data = await apiFetch(`/api/services/search?${params.toString()}`);
      setListings(data);
    } catch (err) {
      console.error('Failed to search services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (urlCategory !== undefined) {
      setCategory(urlCategory);
    }
  }, [urlCategory]);

  useEffect(() => {
    fetchResults();
  }, [category, minRating, verificationTier, latitude, longitude]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults();
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Acquiring coordinates...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsLocating(false);
        setLocationStatus('Coordinates updated successfully.');
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Fallback to Pokhara
        setLatitude(28.2096);
        setLongitude(83.9856);
        setIsLocating(false);
        setLocationStatus('Unable to retrieve location. Defaulting to Pokhara.');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const clearFilters = () => {
    setKeyword('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setVerificationTier('');
    setLatitude(28.2096);
    setLongitude(83.9856);
    setLocationStatus(null);
    navigate('/search', { replace: true });
  };

  const getBestListingId = () => {
    if (!listings || listings.length === 0) return null;
    let best = listings[0];
    for (const l of listings) {
      const r1 = l.provider?.averageRating || 0;
      const r2 = best.provider?.averageRating || 0;
      if (r1 > r2) {
        best = l;
      } else if (r1 === r2 && l.provider?.verificationTier === 'VERIFIED') {
        best = l;
      }
    }
    return best.id;
  };
  const bestListingId = getBestListingId();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-gold-royal pb-6">
        <div>
          <span className="text-xs font-bold text-amber-450 uppercase tracking-widest bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">Discovery Portal</span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-2.5">Service Discovery</h1>
          <p className="text-slate-400 text-sm mt-1.5">Explore and book verified local professional experts matching your needs.</p>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-lg">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <Input
              type="text"
              placeholder="Search services (e.g. wire fix, pipe leaks...)"
              className="pl-11 py-3 w-full bg-slate-950 border-gold-royal text-slate-100 placeholder:text-slate-500 rounded-xl"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <Button type="submit" variant="royal" className="px-6 rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-800/30">Search</Button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar (Desktop) */}
        <div className="hidden lg:flex flex-col gap-6 bg-slate-950/60 border border-gold-royal p-6 rounded-xl h-fit">
          <div className="flex items-center justify-between border-b border-gold-royal pb-3">
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-amber-400" /> Filters
            </span>
            <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-slate-355 font-semibold">
              Clear All
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-gold-royal rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="" className="bg-slate-900 text-slate-200">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Filters */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Price Limits ($)</span>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                className="py-1.5 text-xs text-center"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span className="text-slate-600">-</span>
              <Input
                type="number"
                placeholder="Max"
                className="py-1.5 text-xs text-center"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Location radius */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location Proximity</span>
            <Button
              type="button"
              variant="outline"
              onClick={handleUseMyLocation}
              className="w-full flex items-center justify-center gap-2 text-xs border-gold-royal hover:bg-slate-900 h-auto py-2"
              isLoading={isLocating}
            >
              <Navigation className="h-3.5 w-3.5 text-amber-400" />
              Pin My Coordinates
            </Button>
            {locationStatus && (
              <span className="text-[10px] text-slate-500 font-medium leading-relaxed">{locationStatus}</span>
            )}
          </div>

          {/* Rating */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Min Rating Score</span>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full bg-slate-900 border border-gold-royal rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="" className="bg-slate-900 text-slate-200">Any Rating</option>
              <option value="4.5" className="bg-slate-900 text-slate-200">4.5★ & above</option>
              <option value="4.0" className="bg-slate-900 text-slate-200">4.0★ & above</option>
              <option value="3.5" className="bg-slate-900 text-slate-200">3.5★ & above</option>
            </select>
          </div>

          {/* Verification Tier */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verification Status</span>
            <select
              value={verificationTier}
              onChange={(e) => setVerificationTier(e.target.value)}
              className="w-full bg-slate-900 border border-gold-royal rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="" className="bg-slate-900 text-slate-200">Any Verification</option>
              <option value="VERIFIED" className="bg-slate-900 text-slate-200">Verified Badged Only</option>
              <option value="BASIC" className="bg-slate-900 text-slate-200">Basic Credentials</option>
            </select>
          </div>
        </div>

        {/* Results Listings Grid */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {category && categoryDescriptions[category] && (
            <div className="flex flex-col gap-4">
              <div className="relative group overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-r from-slate-900/60 to-indigo-950/20 backdrop-blur-xl p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/10 to-indigo-500/10 opacity-30 blur rounded-2xl" />
                <div className="relative text-3xl h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-450 shadow-lg shrink-0">
                  {categoryDescriptions[category].icon}
                </div>
                <div className="relative flex-grow min-w-0">
                  <h2 className="text-lg font-black text-white tracking-wide uppercase">{category} Services</h2>
                  <p className="text-slate-355 text-xs sm:text-sm mt-1.5 leading-relaxed">{categoryDescriptions[category].desc}</p>
                </div>
              </div>

              {/* Recommended Provider Highlighting Box */}
              {!isLoading && listings.length > 0 && (
                (() => {
                  const best = listings.reduce((prev, current) => {
                    const r1 = prev.provider?.averageRating || 0;
                    const r2 = current.provider?.averageRating || 0;
                    if (r2 > r1) return current;
                    if (r2 === r1 && current.provider?.verificationTier === 'VERIFIED') return current;
                    return prev;
                  }, listings[0]);

                  if (!best || !best.provider || best.provider.averageRating === 0) return null;

                  return (
                    <div className="relative group border border-amber-500/30 bg-amber-500/5 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 font-extrabold text-xs uppercase tracking-wider shrink-0 border border-amber-500/30 animate-pulse-slow">
                          ★ Recommended Expert
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-200">
                            We recommend booking <span className="text-amber-400 font-extrabold">{best.provider.user?.name}</span> (Rated {best.provider.averageRating.toFixed(1)}★ with {best.provider.reviewCount} reviews) based on local customer ratings.
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="gold"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/provider-profile/${best.provider?.userId}`);
                        }}
                        className="shrink-0 text-[11px] px-3.5 py-2 font-bold"
                      >
                        Book Best Option
                      </Button>
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* Mobile Filter Toggle */}
          <div className="flex lg:hidden justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse h-60">
                  <div className="bg-slate-800 h-32 w-full" />
                  <CardBody className="flex flex-col gap-3">
                    <div className="h-4 bg-slate-800 rounded w-2/3" />
                    <div className="h-3 bg-slate-800 rounded w-1/2" />
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20 bg-slate-950/40 border border-gold-royal rounded-xl">
              <span className="text-4xl">🔍</span>
              <h3 className="text-base font-semibold text-slate-200 uppercase tracking-wider mt-4">No Services Found</h3>
              <p className="text-slate-500 text-xs mt-1">Try adjusting your filters, location parameters, or keyword query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listings.map((item) => (
                <Card 
                  key={item.id} 
                  hoverable 
                  className="flex flex-col justify-between rounded-2xl border-gold-royal bg-slate-950/40 shadow-xl hover:border-amber-500/35 hover:shadow-amber-500/5 transition-all group cursor-pointer"
                  onClick={() => navigate(`/provider-profile/${item.provider?.userId}`)}
                >
                  <CardBody className="p-5 flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getCategoryBadgeClass(item.category)}`}>
                          {item.category}
                        </span>
                        {bestListingId === item.id && item.provider?.averageRating > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 border border-amber-400 shadow-md">
                            ★ Recommended
                          </span>
                        )}
                      </div>
                      <span className="text-lg font-extrabold text-white">
                        Rs. {item.price}
                        <span className="text-xs text-slate-500 font-normal">
                          /{item.pricingModel === 'HOURLY' ? 'hr' : 'job'}
                        </span>
                      </span>
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="text-base font-extrabold text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Proximity / Geolocation badge */}
                    {item.distance !== undefined && item.distance !== null && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5 w-fit">
                        <MapPin className="h-3 w-3 text-amber-400 animate-pulse" />
                        {item.distance} km away
                      </div>
                    )}
                  </CardBody>

                  {/* Provider footer bar */}
                  <div className="px-5 py-4 border-t border-gold-royal bg-slate-950/65 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img
                          src={item.provider?.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                          alt={item.provider?.user?.name}
                          className="h-8 w-8 rounded-full object-cover border border-gold-royal"
                        />
                        {item.provider?.verificationTier === 'VERIFIED' && (
                          <div className="absolute -bottom-1 -right-1 bg-amber-600 text-slate-950 rounded-full p-0.5 border border-slate-950 shadow-md">
                            <ShieldCheck className="h-2.5 w-2.5 text-slate-950" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-bold text-slate-200 line-clamp-1">{item.provider?.user?.name}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold mt-0.5">
                          <Star className="h-3 w-3 fill-current" />
                          {item.provider?.averageRating > 0
                            ? `${item.provider.averageRating.toFixed(1)} (${item.provider.reviewCount})`
                            : 'New Provider'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAuthenticated && currentUser?.role === 'CUSTOMER' && currentUser?.id !== item.provider?.userId && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs p-2.5 h-auto border-gold-royal text-slate-400 hover:text-white hover:border-amber-500/45 hover:bg-slate-900/60 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePartner(item.provider?.userId);
                            setWidgetOpen(true);
                          }}
                          title="Message Provider"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-gold-royal hover:bg-slate-900/60 hover:border-amber-500/40 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/provider-profile/${item.provider?.userId}`);
                        }}
                      >
                        Book Professional
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
