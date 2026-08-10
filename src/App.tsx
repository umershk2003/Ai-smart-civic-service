import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { LandingPage } from './components/LandingPage';
import { AccessDenied } from './components/AccessDenied';
import { CitizenPortal } from './components/CitizenPortal';
import { ServiceDesk } from './components/ServiceDesk';
import { FieldOfficerPortal } from './components/FieldOfficerPortal';
import { CategoryManagement } from './components/CategoryManagement';
import { RoleManagement } from './components/RoleManagement';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AICopilot } from './components/AICopilot';
import { FIELD_OFFICERS_LIST, SUPERVISOR_DEPARTMENTS_LIST } from './components/RoleSwitcher';
import { AppShell, ShellNotification } from './components/shell/AppShell';
import { ToastProvider, useToast } from './components/ui/Toast';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { liveStream, ServerNotification } from './auth/live';
import {
  NavTab,
  ALLOWED_TABS_PER_ROLE,
  defaultTabForRole,
} from './auth/permissions';
import { Complaint, ExtendedUserRole, CivicCategoryDef, AuditEntry, UserAccount } from './types';
import { initialComplaints } from './data/seedData';
import { defaultCategories } from './data/categoriesData';
import { initialAuditLogs } from './data/auditLogData';

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return 'Just now';
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

const INITIAL_USERS: UserAccount[] = [
  { id: 'u-1', name: 'Zoya Khan', email: 'citizen@civic.com', role: 'citizen', status: 'Active', lastActive: 'Just now' },
  { id: 'u-2', name: 'Officer Imran Shahid', email: 'officer@civic.com', role: 'field_officer', department: 'Department of Public Works', status: 'Active', lastActive: '5m ago' },
  { id: 'u-3', name: 'Supv. Khalid Mehmood', email: 'supervisor@civic.com', role: 'supervisor', department: 'Water & Sanitation Authority', status: 'Active', lastActive: '12m ago' },
  { id: 'u-4', name: 'Ahmed Khan', email: 'admin@civic.com', role: 'municipal_admin', department: 'Municipal Services', status: 'Active', lastActive: '1m ago' },
  { id: 'u-5', name: 'Zain ul Abideen', email: 'superadmin@civic.com', role: 'super_admin', status: 'Active', lastActive: 'Online' }
];

function MainAppContent() {
  const { user, isLoggedIn, logout } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<NavTab>('citizen');
  const [selectedOfficer, setSelectedOfficer] = useState<string>(FIELD_OFFICERS_LIST[0]);
  const [selectedSupervisorDepartment, setSelectedSupervisorDepartment] = useState<string>(SUPERVISOR_DEPARTMENTS_LIST[0]);

  // Data states
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [categories, setCategories] = useState<CivicCategoryDef[]>(defaultCategories);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(initialAuditLogs);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [loading, setLoading] = useState(true);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [apiNotifications, setApiNotifications] = useState<ServerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const currentRole: ExtendedUserRole = user?.role || 'citizen';

  // Fetch complaints from server on mount & role change
  const fetchComplaints = async () => {
    try {
      const res = await fetch('/api/complaints', {
        headers: { 'x-user-role': currentRole }
      });
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (err) {
      console.warn('Backend endpoint unavailable, using local state:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setApiNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch (err) {
      console.warn('Notifications fetch failed:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories', {
        headers: { 'x-user-role': currentRole },
      });
      if (res.ok) setCategories(await res.json());
    } catch (err) {
      console.warn('Categories fetch failed:', err);
    }
  };

  // Server-side audit ledger (JWT-gated; admin roles only). Replaces the static
  // demo seed so the Super Admin "Immutable Ledger" reflects real actions.
  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAuditLogs(data);
      }
    } catch (err) {
      console.warn('Audit logs fetch failed:', err);
    }
  };

  const isAdminViewer = currentRole === 'municipal_admin' || currentRole === 'super_admin';

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read', { method: 'POST' });
    } catch {
      /* optimistic below */
    }
    setApiNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchComplaints();
      fetchNotifications();
      if (isAdminViewer) fetchAuditLogs();
      liveStream.refresh();
    }
  }, [isLoggedIn, currentRole]);

  // The JWT is minted asynchronously after a login/role change; re-fetch the
  // role-scoped notification feed once the token actually lands (otherwise we
  // read the previous role's data). Ignore null tokens (logout / no session).
  useEffect(() => {
    const onToken = (e: Event) => {
      const token = (e as CustomEvent<string | null>).detail;
      if (isLoggedIn && token) {
        fetchNotifications();
        if (isAdminViewer) fetchAuditLogs();
      }
    };
    window.addEventListener('civic:auth-token', onToken);
    return () => window.removeEventListener('civic:auth-token', onToken);
  }, [isLoggedIn, currentRole]);

  // Real-time: react to pushed events instead of waiting for a refresh.
  useEffect(() => {
    if (!isLoggedIn) return;
    const unsubscribe = liveStream.subscribe((event) => {
      if (event.type === 'complaint.created' || event.type === 'complaint.updated') {
        fetchComplaints();
        if (isAdminViewer) fetchAuditLogs();
      } else if (event.type === 'category.updated') {
        fetchCategories();
      } else if (event.type === 'notification.new') {
        fetchNotifications();
        const n = event.notification as ServerNotification | undefined;
        if (n && n.roles?.includes(currentRole)) {
          toast({
            title: n.title,
            description: n.description,
            variant: n.tone === 'critical' ? 'error' : n.tone === 'success' ? 'success' : 'info',
          });
        }
      }
    });
    return unsubscribe;
  }, [isLoggedIn, currentRole]);

  // Reset database to initial seed data
  const handleResetSeed = async () => {
    setResetConfirmOpen(false);
    try {
      const res = await fetch('/api/seed-reset', { method: 'POST' });
      if (res.ok) {
        await fetchComplaints();
        if (isAdminViewer) await fetchAuditLogs();
      } else {
        setComplaints([...initialComplaints]);
      }
    } catch (err) {
      setComplaints([...initialComplaints]);
    }
    setCategories([...defaultCategories]);
    setAuditLogs([...initialAuditLogs]);
    toast({
      title: 'Demo data reset',
      description: 'Complaints, categories, and audit logs restored to seed state.',
      variant: 'success',
    });
  };

  // Complaint Handlers
  const handleComplaintSubmitted = (newCmp: Complaint) => {
    setComplaints((prev) => [newCmp, ...prev]);
    toast({
      title: 'Complaint submitted',
      description: `Tracking ID ${newCmp.trackingId} — AI classified as ${newCmp.category}.`,
      variant: 'success',
    });
  };

  const handleUpdateComplaint = (id: string, updatedPartial: Partial<Complaint>) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id || c.trackingId === id ? { ...c, ...updatedPartial } : c))
    );
  };

  const handleTrackLookup = async (trackingId: string): Promise<Complaint | null> => {
    try {
      const res = await fetch(`/api/complaints/${encodeURIComponent(trackingId)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error('Track lookup failed:', err);
    }
    const found = complaints.find(
      (c) => c.trackingId.toLowerCase() === trackingId.toLowerCase() || c.id === trackingId
    );
    return found || null;
  };

  // Category Management Handlers
  const handleAddCategory = (catData: Omit<CivicCategoryDef, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCat: CivicCategoryDef = {
      ...catData,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCategories((prev) => [...prev, newCat]);
    toast({ title: 'Category created', description: `${newCat.name} added for ${newCat.department}.`, variant: 'success' });

    handleAddAuditLog({
      user: user?.name || 'Municipal Admin Lead',
      role: currentRole,
      action: 'Created Category',
      oldValue: null,
      newValue: newCat.name,
      reason: `Added category ${newCat.name} assigned to ${newCat.department}`
    });
  };

  const handleUpdateCategory = (updatedCat: CivicCategoryDef) => {
    setCategories((prev) => prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)));
    toast({ title: 'Category updated', description: updatedCat.name, variant: 'info' });

    handleAddAuditLog({
      user: user?.name || 'Municipal Admin Lead',
      role: currentRole,
      action: 'Updated Category Specs',
      oldValue: updatedCat.name,
      newValue: `${updatedCat.name} (${updatedCat.status})`,
      reason: `Updated specs for category ${updatedCat.name}`
    });
  };

  const handleToggleCategoryStatus = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === categoryId) {
          const nextStatus = c.status === 'Active' ? 'Inactive' : 'Active';
          handleAddAuditLog({
            user: user?.name || 'Municipal Admin Lead',
            role: currentRole,
            action: 'Category Status Toggled',
            oldValue: c.status,
            newValue: nextStatus,
            reason: `Category ${c.name} status toggled to ${nextStatus}`
          });
          return { ...c, status: nextStatus, updatedAt: new Date().toISOString() };
        }
        return c;
      })
    );
  };

  // User Role Management Handlers
  const handleUpdateUserRole = (userId: string, newRole: ExtendedUserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    toast({ title: 'User role updated', variant: 'info' });
  };

  const handleAddAuditLog = (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditEntry = {
      ...entry,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Notification feed for the shell bell — now served from the backend's
  // persisted, role-scoped notifications (real-time via the SSE stream).
  const notifications = useMemo<ShellNotification[]>(() => {
    return apiNotifications.slice(0, 8).map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      time: timeAgo(n.createdAt),
      tab: (n.tab as NavTab) || undefined,
      tone: n.tone === 'critical' ? 'critical' : n.tone === 'success' ? 'success' : 'info',
    }));
  }, [apiNotifications]);

  // If user is not logged in, render the marketing landing page with sign-in
  if (!isLoggedIn || !user) {
    return (
      <LandingPage onSignInSuccess={(role) => setActiveTab(defaultTabForRole(role))} />
    );
  }

  // Check if current tab is authorized for current user's role
  const allowedTabs = ALLOWED_TABS_PER_ROLE[currentRole] || ['citizen'];
  const isTabAllowed = allowedTabs.includes(activeTab);

  const criticalCount = complaints.filter((c) => c.priority === 'Critical' && c.status !== 'Resolved' && c.status !== 'Closed').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      <AppShell
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        selectedOfficer={selectedOfficer}
        onOfficerChange={setSelectedOfficer}
        selectedSupervisorDepartment={selectedSupervisorDepartment}
        onSupervisorDepartmentChange={setSelectedSupervisorDepartment}
        onLogout={logout}
        onRequestReset={() => setResetConfirmOpen(true)}
        criticalCount={criticalCount}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAllRead={markAllRead}
      >
        <main className="flex-1">
          {!isTabAllowed ? (
            <AccessDenied
              userRole={currentRole}
              attemptedTab={activeTab}
              onGoToDashboard={() => setActiveTab(defaultTabForRole(currentRole))}
            />
          ) : (
            <>
              {activeTab === 'citizen' && (
                <CitizenPortal
                  categories={categories}
                  onComplaintSubmitted={handleComplaintSubmitted}
                  onTrackLookup={handleTrackLookup}
                  onUpdateComplaint={(cmp) => handleUpdateComplaint(cmp.id, cmp)}
                />
              )}

              {activeTab === 'desk' && (
                <ServiceDesk
                  complaints={complaints}
                  onUpdateComplaint={handleUpdateComplaint}
                  loading={loading}
                />
              )}

              {activeTab === 'field' && (
                <FieldOfficerPortal
                  officerName={selectedOfficer}
                  complaints={complaints}
                  onUpdateComplaint={handleUpdateComplaint}
                />
              )}

              {activeTab === 'categories' && (
                <CategoryManagement
                  categories={categories}
                  onAddCategory={handleAddCategory}
                  onUpdateCategory={handleUpdateCategory}
                  onToggleStatus={handleToggleCategoryStatus}
                />
              )}

              {activeTab === 'roles' && (
                <RoleManagement
                  users={users}
                  auditLogs={auditLogs}
                  onUpdateUserRole={handleUpdateUserRole}
                  onAddAuditLog={handleAddAuditLog}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsDashboard complaints={complaints} role={currentRole} />
              )}

              {activeTab === 'assistant' && (
                <AICopilot complaints={complaints} />
              )}
            </>
          )}
        </main>
      </AppShell>

      {/* Reset demo data confirmation */}
      <ConfirmDialog
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={handleResetSeed}
        title="Reset demo data?"
        description="This will restore complaints, categories, and audit logs to their original seed state. Any changes made during this session will be lost."
        confirmLabel="Reset data"
        danger
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainAppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
