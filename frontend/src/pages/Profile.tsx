import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  Save, 
  Trash2, 
  AlertTriangle, 
  Lock, 
  CheckCircle, 
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';

export const Profile: React.FC = () => {
  const { user, accessToken, setAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  
  // Settings & Privacy preferences
  const [enhancedPrivacy, setEnhancedPrivacy] = useState(true);
  const [hideSearchAvatar, setHideSearchAvatar] = useState(false);

  // Provider details form states
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [latitude, setLatitude] = useState('28.2096');
  const [longitude, setLongitude] = useState('83.9856');
  const [isSavingProvider, setIsSavingProvider] = useState(false);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateConfirmText, setDeactivateConfirmText] = useState('');

  // Fetch full details from /api/profiles/me
  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken) return;
      setIsLoading(true);
      try {
        const res = await fetch('/api/profiles/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setName(data.name || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
          setAvatarUrl(data.avatarUrl || '');
          if (data.providerProfile) {
            setBio(data.providerProfile.bio || '');
            setSkills(data.providerProfile.skills ? data.providerProfile.skills.join(', ') : '');
            setContactInfo(data.providerProfile.contactInfo || '');
            setLatitude(data.providerProfile.latitude !== undefined && data.providerProfile.latitude !== null ? String(data.providerProfile.latitude) : '28.2096');
            setLongitude(data.providerProfile.longitude !== undefined && data.providerProfile.longitude !== null ? String(data.providerProfile.longitude) : '83.9856');
          }
        }
      } catch (err) {
        console.error('Error fetching detailed profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [accessToken]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/profiles/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name,
          phone,
          avatarUrl,
          address,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Sync local auth user state
        if (user) {
          setAuth(
            {
              ...user,
              name: data.name,
              avatarUrl: data.avatarUrl,
            },
            accessToken
          );
        }
        setMessage({ type: 'success', text: 'Profile changes saved securely!' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update details.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network connection issue. Please retry.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setIsSavingProvider(true);
    setMessage(null);

    const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
    if (skillsArray.length === 0) {
      setMessage({ type: 'error', text: 'Please enter at least one skill.' });
      setIsSavingProvider(false);
      return;
    }

    try {
      const res = await fetch('/api/profiles/provider', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          bio,
          skills: skillsArray,
          contactInfo,
          latitude: parseFloat(latitude) || 28.2096,
          longitude: parseFloat(longitude) || 83.9856,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Professional Studio details updated successfully!' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update studio details.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network connection issue. Please retry.' });
    } finally {
      setIsSavingProvider(false);
    }
  };

  const handleDeactivate = async () => {
    if (deactivateConfirmText.toLowerCase() !== 'delete') return;
    if (!accessToken) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/profiles/me', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        logout();
        navigate('/');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to deactivate account.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to authentication servers.');
    } finally {
      setIsSaving(false);
      setShowDeactivateModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-amber-500 border-r-2 border-indigo-500" />
        <p className="text-sm text-slate-400 font-medium">Securing profile connection...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pt-24 pb-20 sm:px-6 lg:px-8 relative z-10">
      
      {/* Upper Title Header */}
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-350">
          Account Settings
        </h1>
        <p className="mt-2 text-slate-400">
          Update your credential details, configure location coordinates, and control privacy rules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form Settings Panel */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Status Message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className={`p-4 rounded-xl border flex items-center gap-3 ${
                  message.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                )}
                <span className="text-sm font-medium">{message.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSave} className="glass-royal rounded-3xl p-6 md:p-8 border border-gold-royal/30 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5 pb-3 border-b border-slate-900">
              <User className="h-5 w-5 text-amber-500" /> Personal Identity
            </h2>

            {/* Profile Avatar Selection Block */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 to-indigo-650 blur opacity-30 group-hover:opacity-60 transition duration-300" />
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'}
                  alt={name}
                  className="relative h-20 w-20 rounded-full object-cover border-2 border-amber-500 shadow-xl"
                />
              </div>
              <div className="flex-grow w-full space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Avatar Image Link
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Input Details fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="tel"
                    placeholder="+977-9800000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  Email Address <Lock className="h-3 w-3" />
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-slate-950/70 border border-slate-900 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>
                <p className="text-[10px] text-slate-500">Contact admin support to modify login credentials.</p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Home/Work Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Lakeside Ward 6, Pokhara"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Actions Block */}
            <div className="pt-4 border-t border-slate-900 flex justify-end">
              <Button
                type="submit"
                variant="gold"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 font-bold shadow-xl shadow-amber-500/10"
              >
                <Save className="h-4.5 w-4.5" />
                {isSaving ? 'Saving Changes...' : 'Save Settings'}
              </Button>
            </div>
          </form>

          {/* Professional Studio Profile Details */}
          {user?.role === 'PROVIDER' && (
            <form onSubmit={handleSaveProvider} className="glass-royal rounded-3xl p-6 md:p-8 border border-gold-royal/30 space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2.5 pb-3 border-b border-slate-900">
                <Briefcase className="h-5 w-5 text-amber-500" /> Professional Studio Profile
              </h2>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Professional Bio / Experience
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your expertise, background, and services in detail..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Skills & Certifications (Comma-separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrical Wiring, Repair, Lighting Design"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Business Contact Info / Office Address details
                </label>
                <input
                  type="text"
                  placeholder="e.g. WhatsApp +977-9800000000, Office location details..."
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Service Latitude (Coordinates)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Service Longitude (Coordinates)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-900 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSavingProvider}
                  variant="gold"
                  className="flex items-center gap-2 px-6 py-2.5 font-bold shadow-xl shadow-amber-500/10"
                >
                  <Save className="h-4.5 w-4.5" />
                  {isSavingProvider ? 'Saving Studio Details...' : 'Save Studio Details'}
                </Button>
              </div>
            </form>
          )}

          {/* Account Danger Area */}
          <div className="glass-royal rounded-3xl p-6 border border-rose-500/20 bg-rose-950/5">
            <h2 className="text-lg font-bold text-rose-450 flex items-center gap-2.5 pb-3 border-b border-rose-500/10">
              <AlertTriangle className="h-5 w-5 text-rose-500" /> Danger Zone
            </h2>
            <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-200">Deactivate / Delete Account</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Deactivating your profile will instantly clean your active booking request records, disable service listings, and revoke active authentication keys. This is irreversible.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="border-rose-900/50 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 px-5"
                onClick={() => setShowDeactivateModal(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Deactivate
              </Button>
            </div>
          </div>

        </div>

        {/* Right Settings Info Panel: Privacy Information */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Privacy Protection Card */}
          <div className="glass-royal rounded-3xl p-6 border border-indigo-500/20 relative overflow-hidden bg-gradient-to-b from-indigo-950/20 to-transparent">
            <div className="absolute top-[-20%] right-[-20%] w-[120px] h-[120px] rounded-full bg-indigo-500/10 blur-[30px]" />
            
            <h3 className="text-base font-bold text-white flex items-center gap-2.5 mb-4">
              <ShieldCheck className="h-5 w-5 text-indigo-400" /> Privacy & Safety
            </h3>
            
            <div className="space-y-4 text-xs text-slate-355 leading-relaxed">
              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/40">
                <span className="font-bold text-slate-200 block mb-1">Address Safeguard Policy</span>
                Your specific address is hidden from the public directories. It is only shared automatically with a service provider once you confirm their booking request slot.
              </div>

              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/40">
                <span className="font-bold text-slate-200 block mb-1">Masked Contact Info</span>
                Provider calls utilize our secure application gateway. Standard phone contacts are obfuscated under standard pending states to avoid unsolicited messaging.
              </div>
            </div>
          </div>

          {/* Privacy Preferences Controls */}
          <div className="glass-royal rounded-3xl p-6 border border-gold-royal/30">
            <h3 className="text-base font-bold text-white mb-4">Privacy Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <label className="text-xs font-bold text-slate-200 block">Enhanced Privacy Mode</label>
                  <span className="text-[10px] text-slate-500 block leading-tight">Restrict search coordinate precision to general neighborhoods only.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEnhancedPrivacy(!enhancedPrivacy)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    enhancedPrivacy ? 'bg-amber-500' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                      enhancedPrivacy ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-start justify-between gap-3 pt-3 border-t border-slate-900">
                <div className="space-y-0.5">
                  <label className="text-xs font-bold text-slate-200 block">Hide Search Avatar</label>
                  <span className="text-[10px] text-slate-500 block leading-tight">Use a standard placeholder logo in general listings and searches.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHideSearchAvatar(!hideSearchAvatar)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    hideSearchAvatar ? 'bg-amber-500' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                      hideSearchAvatar ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Double confirmation modal for deactivation */}
      <AnimatePresence>
        {showDeactivateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setShowDeactivateModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/30 bg-slate-950 p-6 md:p-8 shadow-2xl z-10"
            >
              <div className="flex items-center gap-3 text-rose-455 mb-4">
                <AlertTriangle className="h-6 w-6 text-rose-500 animate-bounce-slow" />
                <h3 className="text-lg font-bold text-white">Confirm Deactivation</h3>
              </div>

              <p className="text-sm text-slate-355 leading-relaxed">
                This action is permanent and completely deletes all of your account databases, bookings, logs, and profile records from the marketplace.
              </p>

              <div className="mt-5 space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Type <span className="text-rose-400 font-mono">delete</span> to confirm:
                </label>
                <input
                  type="text"
                  placeholder="delete"
                  value={deactivateConfirmText}
                  onChange={(e) => setDeactivateConfirmText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all font-mono"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  className="border-slate-800 text-slate-300 hover:bg-slate-900"
                  onClick={() => setShowDeactivateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  disabled={deactivateConfirmText.toLowerCase() !== 'delete'}
                  className="border-rose-950 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all px-5 font-bold"
                  onClick={handleDeactivate}
                >
                  Deactivate Account
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
