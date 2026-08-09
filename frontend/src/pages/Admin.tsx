import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ScrollText, 
  Database, 
  ShieldAlert, 
  Award, 
  FileText, 
  Ban, 
  Search, 
  Users, 
  Activity, 
  RefreshCw,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { apiFetch } from '../api/client';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const Admin: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);

  const [metrics, setMetrics] = useState<any>(null);
  const [pendingQueue, setPendingQueue] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [activeSubTab, setActiveSubTab] = useState<'metrics' | 'queue' | 'kanban' | 'users' | 'reports' | 'audits'>('metrics');
  
  // Search & detail states
  const [userSearch, setUserSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Mock spam reports state
  const [spamReports, setSpamReports] = useState<any[]>([
    {
      id: 'report-1',
      reporterName: 'Sita Kumari',
      targetName: 'Hari Shrestha',
      targetRole: 'PROVIDER',
      reason: 'Advertised hourly pricing differs from agreed booking bid.',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      status: 'PENDING'
    },
    {
      id: 'report-2',
      reporterName: 'Hari Shrestha',
      targetName: 'Rabin Thapa',
      targetRole: 'CUSTOMER',
      reason: 'Repeatedly cancelled slot coordinates near lakeside without informing.',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      status: 'RESOLVED'
    }
  ]);

  const loadAdminDashboard = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch stats
      const stats = await apiFetch<any>('/api/admin/stats');
      setMetrics(stats);

      // 2. Fetch verification requests
      const verifications = await apiFetch<any[]>('/api/admin/verifications');
      setPendingQueue(verifications);

      // 3. Fetch users
      const users = await apiFetch<any[]>('/api/admin/users');
      setUsersList(users);

      // 4. Fetch audit logs
      const logs = await apiFetch<any[]>('/api/admin/logs');
      setAuditLogs(logs);

      // 5. Fetch resolved system bookings
      const bookingsData = await apiFetch<any[]>('/api/admin/bookings');
      setBookings(bookingsData);
    } catch (err: any) {
      console.error('Failed to load admin panel data:', err);
      setErrorMsg(err.message || 'Failed to sync with central database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      loadAdminDashboard();
    }
  }, [currentUser]);

  // Handle Verification approval
  const handleApproveVerification = async (id: string, tier: 'VERIFIED' | 'BASIC') => {
    try {
      setIsLoading(true);
      await apiFetch(`/api/admin/verifications/${id}/approve`, {
        method: 'POST',
        json: { tier },
      });
      setIsDetailModalOpen(false);
      await loadAdminDashboard();
    } catch (err: any) {
      alert(err.message || 'Verification approval failed.');
      setIsLoading(false);
    }
  };

  // Handle Verification rejection
  const handleRejectVerification = async (id: string) => {
    try {
      setIsLoading(true);
      await apiFetch(`/api/admin/verifications/${id}/reject`, {
        method: 'POST',
      });
      setIsDetailModalOpen(false);
      await loadAdminDashboard();
    } catch (err: any) {
      alert(err.message || 'Verification rejection failed.');
      setIsLoading(false);
    }
  };

  // Toggle user suspension
  const handleToggleSuspension = async (id: string) => {
    try {
      setIsLoading(true);
      await apiFetch(`/api/admin/users/${id}/suspend`, {
        method: 'POST',
      });
      await loadAdminDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle account suspension.');
      setIsLoading(false);
    }
  };

  // Resolve Spam Report
  const handleResolveSpamReport = (reportId: string, action: 'DISMISS' | 'WARN') => {
    setSpamReports(prev => prev.map(rep => {
      if (rep.id === reportId) {
        return { ...rep, status: 'RESOLVED', resolution: action === 'WARN' ? 'Warning Sent' : 'Dismissed' };
      }
      return rep;
    }));
    alert(action === 'WARN' ? 'Warning notification successfully issued to the user.' : 'Spam report dismissed.');
  };

  // Helper to determine if a user name indicates suspension
  const isUserSuspended = (name: string) => {
    return name.endsWith(' (Suspended)');
  };

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="mx-auto max-w-md text-center py-20 px-4">
        <ShieldAlert className="h-16 w-16 text-rose-500 mx-auto animate-pulse" />
        <h2 className="text-xl font-extrabold text-white uppercase tracking-wider mt-6">Access Restricted</h2>
        <p className="text-slate-400 text-xs mt-2">This panel is only accessible by verified system administrators.</p>
      </div>
    );
  }

  // Filter lists
  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredLogs = auditLogs.filter(l => 
    l.action.toLowerCase().includes(logSearch.toLowerCase()) ||
    (l.details && l.details.toLowerCase().includes(logSearch.toLowerCase()))
  );

  // Group bookings for Kanban columns
  const kanbanRequested = bookings.filter(b => b.status === 'REQUESTED');
  const kanbanConfirmed = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS');
  const kanbanCompleted = bookings.filter(b => b.status === 'COMPLETED');
  const kanbanCancelled = bookings.filter(b => b.status === 'CANCELLED');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Top Admin Header Panel */}
      <div className="relative overflow-hidden rounded-3xl border border-gold-royal glass-royal p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="h-32 w-32 text-amber-400 animate-pulse" />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white">
                CENTRAL ADMINISTRATOR CONTROL HUB
              </h1>
            </div>
            <p className="text-slate-450 text-xs mt-1.5 max-w-2xl">
              Monitor active database metrics, review provider credential files, moderate accounts, inspect audit trails, and manage booking kanban.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={loadAdminDashboard}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Central DB
          </Button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-lg border border-red-500/20 bg-red-950/20 text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Grid Layout splits navigation and views */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-1.5 bg-slate-950/40 border border-slate-900 p-4 rounded-2xl h-fit">
          <p className="text-[9px] text-slate-500 font-extrabold tracking-widest uppercase px-3.5 mb-1.5">Management Menu</p>
          
          <button
            onClick={() => setActiveSubTab('metrics')}
            className={`w-full py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xl text-left transition-all flex items-center gap-2.5 border ${
              activeSubTab === 'metrics' 
                ? 'bg-primary/10 text-white border-primary/20 shadow-md' 
                : 'text-slate-400 border-transparent hover:bg-slate-900/40 hover:text-slate-200'
            }`}
          >
            <Activity className="h-4.5 w-4.5" />
            System Metrics
          </button>
          
          <button
            onClick={() => setActiveSubTab('queue')}
            className={`w-full py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xl text-left transition-all flex items-center justify-between border ${
              activeSubTab === 'queue' 
                ? 'bg-primary/10 text-white border-primary/20 shadow-md' 
                : 'text-slate-400 border-transparent hover:bg-slate-900/40 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Award className="h-4.5 w-4.5" />
              <span>Credentials Queue</span>
            </div>
            {pendingQueue.length > 0 && (
              <span className="px-2 py-0.5 text-[9px] font-black bg-primary text-white rounded-full animate-bounce">
                {pendingQueue.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('kanban')}
            className={`w-full py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xl text-left transition-all flex items-center gap-2.5 border ${
              activeSubTab === 'kanban' 
                ? 'bg-primary/10 text-white border-primary/20 shadow-md' 
                : 'text-slate-400 border-transparent hover:bg-slate-900/40 hover:text-slate-200'
            }`}
          >
            <Layers className="h-4.5 w-4.5" />
            Booking Kanban
          </button>

          <button
            onClick={() => setActiveSubTab('users')}
            className={`w-full py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xl text-left transition-all flex items-center gap-2.5 border ${
              activeSubTab === 'users' 
                ? 'bg-primary/10 text-white border-primary/20 shadow-md' 
                : 'text-slate-400 border-transparent hover:bg-slate-900/40 hover:text-slate-200'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            User Moderation
          </button>

          <button
            onClick={() => setActiveSubTab('reports')}
            className={`w-full py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xl text-left transition-all flex items-center justify-between border ${
              activeSubTab === 'reports' 
                ? 'bg-primary/10 text-white border-primary/20 shadow-md' 
                : 'text-slate-400 border-transparent hover:bg-slate-900/40 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-4.5 w-4.5" />
              <span>Spam & Warnings</span>
            </div>
            {spamReports.filter(r => r.status === 'PENDING').length > 0 && (
              <span className="px-2 py-0.5 text-[9px] font-black bg-rose-500 text-white rounded-full">
                {spamReports.filter(r => r.status === 'PENDING').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('audits')}
            className={`w-full py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xl text-left transition-all flex items-center gap-2.5 border ${
              activeSubTab === 'audits' 
                ? 'bg-primary/10 text-white border-primary/20 shadow-md' 
                : 'text-slate-400 border-transparent hover:bg-slate-900/40 hover:text-slate-200'
            }`}
          >
            <ScrollText className="h-4.5 w-4.5" />
            System Audit Trail
          </button>
        </div>

        {/* Action Panel Panel Content */}
        <div className="lg:col-span-9">
          
          {/* Subtab 1: System Metrics */}
          {activeSubTab === 'metrics' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-2">
                <span className="w-1.5 h-3.5 bg-primary rounded-full"></span>
                Database Growth Indicators
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border-slate-900 bg-slate-950/30">
                  <CardBody className="p-5 text-center flex flex-col justify-between h-full">
                    <Users className="h-5 w-5 text-primary mx-auto" />
                    <div>
                      <p className="text-2xl font-black text-white mt-3 leading-none">
                        {metrics?.totalUsers ?? 0}
                      </p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-2.5">Total Members</p>
                    </div>
                  </CardBody>
                </Card>

                <Card className="border-slate-900 bg-slate-950/30">
                  <CardBody className="p-5 text-center flex flex-col justify-between h-full">
                    <Award className="h-5 w-5 text-emerald-450 mx-auto" />
                    <div>
                      <p className="text-2xl font-black text-white mt-3 leading-none">
                        {metrics?.totalProviders ?? 0}
                      </p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-2.5">Registered Experts</p>
                    </div>
                  </CardBody>
                </Card>

                <Card className="border-slate-900 bg-slate-950/30">
                  <CardBody className="p-5 text-center flex flex-col justify-between h-full">
                    <Database className="h-5 w-5 text-indigo-400 mx-auto" />
                    <div>
                      <p className="text-2xl font-black text-white mt-3 leading-none">
                        {metrics?.totalBookings ?? 0}
                      </p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-2.5">Bookings Created</p>
                    </div>
                  </CardBody>
                </Card>

                <Card className="border-slate-900 bg-slate-950/30">
                  <CardBody className="p-5 text-center flex flex-col justify-between h-full">
                    <Layers className="h-5 w-5 text-sky-400 mx-auto" />
                    <div>
                      <p className="text-2xl font-black text-white mt-3 leading-none">
                        {metrics?.totalListings ?? 0}
                      </p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-2.5">Active Listings</p>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Status Breakdown & Category Popularity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Booking Status Breakdown */}
                <Card className="border-slate-900 bg-slate-950/20">
                  <CardBody className="p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center justify-between">
                      <span>Booking Status Shares</span>
                      <Badge variant="primary">Real-Time</Badge>
                    </h3>
                    
                    {metrics?.bookingStatuses ? (
                      <div className="flex flex-col gap-3.5">
                        {Object.entries(metrics.bookingStatuses).map(([status, count]: [string, any]) => {
                          const total = metrics.totalBookings || 1;
                          const pct = Math.round((count / total) * 100);
                          
                          let barColor = 'bg-slate-700';
                          if (status === 'COMPLETED') barColor = 'bg-emerald-500';
                          if (status === 'CONFIRMED' || status === 'IN_PROGRESS') barColor = 'bg-primary';
                          if (status === 'REQUESTED') barColor = 'bg-amber-500';
                          if (status === 'CANCELLED') barColor = 'bg-rose-500';

                          return (
                            <div key={status}>
                              <div className="flex justify-between items-center text-xs mb-1 font-semibold">
                                <span className="text-slate-450">{status}</span>
                                <span className="text-slate-200">{count} ({pct}%)</span>
                              </div>
                              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-900/35">
                                <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic text-center py-6">No bookings created yet.</p>
                    )}
                  </CardBody>
                </Card>

                {/* Service Categories */}
                <Card className="border-slate-900 bg-slate-950/20">
                  <CardBody className="p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center justify-between">
                      <span>Service Directory Mix</span>
                      <Badge variant="info">Categories</Badge>
                    </h3>

                    {metrics?.listingCategories && Object.keys(metrics.listingCategories).length > 0 ? (
                      <div className="flex flex-col gap-3.5">
                        {Object.entries(metrics.listingCategories).map(([category, count]: [string, any]) => {
                          const total = metrics.totalListings || 1;
                          const pct = Math.round((count / total) * 100);

                          return (
                            <div key={category}>
                              <div className="flex justify-between items-center text-xs mb-1 font-semibold">
                                <span className="text-slate-455">{category}</span>
                                <span className="text-slate-200">{count} ({pct}%)</span>
                              </div>
                              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-900/35">
                                <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic text-center py-6">No service listings found.</p>
                    )}
                  </CardBody>
                </Card>
              </div>
            </div>
          )}

          {/* Subtab 2: Verification Queue */}
          {activeSubTab === 'queue' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-2">
                <span className="w-1.5 h-3.5 bg-primary rounded-full"></span>
                Expert Credentials Audit Queue
              </h2>

              {pendingQueue.length === 0 ? (
                <div className="text-center py-16 bg-slate-950/30 border border-slate-900 rounded-xl">
                  <p className="text-slate-500 text-xs">No pending verification documents in queue.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {pendingQueue.map((item) => (
                    <Card key={item.id} className="border-slate-900 bg-slate-950/20 hover:border-primary/20 transition-all">
                      <CardBody className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-grow flex items-center gap-3">
                          <img 
                            src={item.user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user?.name || 'Provider')}&background=1e1b4b&color=ca8a04`} 
                            alt={item.user?.name}
                            className="h-11 w-11 rounded-xl border border-slate-800 object-cover"
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-200">{item.user?.name || 'Anonymous Provider'}</p>
                            <p className="text-xs text-slate-500">{item.user?.email || 'No email'}</p>
                          </div>
                        </div>

                        <div className="flex gap-2.5 w-full md:w-auto">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setSelectedRequest(item);
                              setIsDetailModalOpen(true);
                            }}
                            className="w-full md:w-auto px-4 font-bold text-xs flex items-center justify-center gap-1"
                          >
                            <span>Inspect Credentials</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subtab 3: Booking Kanban Board */}
          {activeSubTab === 'kanban' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-3.5 bg-primary rounded-full"></span>
                  Booking Status Kanban Management
                </h2>
                <p className="text-[10px] text-slate-500">Visual mapping of booking statuses across the LocalSkill ecosystem.</p>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-16 bg-slate-950/30 border border-slate-900 rounded-xl">
                  <p className="text-slate-500 text-xs">No bookings logged in database.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  
                  {/* Column 1: Requested */}
                  <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="text-[10px] font-black uppercase text-amber-450 tracking-wider">Requested</span>
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-950 border border-slate-900 px-1.5 py-0.5 rounded-full">{kanbanRequested.length}</span>
                    </div>
                    <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                      {kanbanRequested.map(b => (
                        <div key={b.id} className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
                          <p className="text-[9px] font-bold text-slate-550">ID: {b.id.substring(b.id.length - 6)}</p>
                          <h4 className="text-xs font-bold text-white leading-tight truncate">{b.service?.title}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span>Client:</span>
                            <span className="text-slate-200 truncate">{b.customer?.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Confirmed */}
                  <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="text-[10px] font-black uppercase text-primary tracking-wider">Confirmed</span>
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-950 border border-slate-900 px-1.5 py-0.5 rounded-full">{kanbanConfirmed.length}</span>
                    </div>
                    <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                      {kanbanConfirmed.map(b => (
                        <div key={b.id} className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
                          <p className="text-[9px] font-bold text-slate-550">ID: {b.id.substring(b.id.length - 6)}</p>
                          <h4 className="text-xs font-bold text-white leading-tight truncate">{b.service?.title}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span>Client:</span>
                            <span className="text-slate-200 truncate">{b.customer?.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 3: Completed */}
                  <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="text-[10px] font-black uppercase text-emerald-450 tracking-wider">Completed</span>
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-950 border border-slate-900 px-1.5 py-0.5 rounded-full">{kanbanCompleted.length}</span>
                    </div>
                    <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                      {kanbanCompleted.map(b => (
                        <div key={b.id} className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
                          <p className="text-[9px] font-bold text-slate-550">ID: {b.id.substring(b.id.length - 6)}</p>
                          <h4 className="text-xs font-bold text-white leading-tight truncate">{b.service?.title}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span>Client:</span>
                            <span className="text-slate-200 truncate">{b.customer?.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 4: Cancelled */}
                  <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="text-[10px] font-black uppercase text-rose-450 tracking-wider">Cancelled</span>
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-950 border border-slate-900 px-1.5 py-0.5 rounded-full">{kanbanCancelled.length}</span>
                    </div>
                    <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                      {kanbanCancelled.map(b => (
                        <div key={b.id} className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-2 opacity-60">
                          <p className="text-[9px] font-bold text-slate-550">ID: {b.id.substring(b.id.length - 6)}</p>
                          <h4 className="text-xs font-bold text-white leading-tight truncate">{b.service?.title}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span>Client:</span>
                            <span className="text-slate-200 truncate">{b.customer?.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* Subtab 4: User Moderation */}
          {activeSubTab === 'users' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-3.5 bg-primary rounded-full"></span>
                  Active User Directory
                </h2>

                {/* User Search */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or role..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-slate-800 bg-slate-950/45 text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-16 bg-slate-950/30 border border-slate-850 rounded-xl">
                    <p className="text-slate-500 text-xs">No matches found for your search query.</p>
                  </div>
                ) : (
                  filteredUsers.map((usr) => {
                    const suspended = isUserSuspended(usr.name);
                    const cleanName = suspended ? usr.name.replace(' (Suspended)', '') : usr.name;

                    return (
                      <Card key={usr.id} className={`border-slate-900 bg-slate-950/25 transition-all ${suspended ? 'opacity-70 border-red-950/50 bg-red-950/5' : ''}`}>
                        <CardBody className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={usr.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=020617&color=6366f1`}
                              alt={cleanName}
                              className="h-10 w-10 rounded-xl border border-slate-850 object-cover"
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xs font-extrabold text-slate-200">{cleanName}</p>
                                <Badge 
                                  variant={usr.role === 'ADMIN' ? 'warning' : usr.role === 'PROVIDER' ? 'primary' : 'secondary'} 
                                  className="scale-90"
                                >
                                  {usr.role}
                                </Badge>
                                {suspended && (
                                  <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-rose-950/60 text-rose-400 border border-rose-500/25 rounded-md">
                                    Suspended
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1">{usr.email}</p>
                            </div>
                          </div>

                          <div className="w-full sm:w-auto self-end sm:self-center">
                            {!suspended ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                className="text-xs font-bold w-full sm:w-auto px-4 flex items-center justify-center gap-1.5 border border-rose-500/20"
                                onClick={() => handleToggleSuspension(usr.id)}
                              >
                                <Ban className="h-3.5 w-3.5" /> 
                                <span>Suspend Account</span>
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs font-bold w-full sm:w-auto px-4 flex items-center justify-center gap-1.5 border-slate-800 hover:bg-slate-900/60"
                                onClick={() => handleToggleSuspension(usr.id)}
                              >
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-450" /> 
                                <span>Reactivate</span>
                              </Button>
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Subtab 5: Spam & Warnings Moderation */}
          {activeSubTab === 'reports' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-3.5 bg-primary rounded-full"></span>
                  Spam Reports & Warning logs
                </h2>
                <p className="text-[10px] text-slate-500">Moderate complaints filed by customers and providers regarding platform listings, booking coordination, or chat behaviour.</p>
              </div>

              <div className="flex flex-col gap-4">
                {spamReports.map((report) => (
                  <div key={report.id} className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col sm:flex-row items-start justify-between gap-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/25 px-2 py-0.5 rounded">
                          Spam Ticket
                        </span>
                        <span className="text-[9px] font-bold text-slate-500">ID: {report.id}</span>
                      </div>
                      <p className="text-xs text-slate-350 leading-relaxed">
                        Reporter <strong className="text-slate-200">{report.reporterName}</strong> flagged <strong className="text-slate-200">{report.targetName} ({report.targetRole})</strong>
                      </p>
                      <p className="text-[11px] text-slate-450 bg-slate-950 border border-slate-900 p-2.5 rounded-xl leading-relaxed italic">
                        "{report.reason}"
                      </p>
                      <span className="block text-[8px] text-slate-550">Filed: {new Date(report.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="shrink-0 flex sm:flex-col gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t border-slate-900/60 sm:border-t-0">
                      {report.status === 'PENDING' ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="primary" 
                            onClick={() => handleResolveSpamReport(report.id, 'WARN')}
                            className="w-full text-[10px] uppercase font-bold px-3 py-2 flex items-center justify-center gap-1.5"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>Warn User</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleResolveSpamReport(report.id, 'DISMISS')}
                            className="w-full text-[10px] uppercase font-bold px-3 py-2 border-slate-800 hover:bg-slate-900"
                          >
                            Dismiss
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-slate-550 font-bold uppercase bg-slate-900 px-3 py-1.5 border border-slate-850 rounded-xl">
                          <CheckCircle2 className="h-4 w-4 text-emerald-450" />
                          <span>Resolved: {report.resolution}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtab 6: Audit Logs */}
          {activeSubTab === 'audits' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-3.5 bg-primary rounded-full"></span>
                  System Audit Trail
                </h2>

                {/* Log Search */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search logs by action or details..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-slate-800 bg-slate-950/45 text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="bg-slate-950/20 border border-slate-850 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left text-xs table-auto">
                    <thead className="bg-slate-950/95 sticky top-0 uppercase text-[9px] tracking-widest text-slate-500 border-b border-slate-850 z-10">
                      <tr>
                        <th className="px-5 py-4 font-extrabold">Timestamp</th>
                        <th className="px-5 py-4 font-extrabold">Action Code</th>
                        <th className="px-5 py-4 font-extrabold">Audit Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-300">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-5 py-12 text-center text-slate-500 italic">
                            No matching audit trail logs recorded.
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log) => {
                          const isActionAdmin = log.action.startsWith('ADMIN_');
                          const isActionUser = log.action.includes('LOGIN') || log.action.includes('REGISTER');
                          
                          let actionColor = 'secondary';
                          if (isActionAdmin) actionColor = 'warning';
                          if (isActionUser) actionColor = 'success';
                          if (log.action.includes('SUSPEND')) actionColor = 'destructive';

                          return (
                            <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                              <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                                {new Date(log.createdAt).toLocaleString()}
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                <Badge variant={actionColor as any} className="font-bold scale-95 tracking-wide">
                                  {log.action}
                                </Badge>
                              </td>
                              <td className="px-5 py-3.5 text-slate-400 max-w-sm sm:max-w-md truncate md:whitespace-normal">
                                {log.details}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* INSPECT CREDENTIALS DETAIL PREVIEW PANEL MODAL */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Inspector Panel: Verify Provider Credentials"
        footer={
          <div className="flex flex-wrap gap-2 justify-end w-full">
            <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleRejectVerification(selectedRequest?.id)}
              className="font-bold border border-rose-500/20"
            >
              Reject Documents
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleApproveVerification(selectedRequest?.id, 'BASIC')}
              className="font-bold border-slate-800 hover:bg-slate-900"
            >
              Grant Basic Tier
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleApproveVerification(selectedRequest?.id, 'VERIFIED')}
              className="font-bold"
            >
              Verify Professional
            </Button>
          </div>
        }
      >
        {selectedRequest && (
          <div className="space-y-4">
            
            <div className="flex items-center gap-3 bg-slate-950/40 p-3.5 border border-slate-900 rounded-xl">
              <img 
                src={selectedRequest.user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedRequest.user?.name || 'Provider')}&background=1e1b4b&color=ca8a04`} 
                alt={selectedRequest.user?.name}
                className="h-12 w-12 rounded-xl object-cover border border-slate-800"
              />
              <div>
                <h4 className="text-sm font-bold text-white">{selectedRequest.user?.name}</h4>
                <p className="text-xs text-slate-500">{selectedRequest.user?.email} • Address: {selectedRequest.user?.address || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">Provider bio & experience</label>
              <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/20 border border-slate-900/60 p-3 rounded-xl">
                {selectedRequest.bio || 'No profile biography provided.'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">Offered Skills Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {selectedRequest.skills && selectedRequest.skills.length > 0 ? (
                  selectedRequest.skills.map((skill: string) => (
                    <span key={skill} className="px-2.5 py-0.5 bg-slate-900 border border-slate-850 rounded text-[9px] font-bold text-slate-300">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No skills registered.</span>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-900">
              <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">Credential Verification Proof</label>
              
              {selectedRequest.verificationDocs && selectedRequest.verificationDocs.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {selectedRequest.verificationDocs.map((doc: string, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <a
                        href={doc}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline font-semibold flex items-center gap-1.5"
                      >
                        <FileText className="h-4 w-4" /> 
                        <span>Download Credential File #{idx + 1}</span>
                      </a>
                      
                      {/* Document mockup view slot */}
                      <div className="bg-slate-950 rounded-xl border border-slate-900 p-3 text-center space-y-3">
                        <p className="text-[9px] text-slate-550 uppercase tracking-wider">Document Preview Slot</p>
                        <img 
                          src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=400&q=80" 
                          alt="Trade License Document Mockup" 
                          className="mx-auto h-28 object-cover rounded border border-slate-900 brightness-95" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-650 italic">No verification documents attached.</p>
              )}
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
};
