import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, MessageSquare, Calendar, Search, LogOut, ShieldAlert, User, Menu, X, Sun, Moon, Settings, Briefcase } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useChatStore } from '../../store/useChatStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const { unreadCount: chatUnreadCount, connectSocket, disconnectSocket } = useChatStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Toggle theme class on body
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Fetch notifications and initialize socket on login
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
      connectSocket(user.id);
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, user]);

  // Click outside listener to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gold-royal bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-gradient font-bold text-slate-950 shadow-lg shadow-amber-650/20">
                LS
              </div>
              <span className="text-lg font-extrabold tracking-wider text-white">
                Local<span className="text-amber-400">Skill</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-6">
                {user?.role === 'CUSTOMER' ? (
                  <Link
                    to="/search"
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      isActive('/search') ? 'text-amber-400' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Search className="h-4 w-4" /> Search Services
                  </Link>
                ) : (
                  <Link
                    to="/provider-dashboard"
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      isActive('/provider-dashboard') ? 'text-amber-400' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Briefcase className="h-4 w-4" /> Provider Dashboard
                  </Link>
                )}
                <Link
                  to="/bookings"
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive('/bookings') ? 'text-amber-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Calendar className="h-4 w-4" /> {user?.role === 'PROVIDER' ? 'My Appointments' : 'My Bookings'}
                </Link>
                <Link
                  to="/chat"
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive('/chat') ? 'text-amber-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" /> Chats
                  {chatUnreadCount > 0 && (
                    <Badge variant="destructive" className="px-1.5 py-0.5 rounded-md scale-90">
                      {chatUnreadCount}
                    </Badge>
                  )}
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      isActive('/admin') ? 'text-amber-400' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <ShieldAlert className="h-4 w-4" /> Admin Panel
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* User Section / Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-slate-400 hover:text-white h-auto"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <div className="relative" ref={notificationsRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative p-2 text-slate-400 hover:text-white h-auto"
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-450 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                    )}
                  </Button>

                  {/* Notifications Dropdown */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-3 w-80 origin-top-right rounded-xl border border-gold-royal bg-slate-950/95 shadow-2xl z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gold-royal">
                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllAsRead()}
                            className="text-xs font-semibold text-amber-400 hover:text-amber-350 transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/40">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-slate-500">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-3.5 hover:bg-slate-800/30 transition-all cursor-pointer ${
                                !n.isRead ? 'bg-amber-500/5' : ''
                              }`}
                              onClick={() => markAsRead(n.id)}
                            >
                              <div className="flex justify-between items-start gap-1.5">
                                <p className={`text-xs font-semibold text-slate-200 ${!n.isRead ? 'text-amber-400' : ''}`}>
                                  {n.title}
                                </p>
                                <span className="text-[10px] text-slate-500">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1 leading-normal">
                                {n.content}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Panel */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 rounded-full border border-gold-royal bg-slate-950 p-1 hover:border-amber-500/35 transition-colors focus:outline-none"
                  >
                    <img
                      src={user?.avatarUrl}
                      alt={user?.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-48 origin-top-right rounded-xl border border-gold-royal bg-slate-950/95 shadow-2xl z-50 py-1.5 text-sm">
                      <div className="px-4 py-2 border-b border-gold-royal">
                        <p className="font-semibold text-slate-200 truncate">{user?.name}</p>
                        <p className="text-[10px] text-slate-500 truncate uppercase mt-0.5 tracking-wider">{user?.role}</p>
                      </div>
                      
                      {user?.role === 'PROVIDER' && (
                        <Link
                          to={`/provider-profile/${user.id}`}
                          className="flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="h-4 w-4" /> My Profile
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="h-4 w-4" /> Settings
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-rose-400 hover:bg-rose-500/10 transition-colors text-left border-t border-slate-900 mt-1"
                      >
                        <LogOut className="h-4 w-4" /> Log out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/auth?tab=register">
                  <Button variant="royal" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 h-auto text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gold-royal bg-slate-950 px-4 py-3 flex flex-col gap-3">
          {isAuthenticated ? (
            <>
              {user?.role === 'CUSTOMER' ? (
                <Link
                  to="/search"
                  className="text-sm font-medium text-slate-300 hover:text-white py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Search Services
                </Link>
              ) : (
                <Link
                  to="/provider-dashboard"
                  className="text-sm font-medium text-slate-300 hover:text-white py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Provider Dashboard
                </Link>
              )}
              <Link
                to="/bookings"
                className="text-sm font-medium text-slate-300 hover:text-white py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {user?.role === 'PROVIDER' ? 'My Appointments' : 'My Bookings'}
              </Link>
              <Link
                to="/chat"
                className="text-sm font-medium text-slate-300 hover:text-white py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Chats
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="text-sm font-medium text-slate-300 hover:text-white py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              {user?.role === 'PROVIDER' && (
                <Link
                  to={`/provider-profile/${user.id}`}
                  className="text-sm font-medium text-slate-300 hover:text-white py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Public Profile
                </Link>
              )}
              <Link
                to="/profile"
                className="text-sm font-medium text-slate-300 hover:text-white py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Settings
              </Link>
              <hr className="border-gold-royal my-1" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-rose-400 hover:text-rose-300 py-2 text-left"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link to="/auth?tab=register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="royal" className="w-full">
                  Register
                </Button>
              </Link>
            </div>
          )}
          <hr className="border-gold-royal my-1" />
          <button
            onClick={() => {
              toggleTheme();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white py-2 text-left"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" /> Light Mode
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-amber-400" /> Dark Mode
              </>
            )}
          </button>
        </div>
      )}
    </nav>
  );
};
