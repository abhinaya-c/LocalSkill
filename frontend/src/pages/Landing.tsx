import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Briefcase, 
  Sparkles, 
  Search,
  Clock,
  MapPin,
  Star,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/useAuthStore';
import { apiFetch } from '../api/client';

// ----------------------------------------------------
// MAP PREVIEW COMPONENT
// ----------------------------------------------------
const MapPreview: React.FC = () => {
  return (
    <div className="relative glass-royal border border-gold-royal/35 rounded-3xl p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Pokhara Coverage Area</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Real-time coordinates verification</p>
        </div>
        <span className="text-[9px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono animate-pulse">
          12 Active Experts
        </span>
      </div>

      <div className="relative h-48 bg-slate-950/80 rounded-2xl border border-slate-900/60 overflow-hidden flex items-center justify-center">
        {/* Grid dots background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-35" />

        {/* Abstract lake representation */}
        <div className="absolute left-6 top-1/4 w-28 h-32 bg-blue-500/5 rounded-full filter blur-xl transform -rotate-12" />
        <div className="absolute left-10 top-1/3 w-20 h-24 bg-blue-900/15 rounded-full border border-blue-500/15 flex items-center justify-center transform rotate-6 select-none">
          <span className="text-[8px] text-blue-400 font-bold uppercase tracking-widest">Phewa Lake</span>
        </div>

        {/* Visual landmarks */}
        <div className="absolute right-12 top-10 border border-slate-800/80 bg-slate-900/40 rounded px-1.5 py-0.5 text-[8px] text-slate-500 font-bold">
          LAKESIDE WARD 6
        </div>
        <div className="absolute right-6 bottom-10 border border-slate-800/80 bg-slate-900/40 rounded px-1.5 py-0.5 text-[8px] text-slate-500 font-bold">
          CHIPLEDHUNGA
        </div>

        {/* Dynamic active expert pins */}
        <div className="absolute left-1/2 top-1/3 group cursor-pointer">
          <span className="absolute -inset-1.5 bg-emerald-500 rounded-full blur opacity-55 animate-ping" />
          <div className="relative h-3 w-3 rounded-full bg-emerald-500 border border-white" />
        </div>

        <div className="absolute right-1/3 top-1/2 group cursor-pointer">
          <span className="absolute -inset-1.5 bg-indigo-500 rounded-full blur opacity-55 animate-ping" />
          <div className="relative h-3 w-3 rounded-full bg-indigo-500 border border-white" />
        </div>

        <div className="absolute left-1/3 bottom-1/3 group cursor-pointer">
          <span className="absolute -inset-1.5 bg-amber-500 rounded-full blur opacity-55 animate-ping" />
          <div className="relative h-3 w-3 rounded-full bg-amber-500 border border-white" />
        </div>
      </div>
      <p className="text-[9px] text-slate-500 mt-2.5 text-center leading-normal">
        Your specific street address is secure and only shared once a booking request is accepted.
      </p>
    </div>
  );
};

// ----------------------------------------------------
// CUSTOMER LANDING PAGE / DISCOVERY FEED
// ----------------------------------------------------
const LandingCustomer: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [recommended, setRecommended] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Quick Autocomplete search suggestions
  const autocompletes = ['Electrician', 'Plumber', 'Carpenter', 'Tutor', 'Painter', 'Designer', 'Mechanic'];

  // Categories list (colorful cards with hover animations)
  const categories = [
    { displayName: '⚡ Electrician', name: 'Electrical', desc: 'Wiring, breaker panels', color: 'from-amber-400 to-orange-500', glow: 'shadow-orange-500/20' },
    { displayName: '🚰 Plumber', name: 'Plumbing', desc: 'Leaks, pipes, drains', color: 'from-blue-400 to-sky-500', glow: 'shadow-blue-500/20' },
    { displayName: '🧹 Cleaner', name: 'Gardening', desc: 'Cleaning, maintenance', color: 'from-emerald-400 to-green-500', glow: 'shadow-emerald-500/20' },
    { displayName: '🎨 Designer', name: 'Carpentry', desc: 'Furniture, woodwork', color: 'from-pink-500 to-rose-600', glow: 'shadow-rose-500/20' },
    { displayName: '💻 IT Support', name: 'Smart Home', desc: 'Wi-Fi, smart cameras', color: 'from-indigo-400 to-violet-500', glow: 'shadow-indigo-500/20' },
    { displayName: '📚 Tutor', name: 'AC & Heating', desc: 'Lessons, coaching classes', color: 'from-cyan-400 to-teal-500', glow: 'shadow-cyan-500/20' },
    { displayName: '🏠 Carpenter', name: 'Carpentry', desc: 'Woodwork, furniture repair', color: 'from-yellow-600 to-amber-800', glow: 'shadow-amber-600/20' },
    { displayName: '🚗 Mechanic', name: 'Automotive', desc: 'Car & bike repairs', color: 'from-red-400 to-rose-500', glow: 'shadow-red-500/20' },
  ];

  // Active providers list for live help right now
  const liveHelpProviders = [
    {
      name: 'Hari Shrestha',
      category: 'Electrical',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      eta: 'Arrives in ~20 min',
      distance: '0.8 km near Lakeside',
      role: 'Electrician',
      userId: 'provider-uuid-1111-2222-3333'
    },
    {
      name: 'Ramesh Vishwakarma',
      category: 'Carpentry',
      avatarUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=150&q=80',
      eta: 'Arrives in ~35 min',
      distance: '1.4 km near Chipledhunga',
      role: 'Carpenter',
      userId: 'provider-uuid-carpentry-7777'
    },
    {
      name: 'Nabina Adhikari',
      category: 'Gardening',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      eta: 'Arrives in ~25 min',
      distance: '1.1 km near Lakeside',
      role: 'Gardener',
      userId: 'provider-uuid-gardening-8888'
    }
  ];

  // FAQ list
  const faqs = [
    {
      q: 'How do bookings work?',
      a: 'Browse verified local specialists, check their real-time calendar availability, choose a slot that fits your schedule, and request a booking. Your provider coordinates all logistics directly with you via our secure live chat.'
    },
    {
      q: 'How are providers verified?',
      a: 'Our administration team manually audits all professional credentials, trade licenses, and identity documents submitted by specialists. Verified providers receive a gold badge indicating successful verification.'
    },
    {
      q: 'What payment methods are supported?',
      a: 'We support standard cash on delivery, bank transfers, and local digital wallet transfers (eSewa / Khalti) settled directly between customers and providers.'
    },
    {
      q: 'Can I cancel a booking?',
      a: 'Yes, both customers and providers can cancel bookings prior to the scheduled start time. We recommend coordinating via chat to ensure clear communication.'
    },
    {
      q: 'How do I become a provider?',
      a: 'Click "Become a Provider" in the navigation bar or Hero section, register an account, and fill out your service profile. Once approved, you can start listing services and accepting bookings immediately!'
    }
  ];

  useEffect(() => {
    const fetchRecommended = async () => {
      setIsLoadingProviders(true);
      try {
        const data = await apiFetch('/api/services/search?category=');
        if (Array.isArray(data)) {
          const sorted = data.sort((a: any, b: any) => {
            const r1 = a.provider?.averageRating || 0;
            const r2 = b.provider?.averageRating || 0;
            if (r1 !== r2) return r2 - r1;
            
            const tierA = a.provider?.verificationTier === 'VERIFIED' ? 2 : a.provider?.verificationTier === 'BASIC' ? 1 : 0;
            const tierB = b.provider?.verificationTier === 'VERIFIED' ? 2 : b.provider?.verificationTier === 'BASIC' ? 1 : 0;
            return tierB - tierA;
          });
          setRecommended(sorted.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load recommended providers:', err);
      } finally {
        setIsLoadingProviders(false);
      }
    };

    const fetchRecentBookings = async () => {
      if (!isAuthenticated) return;
      try {
        const data = await apiFetch('/api/bookings/customer');
        if (Array.isArray(data)) {
          setRecentBookings(data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load recent bookings:', err);
      }
    };

    fetchRecommended();
    fetchRecentBookings();
  }, [isAuthenticated]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchKeyword(tag);
    navigate(`/search?keyword=${encodeURIComponent(tag)}`);
  };

  const greetingMessage = user ? `Welcome back, ${user.name}` : 'Find Trusted Local Professionals Near You.';

  return (
    <div className="relative overflow-hidden min-h-screen flex flex-col justify-between">
      {/* Background glowing mesh */}
      <div className="absolute inset-0 z-0 bg-grid-royal opacity-30 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-700/10 to-indigo-650/0 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[550px] h-[550px] rounded-full bg-gradient-to-br from-amber-600/10 to-transparent blur-[115px] pointer-events-none" />

      <main className="flex-grow">
        
        {/* 1. HERO SECTION */}
        <section className="mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-pulse" /> Pokhara's #1 Skill Marketplace
              </span>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                {greetingMessage}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl">
                Book skilled electricians, plumbers, designers, tutors, cleaners and hundreds of other professionals within minutes.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" onClick={() => navigate('/search')} className="px-6 py-3 font-bold text-xs rounded-xl shadow-lg">
                  Find a Service
                </Button>
                <Button variant="outline" onClick={() => navigate('/auth?mode=register')} className="px-6 py-3 font-bold text-xs rounded-xl border-slate-800 hover:bg-slate-900/60">
                  Become a Provider
                </Button>
              </div>

              {/* Large Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative glass p-2 rounded-2xl border border-slate-850 flex flex-col sm:flex-row items-center gap-2 max-w-2xl shadow-2xl mt-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full bg-transparent text-slate-200 placeholder:text-slate-500 rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div className="h-4 w-px bg-slate-800 hidden sm:block" />
                <div className="flex items-center gap-1.5 px-3 py-2 w-full sm:w-auto text-xs text-slate-400">
                  <MapPin className="h-4 w-4 text-rose-500" />
                  <span className="font-semibold text-slate-300">Pokhara</span>
                </div>
                <Button type="submit" variant="primary" className="w-full sm:w-auto px-6 py-3 text-xs font-bold rounded-xl shadow-lg">
                  Search
                </Button>
              </form>

              {/* Quick Autocomplete Tags */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                <span className="font-bold">Popular:</span>
                {autocompletes.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className="px-2.5 py-1 bg-slate-900/60 border border-slate-850 rounded-lg hover:border-blue-500/30 hover:text-white transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero Right Column: Interactive Map Preview */}
            <div className="lg:col-span-5">
              <MapPreview />
            </div>

          </div>
        </section>

        {/* 2. NEED HELP RIGHT NOW SECTION */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-10 border-t border-slate-900/60">
          <div className="glass-royal border border-gold-royal/35 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 bg-gradient-to-r from-slate-950 via-slate-950/90 to-blue-950/20">
            
            {/* Left Block */}
            <div className="space-y-2 max-w-lg">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-black uppercase rounded-md animate-pulse">
                  Emergency Support
                </span>
                <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  🚨 Need Help Right Now?
                </h3>
              </div>
              <p className="text-xs text-slate-455 leading-relaxed">
                Connect with active professionals nearby with live availability enabled. Get responses within minutes.
              </p>
              
              {/* Quick emergency service buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button onClick={() => handleTagClick('Electrical')} className="px-3.5 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs font-semibold hover:border-amber-500/40 text-slate-200 hover:text-white transition-all flex items-center gap-1.5">
                  ⚡ Electrician
                </button>
                <button onClick={() => handleTagClick('Plumbing')} className="px-3.5 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs font-semibold hover:border-blue-500/40 text-slate-200 hover:text-white transition-all flex items-center gap-1.5">
                  🚰 Plumber
                </button>
                <button onClick={() => handleTagClick('Automotive')} className="px-3.5 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs font-semibold hover:border-red-500/40 text-slate-200 hover:text-white transition-all flex items-center gap-1.5">
                  🔧 Mechanic
                </button>
                <button onClick={() => handleTagClick('AC & Heating')} className="px-3.5 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs font-semibold hover:border-cyan-500/40 text-slate-200 hover:text-white transition-all flex items-center gap-1.5">
                  🩺 Home Nurse
                </button>
              </div>
            </div>

            {/* Right Block: Live active providers list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
              {liveHelpProviders.map(p => (
                <div key={p.name} className="p-4 bg-slate-950 border border-slate-900/80 rounded-2xl flex flex-col justify-between space-y-3 hover:border-rose-500/25 transition-all group">
                  <div className="flex items-center gap-2">
                    <img src={p.avatarUrl} alt={p.name} className="h-8 w-8 rounded-full border border-slate-800 object-cover shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-[11px] font-bold text-slate-200 truncate">{p.name}</h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                        <span className="text-[8px] text-emerald-450 font-bold uppercase tracking-wider truncate">Available Now</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-500 space-y-0.5">
                    <p className="flex items-center gap-1 text-slate-355">
                      <Clock className="h-3 w-3 text-rose-500 shrink-0" />
                      <span>{p.eta}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-600 shrink-0" />
                      <span>{p.distance}</span>
                    </p>
                  </div>
                  <Button size="sm" variant="primary" onClick={() => navigate(`/provider-profile/${p.userId}`)} className="text-[9px] py-1 h-auto font-black uppercase tracking-wider w-full">
                    Instant Book
                  </Button>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 3. RECENT CUSTOMER BOOKINGS (KEEP EXISTING FEATURE) */}
        {isAuthenticated && recentBookings.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-10">
            <div className="p-5 bg-blue-950/15 border border-blue-500/20 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400 animate-pulse" /> Track Recent Booking Actions
                </h3>
                <Link to="/bookings" className="text-[10px] text-blue-450 hover:underline font-bold">
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recentBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/45 border border-slate-905">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img 
                        src={b.provider?.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} 
                        alt={b.provider?.user?.name} 
                        className="h-8 w-8 rounded-full object-cover border border-slate-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-[11px] font-bold text-slate-250 truncate">{b.service?.title || 'Service Listing'}</h4>
                        <p className="text-[9px] text-slate-500 truncate">
                          {b.provider?.user?.name} • {new Date(b.slot?.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md shrink-0 ${
                      b.status === 'REQUESTED' ? 'bg-amber-500/10 text-amber-400' :
                      b.status === 'CONFIRMED' ? 'bg-blue-500/10 text-blue-400' :
                      b.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-450' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 4. POPULAR CATEGORIES */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10 border-t border-slate-900/40">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3.5 py-1 rounded-full border border-blue-500/20">Explore Services</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">Popular Categories</h2>
            <p className="text-slate-400 mt-2 text-xs sm:text-sm">Find verified local specialists across key service disciplines.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((c, i) => (
              <div
                key={c.name}
                onClick={() => navigate(`/search?category=${encodeURIComponent(c.name)}`)}
                className="bg-slate-900/30 backdrop-blur-md border border-slate-850 rounded-2xl p-5 hover:border-blue-500/30 hover:bg-slate-900/50 hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col justify-between h-32 shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <span className="text-2xl">{c.displayName.split(' ')[0]}</span>
                  <span className="text-[10px] text-slate-600 font-bold font-mono">0{i+1}</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-100 text-xs sm:text-sm group-hover:text-blue-400 transition-colors">
                    {c.displayName.split(' ').slice(1).join(' ')}
                  </h4>
                  <p className="text-[10px] text-slate-550 mt-0.5 leading-normal truncate">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button onClick={() => navigate('/search')} className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-all flex items-center gap-1 mx-auto">
              <span>➜ View All Services</span>
            </button>
          </div>
        </section>

        {/* 5. FEATURED PROVIDERS */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10 border-t border-slate-900/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3.5 py-1 rounded-full border border-blue-500/20">Top Specialists</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">Featured Professionals</h2>
              <p className="text-slate-400 mt-2 text-xs sm:text-sm">Vetted experts currently serving Lakeside, Chipledhunga, and local Pokhara sectors.</p>
            </div>
            <button onClick={() => navigate('/search')} className="text-xs font-bold text-blue-455 hover:underline shrink-0">
              Browse All Experts
            </button>
          </div>

          {isLoadingProviders ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
            </div>
          ) : recommended.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8 italic bg-slate-900/10 border border-slate-900 rounded-2xl">No featured specialists matching profile criteria.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {recommended.map((item) => {
                const verified = item.provider?.verificationTier === 'VERIFIED';
                const rating = item.provider?.averageRating || 5.0;
                
                return (
                  <div 
                    key={item.id} 
                    onClick={() => navigate(`/provider-profile/${item.provider?.userId}`)}
                    className="bg-slate-900/20 border border-slate-900 hover:border-blue-500/25 rounded-3xl overflow-hidden transition-all duration-300 group cursor-pointer hover:shadow-xl flex flex-col justify-between"
                  >
                    {/* Provider Avatar & Hero Info */}
                    <div className="relative h-44 bg-slate-950 overflow-hidden shrink-0">
                      <img 
                        src={item.provider?.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'} 
                        alt={item.provider?.user?.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                      />
                      {/* Rating Overlay */}
                      <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-slate-800 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        ⭐ {rating.toFixed(1)}
                      </span>
                      {/* Price Tag Overlay */}
                      <span className="absolute bottom-3 right-3 bg-blue-600 px-3 py-1 rounded-xl text-xs font-black text-white shadow-lg">
                        Rs. {item.price} <span className="text-[9px] font-normal">/{item.pricingModel === 'HOURLY' ? 'hr' : 'job'}</span>
                      </span>
                    </div>

                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-blue-400 transition-colors truncate max-w-[160px]">
                            {item.provider?.user?.name}
                          </h3>
                          {verified && (
                            <span className="p-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-md text-[8px] font-bold uppercase tracking-wider">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-550 uppercase tracking-widest font-black mt-0.5">{item.category}</p>
                        
                        <p className="text-xs text-slate-400 line-clamp-2 mt-2.5">
                          {item.description || 'Verified local specialist offering high fidelity, on-time service delivery.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-rose-500" />
                          <span>Pokhara</span>
                        </span>
                        <span>Response: ~15 mins</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 6. HOW IT WORKS */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10 border-t border-slate-900/40">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3.5 py-1 rounded-full border border-blue-500/20">Process Flow</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">How It Works</h2>
            <p className="text-slate-400 mt-2 text-xs sm:text-sm">Simple 3-step process to get your tasks done.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-slate-900/10 border border-slate-900/80 rounded-3xl p-6 relative flex flex-col items-center text-center space-y-4 hover:border-slate-800 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg font-black">
                1
              </div>
              <h3 className="font-extrabold text-base text-slate-100">Search</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Describe your task, browse matching local specialists in Pokhara, and inspect reviews or coordinates.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/10 border border-slate-900/80 rounded-3xl p-6 relative flex flex-col items-center text-center space-y-4 hover:border-slate-800 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg font-black">
                2
              </div>
              <h3 className="font-extrabold text-base text-slate-100">Book</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select from the specialist's calendar slots, submit coordinates, and confirm booking request details.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/10 border border-slate-900/80 rounded-3xl p-6 relative flex flex-col items-center text-center space-y-4 hover:border-slate-800 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg font-black">
                3
              </div>
              <h3 className="font-extrabold text-base text-slate-100">Get the Job Done</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Coordinate with the specialist via secure chat, receive the visit, and settle payment upon work completion.
              </p>
            </div>

          </div>
        </section>

        {/* 7. WHY CHOOSE US */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10 border-t border-slate-900/40">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3.5 py-1 rounded-full border border-blue-500/20">Our Value Proposition</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">Why Choose Us</h2>
            <p className="text-slate-400 mt-2 text-xs sm:text-sm">We provide the most robust local connection framework in Pokhara.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-450 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-200">Verified Professionals</h4>
                <p className="text-[10px] text-slate-500 mt-1">Manual documentation auditing ensures credential security.</p>
              </div>
            </div>

            <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-450 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-200">Secure Payments</h4>
                <p className="text-[10px] text-slate-500 mt-1">Settle payment directly with your provider upon work completion.</p>
              </div>
            </div>

            <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-450 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-200">Instant Booking</h4>
                <p className="text-[10px] text-slate-500 mt-1">Lock slots inside specialist calendars immediately.</p>
              </div>
            </div>

            <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-450 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-200">Live Chat</h4>
                <p className="text-[10px] text-slate-500 mt-1">Built-in chat alerts and updates sync automatically.</p>
              </div>
            </div>

            <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-450 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-200">Real Reviews</h4>
                <p className="text-[10px] text-slate-500 mt-1">Verified customers provide reviews after work is completed.</p>
              </div>
            </div>

            <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-450 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-200">Affordable Pricing</h4>
                <p className="text-[10px] text-slate-500 mt-1">0% commission allows specialists to offer competitive rates.</p>
              </div>
            </div>

            <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-450 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-200">Local Experts</h4>
                <p className="text-[10px] text-slate-500 mt-1">Discover providers residing right in your neighborhood.</p>
              </div>
            </div>

            <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-450 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-200">Customer Support</h4>
                <p className="text-[10px] text-slate-500 mt-1">Help desk team resolves questions and issues quickly.</p>
              </div>
            </div>

          </div>
        </section>

        {/* 8. STATISTICS */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10 border-t border-slate-900/40">
          <div className="relative overflow-hidden rounded-3xl border border-slate-900 bg-slate-950/40 p-8 sm:p-12 shadow-2xl backdrop-blur-md">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <TrendingUp className="h-44 w-44 text-blue-500 animate-pulse" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
              <div className="space-y-1">
                <p className="text-3xl sm:text-5xl font-black text-blue-400">15,000+</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Users</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl sm:text-5xl font-black text-blue-400">2,400+</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Professionals</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl sm:text-5xl font-black text-blue-400">10,000+</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Completed Jobs</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl sm:text-5xl font-black text-blue-400">4.9★</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Average Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. TESTIMONIALS */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10 border-t border-slate-900/40">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3.5 py-1 rounded-full border border-blue-500/20">Client Voices</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">Testimonials</h2>
            <p className="text-slate-400 mt-2 text-xs sm:text-sm">Real reviews from our growing community in Pokhara.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-slate-900/15 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-800 transition-colors">
              <div className="flex gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" /><Star className="h-4 w-4 fill-amber-500 text-amber-500" /><Star className="h-4 w-4 fill-amber-500 text-amber-500" /><Star className="h-4 w-4 fill-amber-500 text-amber-500" /><Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "The electrician arrived within 30 minutes. Amazing experience."
              </p>
              <span className="text-[10px] font-bold text-slate-500">— Sarah</span>
            </div>

            <div className="bg-slate-900/15 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-800 transition-colors">
              <div className="flex gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" /><Star className="h-4 w-4 fill-amber-500 text-amber-500" /><Star className="h-4 w-4 fill-amber-500 text-amber-500" /><Star className="h-4 w-4 fill-amber-500 text-amber-500" /><Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "I found a great math tutor."
              </p>
              <span className="text-[10px] font-bold text-slate-500">— Alex</span>
            </div>

            <div className="bg-slate-900/15 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-800 transition-colors">
              <div className="flex gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" /><Star className="h-4 w-4 fill-amber-500 text-amber-500" /><Star className="h-4 w-4 fill-amber-500 text-amber-500" /><Star className="h-4 w-4 fill-amber-500 text-amber-500" /><Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Excellent plumbing service near Chipledhunga. Clean and fast worker."
              </p>
              <span className="text-[10px] font-bold text-slate-500">— Rabin</span>
            </div>

          </div>
        </section>

        {/* 10. BECOME A PROVIDER CTA */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10 border-t border-slate-900/40">
          <div className="relative overflow-hidden rounded-3xl border border-gold-royal bg-gradient-to-r from-blue-950/25 to-slate-950/50 p-8 sm:p-12 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl text-left">
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase rounded-full">Partner Program</span>
              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                Earn More With Your Skills
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Join thousands of professionals already growing their business. Keep 100% of your earnings with zero commission deductions.
              </p>
            </div>
            
            <div className="shrink-0">
              <Button variant="gold" onClick={() => navigate('/auth?mode=register')} className="px-8 py-4 font-black uppercase text-xs tracking-wider shadow-2xl">
                Register as Provider
              </Button>
            </div>
          </div>
        </section>

        {/* 11. FAQ ACCORDION */}
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 relative z-10 border-t border-slate-900/40">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3.5 py-1 rounded-full border border-blue-500/20">Common Queries</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">FAQ</h2>
            <p className="text-slate-400 mt-2 text-xs sm:text-sm">Find fast answers regarding booking operations and provider verification rules.</p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-slate-900/20 border border-slate-900/80 rounded-2xl overflow-hidden transition-all">
                  <button 
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-200 hover:text-white transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-900/35 text-xs text-slate-400 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
};


// ----------------------------------------------------
// PROVIDER LANDING PAGE
// ----------------------------------------------------
const LandingProvider: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<any>(null);
  const [listingsCount, setListingsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Interactive Earnings Calculator states
  const [calcHourlyRate, setCalcHourlyRate] = useState<number>(600);
  const [calcWeeklyHours, setCalcWeeklyHours] = useState<number>(20);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const profileData = await apiFetch('/api/profiles/me');
        if (profileData?.providerProfile) {
          setProfile(profileData.providerProfile);
        }
        const listingsData = await apiFetch('/api/services/provider');
        if (Array.isArray(listingsData)) {
          setListingsCount(listingsData.length);
        }
      } catch (err) {
        console.error('Error fetching provider stats on landing:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const steps = [
    { num: '01', title: 'Setup Studio Profile', desc: 'Define your business bio, skills tags, and address geofence landmarks.' },
    { num: '02', title: 'Publish Services', desc: 'Create listings with transparent Rupees (Rs.) pricing models.' },
    { num: '03', title: 'Manage Calendar Slots', desc: 'Register open slots when you are available to accept client bookings.' },
    { num: '04', title: 'Approve & Deliver', desc: 'Accept incoming requested bookings, coordinate via chat, and complete tasks.' },
  ];

  const providerFaqs = [
    {
      q: 'How much does LocalSkill cost for providers?',
      a: 'LocalSkill is completely free for providers! We charge 0% commission on your bookings, allowing you to retain 100% of your earnings.'
    },
    {
      q: 'How do clients pay me?',
      a: 'Clients settle payment directly with you upon work completion via Cash on Delivery, local bank transfer, or digital wallets like eSewa and Khalti.'
    },
    {
      q: 'What is the difference between Basic and Verified tiers?',
      a: 'The Basic tier allows you to list services and take bookings. The Verified tier requires uploading qualifications/licenses, which adds a gold checkmark and boosts your visibility in search results.'
    },
    {
      q: 'Can I choose my own hours and rates?',
      a: 'Yes, you have complete control over your schedule by opening slots in the calendar, and you set your own rates per hour or per job.'
    }
  ];

  // Calculate simulated monthly earnings: rate * hours * 4 weeks
  const simulatedMonthlyEarnings = calcHourlyRate * calcWeeklyHours * 4;

  return (
    <div className="relative overflow-hidden min-h-screen flex flex-col justify-between">
      {/* Background glowing mesh */}
      <div className="absolute inset-0 z-0 bg-grid-royal opacity-45 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-emerald-900/10 to-indigo-950/0 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-600/10 to-transparent blur-[110px] pointer-events-none" />

      <main className="flex-grow">
        
        {/* 1. HERO SECTION */}
        <section className="mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">
                <Briefcase className="h-3.5 w-3.5 text-emerald-400" /> Vetted Provider Studio
              </span>
              
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                Welcome back,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-450 to-teal-400">
                  {user?.name || 'Expert Specialist'}
                </span>
              </h1>
              
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl">
                The zero-commission, direct-to-customer marketplace. Get found by clients, coordinate tasks via live chat, and manage your studio calendar in one place.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" onClick={() => navigate('/provider-dashboard')} className="px-6 py-3 font-bold text-xs rounded-xl shadow-lg bg-emerald-500 hover:bg-emerald-600 border-emerald-600">
                  Studio Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate('/bookings')} className="px-6 py-3 font-bold text-xs rounded-xl border-slate-800 hover:bg-slate-900/60">
                  My Appointments
                </Button>
              </div>

              {/* Tips Callout */}
              <div className="p-4 rounded-2xl bg-emerald-950/10 border border-emerald-500/15 max-w-2xl flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Set availability slots to get booked</h4>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Customers browse open slots inside your schedule to request bookings. Keep your calendar slots updated to avoid missing leads.
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Right Column: Studio Snapshot */}
            <div className="lg:col-span-5">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-25" />
                <div className="relative glass-royal p-6 rounded-3xl border border-gold-royal/35 space-y-5">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"} 
                      alt={user?.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">{user?.name}</h4>
                      <p className="text-[10px] text-emerald-450 font-bold uppercase tracking-wider mt-0.5">
                        {profile?.verificationTier || 'UNVERIFIED'} SPECIALIST
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-900/60">
                    <div className="text-center p-3 rounded-2xl bg-slate-900/50 border border-slate-850">
                      <p className="text-base font-extrabold text-white">
                        {isLoading ? '...' : (profile?.averageRating?.toFixed(1) || '0.0')} ★
                      </p>
                      <p className="text-[8px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Rating</p>
                    </div>
                    <div className="text-center p-3 rounded-2xl bg-slate-900/50 border border-slate-850">
                      <p className="text-base font-extrabold text-white">
                        {isLoading ? '...' : listingsCount}
                      </p>
                      <p className="text-[8px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Listings</p>
                    </div>
                    <div className="text-center p-3 rounded-2xl bg-slate-900/50 border border-slate-850">
                      <p className="text-base font-extrabold text-white">
                        {isLoading ? '...' : (profile?.reviewCount || 0)}
                      </p>
                      <p className="text-[8px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Reviews</p>
                    </div>
                  </div>
                  
                  {/* Verified callout */}
                  <div className="p-3 rounded-xl bg-slate-900/30 border border-slate-850 flex items-center gap-2 text-[10px] text-slate-400">
                    <ShieldCheck className="h-4 w-4 text-emerald-450 shrink-0" />
                    <span>Upload credentials to earn the Verified Gold Badge checkmark.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 2. INTERACTIVE EARNINGS ESTIMATOR CALCULATOR */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-10 border-t border-slate-900/60">
          <div className="glass-royal border border-gold-royal/35 rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-slate-950/90 to-emerald-950/15">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-6 space-y-4">
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 text-[9px] font-black uppercase rounded-md">
                  Calculator Tool
                </span>
                <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  🪙 Estimate Your Potential Earnings
                </h3>
                <p className="text-xs text-slate-455 leading-relaxed">
                  Unlike traditional platforms, LocalSkill charges **0% platform commissions**. Drag the sliders to estimate how much you can take home per month based on your hourly service pricing and weekly working slots.
                </p>
              </div>

              {/* Sliders and output preview */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-950 border border-slate-900/80 p-5 rounded-2xl">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                      Hourly Rate: Rs. {calcHourlyRate}
                    </label>
                    <input 
                      type="range" 
                      min="200" 
                      max="2500" 
                      step="50"
                      value={calcHourlyRate} 
                      onChange={(e) => setCalcHourlyRate(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                      Hours per Week: {calcWeeklyHours} hrs
                    </label>
                    <input 
                      type="range" 
                      min="5" 
                      max="60" 
                      step="1"
                      value={calcWeeklyHours} 
                      onChange={(e) => setCalcWeeklyHours(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center text-center bg-slate-900/50 p-4 rounded-xl border border-slate-850">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Estimated Monthly Take-Home</p>
                  <p className="text-3xl font-black text-emerald-450 mt-2">Rs. {simulatedMonthlyEarnings.toLocaleString()}</p>
                  <p className="text-[8px] text-slate-550 mt-1">100% Retained • 0% Commissions Paid</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. STUDIO COMMAND CENTER OVERVIEW */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10 border-t border-slate-900/40">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/20">Studio Toolkit</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">Smart Management Features</h2>
            <p className="text-slate-400 mt-2 text-xs sm:text-sm">Manage bookings, communication, and digital wallet stats in one unified hub.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            
            <div className="p-6 bg-slate-900/20 border border-slate-900 rounded-3xl space-y-3 hover:border-emerald-500/20 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                🗓️
              </div>
              <h4 className="font-extrabold text-sm text-slate-200">Availability Planner</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Batch generate slots template across selected weekdays to simplify calendar setup.
              </p>
            </div>

            <div className="p-6 bg-slate-900/20 border border-slate-900 rounded-3xl space-y-3 hover:border-emerald-500/20 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                💬
              </div>
              <h4 className="font-extrabold text-sm text-slate-200">Real-Time Chat</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Coordinate task details directly with clients using our built-in instant messaging.
              </p>
            </div>

            <div className="p-6 bg-slate-900/20 border border-slate-900 rounded-3xl space-y-3 hover:border-emerald-500/20 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                💼
              </div>
              <h4 className="font-extrabold text-sm text-slate-200">Studio Portfolio</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload credential listings and highlight project galleries to attract more views.
              </p>
            </div>

            <div className="p-6 bg-slate-900/20 border border-slate-900 rounded-3xl space-y-3 hover:border-emerald-500/20 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                🪙
              </div>
              <h4 className="font-extrabold text-sm text-slate-200">0% Commission Wallet</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Simulate digital wallet stats and withdraw digital earnings directly.
              </p>
            </div>

          </div>
        </section>

        {/* 4. WORKFLOW GUIDE SUCCESS STEPS */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10 border-t border-slate-900/40">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/20">Studio Workflow</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">How It Works for Partners</h2>
            <p className="text-slate-400 mt-2 text-xs sm:text-sm">Four simple steps to register, publish services, and deliver tasks.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div
                key={s.title}
                className="relative p-6 bg-slate-900/20 border border-slate-900 rounded-3xl overflow-hidden group hover:border-emerald-500/20 hover:bg-slate-900/30 transition-all duration-300"
              >
                <div className="absolute -top-3 -right-3 text-6xl font-black text-slate-800/15 tracking-tighter group-hover:text-emerald-500/10 transition-colors">
                  {s.num}
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-450 font-bold mb-4 text-xs">
                  {s.num}
                </div>
                <h3 className="font-extrabold text-slate-100 text-sm mt-2">{s.title}</h3>
                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. WHY PARTNER WITH US */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10 border-t border-slate-900/40">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/20">Marketplace Value</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">Why Partner With Us</h2>
            <p className="text-slate-400 mt-2 text-xs sm:text-sm">We provide the most provider-friendly service network in Pokhara.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-200">0% Commission</h4>
                <p className="text-[10px] text-slate-500 mt-1">Keep 100% of your earnings. No platform cuts.</p>
              </div>
            </div>

            <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-200">Direct Settlement</h4>
                <p className="text-[10px] text-slate-500 mt-1">Receive payments immediately via cash or transfer.</p>
              </div>
            </div>

            <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-200">Live Pushes</h4>
                <p className="text-[10px] text-slate-500 mt-1">Get immediate communication alerts through built-in chat.</p>
              </div>
            </div>

            <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-200">Verified Badging</h4>
                <p className="text-[10px] text-slate-500 mt-1">Gain priority search ranking by uploading licenses.</p>
              </div>
            </div>

          </div>
        </section>

        {/* 6. FAQ ACCORDION FOR PROVIDERS */}
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 relative z-10 border-t border-slate-900/40">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/20">Common Queries</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">Provider FAQ</h2>
            <p className="text-slate-400 mt-2 text-xs sm:text-sm">Find fast answers regarding studio tools and commission parameters.</p>
          </div>

          <div className="space-y-3.5">
            {providerFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-slate-900/20 border border-slate-900/80 rounded-2xl overflow-hidden transition-all">
                  <button 
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-200 hover:text-white transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-900/35 text-xs text-slate-400 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
};


// ----------------------------------------------------
// MAIN ROUTER VIEW SWITCH
// ----------------------------------------------------
export const Landing: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user?.role === 'PROVIDER') {
    return <LandingProvider />;
  }

  return <LandingCustomer />;
};
